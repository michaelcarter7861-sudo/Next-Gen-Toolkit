# Browser acceptance suite

`node scripts/e2e/run.mjs` drives a real browser against a real production build.

```bash
npm ci
npm run build            # the suite serves dist/, it does not build it
npx playwright install chromium
node scripts/e2e/run.mjs # BASE_URL=https://nextgentoolkit.pages.dev to test a deployment
```

- **Fixtures are generated in-process**: a Skia gradient+noise JPEG, and 1/2/3-page PDFs from
  pdf-lib. Nothing is committed as binary test data.
- **41–42 scenarios** (42 where the engine emits a real download event): every route (status, `<h1>`, canonical), 404, nested refresh, no-JS trust
  page, 20 KB ceiling with gauge parsing and real download verification, PDF→image default
  all-pages and impossible range, PDF optimisation outcome, OCR preview honesty, dark-mode
  persistence, palette focus trap + Escape, overflow at 320/768/1440/1920, console-error sweep
  attributed per route.
- **Output**: screenshots and `e2e-results.json` in `audit/screenshots/` (gitignored), plus
  `::error` / `::notice` annotations so failures are readable through the GitHub check-runs API.
- **Where it runs**: `.github/workflows/browser-e2e.yml`, three jobs: chromium,
  firefox and webkit functional suites (build → unit tests → browser install →
  suite → upload evidence) plus an axe-core accessibility job. It never deploys.
- **Cross-browser note**: Firefox and WebKit refuse to start a download from a
  synthetic click, so the suite instruments the anchor the app creates and
  asserts the contract (blob URL + target filename) there; the real download
  event, its filename and its byte count are asserted in Chromium and WebKit.

```bash
npm run test:a11y   # axe-core scan of 14 page families, light + dark
```
