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
- **34 scenarios**: every route (status, `<h1>`, canonical), 404, nested refresh, no-JS trust
  page, 20 KB ceiling with gauge parsing and real download verification, PDF→image default
  all-pages and impossible range, PDF optimisation outcome, OCR preview honesty, dark-mode
  persistence, palette focus trap + Escape, overflow at 320/768/1440/1920, console-error sweep
  attributed per route.
- **Output**: screenshots and `e2e-results.json` in `audit/screenshots/` (gitignored), plus
  `::error` / `::notice` annotations so failures are readable through the GitHub check-runs API.
- **Where it runs**: `.github/workflows/browser-e2e.yml` (build → unit tests → Chromium →
  suite → upload evidence). It never deploys.
