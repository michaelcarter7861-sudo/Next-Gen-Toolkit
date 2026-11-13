import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { HUBS, TOOLS_CATALOG } from '../src/data/toolsCatalog';

const DIST = path.resolve('dist');
const SITE_URL = (process.env.SITE_URL || 'https://michaelcarter7861-sudo.github.io/UTILIX').replace(/\/+$/, '');
const SITE_PATH = new URL(SITE_URL).pathname.replace(/\/+$/, '');
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char] || char));
const absoluteUrl = (route: string) => `${SITE_URL}${route === '/' ? '/' : route}`;
const publicPath = (route: string) => `${SITE_PATH}${route === '/' ? '/' : route}`;
const shortDescription = (value: string, max = 158) => {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
};
const link = (route: string, label: string) =>
  `<li><a href="${escapeHtml(publicPath(route))}">${escapeHtml(label)}</a></li>`;

const template = await readFile(path.join(DIST, 'index.html'), 'utf8');

function createPage({
  route, title, description, content, schema,
}: {
  route: string; title: string; description: string; content: string; schema: unknown;
}) {
  const canonical = absoluteUrl(route);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(shortDescription(description));
  const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');
  let html = template;
  html = html.replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${safeDescription}" />`);
  html = html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="index,follow,max-image-preview:large" />');
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${safeDescription}" />`);
  html = html.replace(/<meta property="og:type"[^>]*>/, '<meta property="og:type" content="website" />');
  html = html.replace(/<meta property="og:site_name"[^>]*>/, '<meta property="og:site_name" content="UTILIX" />');
  html = html.replace(/<meta name="twitter:card"[^>]*>/, '<meta name="twitter:card" content="summary" />');
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${safeDescription}" />`);
  html = html.replace('</head>', `<link rel="canonical" href="${escapeHtml(canonical)}" />\n<meta property="og:url" content="${escapeHtml(canonical)}" />\n<script type="application/ld+json">${jsonLd}</script>\n</head>`);
  html = html.replace('<div id="root"></div>', `<main id="seo-fallback" style="max-width:980px;margin:0 auto;padding:32px 20px;font:16px/1.65 system-ui,sans-serif;color:#171927"><div style="font-weight:800;letter-spacing:.08em">UTILIX</div>${content}<p><a href="${escapeHtml(publicPath('/'))}">UTILIX home</a></p></main><div id="root"></div>`);
  return html;
}

const homeContent = `<h1>Free Online PDF, Image, Text and Developer Tools</h1>
<p>UTILIX brings together practical browser-based tools for working with PDF files, images, text, developer data and everyday generators. Open a tool, follow its instructions and process supported inputs in your browser.</p>
${HUBS.map((hub) => {
  const tools = TOOLS_CATALOG.filter((tool) => tool.hubId === hub.id);
  return `<section><h2>${escapeHtml(hub.name)}</h2><p>${escapeHtml(hub.description)}</p><ul>${tools.map((tool) => link(tool.canonicalPath, tool.name)).join('')}</ul></section>`;
}).join('')}`;
const homeSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'UTILIX',
  url: absoluteUrl('/'),
  description: 'Free online PDF, image, text and developer utilities.',
};

await writeFile(path.join(DIST, 'index.html'), createPage({
  route: '/', title: 'UTILIX — Free Online PDF, Image, Text & Developer Tools',
  description: 'Use free online PDF, image, text and developer tools. Compress files, convert formats, clean text, inspect data and generate QR codes.',
  content: homeContent, schema: homeSchema,
}));

for (const hub of HUBS) {
  const tools = TOOLS_CATALOG.filter((tool) => tool.hubId === hub.id);
  const route = hub.slug;
  const content = `<nav aria-label="Breadcrumb"><a href="${escapeHtml(publicPath('/'))}">Home</a> / ${escapeHtml(hub.name)}</nav>
<h1>${escapeHtml(hub.name)}</h1><p>${escapeHtml(hub.description)}</p>
<h2>Available ${escapeHtml(hub.name)}</h2><ul>${tools.map((tool) => link(tool.canonicalPath, tool.name)).join('')}</ul>`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: hub.name,
    description: hub.description,
    url: absoluteUrl(route),
    isPartOf: { '@type': 'WebSite', name: 'UTILIX', url: absoluteUrl('/') },
    mainEntity: { '@type': 'ItemList', itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem', position: index + 1, name: tool.name, url: absoluteUrl(tool.canonicalPath),
    })) },
  };
  const folder = path.join(DIST, route.replace(/^\/+|\/+$/g, ''));
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'index.html'), createPage({
    route, title: `${hub.name} — Free Online Tools | UTILIX`,
    description: hub.description, content, schema,
  }));
}

for (const tool of TOOLS_CATALOG) {
  const hub = HUBS.find((item) => item.id === tool.hubId);
  const route = tool.canonicalPath;
  const related = TOOLS_CATALOG.filter((item) => item.hubId === tool.hubId && item.id !== tool.id).slice(0, 5);
  const content = `<nav aria-label="Breadcrumb"><a href="${escapeHtml(publicPath('/'))}">Home</a> / <a href="${escapeHtml(publicPath(hub?.slug || '/'))}">${escapeHtml(hub?.name || 'Tools')}</a> / ${escapeHtml(tool.name)}</nav>
<h1>${escapeHtml(tool.name)}</h1>
<p>${escapeHtml(tool.entityLeadSentence)}</p>
<h2>${escapeHtml(tool.aeoQuestionHeading)}</h2><p>${escapeHtml(tool.aeoSummaryParagraph)}</p>
<h2>How to use ${escapeHtml(tool.name)}</h2><ol>${tool.howToSteps.map((step) => `<li><strong>${escapeHtml(step.name)}:</strong> ${escapeHtml(step.text)}</li>`).join('')}</ol>
<h2>Frequently asked questions</h2>${tool.faqs.map((faq) => `<section><h3>${escapeHtml(faq.q)}</h3><p>${escapeHtml(faq.a)}</p></section>`).join('')}
<h2>Related tools</h2><ul>${related.map((item) => link(item.canonicalPath, item.name)).join('')}</ul>`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: `UTILIX ${tool.name}`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
        url: absoluteUrl(route),
        description: shortDescription(tool.aeoSummaryParagraph),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
  await writeFile(path.join(folder, 'index.html'), createPage({
    route,
    title: `${shortDescription(tool.primaryKeyword, 55)} | UTILIX`,
    description: tool.aeoSummaryParagraph,
    content, schema,
  }));
}

await writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`);
for (const filename of ['llms.txt', 'llms-full.txt']) {
  const filePath = path.join(DIST, filename);
  try {
    const source = await readFile(filePath, 'utf8');
    const rewritten = source.replaceAll('https://utilix.tools', SITE_URL).replaceAll('https://utilix.io', SITE_URL);
    await writeFile(filePath, rewritten);
  } catch {
    // Optional AI-crawler documentation should not fail a production build.
  }
}

const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | UTILIX</title><meta name="description" content="The requested UTILIX page could not be found."></head><body><main><h1>Page not found</h1><p>The requested page does not exist.</p><a href="${escapeHtml(publicPath('/'))}">Return to UTILIX</a></main></body></html>`;
await writeFile(path.join(DIST, '404.html'), notFound);

console.log(`Generated static SEO HTML for ${allRoutes.length} canonical routes at ${SITE_URL}`);
