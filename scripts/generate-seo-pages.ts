import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { HUBS, TOOLS_CATALOG, PLATFORM_LSI_CLUSTERS } from '../src/data/toolsCatalog';

const DIST = path.resolve('dist');
const PUBLIC_DIR = path.resolve('public');
const SITE_URL = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://utilix-5rz.pages.dev'
).replace(/\/+$/, '');
const SITE_PATH = new URL(SITE_URL).pathname.replace(/\/+$/, '');

const normalizeRoute = (route: string) => {
  if (!route || route === '/') return '/';
  const withLeading = route.startsWith('/') ? route : `/${route}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char] || char)
  );

const absoluteUrl = (route: string) => `${SITE_URL}${normalizeRoute(route)}`;
const publicPath = (route: string) => `${SITE_PATH}${normalizeRoute(route)}`;

const shortDescription = (value: string, max = 158) => {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};

const link = (route: string, label: string) =>
  `<li><a href="${escapeHtml(publicPath(route))}">${escapeHtml(label)}</a></li>`;

const template = await readFile(path.join(DIST, 'index.html'), 'utf8');

function createPage({
  route,
  title,
  description,
  keywords,
  content,
  schema,
}: {
  route: string;
  title: string;
  description: string;
  keywords: string;
  content: string;
  schema: unknown;
}) {
  const canonical = absoluteUrl(route);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(shortDescription(description));
  const safeKeywords = escapeHtml(keywords);
  const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');

  let html = template;
  // Remove any pre-existing canonical or og:url tags from base template to avoid duplicates
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
  html = html.replace(/<meta\s+property=["']og:url["'][^>]*>\s*/gi, '');

  html = html.replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${safeDescription}" />`);
  if (/<meta name="keywords"[^>]*>/.test(html)) {
    html = html.replace(/<meta name="keywords"[^>]*>/, `<meta name="keywords" content="${safeKeywords}" />`);
  } else {
    html = html.replace('</head>', `<meta name="keywords" content="${safeKeywords}" />\n</head>`);
  }
  html = html.replace(
    /<meta name="robots"[^>]*>/,
    '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />'
  );
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${safeDescription}" />`
  );
  html = html.replace(/<meta property="og:type"[^>]*>/, '<meta property="og:type" content="website" />');
  html = html.replace(/<meta property="og:site_name"[^>]*>/, '<meta property="og:site_name" content="NextGenToolkit" />');
  html = html.replace(/<meta name="twitter:card"[^>]*>/, '<meta name="twitter:card" content="summary_large_image" />');
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(
    /<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${safeDescription}" />`
  );
  html = html.replace(
    '</head>',
    `<link rel="canonical" href="${escapeHtml(canonical)}" />\n<meta property="og:url" content="${escapeHtml(canonical)}" />\n<script type="application/ld+json">${jsonLd}</script>\n</head>`
  );
  html = html.replace(
    '<div id="root"></div>',
    `<main id="seo-fallback" style="max-width:980px;margin:0 auto;padding:32px 20px;font:16px/1.65 system-ui,sans-serif;color:#171927"><div style="font-weight:800;letter-spacing:.04em">NextGenToolkit</div>${content}<p><a href="${escapeHtml(publicPath('/'))}">NextGenToolkit Home</a></p></main><div id="root"></div>`
  );
  return html;
}

const homeLsiSection = PLATFORM_LSI_CLUSTERS.map(
  (cluster) =>
    `<section><h3>${escapeHtml(cluster.clusterTitle)}</h3><ul>${cluster.keywords
      .map((kw) => {
        const t = TOOLS_CATALOG.find((item) => item.id === kw.toolId);
        return t ? link(t.canonicalPath, `${kw.term} (${t.name})`) : '';
      })
      .join('')}</ul></section>`
).join('');

const homeContent = `<h1>NextGenToolkit — Free Online PDF, Image, Text and Developer Tools</h1>
<p>NextGenToolkit brings together 25 practical browser-based tools for working with PDF files, images, text, developer data, and everyday generators. Open a utility, follow its instructions, and process supported inputs directly in your browser.</p>
${HUBS.map((hub) => {
  const tools = TOOLS_CATALOG.filter((tool) => tool.hubId === hub.id);
  return `<section><h2>${escapeHtml(hub.name)}</h2><p>${escapeHtml(hub.description)}</p><p><strong>Semantic Topics:</strong> ${escapeHtml(hub.hubLsiKeywords.join(' · '))}</p><ul>${tools
    .map((tool) => link(tool.canonicalPath, `${tool.name} — ${tool.shortDesc}`))
    .join('')}</ul></section>`;
}).join('')}
<section><h2>Popular Search Intents & Semantic Workflows</h2>${homeLsiSection}</section>`;

const homeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'NextGenToolkit',
      alternateName: ['nextgentoolkit', 'NextGen Toolkit'],
      url: absoluteUrl('/'),
      description: 'Free online PDF, image, text, developer, and generator utilities.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${absoluteUrl('/')}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'ItemList',
      name: 'NextGenToolkit 25 Browser Utilities',
      numberOfItems: TOOLS_CATALOG.length,
      itemListElement: TOOLS_CATALOG.map((tool, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: tool.name,
        url: absoluteUrl(tool.canonicalPath),
      })),
    },
  ],
};

await writeFile(
  path.join(DIST, 'index.html'),
  createPage({
    route: '/',
    title: 'NextGenToolkit — 25+ Free Online PDF, Image, Text & Developer Tools',
    description:
      'Use 25+ free online PDF, image, text, developer, and generator tools in your browser. Compress files to exact KB, convert WebP, format JSON, and generate QR codes.',
    keywords:
      'NextGenToolkit, nextgentoolkit, free online PDF tools, compress image to 20KB 50KB, JSON formatter validator, LLM token counter, EXIF remover, vector QR code generator',
    content: homeContent,
    schema: homeSchema,
  }),
  'utf8'
);

for (const hub of HUBS) {
  const tools = TOOLS_CATALOG.filter((tool) => tool.hubId === hub.id);
  const route = normalizeRoute(hub.slug);
  const content = `<nav aria-label="Breadcrumb"><a href="${escapeHtml(publicPath('/'))}">Home</a> / ${escapeHtml(hub.name)}</nav>
<h1>${escapeHtml(hub.name)}</h1><p>${escapeHtml(hub.description)}</p>
<p><strong>Key Capabilities & LSI Topics:</strong> ${escapeHtml(hub.hubLsiKeywords.join(' · '))}</p>
<h2>Available ${escapeHtml(hub.name)} (${tools.length})</h2><ul>${tools
    .map((tool) => link(tool.canonicalPath, `${tool.name} — ${tool.shortDesc}`))
    .join('')}</ul>`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${hub.name} | NextGenToolkit`,
        description: hub.description,
        url: absoluteUrl(route),
        keywords: [hub.name, ...hub.hubLsiKeywords, 'NextGenToolkit'].join(', '),
        isPartOf: { '@type': 'WebSite', name: 'NextGenToolkit', url: absoluteUrl('/') },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: tools.map((tool, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: tool.name,
            url: absoluteUrl(tool.canonicalPath),
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: hub.name, item: absoluteUrl(route) },
        ],
      },
    ],
  };
  const folder = path.join(DIST, route.replace(/^\/+|\/+$/g, ''));
  await mkdir(folder, { recursive: true });
  await writeFile(
    path.join(folder, 'index.html'),
    createPage({
      route,
      title: `${hub.name} — Free Online Browser Tools | NextGenToolkit`,
      description: hub.description,
      keywords: [hub.name, ...hub.hubLsiKeywords, 'NextGenToolkit'].join(', '),
      content,
      schema,
    }),
    'utf8'
  );
}

for (const tool of TOOLS_CATALOG) {
  const hub = HUBS.find((item) => item.id === tool.hubId);
  const route = normalizeRoute(tool.canonicalPath);
  const related = TOOLS_CATALOG.filter((item) => item.hubId === tool.hubId && item.id !== tool.id).slice(0, 5);
  const content = `<nav aria-label="Breadcrumb"><a href="${escapeHtml(publicPath('/'))}">Home</a> / <a href="${escapeHtml(publicPath(hub?.slug || '/'))}">${escapeHtml(hub?.name || 'Tools')}</a> / ${escapeHtml(tool.name)}</nav>
<h1>${escapeHtml(tool.name)}</h1>
<p>${escapeHtml(tool.entityLeadSentence)}</p>
<h2>${escapeHtml(tool.aeoQuestionHeading)}</h2><p>${escapeHtml(tool.aeoSummaryParagraph)}</p>
<h2>How to use ${escapeHtml(tool.name)}</h2><ol>${tool.howToSteps
    .map((step) => `<li><strong>${escapeHtml(step.name)}:</strong> ${escapeHtml(step.text)}</li>`)
    .join('')}</ol>
<h2>Technical Specifications</h2>
<ul>
  <li><strong>Execution Engine:</strong> ${escapeHtml(tool.specTable.executionEngine)}</li>
  <li><strong>Supported Formats:</strong> ${escapeHtml(tool.specTable.supportedFormats)}</li>
  <li><strong>Privacy Model:</strong> ${escapeHtml(tool.specTable.privacyModel)}</li>
  <li><strong>Batch Support:</strong> ${escapeHtml(tool.specTable.batchSupport)}</li>
</ul>
<h2>Semantic Entities & LSI Keywords</h2>
<p>${escapeHtml([...tool.lsiKeywords, ...tool.clusteredQueries].join(' · '))}</p>
<h2>Frequently asked questions</h2>${tool.faqs
    .map((faq) => `<section><h3>${escapeHtml(faq.q)}</h3><p>${escapeHtml(faq.a)}</p></section>`)
    .join('')}
<h2>Related tools</h2><ul>${related.map((item) => link(item.canonicalPath, item.name)).join('')}</ul>`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: `NextGenToolkit ${tool.name}`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (Web Browser)',
        isAccessibleForFree: true,
        url: absoluteUrl(route),
        description: shortDescription(tool.aeoSummaryParagraph),
        keywords: [tool.primaryKeyword, ...tool.lsiKeywords, ...tool.clusteredQueries].join(', '),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'HowTo',
        name: tool.aeoQuestionHeading,
        description: shortDescription(tool.aeoSummaryParagraph),
        step: tool.howToSteps.map((s, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: s.name,
          text: s.text,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: hub?.name || 'Tools', item: absoluteUrl(hub?.slug || '/') },
          { '@type': 'ListItem', position: 3, name: tool.name, item: absoluteUrl(route) },
        ],
      },
    ],
  };
  const folder = path.join(DIST, route.replace(/^\/+|\/+$/g, ''));
  await mkdir(folder, { recursive: true });
  await writeFile(
    path.join(folder, 'index.html'),
    createPage({
      route,
      title: `${shortDescription(tool.primaryKeyword, 52)} | NextGenToolkit`,
      description: tool.aeoSummaryParagraph,
      keywords: [tool.primaryKeyword, ...tool.lsiKeywords, ...tool.clusteredQueries, 'NextGenToolkit'].join(', '),
      content,
      schema,
    }),
    'utf8'
  );
}

// ============================================================================
// Generate sitemap XML & sitemap index.
// lastmod is omitted because a build timestamp is not a reliable per-URL
// modification date; publishing a fabricated timestamp would be misleading.
const sitemapUrls = [
  absoluteUrl('/'),
  ...HUBS.map((hub) => absoluteUrl(hub.slug)),
  ...TOOLS_CATALOG.map((tool) => absoluteUrl(tool.canonicalPath)),
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
  .map((loc) => `  <url>\n    <loc>${escapeHtml(loc)}</loc>\n  </url>`)
  .join('\n')}\n</urlset>\n`;

const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${escapeHtml(`${SITE_URL}/sitemap.xml`)}</loc>\n  </sitemap>\n</sitemapindex>\n`;

await writeFile(path.join(DIST, 'sitemap.xml'), sitemapXml, 'utf8');
await writeFile(path.join(DIST, 'sitemap-index.xml'), sitemapIndexXml, 'utf8');
try {
  await writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  await writeFile(path.join(PUBLIC_DIR, 'sitemap-index.xml'), sitemapIndexXml, 'utf8');
} catch {
  // Ignore if public directory is read-only in CI
}

const robotsTxt = [
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
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  '',
].join('\n');

await writeFile(path.join(DIST, 'robots.txt'), robotsTxt, 'utf8');

// Ensure Cloudflare Pages _headers and _redirects exist in dist/ so Googlebot never hits SPA HTML fallback or wrong MIME type
const headersConfig = `/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  X-Robots-Tag: all
  Access-Control-Allow-Origin: *

/sitemap-index.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  X-Robots-Tag: all
  Access-Control-Allow-Origin: *

/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *

/llms.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *

/llms-full.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: *
`;

const redirectsConfig = `/sitemap.xml/ /sitemap.xml 200
/sitemap_index.xml /sitemap-index.xml 200
/robots.txt/ /robots.txt 200
`;

await writeFile(path.join(DIST, '_headers'), headersConfig, 'utf8');
await writeFile(path.join(DIST, '_redirects'), redirectsConfig, 'utf8');

for (const filename of ['llms.txt', 'llms-full.txt']) {
  const filePath = path.join(DIST, filename);
  try {
    const source = await readFile(filePath, 'utf8');
    const rewritten = source
      .replaceAll('https://utilix.tools', SITE_URL)
      .replaceAll('https://utilix.io', SITE_URL)
      .replaceAll('https://utilix-5rz.pages.dev', SITE_URL);
    await writeFile(filePath, rewritten, 'utf8');
  } catch {
    // Optional AI-crawler documentation should not fail a production build.
  }
}

const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | NextGenToolkit</title><meta name="description" content="The requested NextGenToolkit page could not be found."></head><body style="font-family:system-ui,sans-serif;padding:40px;max-width:680px;margin:0 auto;color:#171927"><main><h1>Page not found</h1><p>The requested utility page does not exist.</p><a href="${escapeHtml(publicPath('/'))}">Return to NextGenToolkit</a></main></body></html>`;
await writeFile(path.join(DIST, '404.html'), notFound, 'utf8');

console.log(`Generated NextGenToolkit static SEO HTML and valid sitemap.xml at ${SITE_URL}`);