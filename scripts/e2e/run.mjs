#!/usr/bin/env node
/**
 * Real browser acceptance suite for NextGenToolkit.
 *
 * Runs against the built `dist/` over a local static server. Fixtures are
 * generated in-process (Skia canvas + pdf-lib), so nothing binary needs to be
 * committed and the run is reproducible.
 *
 *   npm ci && npm run build
 *   npx playwright install --with-deps chromium
 *   node scripts/e2e/run.mjs
 *
 * Environment: BASE_URL (test a deployed host), BROWSER (chromium|firefox|webkit),
 * SHOTS_DIR (default audit/screenshots).
 */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { createCanvas } from '@napi-rs/canvas';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const ROOT = path.resolve('dist');
const PORT = Number(process.env.PORT ?? 4173);
const BASE = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;
const SHOTS = path.resolve(process.env.SHOTS_DIR ?? 'audit/screenshots');
const results = [];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2',
};

function serve() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', BASE);
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
    if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
    if (!existsSync(file)) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(await readFile(path.join(ROOT, '404.html')).catch(() => 'not found'));
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  });
  return new Promise((resolve) => server.listen(PORT, '0.0.0.0', () => resolve(server)));
}

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: 'pass' });
    console.log(`  ok    ${name}`);
  } catch (error) {
    const message = String(error?.message ?? error).replace(/\r?\n/g, ' ').slice(0, 900);
    results.push({ name, status: 'fail', error: message });
    console.log(`  FAIL  ${name}\n        ${message}`);
    // CI annotations are readable from the API even when log/artifact download is blocked.
    console.log(`::error title=${name.slice(0, 90)}::${message}`);
  }
}

/* ------------------------------------------------------------------ fixtures */

function photoBuffer(width = 1200, height = 900) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, width, height);
  let seed = 987654321;
  for (let i = 0; i < data.data.length; i += 4) {
    const pixel = i / 4;
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const noise = (seed & 0x3f) - 32;
    data.data[i] = (Math.round(((pixel % width) / width) * 200) + noise + 28) & 0xff;
    data.data[i + 1] = (Math.round((Math.floor(pixel / width) / height) * 200) + noise + 28) & 0xff;
    data.data[i + 2] = (160 + noise) & 0xff;
    data.data[i + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return canvas.toBuffer('image/jpeg', 95);
}

async function pdfBuffer(pageCount = 3) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`Browser test page ${i + 1}`, { x: 48, y: 780, size: 26, font });
    for (let line = 0; line < 10; line++) {
      page.drawText(`Body line ${line} on page ${i + 1}`, { x: 48, y: 700 - line * 24, size: 14, font });
    }
  }
  return Buffer.from(await doc.save());
}

/* --------------------------------------------------------------------- suite */

const engines = { chromium, firefox, webkit };

async function main() {
  if (!existsSync(ROOT)) {
    console.error('dist/ not found — run `npm run build` first.');
    process.exit(1);
  }
  await mkdir(SHOTS, { recursive: true });
  const server = await serve();
  const engine = engines[process.env.BROWSER ?? 'chromium'] ?? chromium;
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
  page.on('pageerror', (e) => consoleErrors.push(String(e.message)));

  console.log(`\nBrowser: ${process.env.BROWSER ?? 'chromium'} · target: ${BASE}\n`);

  const routes = ['/', '/sitemap/', '/about/', '/contact/', '/privacy/', '/terms/',
    '/editorial-policy/', '/changelog/', '/pdf-tools/', '/image-tools/', '/text-tools/',
    '/developer-tools/', '/seo-tools/', '/generator-tools/',
    '/image-tools/compress-image-to-kb/', '/pdf-tools/compress-pdf/',
    '/pdf-tools/pdf-to-image/', '/image-tools/image-to-text-ocr/',
    '/developer-tools/json-formatter-validator/'];

  for (const route of routes) {
    await check(`direct navigation ${route}`, async () => {
      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      if (!response || response.status() >= 400) throw new Error(`HTTP ${response?.status()}`);
      if (!(await page.locator('h1').first().innerText()).trim()) throw new Error('no H1');
      if (!(await page.locator('link[rel=canonical]').getAttribute('href'))) throw new Error('no canonical');
    });
  }

  await check('invalid route returns the 404 document', async () => {
    const response = await page.goto(`${BASE}/this-route-does-not-exist/`, { waitUntil: 'domcontentloaded' });
    if (response?.status() !== 404) throw new Error(`expected 404, got ${response?.status()}`);
  });

  await check('refresh on a nested route keeps the tool', async () => {
    await page.goto(`${BASE}/pdf-tools/compress-pdf/`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    if (!/compress/i.test(await page.locator('body').innerText())) throw new Error('content lost on refresh');
  });

  await check('trust pages render with JavaScript disabled', async () => {
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const p = await noJs.newPage();
    const response = await p.goto(`${BASE}/privacy/`);
    const text = await p.locator('body').innerText();
    if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
    if (text.length < 500) throw new Error('privacy page empty without JS');
    await noJs.close();
  });

  await check('image compression meets a 20 KB ceiling and reports it', async () => {
    await page.goto(`${BASE}/image-tools/compress-image-to-kb/?kb=20`, { waitUntil: 'networkidle' });
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'photo.jpg', mimeType: 'image/jpeg', buffer: photoBuffer(),
    });
    await page.waitForSelector('[role=img]', { timeout: 90_000 });
    const gauge = await page.locator('[role=img]').first().getAttribute('aria-label');
    const match = /Result ([\\d.]+) (B|KB|MB)/.exec(gauge ?? '');
    if (!match) throw new Error(`gauge did not report a result: ${gauge}`);
    const kb = match[2] === 'KB' ? Number(match[1]) : match[2] === 'MB' ? Number(match[1]) * 1024 : Number(match[1]) / 1024;
    if (kb > 20.5) throw new Error(`output ${kb.toFixed(1)} KB exceeded the 20 KB ceiling`);
    if (!/Target met/i.test(gauge)) throw new Error(`expected "Target met", got: ${gauge}`);
    const name = await page.locator('text=/-20kb\\./').first().innerText().catch(() => '');
    if (name && !/-(20)kb\\.(jpg|png|webp)$/i.test(name.trim())) throw new Error(`bad filename: ${name}`);
  });

  await check('a download link exists for the compressed image', async () => {
    const links = await page.locator('a[download]').count();
    if (links === 0) throw new Error('no download control rendered');
  });

  await check('PDF to image renders every page by default', async () => {
    await page.goto(`${BASE}/pdf-tools/pdf-to-image/`, { waitUntil: 'networkidle' });
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'two-pages.pdf', mimeType: 'application/pdf', buffer: await pdfBuffer(2),
    });
    await page.waitForSelector('text=/page-0[12]/i', { timeout: 120_000 });
    const body = await page.locator('body').innerText();
    if (!/page-01/i.test(body) || !/page-02/i.test(body)) throw new Error('both pages should be rendered by default');
    if (/Page 3 does not exist|valid page selection/i.test(body)) throw new Error('default page selection is broken');
  });

  await check('PDF to image rejects an impossible page range with a message', async () => {
    await page.goto(`${BASE}/pdf-tools/pdf-to-image/`, { waitUntil: 'networkidle' });
    await page.locator('#ngt-pdf-page-range').fill('9');
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'tiny.pdf', mimeType: 'application/pdf', buffer: await pdfBuffer(1),
    });
    await page.waitForSelector('text=/does not exist|valid page/i', { timeout: 60_000 });
  });

  await check('PDF optimisation states an outcome instead of a fabricated saving', async () => {
    await page.goto(`${BASE}/pdf-tools/compress-pdf/`, { waitUntil: 'networkidle' });
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'report.pdf', mimeType: 'application/pdf', buffer: await pdfBuffer(3),
    });
    await page.waitForSelector('text=/Target met|target NOT met|No gain|Already under/i', { timeout: 90_000 });
    const body = await page.locator('body').innerText();
    if (/100% Reduced/i.test(body)) throw new Error('impossible claim found in the result panel');
  });

  await check('OCR stays an honest preview with no fabricated text', async () => {
    await page.goto(`${BASE}/image-tools/image-to-text-ocr/`, { waitUntil: 'networkidle' });
    const body = await page.locator('body').innerText();
    if (!/preview/i.test(body)) throw new Error('no preview badge');
    if (/Extraction Complete|INVOICE #NGT/i.test(body)) throw new Error('fabricated OCR text present');
  });

  await check('dark mode applies and persists across reload', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /theme|dark|light/i }).first().click();
    const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await page.reload({ waitUntil: 'networkidle' });
    const after = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    if (before !== after) throw new Error('theme did not persist');
    await page.screenshot({ path: path.join(SHOTS, `home-${before ? 'dark' : 'light'}.png`) });
  });

  await check('command palette traps focus and closes on Escape', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.keyboard.press('Control+k');
    const dialog = page.locator('[role=dialog]');
    await dialog.waitFor({ timeout: 5000 });
    for (let i = 0; i < 14; i++) await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => {
      const root = document.querySelector('[role=dialog]');
      return !!root && root.contains(document.activeElement);
    });
    if (!inside) throw new Error('focus escaped the dialog');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached', timeout: 5000 });
  });

  for (const [width, label] of [[320, 'mobile-320'], [768, 'tablet-768'], [1440, 'desktop-1440'], [1920, 'desktop-1920']]) {
    await check(`no horizontal overflow at ${width}px`, async () => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 2) throw new Error(`horizontal overflow: ${overflow}px`);
      await page.screenshot({ path: path.join(SHOTS, `${label}.png`) });
    });
  }

  await check('no console errors during the suite (excluding tag manager)', async () => {
    const relevant = consoleErrors.filter((m) => !/googletagmanager|analytics|gtag|ERR_BLOCKED/i.test(m));
    if (relevant.length) throw new Error(relevant.slice(0, 3).join(' | '));
  });

  await browser.close();
  server.close();

  const failed = results.filter((r) => r.status === 'fail');
  await writeFile(path.join(SHOTS, 'e2e-results.json'), JSON.stringify({
    ranAt: new Date().toISOString(), baseUrl: BASE, browser: process.env.BROWSER ?? 'chromium',
    totals: { total: results.length, pass: results.length - failed.length, fail: failed.length },
    results,
  }, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} browser scenarios passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  const message = String(error?.stack ?? error).replace(/\r?\n/g, ' ').slice(0, 900);
  console.error(error);
  console.log(`::error title=suite-crashed::${message}`);
  process.exit(1);
});
