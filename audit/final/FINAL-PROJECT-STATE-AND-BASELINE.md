# Final Project State and Baseline

Snapshot: 2026-11-16, branch `arena/8d148eee-next-gen-toolkit`.

## What the repository actually is

| Property | Value |
|---|---|
| Stack | Vite + React + TypeScript, static output, no backend in production |
| Package manager | npm (`package-lock.json` committed; `bun.lock` removed) |
| Production host | Cloudflare Pages, `https://nextgentoolkit.pages.dev/` |
| Diagnostic host | GitHub Pages, `https://michaelcarter7861-sudo.github.io/Next-Gen-Toolkit/` (must stay noindex) |
| Indexable routes | 37 (24/25 tools; `image-to-text-ocr` quarantined) |
| Trust pages | 6 |
| Installed packages | 244 (`npm install`/`npm ci` resolved 244 packages, exit 0) |
| Unit/integration tests | 40 passing (`npm test`) |
| Browser E2E | executed in GitHub Actions this run — see `FINAL-ENGINEERING-AND-TEST-REPORT.md` |
| Build | green: typecheck, SEO generation, SEO verification, OG PNG |

## Architecture

```
src/pages/          route components, one per tool + trust pages
src/components/     ToolWorkspace (shared shell), ByteGauge, CommandModal, cards
src/utils/          engines: imageEngine, binaryEngines (pdf-lib), pdfRaster (pdf.js),
                    textEngine, split/merge/extract, all pure enough to unit test in Node
src/data/           toolsCatalog (single source of truth for routes, SEO, sitemap)
scripts/            generate-seo-pages, verify-seo-build, e2e/run.mjs
```

Two rasterisers exist on purpose: `pdfRaster.ts` (Node, pdf.js + Skia) powers tests, and
`pdfRasterBrowser.ts` mirrors its result type in the browser. Keeping the result type identical
is what lets the UI treat truncation uniformly.

## Truth table for previously conflicting claims

| Claim | Verdict | Evidence |
|---|---|---|
| "PDF→image is shipped" | **True** | `pdf-to-image` route is live, indexable, and rasterises with pdf.js in-tab |
| "PDF→image is not shipped" | False — stale | contradicted by the route and by the browser suite |
| "235 packages" | False | measured: 244 |
| "244 packages" | True | `npm install` output, exit 0 |
| "36 tests" | Superseded | 40 unit/integration; browser tests are counted separately |
| "Privacy = local processing" | Over-claim | Sejda Desktop and PDF24 Creator also process locally; locality ≠ no telemetry, and GTM is loaded |
| "D1–D4 pending approvals" | Partly false | D2/D3/D4 are decided and implemented; D1 (contact address) was promised and never supplied, so `PUBLIC_CONTACT = null` |

## Environment constraints recorded for the next run

- Browser binaries cannot be installed in this sandbox (`playwright install`, `@sparticuz/chromium`,
  `apt-get` all blocked). The browser suite therefore runs in GitHub Actions; artifacts and raw
  logs are also unreachable from here, so the suite emits CI annotations.
- `node_modules` does not survive a turn: `npm ci` first.
- `curl` to production fails with `SSL_ERROR_SYSCALL`; use the page fetcher.

## Baseline numbers to beat

37 indexable URLs · 40 unit tests · 244 packages · build under the CI timeout · browser suite
green at 320–1920 px. Any future change that lowers any of these is a regression.
