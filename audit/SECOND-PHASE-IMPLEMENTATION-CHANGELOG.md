# Second-Phase Implementation Changelog

**Date:** 2026-11-16 · **Branch:** `arena/8d148eee-next-gen-toolkit`
Every row records what changed, why, and how it was checked. "Test" values refer to executed commands, never assumptions.

## 1. Engines

| File | Previous behaviour | New behaviour | Reason | Evidence | Test | Result | Limitation |
|---|---|---|---|---|---|---|---|
| `src/utils/binaryEngines.ts` (`compressPdfToTargetKb`) | 3 statuses; re-encoded files already under the ceiling | 4 statuses (`already-below-target`, `met-target`, `optimized-only`, `no-gain`); already-compliant files returned byte-identical; failures throw | Mission §4.3 requires six distinguishable outcomes; the UI cannot say "already optimised" when the target was missed | Phase-2 defect N2 | `pdfRaster.test.ts` "distinguishes already under the limit" | pass | Never reduces image-heavy PDFs |
| `src/utils/binaryEngines.ts` (`compressImageToExactKbClient`) | trusted the requested MIME; PNG downscaled silently; already-small files re-encoded | `Blob.type` is authoritative (`actualMime`, `formatFallback`); PNG stays lossless; bounded, reported downscaling; untouched return for already-small inputs; `savingsPercent`, `scaled`, `transparencyNote` | A PNG fallback named `.webp` is a corrupt-looking download | Phase-2 defects N3/N4 | `imageEngine.test.ts` (8 tests, executes the shipped engine) | 8 pass | Browser `toBlob` behaviour per engine untested |
| `src/utils/pdfRaster.ts` (new) | no rasteriser existed | Real pdf.js orchestration: page selection parser, 72–600 DPI clamp, 32 MP memory guard, PNG/JPEG/WebP, per-page DPI reporting, honest filenames | PDF→image was a preview tool with no engine | Phase-2 defect N7 | `pdfRaster.test.ts` (7 tests incl. real rendering) | 7 pass | 50-page cap per run |
| `src/utils/pdfRasterBrowser.ts` (new) | — | Lazy browser adapters; worker URL bundled by Vite | Keeps pdf.js out of the main bundle | build output shows separate chunk + worker | build | pass | Worker loading untested in a browser |

## 2. Interface

| File | Change | Reason | Test |
|---|---|---|---|
| `src/components/ByteGauge.tsx` (new) | Ruler showing original → target → result with measured bytes, colour-coded outcome, `role="img"` + text summary | Phase-1 strategy proposed it; a strategy document is not an implementation | rendered only from real results; `tsc` + build |
| `src/components/ToolWorkspace.tsx` | PDF status labels for all four states; image meta rows (`Result`, `Output`, `Format` fallback, `Transparency`); real PDF→image wiring (page range, DPI, format); gauge state; `24 ms` fabrication removed; `PDF_RENDER_NOTICE` deleted; DPI/format controls with labels + 44 px targets | Honest reporting and a working tool | `tsc`, build |
| `src/App.tsx` | Flat hero (gradient removed); eyebrow generated from catalogue counts; 20/50/100 KB preset chips deep-linking `?kb=`; "15 engine suites" claim replaced; `navigateToTool` accepts a preset | Removes the generic-template tell; puts the wedge job on the first screen; kills a false claim | `tsc`, build |
| `src/components/CommandModal.tsx` | Focus trap, focus restore, Escape close, scroll lock, labelled search field, 44 px close button | WCAG 2.4.3 / 2.1.2 | `tsc`; browser test prepared |
| `src/index.css` | `color-scheme`, `prefers-reduced-motion`, visible `:focus-visible` ring for both themes | WCAG 2.3.3 / 2.4.7 | source |
| `index.html` | `color-scheme` meta | Native controls follow the theme | build |

## 3. Content and trust

| File | Change | Reason | Test |
|---|---|---|---|
| `src/data/sitePages.ts` | Personal Gmail address removed; contact page states the channel is pending owner approval and routes to the public repository | Publishing an unapproved personal address is a release blocker | grep: zero occurrences in `src/`, `scripts/`, `public/` |
| `src/data/toolsCatalog.ts` | `pdf-to-image` promoted to **live** with accurate copy; OCR remains `preview` | The rasteriser is real now; OCR is not | build: 24/25 indexable |
| `audit/*.md` (phase 1) | Address scrubbed from the changelog | Same reason | grep |

## 4. Build, CI and repository hygiene

| File | Change | Reason | Test |
|---|---|---|---|
| `package.json` | Test script includes the two new suites; `test:e2e` added; `pdfjs-dist`, `@napi-rs/canvas`, `playwright` as devDependencies | Reproducible engine tests | `npm test` → 36 pass |
| `bun.lock` | **Deleted** | Two lockfiles with CI using npm is a reproducibility trap | `npm ci` succeeds |
| `package-lock.json` | Regenerated | Single source of truth | `npm ci` → 235 packages |
| `scripts/generate-seo-pages.ts` | Preview-host `X-Robots-Tag` rule added to `_headers` | Phase-1 claim was FALSE; Cloudflare supports host placeholders | build output line 50 |
| `scripts/verify-seo-build.ts` | Derives expectations from data; asserts preview exclusion, trust pages, headers, OG dimensions | Hard-coded 32 would break on any legitimate addition | build → 37 routes verified |
| `.github/workflows/seo-check.yml` | Preview assertions updated: PDF→image indexable, OCR noindex | The tool status changed | workflow logic reviewed |
| `scripts/e2e/run.mjs` + `README.md` | Playwright acceptance suite (19 routes, no-JS, theme, focus trap, overflow, console errors) | No browser here; provide a runnable substitute | `node --check` |

## 5. Files touched in this phase

```
modified:  src/utils/binaryEngines.ts
modified:  src/components/ToolWorkspace.tsx
modified:  src/components/CommandModal.tsx
modified:  src/App.tsx
modified:  src/index.css
modified:  src/data/toolsCatalog.ts
modified:  src/data/sitePages.ts
modified:  index.html
modified:  package.json / package-lock.json
modified:  scripts/generate-seo-pages.ts
modified:  scripts/verify-seo-build.ts
modified:  .github/workflows/seo-check.yml
added:     src/utils/pdfRaster.ts, src/utils/pdfRasterBrowser.ts
added:     src/utils/imageEngine.test.ts, src/utils/pdfRaster.test.ts
added:     src/components/ByteGauge.tsx
added:     src/types/asset-modules.d.ts
added:     scripts/e2e/run.mjs, scripts/e2e/README.md
added:     audit/*-SECOND-PHASE*.md, audit/EXPANDED-*, audit/PORTAL-*, audit/DESIGN-*, audit/REVISED-*, audit/FINAL-*
deleted:   bun.lock
```

## 6. Regression record

| Risk | Mitigation | Verified |
|---|---|---|
| New PDF statuses break the UI | All four states mapped in `ToolWorkspace`, `tsc` clean | `tsc` |
| Killing page scaling could enlarge PDFs | Never-larger invariant retained + test | test |
| Promoting PDF→image to live could expose a broken tool | 7 tests execute the real engine; page cap and memory guard reported | tests |
| Preview-host header could deindex production | Only the two-placeholder pattern used; verification commands documented | source + docs |
| Removing the Gmail address leaves no contact route | Contact page routes to the public repository and states the gap | grep + build |
| pdf.js inflates the initial bundle | Dynamic import; separate chunk verified in `dist/assets` | build output |
| `@napi-rs/canvas` quality-unit mismatch faked test passes | Documented in the test file; harness converts 0–1 → 0–100 | 2 false passes found and fixed |

## 7. Deliberately not changed

- No CSP or `X-Frame-Options` (GTM vendor tags, embeddable widget).
- AI modal still present and still non-functional offline; removal is an owner decision.
- GTM still loads without consent; adding a CMP is a product/legal decision, not an engineering default.
- `server.ts` retained (dead in production).
- No deployment, no merge, no DNS or Cloudflare account changes.
