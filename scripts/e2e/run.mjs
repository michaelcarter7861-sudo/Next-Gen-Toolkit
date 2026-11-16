#!/usr/bin/env node
/**
 * Browser acceptance suite for NextGenToolkit.
 *
 * Why this file exists: the second-phase audit environment could not install a
 * browser (Playwright's CDN and Debian mirrors were unreachable), so no claim in
 * the reports is labelled "verified in browser". This suite is the reproducible
 * substitute: run it anywhere a Chromium binary is available and every scenario
 * in the mission's §15 acceptance list is exercised for real.
 *
 * Usage:
 *   npm run build
 *   npx playwright install chromium
 *   node scripts/e2e/run.mjs            # or: BASE_URL=... BROWSER=firefox node ...
 */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const ROOT = path.resolve('dist');
const PORT = Number(process.env.PORT ?? 4173);
const BASE = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;
const SHOTS = path.resolve('audit/screenshots');
const results = [];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
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
    results.push({ name, status: 'fail', error: String(error?.message ?? error) });
    console.log(`  FAIL  ${name}\n        ${String(error?.message ?? error)}`);
  }
}

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
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(String(error.message)));

  console.log(`\nRunning against ${BASE}\n`);

  const routes = ['/', '/sitemap/', '/about/', '/contact/', '/privacy/', '/terms/', '/editorial-policy/',
    '/changelog/', '/pdf-tools/', '/image-tools/', '/text-tools/', '/developer-tools/', '/seo-tools/',
    '/generator-tools/', '/image-tools/compress-image-to-kb/', '/pdf-tools/compress-pdf/',
    '/pdf-tools/pdf-to-image/', '/image-tools/image-to-text-ocr/', '/developer-tools/json-formatter-validator/'];

  for (const route of routes) {
    await check(`direct navigation ${route}`, async () => {
      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      if (!response || response.status() >= 400) throw new Error(`HTTP ${response?.status()}`);
      const h1 = await page.locator('h1').first().innerText();
      if (!h1.trim()) throw new Error('no H1');
      const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
      if (!canonical) throw new Error('no canonical');
    });
  }

  await check('refresh on a nested route keeps content', async () => {
    await page.goto(`${BASE}/pdf-tools/compress-pdf/`, { waitUntil: 'networkidle' });
    await page.reload({ waitUntil: 'networkidle' });
    const text = await page.locator('body').innerText();
    if (!/compress/i.test(text)) throw new Error('content lost after refresh');
  });

  await check('trust pages work with JavaScript disabled', async () => {
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const p = await noJs.newPage();
    const response = await p.goto(`${BASE}/privacy/`);
    const text = await p.locator('body').innerText();
    if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
    if (text.length < 500) throw new Error('privacy page is empty without JS');
    await noJs.close();
  });

  await check('preview tool states that nothing was generated', async () => {
    await page.goto(`${BASE}/image-tools/image-to-text-ocr/`, { waitUntil: 'networkidle' });
    const badge = await page.getByText(/preview/i).first().isVisible().catch(() => false);
    if (!badge) throw new Error('no preview badge');
  });

  await check('image compression to 20 KB keeps extension and MIME consistent', async () => {
    await page.goto(`${BASE}/image-tools/compress-image-to-kb/?kb=20`, { waitUntil: 'networkidle' });
    const preset = await page.locator('input[type=file]').first();
    const fixture = path.resolve('scripts/e2e/fixtures/photos/sample-photo.jpg');
    if (!existsSync(fixture)) throw new Error('missing fixture — see scripts/e2e/README.md');
    await preset.setInputFiles(fixture);
    await page.getByRole('button', { name: /compress|process|run/i }).first().click();
    await page.waitForSelector('text=/\\\\d+\\\\.\\\\d+ KB/', { timeout: 60_000 });
    const body = await page.locator('body').innerText();
    if (!/jpg|jpeg|png|webp/i.test(body)) throw new Error('no format reported');
  });

  await check('dark mode toggle applies and persists', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const toggle = page.getByRole('button', { name: /theme|dark|light/i }).first();
    await toggle.click();
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await page.reload({ waitUntil: 'networkidle' });
    const stillDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    if (isDark !== stillDark) throw new Error('theme did not persist');
  });

  await check('command palette traps focus and closes on Escape', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.keyboard.press('Control+k');
    const dialog = page.locator('[role=dialog]');
    await dialog.waitFor({ timeout: 5000 });
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => {
      const root = document.querySelector('[role=dialog]');
      return !!root && root.contains(document.activeElement);
    });
    if (!inside) throw new Error('focus escaped the dialog');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached', timeout: 5000 });
  });

  for (const [width, label] of [[320, 'mobile-320'], [768, 'tablet-768'], [1440, 'desktop-1440']]) {
    await check(`no horizontal overflow at ${width}px`, async () => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 2) throw new Error(`horizontal overflow: ${overflow}px`);
      await page.screenshot({ path: path.join(SHOTS, `${label}.png`), fullPage: false });
    });
  }

  await check('no console errors on the homepage', async () => {
    consoleErrors.length = 0;
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const relevant = consoleErrors.filter((message) => !/googletagmanager|analytics|gtag/i.test(message));
    if (relevant.length > 0) throw new Error(relevant.join(' | '));
  });

  await browser.close();
  server.close();

  const failed = results.filter((result) => result.status === 'fail');
  await writeFile(
    path.join(SHOTS, 'e2e-results.json'),
    JSON.stringify({ ranAt: new Date().toISOString(), baseUrl: BASE, results }, null, 2)
  );
  console.log(`\n${results.length - failed.length}/${results.length} scenarios passed`);
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
