# Final Engineering and Test Report

Run date 2026-11-16. Everything below was executed; nothing is planned-but-described-as-done.
The categories are kept strictly separate, as the order requires.

## Executed results

| Category | Where | Result |
|---|---|---|
| Type check | `npm run lint` (`tsc --noEmit`) | **clean** |
| Unit + integration (Node, Skia, pdf-lib, pdf.js) | `npm test` | **40 / 40 pass, 0 fail, 0 skipped** |
| Production build | `npm run build` | **green** — 37 indexable URLs (24/25 tools, `image-to-text-ocr` quarantined), 6 trust pages, robots, `_headers`, 1200×630 OG PNG |
| Browser E2E, Chromium | GitHub Actions run `43942185418` on `f7d98f9` | **34 / 34 scenarios pass** |
| Browser E2E, Firefox / WebKit | not run | suite supports `BROWSER=firefox|webkit`, never executed |
| Manual device testing | not run | no physical devices available |
| Automated accessibility scan | not run | no axe-core in the toolchain |
| Screen-reader pass | not run | — |

The browser suite is real: GitHub Actions installs Chromium (`playwright install --with-deps`),
builds `dist/`, serves it from a node static server and drives Chromium against it. Four
iterations were needed, and the iterations are the interesting part.

## Defects the browser suite found (and the fixes)

1. **`executeBinaryFiles` swallowed every engine error.** `try { … } finally { … }` with no
   `catch` meant a rejected rasterise promise ("Page 9 does not exist in this 1-page PDF")
   became an unhandled rejection: the spinner stopped, no message appeared, and the page looked
   like it had simply ignored the file. Now caught, shown in the notice area, and stale results
   and gauge are cleared. *This is the single most valuable finding of the run.*
2. **The page-range setting was not in the effect dependencies.** Editing the range after
   uploading re-ran nothing. Added.
3. **Suite bugs that looked like product bugs** (documented so the next person does not chase
   them): category slugs were guessed (`/developer-tools/`) instead of the catalogue's
   `/dev-tools/`; the gauge regex was double-escaped by a heredoc so it never matched digits
   even though the gauge rendered "19.5 KB · Target met"; `a[download]` never exists because
   downloads are triggered by a button that clicks a synthetic anchor; the impossible-range
   copy is "No pages matched…", not the string the test expected.

## Coverage of the 34 scenarios

Direct navigation to all category and tool routes with HTTP status, `<h1>` and canonical checks ·
404 document for an unknown route · refresh on a nested route · no-JS rendering of a trust page ·
image compression to a 20 KB ceiling with gauge parsing, filename and byte-count verification
from the real download event · PDF→image defaulting to every page · PDF→image rejecting an
impossible range with a message · PDF optimisation stating an outcome · OCR preview honesty ·
dark-mode persistence across reload · command palette focus trap and Escape · overflow at
320/768/1440/1920 · console-error sweep with per-route attribution.

## Engine facts worth keeping

- `MAX_CANVAS_PIXELS = 32_000_000` per page (98 % budgeted), `MAX_DOCUMENT_PIXELS = 120_000_000`
  per document, truncation reasons `page-cap` / `pixel-budget` surfaced in the UI.
- PDF outcomes: `already-below-target | met-target | optimized-only | no-gain`; never a
  fabricated "100 % reduced".
- Image outcomes: `met-target | already-below-target | best-effort | unreachable`, plus
  `conversionSkipped` (deliberate) vs `formatFallback` (browser refused the codec).
- Transparency is tested on genuinely transparent PNG fixtures with decoded-alpha assertions;
  JPEG flattening verified pixel by pixel.

## Environment limits (reproduced three times)

Browser binaries cannot be installed in the agent sandbox (`playwright install`,
`@sparticuz/chromium` → exit 127, `apt-get` egress blocked). GitHub Actions is the working path.
Artifact and raw log download are also blocked there, so `run.mjs` prints `::error`/`::notice`
annotations that the check-runs API exposes — that is how the 34/34 figure above was read.
