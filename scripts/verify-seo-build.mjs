import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://nextgentoolkit.pages.dev';
const origin = new URL(siteUrl).origin;
const basePath = new URL(siteUrl).pathname.replace(/\\/+$/, '');
const dist = 'dist';

const sitemap = readFileSync(`${dist}/sitemap.xml`, 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\\/loc>/g)].map((match) => match[1]);

assert.equal(urls.length, 32, 'Expected homepage + sitemap + 5 hubs + 25 tool URLs');

for (const url of urls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, origin, `Unexpected sitemap origin: ${url}`);
  const route = parsed.pathname.slice(basePath.length).replace(/^\\/+|\\/+$/g, '');
  const htmlPath = route ? `${dist}/${route}/index.html` : `${dist}/index.html`;
  assert.ok(existsSync(htmlPath), `Missing prerendered route: ${htmlPath}`);

  const html = readFileSync(htmlPath, 'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="${url}"`), `Missing canonical: ${url}`);
  assert.ok(html.includes('<h1>'), `Missing static H1: ${url}`);
  assert.ok(html.includes('All Tools Directory'), `Missing static directory link: ${url}`);
}

const robots = readFileSync(`${dist}/robots.txt`, 'utf8');
assert.ok(robots.includes(`${siteUrl.replace(/\\/+$/, '')}/sitemap.xml`), 'robots.txt must reference sitemap.xml');

const png = readFileSync(`${dist}/og-cover.png`);
assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Social preview must be PNG');
assert.equal(png.readUInt32BE(16), 1200, 'Social preview width must be 1200px');
assert.equal(png.readUInt32BE(20), 630, 'Social preview height must be 630px');

console.log(`Verified ${urls.length} static SEO routes, robots.txt, canonicals, directory links, and 1200x630 OG PNG.`);
