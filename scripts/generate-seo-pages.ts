// Cloudflare Pages runs automated tests and TypeScript checks before the production build.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { HUBS, TOOLS_CATALOG } from '../src/data/toolsCatalog';
import {
  HOME_FAQS,
  HUB_FAQS,
  HUB_EDITORIAL_LINKS,
  TOOL_EDITORIAL_LINKS,
} from '../src/data/seoSchemaData';
import { SITE_PAGES } from '../src/data/sitePages';

const DIST = path.resolve('dist');
const PUBLIC_DIR = path.resolve('public');
const SITE_URL = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://nextgentoolkit.pages.dev'
).replace(/\/+$/, '');
const SITE_PATH = new URL(SITE_URL).pathname.replace(/\/+$/, '');

// Preview tools are reachable by humans but deliberately excluded from search
// (noindex + absent from the sitemap) until their engine ships.
const INDEXABLE_TOOLS = TOOLS_CATALOG.filter((tool) => tool.status !== 'preview');
const PREVIEW_TOOLS = TOOLS_CATALOG.filter((tool) => tool.status === 'preview');
const INDEXABLE_URL_COUNT =
  1 + 1 + SITE_PAGES.length + HUBS.length + INDEXABLE_TOOLS.length;

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

const formatBrandedSeoTitle = (subject: string): string => {
  const suffix = ' | NextGenToolkit';
  const clean = subject.replace(/\s+/g, ' ').trim();
  if (clean.length + suffix.length <= 60) {
    return `${clean}${suffix}`;
  }
  const maxSubject = 60 - suffix.length;
  const trimmed = clean.slice(0, maxSubject).replace(/\s+\S*$/, '');
  return `${trimmed}${suffix}`;
};

const trustFooterHtml = () =>
  `<nav aria-label="Site information"><p>${SITE_PAGES.map(
    (page) => `<a href="${escapeHtml(publicPath(page.slug))}">${escapeHtml(page.navLabel)}</a>`
  ).join(' · ')}</p></nav>`;

function createPage({
  route,
  title,
  description,
  content,
  schema,
  noindex = false,
}: {
  route: string;
  title: string;
  description: string;
  content: string;
  schema: unknown;
  noindex?: boolean;
}) {
  const canonical = absoluteUrl(route);
  const safeTitle = escapeHtml(shortDescription(title, 60));
  const safeDescription = escapeHtml(shortDescription(description, 158));
  const ogImage = `${SITE_URL}/og-cover.png`;
  const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');

  let html = template;
  // Remove any pre-existing canonical, og:url, or meta keywords tags from base template
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
  html = html.replace(/<meta\s+property=["']og:url["'][^>]*>\s*/gi, '');
  html = html.replace(/<meta\s+name=["']keywords["'][^>]*>\s*/gi, '');
  html = html.replace(/<script\s+id=["']nextgentoolkit-jsonld-schema["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');

  html = html.replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${safeDescription}" />`);
  html = html.replace(
    /<meta name="robots"[^>]*>/,
    noindex
      ? '<meta name="robots" content="noindex,follow" />'
      : '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />'
  );
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${safeDescription}" />`
  );
  html = html.replace(/<meta property="og:type"[^>]*>/, '<meta property="og:type" content="website" />');
  html = html.replace(/<meta property="og:site_name"[^>]*>/, '<meta property="og:site_name" content="NextGenToolkit" />');
  html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${escapeHtml(ogImage)}" />`);
  html = html.replace(/<meta name="twitter:card"[^>]*>/, '<meta name="twitter:card" content="summary_large_image" />');
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(
    /<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${safeDescription}" />`
  );
  html = html.replace(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`);
  html = html.replace(
    '</head>',
    `<link rel="canonical" href="${escapeHtml(canonical)}" />\n<meta property="og:url" content="${escapeHtml(canonical)}" />\n<script id="nextgentoolkit-jsonld-schema" type="application/ld+json">${jsonLd}</script>\n</head>`
  );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"><main style="max-width:980px;margin:0 auto;padding:32px 20px;font:16px/1.65 system-ui,sans-serif;color:#171927"><div style="font-weight:800;letter-spacing:.04em">NextGenToolkit</div>${content}<p><a href="${escapeHtml(publicPath('/'))}">NextGenToolkit Home</a> · <a href="${escapeHtml(publicPath('/sitemap/'))}">All Tools Directory</a></p>${trustFooterHtml()}</main></div>`
  );
  return html;
}

const homeContent = `<h1>Free PDF, Image, Text and Developer Tools that run in your browser.</h1>
<p>NextGenToolkit brings together 25 browser-based utilities for working with PDF documents, images, text, developer data, and everyday generators. Processing depends on the individual utility: many core tools handle files or text locally in your browser, while AI-powered and other remote-service features may send the data needed for the requested operation to the relevant provider. Check each tool's processing notes before submitting sensitive information.</p>
<p>Popular workflows include <a href="${escapeHtml(publicPath('/image-tools/compress-image-to-kb/'))}">compressing images to exact 20KB or 50KB limits</a>, <a href="${escapeHtml(publicPath('/pdf-tools/merge-pdf/'))}">merging confidential PDF files locally</a>, <a href="${escapeHtml(publicPath('/dev-tools/json-formatter-validator/'))}">formatting and auto-fixing broken JSON syntax</a> per the <a href="https://datatracker.ietf.org/doc/html/rfc8259" target="_blank" rel="noopener noreferrer">IETF RFC 8259 JSON standard</a>, and creating permanent <a href="https://www.iso.org/standard/62021.html" target="_blank" rel="noopener noreferrer">ISO/IEC 18004 QR Code</a> vectors in our <a href="${escapeHtml(publicPath('/generators/custom-qr-code-generator/'))}">Custom SVG/PNG QR Code Studio</a>.</p>
${HUBS.map((hub) => {
  const tools = TOOLS_CATALOG.filter((tool) => tool.hubId === hub.id);
  return `<section><h2><a href="${escapeHtml(publicPath(hub.slug))}">${escapeHtml(hub.name)}</a></h2><p>${escapeHtml(hub.description)}</p><ul>${tools
    .map((tool) => link(tool.canonicalPath, `${tool.name}: ${tool.shortDesc}`))
    .join('')}</ul></section>`;
}).join('')}
<section itemscope itemtype="https://schema.org/FAQPage"><h2>Frequently Asked Questions</h2>${HOME_FAQS.map(
  (faq) =>
    `<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question"><h3 itemprop="name">${escapeHtml(faq.q)}</h3><div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><p itemprop="text">${escapeHtml(faq.a)}</p></div></div>`
).join('')}</section>`;

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
      '@type': 'WebApplication',
      name: 'NextGenToolkit',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      isAccessibleForFree: true,
      url: absoluteUrl('/'),
      description:
        'Compress PDFs & images to exact KB, format broken JSON, count LLM tokens, and run 25+ free browser-based tools with NextGenToolkit.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
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
    {
      '@type': 'FAQPage',
      mainEntity: HOME_FAQS.map((f) => ({
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
      ],
    },
  ],
};

await writeFile(
  path.join(DIST, 'index.html'),
  createPage({
    route: '/',
    title: 'Free PDF, Image, Text & Developer Tools | NextGenToolkit',
    description:
      'Compress PDFs & images to exact KB, format broken JSON, count LLM tokens, and run 25+ free browser-based tools with NextGenToolkit.',
    content: homeContent,
    schema: homeSchema,
  }),
  'utf8'
);

for (const hub of HUBS) {
  const tools = TOOLS_CATALOG.filter((tool) => tool.hubId === hub.id);
  const hubFaqs = HUB_FAQS[hub.id] || [];
  const hubEditorial = HUB_EDITORIAL_LINKS[hub.id];
  const route = normalizeRoute(hub.slug);
  const editorialHtml = hubEditorial
    ? `<section><h2>Workflow Guide &amp; Technical Standards for ${escapeHtml(hub.name)}</h2><p>With NextGenToolkit ${escapeHtml(hub.name)}, you can ${hubEditorial.internalLinks
        .map(
          (il) =>
            `<a href="${escapeHtml(publicPath(il.href))}">${escapeHtml(il.keywordAnchor)}</a> ${escapeHtml(il.contextAfter)}`
        )
        .join(' ')}</p>${hubEditorial.externalLinks
        .map(
          (ext) =>
            `<p>${escapeHtml(ext.contextSentence)} Reference: <a href="${escapeHtml(ext.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ext.keywordAnchor)}</a>.</p>`
        )
        .join('')}</section>`
    : '';
  const content = `<nav aria-label="Breadcrumb"><ol itemscope itemtype="https://schema.org/BreadcrumbList"><li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="${escapeHtml(publicPath('/'))}"><span itemprop="name">Home</span></a><meta itemprop="position" content="1" /></li><li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><span itemprop="name">${escapeHtml(hub.name)}</span><meta itemprop="position" content="2" /></li></ol></nav>
<h1>${escapeHtml(hub.name)}</h1><p>${escapeHtml(hub.description)}</p>
<h2>Available ${escapeHtml(hub.name)} (${tools.length})</h2><ul>${tools
    .map((tool) => link(tool.canonicalPath, `${tool.name}: ${tool.shortDesc}`))
    .join('')}</ul>
${editorialHtml}
<section itemscope itemtype="https://schema.org/FAQPage"><h2>Frequently Asked Questions About ${escapeHtml(hub.name)}</h2>${hubFaqs
    .map(
      (faq) =>
        `<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question"><h3 itemprop="name">${escapeHtml(faq.q)}</h3><div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><p itemprop="text">${escapeHtml(faq.a)}</p></div></div>`
    )
    .join('')}</section>`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `${hub.name} | NextGenToolkit`,
        description: hub.description,
        url: absoluteUrl(route),
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
        '@type': 'FAQPage',
        mainEntity: hubFaqs.map((f) => ({
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
      title: formatBrandedSeoTitle(`${hub.name} - Free Browser Utilities`),
      description: hub.description,
      content,
      schema,
    }),
    'utf8'
  );
}

for (const tool of TOOLS_CATALOG) {
  const hub = HUBS.find((item) => item.id === tool.hubId);
  const route = normalizeRoute(tool.canonicalPath);
  const toolEditorial = TOOL_EDITORIAL_LINKS[tool.id];
  const siblings = TOOLS_CATALOG.filter((item) => item.hubId === tool.hubId && item.id !== tool.id);
  const companionIds = [
    tool.nextStepToolId,
    ...(toolEditorial?.internalLinks.map((l) => l.toolId).filter(Boolean) as string[] || []),
  ];
  const companions = companionIds
    .map((id) => TOOLS_CATALOG.find((t) => t.id === id))
    .filter((t): t is (typeof TOOLS_CATALOG)[number] => Boolean(t) && t!.id !== tool.id && !siblings.some((s) => s.id === t!.id));
  const related = [...siblings, ...companions].slice(0, 6);
  const toolEditorialHtml = toolEditorial
    ? `<section id="technical-guide"><h2>Connected Workflows &amp; Technical Methodology for ${escapeHtml(tool.name)}</h2><p>${escapeHtml(toolEditorial.leadIntro)} ${toolEditorial.internalLinks
        .map(
          (il) =>
            `<a href="${escapeHtml(publicPath(il.href))}">${escapeHtml(il.keywordAnchor)}</a> ${escapeHtml(il.contextAfter)}`
        )
        .join(' ')}</p>${toolEditorial.externalLinks
        .map(
          (ext) =>
            `<p>${escapeHtml(ext.contextSentence)} Specification: <a href="${escapeHtml(ext.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ext.keywordAnchor)}</a> (${escapeHtml(ext.sourceName)}).</p>`
        )
        .join('')}</section>`
    : '';
  const content = `<nav aria-label="Breadcrumb"><ol itemscope itemtype="https://schema.org/BreadcrumbList"><li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="${escapeHtml(publicPath('/'))}"><span itemprop="name">Home</span></a><meta itemprop="position" content="1" /></li><li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="${escapeHtml(publicPath(hub?.slug || '/'))}"><span itemprop="name">${escapeHtml(hub?.name || 'Tools')}</span></a><meta itemprop="position" content="2" /></li><li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><span itemprop="name">${escapeHtml(tool.name)}</span><meta itemprop="position" content="3" /></li></ol></nav>
<h1>${escapeHtml(tool.name)}</h1>
<p>${escapeHtml(tool.entityLeadSentence)}</p>
<h2 id="how-to-use">${escapeHtml(tool.aeoQuestionHeading)}</h2><p>${escapeHtml(tool.aeoSummaryParagraph)}</p>
<h2>How to use ${escapeHtml(tool.name)}</h2><ol>${tool.howToSteps
    .map((step) => `<li><strong>${escapeHtml(step.name)}:</strong> ${escapeHtml(step.text)}</li>`)
    .join('')}</ol>
<h2 id="specifications">Technical Specifications</h2>
<ul>
  <li><strong>Execution Engine:</strong> ${escapeHtml(tool.specTable.executionEngine)}</li>
  <li><strong>Supported Formats:</strong> ${escapeHtml(tool.specTable.supportedFormats)}</li>
  <li><strong>Privacy Model:</strong> ${escapeHtml(tool.specTable.privacyModel)}</li>
  <li><strong>Batch Support:</strong> ${escapeHtml(tool.specTable.batchSupport)}</li>
</ul>
${toolEditorialHtml}
<section id="tool-faq" itemscope itemtype="https://schema.org/FAQPage"><h2>Frequently asked questions about ${escapeHtml(tool.name)}</h2>${tool.faqs
    .map(
      (faq) =>
        `<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question"><h3 itemprop="name">${escapeHtml(faq.q)}</h3><div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer"><p itemprop="text">${escapeHtml(faq.a)}</p></div></div>`
    )
    .join('')}</section>
<h2 id="related-tools">Related tools</h2><ul>${related.map((item) => link(item.canonicalPath, item.name)).join('')}</ul>`;

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
        ...(toolEditorial
          ? {
              isBasedOn: toolEditorial.externalLinks.map((ext) => ({
                '@type': 'CreativeWork',
                name: ext.keywordAnchor,
                url: ext.url,
                publisher: { '@type': 'Organization', name: ext.sourceName },
              })),
            }
          : {}),
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
      title: formatBrandedSeoTitle(`${tool.name} - Free Online Tool`),
      description: tool.aeoSummaryParagraph,
      content,
      schema,
      noindex: tool.status === 'preview',
    }),
    'utf8'
  );
}

// Prerender dedicated HTML SEO Sitemap page (/sitemap/)
const sitemapPageRoute = '/sitemap/';
const sitemapPageContent = `<nav aria-label="Breadcrumb"><ol itemscope itemtype="https://schema.org/BreadcrumbList"><li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><a itemprop="item" href="${escapeHtml(publicPath('/'))}"><span itemprop="name">Home</span></a><meta itemprop="position" content="1" /></li><li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><span itemprop="name">All Tools Directory</span><meta itemprop="position" content="2" /></li></ol></nav>
<h1>NextGenToolkit All Tools &amp; Categories Directory (All ${INDEXABLE_URL_COUNT} Pages)</h1>
<p>Browse all ${INDEXABLE_URL_COUNT} indexable URLs across NextGenToolkit: the homepage, this directory, ${SITE_PAGES.length} site-information pages, ${HUBS.length} topical category hubs, and ${TOOLS_CATALOG.length} browser utilities.</p>
<h2>Category Hubs (${HUBS.length})</h2>
<ul>${HUBS.map((h) => link(h.slug, `${h.name}: ${h.description}`)).join('')}</ul>
${HUBS.map((h) => {
  const hubTools = TOOLS_CATALOG.filter((t) => t.hubId === h.id);
  return `<h2>${escapeHtml(h.name)} (${hubTools.length})</h2><ul>${hubTools
    .map((t) => link(t.canonicalPath, `${t.name} (${t.canonicalPath}): ${t.shortDesc}`))
    .join('')}</ul>`;
}).join('')}`;

const sitemapPageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${absoluteUrl('/')}#organization`,
      name: 'NextGenToolkit',
      url: absoluteUrl('/'),
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
    {
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl(sitemapPageRoute)}#webpage`,
      name: 'NextGenToolkit Complete SEO Sitemap & Directory',
      description:
        `Browse all ${INDEXABLE_URL_COUNT} indexable pages on NextGenToolkit across PDF Tools, Image Tools, Developer Tools, Text Tools, and Calculators & Generators.`,
      url: absoluteUrl(sitemapPageRoute),
      isPartOf: { '@type': 'WebSite', '@id': `${absoluteUrl('/')}#website`, name: 'NextGenToolkit', url: absoluteUrl('/') },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: TOOLS_CATALOG.length,
        itemListElement: TOOLS_CATALOG.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          url: absoluteUrl(t.canonicalPath),
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${absoluteUrl(sitemapPageRoute)}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'SEO Sitemap & Directory', item: absoluteUrl(sitemapPageRoute) },
      ],
    },
  ],
};

const sitemapFolder = path.join(DIST, 'sitemap');
await mkdir(sitemapFolder, { recursive: true });
await writeFile(
  path.join(sitemapFolder, 'index.html'),
  createPage({
    route: sitemapPageRoute,
    title: formatBrandedSeoTitle('Complete SEO Sitemap & All 25 Tools Directory'),
    description:
      `Browse all ${INDEXABLE_URL_COUNT} indexable pages on NextGenToolkit across PDF Tools, Image Tools, Developer Tools, Text Tools, and Calculators & Generators.`,
    content: sitemapPageContent,
    schema: sitemapPageSchema,
  }),
  'utf8'
);

// ============================================================================
// Trust pages (About / Contact / Privacy / Terms / Editorial policy / Changelog)
// Generated as self-contained static documents: they need no JavaScript, load
// in one request, and are crawlable without executing the React bundle.
// ============================================================================
const escapeForPage = (value: string) => escapeHtml(value);

function renderTrustPage(page: (typeof SITE_PAGES)[number]): string {
  const canonical = absoluteUrl(page.slug);
  const nav = SITE_PAGES.map(
    (item) =>
      `<a href="${escapeHtml(publicPath(item.slug))}"${
        item.slug === page.slug ? ' aria-current="page"' : ''
      }>${escapeHtml(item.navLabel)}</a>`
  ).join('');

  const sectionsHtml = page.sections
    .map((section) => {
      const paragraphs = (section.paragraphs || [])
        .map((text) => `<p>${escapeForPage(text)}</p>`)
        .join('');
      const bullets = section.bullets
        ? `<ul>${section.bullets.map((item) => `<li>${escapeForPage(item)}</li>`).join('')}</ul>`
        : '';
      return `<section><h2>${escapeForPage(section.heading)}</h2>${paragraphs}${bullets}</section>`;
    })
    .join('\n');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.description,
        dateModified: page.updated,
        isPartOf: { '@type': 'WebSite', name: 'NextGenToolkit', url: absoluteUrl('/') },
        inLanguage: 'en',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: page.navLabel, item: canonical },
        ],
      },
    ],
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeForPage(shortDescription(page.title, 65))}</title>
<meta name="description" content="${escapeForPage(shortDescription(page.description, 158))}" />
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="NextGenToolkit" />
<meta property="og:title" content="${escapeForPage(page.title)}" />
<meta property="og:description" content="${escapeForPage(shortDescription(page.description, 158))}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:image" content="${SITE_URL}/og-cover.png" />
<link rel="icon" type="image/svg+xml" href="${publicPath('/favicon.svg')}" />
<meta name="theme-color" content="#7047EB" />
<script type="application/ld+json">${jsonLd}</script>
<style>
:root{--ink:#171927;--deep:#253044;--muted:#52607a;--line:#E8E6F2;--brand:#7047EB;--canvas:#F8F7FC}
*{box-sizing:border-box}
body{margin:0;background:var(--canvas);color:var(--ink);font:16px/1.7 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--brand)}
header.site{background:#fff;border-bottom:1px solid var(--line)}
.wrap{max-width:820px;margin:0 auto;padding:0 20px}
header.site .wrap{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding-top:16px;padding-bottom:16px}
.brand{display:flex;align-items:center;gap:10px;font-weight:800;text-decoration:none;color:var(--ink);font-size:17px}
.brand span.mark{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,#7047EB,#5E35D9);color:#fff;display:grid;place-items:center;font-size:11px}
nav.site{display:flex;flex-wrap:wrap;gap:14px;font-size:13px;font-weight:600}
nav.site a{text-decoration:none;color:var(--muted)}
nav.site a[aria-current="page"]{color:var(--brand)}
main{padding:36px 0 8px}
.crumbs{font-size:12px;color:var(--muted);margin-bottom:14px}
h1{font-size:clamp(28px,5vw,38px);line-height:1.15;letter-spacing:-.02em;margin:0 0 12px}
.lede{font-size:17px;color:var(--deep);margin:0 0 8px}
.updated{font-size:12px;color:var(--muted);margin:0 0 28px}
section{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px 22px;margin:0 0 16px}
h2{font-size:18px;margin:0 0 10px;letter-spacing:-.01em}
p{margin:0 0 12px;color:var(--deep)}
p:last-child{margin-bottom:0}
ul{margin:0;padding-left:20px;color:var(--deep)}
li{margin-bottom:6px}
footer.site{border-top:1px solid var(--line);margin-top:32px;padding:24px 0 40px;font-size:13px;color:var(--muted)}
footer.site nav{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:10px;font-weight:600}
footer.site a{color:var(--muted);text-decoration:none}
footer.site a:hover{color:var(--brand)}
@media (prefers-color-scheme:dark){
:root{--ink:#F8F7FC;--deep:#D7DEEE;--muted:#A9B4CA;--line:#2A2E42;--canvas:#131520}
header.site,section,footer.site{background:#1C1F2E;border-color:var(--line)}
.brand{color:#fff}
}
</style>
</head>
<body>
<header class="site">
  <div class="wrap">
    <a class="brand" href="${publicPath('/')}"><span class="mark">NG</span>NextGenToolkit</a>
    <nav class="site" aria-label="Site information">${nav}</nav>
  </div>
</header>
<main class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${publicPath('/')}">Home</a> › ${escapeForPage(page.navLabel)}</nav>
  <h1>${escapeForPage(page.h1)}</h1>
  <p class="lede">${escapeForPage(page.intro)}</p>
  <p class="updated">Last reviewed ${escapeForPage(page.updated)} · <a href="${publicPath('/changelog/')}">See all changes</a></p>
  ${sectionsHtml}
</main>
<footer class="site">
  <div class="wrap">
    <nav aria-label="Footer">${nav}<a href="${publicPath('/sitemap/')}">All tools</a></nav>
    <p>NextGenToolkit — browser-first utilities, honestly described.</p>
  </div>
</footer>
</body>
</html>
`;
}

for (const page of SITE_PAGES) {
  const folder = path.join(DIST, page.slug.replace(/^\/+|\/+$/g, ''));
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'index.html'), renderTrustPage(page), 'utf8');
}

// ============================================================================
// Generate sitemap XML & sitemap index.
// lastmod is omitted because a build timestamp is not a reliable per-URL
// modification date; publishing a fabricated timestamp would be misleading.
const sitemapUrls = [
  absoluteUrl('/'),
  absoluteUrl('/sitemap/'),
  ...SITE_PAGES.map((page) => absoluteUrl(page.slug)),
  ...HUBS.map((hub) => absoluteUrl(hub.slug)),
  ...INDEXABLE_TOOLS.map((tool) => absoluteUrl(tool.canonicalPath)),
];

// Preview tools are reachable by humans but deliberately excluded from search:
// noindex + absent from the sitemap. Counted here for the build log.
console.log(
  `Indexable URLs: ${sitemapUrls.length} (tools indexable: ${INDEXABLE_TOOLS.length}/${TOOLS_CATALOG.length}; preview excluded: ${PREVIEW_TOOLS.map((t) => t.slug).join(', ')})`
);

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
  .map((loc) => `  <url>\n    <loc>${escapeHtml(loc)}</loc>\n  </url>`)
  .join('\n')}\n</urlset>\n`;

const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${escapeHtml(`${SITE_URL}/sitemap.xml`)}</loc>\n  </sitemap>\n</sitemapindex>\n`;

const sitemapTxt = `${sitemapUrls.join('\n')}\n`;

await writeFile(path.join(DIST, 'sitemap.xml'), sitemapXml, 'utf8');
try {
  await writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
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

// Ensure Cloudflare Pages _headers exists in dist/ so Googlebot gets strict XML/text MIME headers
const headersConfig = `# Search and AI discovery files
/sitemap.xml
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

# Hashed build assets never change, so they can be cached permanently.
/assets/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/og-cover.png
  Cache-Control: public, max-age=604800
  X-Content-Type-Options: nosniff

# Web app manifest and icon set (installable site, Android/iOS home screen).
/manifest.webmanifest
  Content-Type: application/manifest+json; charset=utf-8
  Cache-Control: public, max-age=3600
  X-Content-Type-Options: nosniff

/icon-192.png
  Cache-Control: public, max-age=604800
  X-Content-Type-Options: nosniff

/icon-512.png
  Cache-Control: public, max-age=604800
  X-Content-Type-Options: nosniff

/icon-512-maskable.png
  Cache-Control: public, max-age=604800
  X-Content-Type-Options: nosniff

/apple-touch-icon.png
  Cache-Control: public, max-age=604800
  X-Content-Type-Options: nosniff

/favicon.ico
  Cache-Control: public, max-age=604800
  X-Content-Type-Options: nosniff

# Baseline security headers. Deliberately no Content-Security-Policy and no
# X-Frame-Options:
#  - the GTM container loads vendor tags we cannot enumerate from this repo, so a
#    strict script-src would silently break analytics;
#  - the product ships an embed widget that must be frameable by third parties.
# Both are tracked as follow-ups in the technical report rather than guessed at.
# Preview and branch deployments live on <alias>.nextgentoolkit.pages.dev.
# Cloudflare Pages supports host placeholders in _headers, so these aliases can
# be noindexed without touching production. The two-placeholder pattern only
# matches 3+ label hosts, so the production host (nextgentoolkit.pages.dev) and
# any custom domain are unaffected.
# Verify after deploy:
#   curl -sI https://<branch>.nextgentoolkit.pages.dev/ | grep -i x-robots-tag   -> noindex
#   curl -sI https://nextgentoolkit.pages.dev/            | grep -i x-robots-tag   -> no header
https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex

# Baseline security headers applied to every path on every host.
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
`;

await writeFile(path.join(DIST, '_headers'), headersConfig, 'utf8');
try {
  await writeFile(path.join(PUBLIC_DIR, '_headers'), headersConfig, 'utf8');
} catch {
  // Ignore if public directory is read-only
}

const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | NextGenToolkit</title><meta name="description" content="The requested NextGenToolkit page could not be found."></head><body style="font-family:system-ui,sans-serif;padding:40px;max-width:680px;margin:0 auto;color:#171927"><main><h1>Page not found</h1><p>The requested utility page does not exist.</p><a href="${escapeHtml(publicPath('/'))}">Return to NextGenToolkit</a></main></body></html>`;
await writeFile(path.join(DIST, '404.html'), notFound, 'utf8');

console.log(`Generated NextGenToolkit static SEO HTML and valid sitemap.xml at ${SITE_URL}`);