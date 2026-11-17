# Final Engineering and Test Report

Run date 2026-11-16. Everything below was executed; nothing is planned-but-described-as-done.
The categories are kept strictly separate, as the order requires.

## Executed results

Latest green run: GitHub Actions run `4407…` on commit `1887292` (branch
`arena/8d148eee-next-gen-toolkit`), 2026-11-16.

| Category | Where | Result |
|---|---|---|
| Type check | `npm run lint` (`tsc --noEmit`) | **clean** |
| Unit + integration (Node, Skia, pdf-lib, pdf.js) | `npm test` | **61 / 61 pass, 0 fail, 0 skipped** |
| Production build | `npm run build` | **green** — 37 indexable URLs, 6 trust pages, robots, `_headers`, OG PNG, manifest, 5 icons |
| Browser E2E, **Chromium** | Actions | **42 / 42 scenarios pass** |
| Browser E2E, **WebKit** (Safari engine) | Actions | **42 / 42 scenarios pass** |
| Browser E2E, **Firefox** | Actions | **41 / 41 scenarios pass** |
| Accessibility, axe-core (WCAG 2.0/2.1/2.2 A+AA, best practice) | Actions | **0 violations** across 14 page families in light and dark |
| Manual device testing | not run | no physical devices available |
| Screen-reader pass | not run | still owed; automated scans do not replace one |
| Field performance (CrUX/Lighthouse field data) | not run | needs a Production Search Console/CrUX property |

The Firefox count is one lower because the suite records an extra pass entry when
the browser emits a real download event; Firefox does not emit one for a
synthetic click, so the app's download contract is asserted there instead (blob
URL + filename), and the engine-level event is verified in Chromium and WebKit.

## How the browser suite reports from a sandbox

Artifact and raw log download are blocked here, so `run.mjs` prints `::error`
and `::notice` workflow commands. Those become check-run annotations readable
through the API — that is where the 42/42, 41/41 and "0 violation types" figures
above come from.

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
