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
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    // Firefox needs this explicit; Chromium defaults to accepting downloads.
    acceptDownloads: true,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  let currentRoute = '/';
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    // Location matters: a 404 for a subresource is a defect, a 404 for the page we
    // deliberately requested is the test doing its job.
    consoleErrors.push(`[on ${currentRoute}] ${m.text()} @ ${m.location()?.url ?? 'unknown'}`);
  });
  page.on('response', (r) => {
    if (r.status() === 404) consoleErrors.push(`[on ${currentRoute}] 404 ${new URL(r.url()).pathname}`);
  });
  page.on('requestfailed', (r) => {
    const failure = r.failure()?.errorText ?? 'unknown';
    if (/ERR_ABORTED/.test(failure)) return;
    consoleErrors.push(`[on ${currentRoute}] requestfailed ${new URL(r.url()).pathname} ${failure}`);
  });
  page.on('pageerror', (e) => consoleErrors.push(String(e.message)));

  console.log(`\nBrowser: ${process.env.BROWSER ?? 'chromium'} · target: ${BASE}\n`);

  // Slugs come from src/data/toolsCatalog.ts: categories are /dev-tools/, /image-tools/,
  // /pdf-tools/, /text-tools/, /generators/. An earlier draft of this suite guessed
  // /developer-tools/ and /seo-tools/, which is what produced the 404 annotations.
  const routes = ['/', '/sitemap/', '/about/', '/contact/', '/privacy/', '/terms/',
    '/editorial-policy/', '/changelog/', '/pdf-tools/', '/image-tools/', '/text-tools/',
    '/dev-tools/', '/generators/',
    '/image-tools/compress-image-to-kb/', '/pdf-tools/compress-pdf/',
    '/pdf-tools/pdf-to-image/', '/image-tools/image-to-text-ocr/',
    '/dev-tools/json-formatter-validator/'];

  for (const route of routes) {
    await check(`direct navigation ${route}`, async () => {
      currentRoute = route;
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
    const match = /Result\s*([\d.]+)\s*(B|KB|MB)/i.exec(gauge ?? '');
    if (!match) throw new Error(`gauge did not report a result: ${gauge}`);
    const kb = match[2] === 'KB' ? Number(match[1]) : match[2] === 'MB' ? Number(match[1]) * 1024 : Number(match[1]) / 1024;
    if (kb > 20.5) throw new Error(`output ${kb.toFixed(1)} KB exceeded the 20 KB ceiling`);
    if (!/Target met/i.test(gauge)) throw new Error(`expected "Target met", got: ${gauge}`);
    const name = await page.getByText(/-20kb\./).first().innerText().catch(() => '');
    if (name && !/-20kb\.(jpg|png|webp)$/i.test(name.trim())) throw new Error(`bad filename: ${name}`);
  });

  await check('the compressed image produces a target-named download', async () => {
    const button = page.getByRole('button', { name: 'Download', exact: true }).first();
    if (!(await button.count())) throw new Error('no download control rendered');

    // Instrument the anchor the app creates. Firefox and WebKit refuse to start a
    // download from a synthetic click, so the app's contract (a blob URL and a
    // target-named file) is asserted in every browser, and the real engine-level
    // download event is asserted where the engine emits one.
    await page.evaluate(() => {
      window.__ngtDownloads = [];
      const original = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function patched() {
        if (this.download) window.__ngtDownloads.push({ name: this.download, href: String(this.href) });
        return original.call(this);
      };
    });

    const downloadEvent = page.waitForEvent('download', { timeout: 20_000 }).catch(() => null);
    await button.dispatchEvent('click');
    const download = await downloadEvent;

    const recorded = await page.evaluate(() => window.__ngtDownloads ?? []);
    if (recorded.length === 0) throw new Error('clicking Download created no download anchor');
    const { name, href } = recorded[recorded.length - 1];
    if (!/-20kb\.(jpg|png|webp)$/i.test(name)) throw new Error(`unexpected filename: ${name}`);
    if (!href.startsWith('blob:')) throw new Error(`download href is not a local blob URL: ${href.slice(0, 40)}`);

    if (download) {
      if (download.suggestedFilename() !== name) {
        throw new Error(`engine reported ${download.suggestedFilename()} but the app named it ${name}`);
      }
      const failure = await download.failure();
      if (failure) throw new Error(`download failed: ${failure}`);
      const stream = await download.createReadStream();
      let bytes = 0;
      for await (const chunk of stream ?? []) bytes += chunk.length;
      if (bytes === 0) throw new Error('downloaded file is empty');
      if (bytes > 20.5 * 1024) {
        throw new Error(`downloaded file is ${(bytes / 1024).toFixed(1)} KB, above the 20 KB ceiling`);
      }
      results.push({ name: 'download event verified by the browser engine', status: 'pass' });
    }
  });

  await check('PDF to image renders every page by default', async () => {
    await page.goto(`${BASE}/pdf-tools/pdf-to-image/`, { waitUntil: 'networkidle' });
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'two-pages.pdf', mimeType: 'application/pdf', buffer: await pdfBuffer(2),
    });
    await page.waitForSelector('text=/page-0[12]/i', { timeout: 120_000 });
    const body = await page.locator('body').innerText();
    if (!/page-01/i.test(body) || !/page-02/i.test(body)) throw new Error('both pages should be rendered by default');
    if (/No pages matched|does not exist|valid page selection/i.test(body)) throw new Error('default page selection is broken');
  });

  await check('PDF to image rejects an impossible page range with a message', async () => {
    await page.goto(`${BASE}/pdf-tools/pdf-to-image/`, { waitUntil: 'networkidle' });
    await page.locator('#ngt-pdf-page-range').fill('9');
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'tiny.pdf', mimeType: 'application/pdf', buffer: await pdfBuffer(1),
    });
    await page.waitForSelector('text=/No pages matched|does not exist|valid page/i', { timeout: 60_000 });
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

  for (const [width, label] of [[320, 'mobile-320'], [375, 'mobile-375'], [430, 'mobile-430'], [768, 'tablet-768'], [1024, 'tablet-1024'], [1440, 'desktop-1440'], [1920, 'desktop-1920']]) {
    await check(`no horizontal overflow at ${width}px`, async () => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE, { waitUntil: 'networkidle' });
      const report = await page.evaluate(() => {
        const doc = document.documentElement;
        const overflow = doc.scrollWidth - doc.clientWidth;
        const offenders = [];
        if (overflow > 2) {
          for (const element of Array.from(document.querySelectorAll('body *'))) {
            const box = element.getBoundingClientRect();
            if (box.right > doc.clientWidth + 2 && box.width > 0) {
              offenders.push({
                tag: element.tagName.toLowerCase(),
                classes: (element.getAttribute('class') ?? '').slice(0, 160),
                width: Math.round(box.width),
                right: Math.round(box.right),
              });
            }
          }
          offenders.sort((a, b) => b.right - a.right);
        }
        return { overflow, offenders: offenders.slice(0, 4) };
      });
      if (report.overflow > 2) {
        const detail = report.offenders
          .map((o) => `${o.tag}.${o.classes.split(' ').slice(0, 6).join('.')} (w=${o.width}, right=${o.right})`)
          .join(' | ');
        throw new Error(`horizontal overflow: ${report.overflow}px by ${detail || 'unknown element'}`);
      }
      await page.screenshot({ path: path.join(SHOTS, `${label}.png`) });
    });
  }

  await check('manifest, icons and theme colours are wired', async () => {
    const html = await page.goto(BASE, { waitUntil: 'networkidle' }).then(() => page.content());
    for (const needle of ['rel="manifest"', 'apple-touch-icon', 'manifest.webmanifest']) {
      if (!html.includes(needle)) throw new Error(`missing ${needle}`);
    }
    const themeColours = await page.locator('meta[name=theme-color]').count();
    if (themeColours < 2) throw new Error(`expected light and dark theme-color meta, found ${themeColours}`);

    const manifestResponse = await page.request.get(`${BASE}/manifest.webmanifest`);
    if (manifestResponse.status() !== 200) throw new Error(`manifest HTTP ${manifestResponse.status()}`);
    const manifest = await manifestResponse.json();
    if (!manifest.icons?.some((icon) => icon.purpose === 'maskable')) throw new Error('no maskable icon');
    if (manifest.display !== 'standalone') throw new Error(`unexpected display mode: ${manifest.display}`);

    for (const [path, expected] of [
      ['/icon-192.png', 192],
      ['/icon-512.png', 512],
      ['/icon-512-maskable.png', 512],
      ['/apple-touch-icon.png', 180],
      ['/favicon.ico', null],
    ]) {
      const response = await page.request.get(`${BASE}${path}`);
      if (response.status() !== 200) throw new Error(`${path} HTTP ${response.status()}`);
      const body = await response.body();
      if (expected && body.readUInt32BE(16) !== expected) {
        throw new Error(`${path} is ${body.readUInt32BE(16)}px wide, expected ${expected}px`);
      }
      if (!expected && body.readUInt16LE(2) !== 1) throw new Error('favicon.ico is not an icon container');
    }
  });

  await check('the results panel names itself and counts the output', async () => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/image-tools/compress-image-to-kb/?kb=40`, { waitUntil: 'networkidle' });
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'photo.jpg', mimeType: 'image/jpeg', buffer: photoBuffer(),
    });
    await page.getByRole('heading', { name: /^Results/ }).waitFor({ timeout: 90_000 });
    const heading = await page.getByRole('heading', { name: /^Results/ }).innerText();
    if (!/1 file/.test(heading)) throw new Error(`results heading did not count the file: ${heading}`);
  });

  await check('reduced motion removes long animations', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    const longAnimations = await page.evaluate(() => {
      let count = 0;
      for (const element of Array.from(document.querySelectorAll('*'))) {
        const style = getComputedStyle(element);
        const duration = Number.parseFloat(style.animationDuration || '0');
        if (duration > 0.05 && style.animationIterationCount !== '1') count += 1;
      }
      return count;
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    if (longAnimations > 0) throw new Error(`${longAnimations} elements still animate with reduced motion`);
  });

  await check('a cancelled run says what happened', async () => {
    await page.goto(`${BASE}/pdf-tools/pdf-to-image/`, { waitUntil: 'networkidle' });
    // 24 pages is deliberately more work than the click needs, so the button is
    // still on screen when the test presses it.
    await page.locator('input[type=file]').first().setInputFiles({
      name: 'many-pages.pdf', mimeType: 'application/pdf', buffer: await pdfBuffer(24),
    });
    const cancel = page.getByRole('button', { name: 'Cancel', exact: true });
    await cancel.waitFor({ timeout: 30_000 });
    await cancel.click();
    await page.waitForFunction(
      () => /Cancelled/i.test(document.body.innerText),
      undefined,
      { timeout: 120_000 }
    );
    const body = await page.locator('body').innerText();
    if (!/Cancelled/i.test(body)) throw new Error('no cancellation message shown');
    // The honest wording: it says how many finished rather than pretending none ran.
    if (!/finished file|Nothing was written/i.test(body)) {
      throw new Error('cancellation message does not say what was kept');
    }
  });

  await check('no console errors during the suite (excluding tag manager)', async () => {
    // The invalid-route scenario deliberately requests a 404 document.
    const relevant = consoleErrors.filter(
      (m) =>
        !/googletagmanager|analytics|gtag|ERR_BLOCKED|\/g\/collect|google-analytics|this-route-does-not-exist/i.test(
          m
        )
    );
    if (relevant.length) throw new Error(relevant.slice(0, 5).join(' | '));
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
  console.log(`::notice title=browser-suite-totals::${results.length - failed.length}/${results.length} scenarios passed (${process.env.BROWSER ?? 'chromium'})`);
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  const message = String(error?.stack ?? error).replace(/\r?\n/g, ' ').slice(0, 900);
  console.error(error);
  console.log(`::error title=suite-crashed::${message}`);
  process.exit(1);
});
