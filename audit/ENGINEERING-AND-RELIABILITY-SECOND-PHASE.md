# Engineering and Reliability — Second Phase

**Date:** 2026-11-16 · **Branch:** `arena/8d148eee-next-gen-toolkit`
**All numbers below were produced by executing the code in this environment.** No browser was available (see §7).

## 1. Verified defects and fixes

| # | Defect | Before (verified) | After (verified) |
|---|---|---|---|
| 1 | Fabricated timing | `executionDurationMs ?? 24` printed **"24 ms"** when unknown | prints `—` |
| 2 | PDF outcome states | 3 states; "already under the limit" indistinguishable from "optimiser found nothing" | 4 states: `already-below-target`, `met-target`, `optimized-only`, `no-gain`; failures throw |
| 3 | PDF input already under ceiling was re-encoded | quality could only be lost | returned byte-identical with 0% claimed |
| 4 | Image MIME trust | extension came from the *request*, so a PNG fallback would be named `.webp` | extension derives from `Blob.type`; `actualMime` + `formatFallback` reported |
| 5 | PNG silent downscale | up to 6 × 0.82 factor with no disclosure | lossless encode first, bounded downscale, `scaled` + dimensions + status reported |
| 6 | Image already under ceiling | re-encoded anyway | returned untouched, original filename kept |
| 7 | Preview tool shipped a dead control | PDF→image DPI selector did nothing | real rasteriser wired to DPI, page range and format |
| 8 | Rasterisation memory | n/a (no engine) | 32 MP canvas budget with a 2% rounding margin; lowered DPI is reported, not hidden |
| 9 | Dual lockfiles | `bun.lock` + `package-lock.json`, CI used npm | `bun.lock` removed |
| 10 | Portal contact | personal address published without approval | removed; page states the channel is pending approval |

## 2. Real PDF rasteriser (`src/utils/pdfRaster.ts` + `pdfRasterBrowser.ts`)

| Property | Value | Verified by |
|---|---|---|
| Engine | pdf.js 5.7.284, worker bundled by Vite (`pdf.worker.min-*.mjs`, 1.23 MB, emitted to `dist/assets`) | build output |
| Lazy loading | module + worker only fetched when the tool runs | dynamic import; separate `pdf-*.js` chunk (409 KB) |
| Page selection | `all`, `1-3,5`, `2`; invalid input throws with a human message | unit tests |
| DPI | 72–600, clamped; 150/300/600 in the UI | unit tests + higher-DPI render test |
| Memory guard | canvas capped at 32 MP; `dpiReduced` surfaced per page | unit test |
| Output formats | PNG / JPEG / WebP with actual-format detection | render test (PNG magic bytes, JPEG SOI) |
| Real output | A4 at 72 DPI renders 595×842 with >2,000 dark pixels of genuine text | render + pixel-count test |
| Filenames | `report-page-03.png`, extension from the encoder's real MIME | unit test |
| Known limitation | 50-page cap per run (`MAX_RASTER_PAGES`), skipped pages are reported | source |

## 3. Image engine (`compressImageToExactKbClient`)

| Case | Result (measured) |
|---|---|
| 1600×1200 noisy JPEG → 20 KB | **51,117 B ≤ 51,200 B**, `met-target`, `.jpg` filename |
| PNG → 40 KB, lossless | lossless path, no quality value, downscale disclosed, honest `best-effort` when unreachable |
| PNG already < target, JPEG requested | returned untouched as PNG, `formatFallback: true` |
| 1 KB ceiling on a 2400×1800 photo | `best-effort`, `targetMet: false`, scaled dimensions reported |
| Transparency | JPEG output carries a "filled with white" note; PNG carries none |
| Impossible to error silently | `encodeCanvas` rejects when the browser returns no blob |

## 4. Test evidence

| Suite | Tests | Result |
|---|---|---|
| `toolEngines.test.ts` | 15 | pass |
| `binaryEngines.test.ts` | 6 | pass |
| `imageEngine.test.ts` (new, executes the shipped engine) | 8 | pass |
| `pdfRaster.test.ts` (new, executes the shipped rasteriser with real pdf.js) | 7 | pass |
| **Total** | **36** | **36 pass / 0 fail** |

Harness note recorded for future maintainers: **`@napi-rs/canvas` takes JPEG quality 0–100, the browser takes 0–1.** Passing the browser value straight through encodes at ~1% quality and makes every byte ceiling look trivially reachable. This produced two false test passes before it was caught, and is now commented in the test file.

## 5. Performance

| Metric | Phase 1 | Now | Note |
|---|---|---|---|
| Homepage entry JS | 109.24 kB / 22.05 kB gz | 111.55 kB / ~22 kB gz | +2 kB for the byte gauge and preset chips |
| Catalogue chunk (eager) | 89.0 kB | 89.0 kB | still eager — P1 task |
| PDF tooling (pdf-lib) | 419.67 kB gz 175.50 | unchanged | lazy |
| pdf.js main chunk | — | 409 kB (lazy) | only on the rasteriser tool |
| pdf.js worker | — | 1.23 MB (lazy, cached) | fetched on first use of that tool |
| Deleted dead weight | — | `public/assets/aistudio` 2.0 MB | |

Build figures are artefacts, not field measurements. **No LCP/INP/CLS claim is made.**

## 6. Security and privacy

| Item | State |
|---|---|
| Secrets in client bundle | none found; `GEMINI_API_KEY` is server-only |
| Third-party requests during a tool run | none for live tools; every engine is local |
| User files | never transmitted; no persistence; no service-worker cache of file data |
| `_headers` | nosniff, Referrer-Policy, Permissions-Policy, HSTS, immutable assets, preview-host noindex |
| CSP / X-Frame-Options | deliberately absent (GTM vendor tags, embeddable widget); documented, not faked |
| GTM consent | **still missing** — Consent Mode or removal is a P0 owner decision |
| Contact data | personal address withdrawn; pending owner approval |

## 7. What could not be tested, and why

| Untested | Reason | Prepared substitute |
|---|---|---|
| Any browser rendering, layout, hydration, canvas behaviour | No browser binary available: Playwright's CDN is unreachable, `@sparticuz/chromium` needs `libnss3`, Debian mirrors are blocked | `scripts/e2e/run.mjs` + `scripts/e2e/README.md`: a ready Playwright suite covering the mission's §15 scenarios, runnable where a browser exists |
| Safari/WebKit `toBlob('image/webp')` fallback behaviour | same | `formatFallback` handles it at runtime and reports it |
| Worker loading on a real device | same | `pdfWorkerUrl` import verified present in the build |
| Memory pressure on a 2 GB phone | same | 32 MP cap + 50-page cap |
| Core Web Vitals | no CrUX access | measurement plan in the SEO report |

## 8. Outstanding risks

| Risk | Likelihood | Impact | Mitigation in this phase |
|---|---|---|---|
| pdfjs adds ~1.6 MB of lazy payload on first use of one tool | Medium | Medium | Lazy chunk + worker; bundle figure documented |
| 600 DPI on a large page still fails on very low-memory devices | Medium | Medium | 32 MP cap; DPI reduction reported |
| A future browser silently returns PNG when WebP is requested | Low | Low | `formatFallback` + extension from `Blob.type` |
| Regression back to fabricated output | Low | High | Source-tree regression test fails the build |
| Tests give false confidence about browser behaviour | High if misread | High | Every claim above is labelled by evidence type; no browser claim is made |
