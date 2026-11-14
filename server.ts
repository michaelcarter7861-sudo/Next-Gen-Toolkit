import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { HUBS, TOOLS_CATALOG } from './src/data/toolsCatalog.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function resolveRequestOrigin(req: express.Request): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/+$/, '');
  }
  const proto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() || req.get('host') || 'utilix-5rz.pages.dev';
  return `${proto}://${host}`.replace(/\/+$/, '');
}

function buildDynamicSitemapXml(baseUrl: string): string {
  const lastmod = '2025-02-20';
  const urls = [
    `${baseUrl}/`,
    ...HUBS.map((hub) => `${baseUrl}${hub.slug}`),
    ...TOOLS_CATALOG.map((tool) => `${baseUrl}${tool.canonicalPath}`),
  ];

  const entries = urls
    .map(
      (loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function buildDynamicSitemapIndexXml(baseUrl: string): string {
  const lastmod = '2025-02-20';
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${baseUrl}/sitemap.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>\n</sitemapindex>\n`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // =========================================================================
  // Dedicated SEO / Google Search Console Routes (Prevents SPA Catch-All & MIME Errors)
  // =========================================================================
  app.get(['/sitemap.xml', '/sitemap.xml/'], (req, res) => {
    const origin = resolveRequestOrigin(req);
    const xml = buildDynamicSitemapXml(origin);
    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'all');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(xml);
  });

  app.get(['/sitemap-index.xml', '/sitemap_index.xml'], (req, res) => {
    const origin = resolveRequestOrigin(req);
    const xml = buildDynamicSitemapIndexXml(origin);
    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'all');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(xml);
  });

  app.get(['/robots.txt', '/robots.txt/'], (req, res) => {
    const origin = resolveRequestOrigin(req);
    const robots = [
      'User-agent: *',
      'Allow: /',
      '',
      'User-agent: Googlebot',
      'Allow: /',
      '',
      'User-agent: Bingbot',
      'Allow: /',
      '',
      'User-agent: OAI-SearchBot',
      'Allow: /',
      '',
      'User-agent: ChatGPT-User',
      'Allow: /',
      '',
      'User-agent: PerplexityBot',
      'Allow: /',
      '',
      'User-agent: ClaudeBot',
      'Allow: /',
      '',
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n');
    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(robots);
  });

  // 1. Google Search Grounding Endpoint (gemini-4-hydrogen + googleSearch tool)
  app.post('/api/ai/search-grounding', async (req, res) => {
    try {
      const { query, context } = req.body as { query?: string; context?: string };
      if (!query || !query.trim()) {
        res.status(400).json({ error: 'Please provide a search query.' });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured. Please check Settings > Secrets in AI Studio.',
        });
        return;
      }

      const prompt = context
        ? `Context:\n${context}\n\nQuery: ${query}\n\nProvide an accurate, up-to-date technical & SEO/AEO/GEO analysis with concrete facts, LSI terms, and benchmarks.`
        : query;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are the NextGenToolkit Search Grounding & Web Utility Intelligence Engine. Provide concise, factual, citation-backed answers for developers, SEO/AEO/GEO engineers, and digital creators.',
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources = chunks
        .map((chunk: { web?: { uri?: string; title?: string } }) => ({
          uri: chunk.web?.uri || '',
          title: chunk.web?.title || chunk.web?.uri || 'Web Source',
        }))
        .filter((s: { uri: string }) => Boolean(s.uri));

      res.json({
        text: response.text || 'No response generated.',
        model: 'gemini-4-hydrogen (Google Search Grounded)',
        sources,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to execute grounded search.';
      res.status(500).json({ error: message });
    }
  });

  // 2. High-Thinking Complex Query Endpoint (gemini-4-carbon with ThinkingLevel.HIGH)
  app.post('/api/ai/deep-think', async (req, res) => {
    try {
      const { prompt, codeOrData } = req.body as { prompt?: string; codeOrData?: string };
      if (!prompt || !prompt.trim()) {
        res.status(400).json({ error: 'Please provide a query or problem for high-thinking analysis.' });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured. Please check Settings > Secrets in AI Studio.',
        });
        return;
      }

      const fullPrompt = codeOrData
        ? `${prompt}\n\nInput Data / Code:\n\`\`\`\n${codeOrData}\n\`\`\``
        : prompt;

      try {
        // Primary: gemini-4-carbon with ThinkingLevel.HIGH (no maxOutputTokens)
        const response = await ai.models.generateContent({
          model: 'gemini-4-carbon',
          contents: fullPrompt,
          config: {
            systemInstruction:
              'You are the NextGenToolkit Deep Reasoning Architect. Perform rigorous algorithmic, regex, schema, security, or SEO/GEO/LSI engineering analysis. Structure your output clearly with actionable code or specifications.',
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH,
            },
          },
        });

        res.json({
          text: response.text || 'No response generated.',
          model: 'gemini-4-carbon (ThinkingLevel.HIGH)',
        });
      } catch (carbonError: unknown) {
        // Graceful fallback if free-tier key cannot access gemini-4-carbon
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: fullPrompt,
          config: {
            systemInstruction:
              'You are the NextGenToolkit Deep Reasoning Architect. Perform rigorous algorithmic, regex, schema, security, or SEO/GEO/LSI engineering analysis. Structure your output clearly with actionable code or specifications.',
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH,
            },
          },
        });

        res.json({
          text: fallbackResponse.text || 'No response generated.',
          model: 'gemini-4-hydrogen (ThinkingLevel.HIGH fallback)',
          note:
            carbonError instanceof Error
              ? `Note: Used gemini-4-hydrogen with HIGH thinking (${carbonError.message.slice(0, 80)})`
              : undefined,
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to execute high-thinking query.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
      const candidateHtml = cleanPath
        ? path.join(distPath, cleanPath, 'index.html')
        : path.join(distPath, 'index.html');
      if (fs.existsSync(candidateHtml)) {
        res.sendFile(candidateHtml);
      } else {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NextGenToolkit server listening on http://localhost:${PORT}`);
  });
}

startServer();
