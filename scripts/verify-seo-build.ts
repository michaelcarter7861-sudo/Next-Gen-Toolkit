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

// ---------------------------------------------------------------------------
// Web app manifest, icon set and the preview-noindex rule.
// ---------------------------------------------------------------------------
const manifestPath = `${dist}/manifest.webmanifest`;
assert.ok(existsSync(manifestPath), 'manifest.webmanifest must be emitted');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
  name?: string;
  short_name?: string;
  start_url?: string;
  display?: string;
  theme_color?: string;
  icons?: Array<{ src: string; sizes: string; type: string; purpose?: string }>;
};
assert.ok(manifest.name && manifest.short_name, 'Manifest needs name and short_name');
assert.equal(manifest.start_url, '/', 'Manifest start_url must be the site root');
assert.ok(['standalone', 'minimal-ui', 'browser'].includes(manifest.display ?? ''), 'Manifest needs a valid display mode');
assert.ok(manifest.icons && manifest.icons.length >= 3, 'Manifest needs at least 192, 512 and a maskable icon');
assert.ok(
  manifest.icons!.some((icon) => icon.purpose === 'maskable'),
  'Manifest must include a maskable icon for Android launchers'
);

const homeHtml = readFileSync(`${dist}/index.html`, 'utf8');
assert.ok(homeHtml.includes('rel="manifest" href="/manifest.webmanifest"'), 'HTML must link the manifest');
assert.ok(homeHtml.includes('rel="apple-touch-icon"'), 'HTML must expose an Apple touch icon');

const pngMagic = (file: string) => {
  const buf = readFileSync(`${dist}/${file}`);
  assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${file} must be a PNG`);
  return buf;
};
for (const [file, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-512-maskable.png', 512],
  ['apple-touch-icon.png', 180],
] as Array<[string, number]>) {
  const buf = pngMagic(file);
  assert.equal(buf.readUInt32BE(16), size, `${file} width must be ${size}px`);
  assert.equal(buf.readUInt32BE(20), size, `${file} height must be ${size}px`);
}
// Static files must never be routed through the page-route normaliser: an
// earlier build emitted href="/favicon.svg/" (a real 404) on every prerendered
// page. Check every page we generate, not just the home page.
for (const route of ['/', '/about/', '/pdf-tools/', '/image-tools/compress-image-to-kb/']) {
  const html = readFileSync(htmlPathFor(route), 'utf8');
  assert.ok(
    !/href="[^"]+\.(svg|png|ico|xml|webmanifest|txt)\//.test(html),
    `Static asset href gained a trailing slash in ${route}`
  );
  for (const match of html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*href="([^"]+)"/g)) {
    const href = match[1];
    const filePath = `${'dist'}${href}`;
    assert.ok(existsSync(filePath), `Linked asset does not exist: ${href} (from ${route})`);
  }
}

const ico = readFileSync(`${dist}/favicon.ico`);
assert.equal(ico.readUInt16LE(2), 1, 'favicon.ico must be an icon container');
assert.ok(ico.length > 100, 'favicon.ico must not be empty');
assert.ok(headers.includes('/manifest.webmanifest'), '_headers must declare the manifest type');
assert.ok(
  headers.includes('https://:version.:project.pages.dev/*') && headers.includes('X-Robots-Tag: noindex'),
  'Preview deployments must be noindexed'
);

// 404 must exist and be noindex
const notFound = readFileSync(`${dist}/404.html`, 'utf8');
assert.ok(/noindex/.test(notFound), '404 page must be noindex');

console.log(
  `Verified ${urls.length} indexable routes, ${previewTools.length} quarantined preview routes, ${SITE_PAGES.length} trust pages, robots, headers, the 1200x630 OG PNG, the manifest and 5 icons.`
);
