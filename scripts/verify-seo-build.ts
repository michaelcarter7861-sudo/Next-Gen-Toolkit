import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { HUBS, TOOLS_CATALOG } from '../src/data/toolsCatalog';
import { SITE_PAGES } from '../src/data/sitePages';

const siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://nextgentoolkit.pages.dev';
const origin = new URL(siteUrl).origin;
let basePath = new URL(siteUrl).pathname;
while (basePath.endsWith('/')) basePath = basePath.slice(0, -1);

const dist = 'dist';

// ---------------------------------------------------------------------------
// Expected URL set, derived from the same data the generator uses.
// ---------------------------------------------------------------------------
const indexableTools = TOOLS_CATALOG.filter((tool) => tool.status !== 'preview');
const previewTools = TOOLS_CATALOG.filter((tool) => tool.status === 'preview');

const expectedPaths = [
  '/',
  '/sitemap/',
  ...SITE_PAGES.map((page) => page.slug),
  ...HUBS.map((hub) => hub.slug),
  ...indexableTools.map((tool) => tool.canonicalPath),
];

const sitemap = readFileSync(`${dist}/sitemap.xml`, 'utf8');
const urls = sitemap
  .split('<loc>')
  .slice(1)
  .map((part) => part.split('</loc>')[0].trim());

assert.equal(
  urls.length,
  expectedPaths.length,
  `Sitemap should list ${expectedPaths.length} indexable URLs, found ${urls.length}`
);

const htmlPathFor = (route: string) => {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return clean ? `${dist}/${clean}/index.html` : `${dist}/index.html`;
};

for (const url of urls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, origin, `Unexpected sitemap origin: ${url}`);
  const route = parsed.pathname.slice(basePath.length) || '/';
  const htmlPath = htmlPathFor(route);
  assert.ok(existsSync(htmlPath), `Missing prerendered route: ${htmlPath}`);

  const html = readFileSync(htmlPath, 'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="${url}"`), `Missing canonical: ${url}`);
  assert.ok(html.includes('<h1>'), `Missing static H1: ${url}`);
  assert.ok(
    !/name="robots"\s+content="noindex/i.test(html),
    `Indexable URL carries a noindex directive: ${url}`
  );
}

// Every expected path must be present exactly once.
for (const route of expectedPaths) {
  const absolute = `${origin}${basePath}${route}`;
  const normalised = route === '/' ? `${origin}${basePath}/` : absolute;
  const found = urls.some((url) => url === normalised || url === absolute);
  assert.ok(found, `Expected URL missing from sitemap: ${route}`);
}

// ---------------------------------------------------------------------------
// Preview tools: reachable, but must never be advertised to search engines.
// ---------------------------------------------------------------------------
for (const tool of previewTools) {
  const htmlPath = htmlPathFor(tool.canonicalPath);
  assert.ok(existsSync(htmlPath), `Preview tool page should still build: ${tool.canonicalPath}`);
  const html = readFileSync(htmlPath, 'utf8');
  assert.ok(
    /name="robots"\s+content="noindex/i.test(html),
    `Preview tool must be noindex: ${tool.canonicalPath}`
  );
  assert.ok(
    !urls.some((url) => url.includes(tool.canonicalPath)),
    `Preview tool must be excluded from the sitemap: ${tool.canonicalPath}`
  );
}

// ---------------------------------------------------------------------------
// Trust pages must genuinely exist and carry the promised content.
// ---------------------------------------------------------------------------
const privacy = readFileSync(`${dist}/privacy/index.html`, 'utf8');
assert.ok(privacy.includes('Google Tag Manager'), 'Privacy page must disclose the tag manager');
assert.ok(privacy.includes('localStorage'), 'Privacy page must disclose local storage keys');

const contact = readFileSync(`${dist}/contact/index.html`, 'utf8');
assert.ok(/mailto:|@/.test(contact), 'Contact page must expose a real contact route');

const about = readFileSync(`${dist}/about/index.html`, 'utf8');
assert.ok(about.includes('<h1>'), 'About page needs an H1');

// ---------------------------------------------------------------------------
// robots.txt / headers / social image
// ---------------------------------------------------------------------------
let normalisedSiteUrl = siteUrl;
while (normalisedSiteUrl.endsWith('/')) normalisedSiteUrl = normalisedSiteUrl.slice(0, -1);

const robots = readFileSync(`${dist}/robots.txt`, 'utf8');
assert.ok(robots.includes(`${normalisedSiteUrl}/sitemap.xml`), 'robots.txt must reference sitemap.xml');

const headers = readFileSync(`${dist}/_headers`, 'utf8');
assert.ok(headers.includes('X-Content-Type-Options: nosniff'), 'Security headers missing nosniff');
assert.ok(headers.includes('max-age=31536000, immutable'), 'Immutable asset caching missing');
assert.ok(!headers.includes('sitemap-v2.xml'), 'Dead sitemap aliases must not be advertised');

const png = readFileSync(`${dist}/og-cover.png`);
assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Social preview must be PNG');
assert.equal(png.readUInt32BE(16), 1200, 'Social preview width must be 1200px');
assert.equal(png.readUInt32BE(20), 630, 'Social preview height must be 630px');

// 404 must exist and be noindex
const notFound = readFileSync(`${dist}/404.html`, 'utf8');
assert.ok(/noindex/.test(notFound), '404 page must be noindex');

console.log(
  `Verified ${urls.length} indexable routes, ${previewTools.length} quarantined preview routes, ${SITE_PAGES.length} trust pages, robots, headers and the 1200x630 OG PNG.`
);
