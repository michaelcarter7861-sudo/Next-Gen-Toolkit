import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

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
        ? `Context:\n${context}\n\nQuery: ${query}\n\nProvide an accurate, up-to-date technical & SEO/AEO analysis with concrete facts and benchmarks.`
        : query;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are the Utilix Search Grounding & Web Utility Intelligence Engine. Provide concise, factual, citation-backed answers for developers, SEO engineers, and digital creators.',
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
              'You are the Utilix Deep Reasoning Architect. Perform rigorous algorithmic, regex, schema, security, or SEO/GEO engineering analysis. Structure your output clearly with actionable code or specifications.',
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
              'You are the Utilix Deep Reasoning Architect. Perform rigorous algorithmic, regex, schema, security, or SEO/GEO engineering analysis. Structure your output clearly with actionable code or specifications.',
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
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Utilix server listening on http://localhost:${PORT}`);
  });
}

startServer();
