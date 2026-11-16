# Final Implementation Changelog

Branch `arena/8d148eee-next-gen-toolkit`. Base: `4d229b6` (main).
Commits in this final phase, newest last:

| Commit | Contents |
|---|---|
| `b1afe52` | Second-phase commit: engine rewrite work, AI assistant gated off, contact scrubbed, 21→40 test expansion |
| `61eb35a` | `fix(final)` — page-selection default, native-resolution compression, `conversionSkipped`, 120 MP document budget, URL revocation, real browser suite, 8 new final reports |
| `02d15b5` | `test(e2e)` — CI annotations so browser failures are readable through the check-runs API |

## Product fixes

**1. Page selection (correctness defect).** `ToolWorkspace.tsx` had one range string shared by
the split tool and the PDF→image tool, defaulting to `'1-2, 4'`. Rendering a 1-page PDF
therefore failed by default. Two states now exist: `pdfRangeSyntax` (split, default `'1-2'`) and
`pdfImagePages` (render, default `'all'`), each wired to its own input.

**2. Quality-first image compression.** The encoder used to downscale pre-emptively when the
target was small (≤ 25 KB, ≤ 55 KB), throwing away resolution before trying quality. The search
now starts at native resolution and lowers resolution only when the quality floor cannot reach
the ceiling.

**3. Honest outcome taxonomy.** `ExactSizeResult` gained `conversionSkipped`. "File already
under the ceiling, so no conversion happened" is no longer reported through `formatFallback`,
which now means only "the browser refused this codec".

**4. Aggregate PDF memory.** Per-page cap stayed at 32 MP (98 % budgeted); a new
`MAX_DOCUMENT_PIXELS = 120_000_000` accumulates across pages with a `maxPixels` override, and
`truncatedReason: 'page-cap' | 'pixel-budget' | null` reaches the UI notice.

**5. Preview blob lifecycle.** `processedItemsRef` revokes the previous run's object URLs before
each new run (they previously accumulated for the life of the tab).

## Test work

- Genuinely transparent PNG fixtures; decoded alpha asserted per pixel.
- JPEG flattening checked by sampling output pixels.
- Pixel-budget truncation test.
- `scripts/e2e/run.mjs` rewritten end to end: in-process Skia JPEG and pdf-lib PDF fixtures, a
  node static server over `dist/`, scenario groups covering real workflows, ceiling parsing
  from the gauge, PDF→image defaults and impossible ranges, OCR preview honesty, dark mode,
  palette focus trap, 320/768/1440/1920 overflow, console-error sweep, 404, nested refresh and
  a no-JS trust page. Screenshots + `e2e-results.json` under `audit/screenshots`.
- `.github/workflows/browser-e2e.yml` added: build → unit tests → chromium → suite, uploads
  evidence, never deploys.

## Documentation

`audit/final/` created with the eleven reports required by the order, plus `README.md` index.
All earlier `audit/` reports are untouched and remain historical.

## Deliberately not done

- No OCR enablement: the workflow was not proven acceptable end to end, so
  `image-to-text-ocr` remains a quarantined preview (noindex, not in the sitemap).
- No contact details published (`PUBLIC_CONTACT = null`).
- No CMP added under GTM (owner decision D2).
- No rasterising target-size PDF engine (owner decision D4).
- No deployment to Cloudflare Pages, no DNS change, no merge to `main`.
