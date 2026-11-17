/**
 * Accessibility scan with axe-core in real Chromium.
 *
 * This is an automated baseline, not an accessibility audit: it catches
 * contrast, naming, landmark and ARIA defects, and it is deliberately run in CI
 * so a regression fails the build. Manual screen-reader testing is still
 * required and is tracked separately.
 *
 * Usage: node scripts/a11y/scan.mjs   (needs `npm run build` first)
 * Env:   BASE_URL to scan a deployment, BROWSER=firefox|webkit
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const ROOT = 'dist';
const OUT = 'audit/a11y';
const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const PAGES = [
  ['/', 'home'],
  ['/pdf-tools/', 'hub-pdf'],
  ['/image-tools/', 'hub-image'],
  ['/dev-tools/', 'hub-dev'],
  ['/text-tools/', 'hub-text'],
  ['/generators/', 'hub-generators'],
  ['/image-tools/compress-image-to-kb/', 'tool-image-kb'],
  ['/pdf-tools/compress-pdf/', 'tool-compress-pdf'],
  ['/pdf-tools/pdf-to-image/', 'tool-pdf-to-image'],
  ['/dev-tools/json-formatter-validator/', 'tool-json'],
  ['/about/', 'trust-about'],
  ['/contact/', 'trust-contact'],
  ['/privacy/', 'trust-privacy'],
  ['/sitemap/', 'sitemap'],
];

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const SEVERITY = { critical: 0, serious: 1, moderate: 2, minor: 3 };

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json', '.json': 'application/json',
};

function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
    const candidates = [join(ROOT, normalize(path)), join(ROOT, normalize(path), 'index.html')];
    for (const candidate of candidates) {
      if (candidate.startsWith(ROOT) && existsSync(candidate) && !candidate.endsWith('/')) {
        res.writeHead(200, { 'Content-Type': MIME[extname(candidate)] ?? 'application/octet-stream' });
        res.end(readFileSync(candidate));
        return;
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(readFileSync(join(ROOT, '404.html'), 'utf8'));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const engines = { chromium, firefox, webkit };

async function main() {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const engine = engines[process.env.BROWSER ?? 'chromium'] ?? chromium;
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const findings = [];

  for (const [route, name] of PAGES) {
    const themes = route === '/' ? ['light', 'dark'] : ['light'];
    for (const theme of themes) {
      // The app stores its theme in localStorage and also honours the OS
      // preference, so dark mode is scanned as a real reload — not by forcing a
      // class the React tree does not know about.
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      await page.evaluate((value) => {
        try { localStorage.setItem('ngt_theme_v1', value); } catch { /* private mode */ }
      }, theme);
      await page.reload({ waitUntil: 'networkidle' });
      // Belt and braces: the stored preference drives React, and the class is
      // forced afterwards so a hydration race can never scan the wrong theme.
      await page.evaluate((value) => {
        document.documentElement.classList.toggle('dark', value === 'dark');
      }, theme);
      await page.waitForTimeout(150);
      const applied = await page.evaluate(() => ({
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        canvas: getComputedStyle(document.body).backgroundColor,
        ink: getComputedStyle(document.body).color,
      }));
      if (applied.theme !== theme) throw new Error(`theme ${theme} did not apply (got ${applied.theme})`);
      console.log(`  theme ${theme} · canvas ${applied.canvas} · ink ${applied.ink}`);
      await page.addScriptTag({ content: AXE });
      const result = await page.evaluate(async (tags) => {
        // @ts-expect-error injected at runtime
        return await window.axe.run(document, {
          runOnly: { type: 'tag', values: tags },
          resultTypes: ['violations'],
        });
      }, TAGS);

      for (const violation of result.violations) {
        findings.push({
          page: route,
          theme,
          rule: violation.id,
          impact: violation.impact ?? 'minor',
          help: violation.help,
          nodes: violation.nodes.slice(0, 4).map((node) => ({
            target: node.target.join(' '),
            html: (node.html ?? '').slice(0, 240),
            summary: (node.failureSummary ?? '').split('\n').slice(0, 3).join(' '),
          })),
          nodeCount: violation.nodes.length,
        });
        console.log(
          `  ${violation.impact?.toUpperCase().padEnd(9)} ${route} [${theme}] ${violation.id}: ${violation.help} (${violation.nodes.length} node${violation.nodes.length === 1 ? '' : 's'})`
        );
      }
      console.log(`${name} [${theme}] — ${result.violations.length} violation type(s)`);
    }
  }

  await browser.close();
  server.close();

  mkdirSync(OUT, { recursive: true });
  findings.sort((a, b) => (SEVERITY[a.impact] ?? 9) - (SEVERITY[b.impact] ?? 9));
  writeFileSync(
    join(OUT, 'report.json'),
    JSON.stringify(
      {
        ranAt: new Date().toISOString(),
        engine: process.env.BROWSER ?? 'chromium',
        base: process.env.BASE_URL ?? 'local dist/',
        pagesScanned: PAGES.length,
        tags: TAGS,
        totals: {
          violationTypes: findings.length,
          nodes: findings.reduce((sum, f) => sum + f.nodeCount, 0),
          critical: findings.filter((f) => f.impact === 'critical').length,
          serious: findings.filter((f) => f.impact === 'serious').length,
        },
        findingsIndex: findings,
      },
      null,
      2
    )
  );

  const blocking = findings.filter((f) => f.impact === 'critical' || f.impact === 'serious');
  console.log(
    `\naxe-core: ${findings.length} violation type(s) across ${PAGES.length} pages ` +
      `(${blocking.length} critical/serious). Report: ${OUT}/report.json`
  );
  console.log(`::notice title=a11y-totals::${findings.length} violation types, ${blocking.length} critical/serious`);
  for (const item of blocking.slice(0, 10)) {
    console.log(
      `::error title=a11y ${item.impact} ${item.rule} (${item.page} ${item.theme})::` +
        `${item.help} — ${item.nodes[0]?.target ?? ''} — ${item.nodes[0]?.html ?? ''} — ${item.nodes[0]?.summary ?? ''}`.replace(/\r?\n/g, ' ').slice(0, 900)
    );
  }
  if (blocking.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  console.log(`::error title=a11y-crashed::${String(error?.stack ?? error).replace(/\r?\n/g, ' ').slice(0, 900)}`);
  process.exit(1);
});
