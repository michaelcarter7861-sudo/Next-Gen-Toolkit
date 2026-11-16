# Second-Phase Remaining-Work Verification

**Date:** 2026-11-16 (second phase)
**Branch:** `arena/8d148eee-next-gen-toolkit`
**Evidence labels used:** VERIFIED IN BROWSER · VERIFIED BY EXECUTABLE TEST · VERIFIED BY SOURCE INSPECTION · OBSERVED ON OFFICIAL EXTERNAL SOURCE · INFERRED · UNVERIFIED · FALSE

> **Headline limitation:** no browser could be installed in this environment (`playwright install` cannot reach its CDN; `@sparticuz/chromium` needs `libnss3`, and Debian mirrors are unreachable). Therefore **no item in this phase is labelled VERIFIED IN BROWSER**. Engine behaviour was instead executed against the shipped code with a real PDF engine and a real Skia canvas, and browser-only behaviour is listed separately as untested. See `ENGINEERING-AND-RELIABILITY-SECOND-PHASE.md` §7.

## 1. Actual starting state

| Question | Answer |
|---|---|
| Branch | `arena/8d148eee-next-gen-toolkit` |
| Local HEAD at start | `4d229b6` ("seo: remove redundant sitemap aliases") |
| Phase-1 patch state | **Uncommitted working tree.** 23 tracked files modified, 5 deleted, 6 new paths. |
| Was phase 1 pushed? | Yes — `origin/arena/8d148eee-next-gen-toolkit` = `ab13def`. The local clone was re-created at `4d229b6` and the working tree restored from the file snapshot, so the commit object is absent locally. Content is identical; nothing was lost. |
| `main` | Untouched, still `4d229b6`. No merge, no deploy, no Cloudflare change. |
| Previous reports | Preserved unmodified in `audit/`; this document supersedes their *claims* where noted below. |

**Baseline re-run (clean, before any second-phase edit):** `npm ci` OK · `npx tsc --noEmit` clean · `npm test` 21/21 · `npm run build` OK, 36 routes. This matches the phase-1 report exactly — no drift.

## 2. Verification of phase-1 work

| # | Phase-1 claim | Verdict | Evidence / correction |
|---|---|---|---|
| V1 | Fake OCR output removed | **VERIFIED BY SOURCE INSPECTION** | Canned text and sample injection gone; `OCR_NOTICE` path emits nothing; OCR still `status:'preview'`. |
| V2 | Fake PDF→image removed | **VERIFIED BY SOURCE INSPECTION** | `renderPdfSummaryPreviewImages` absent from the tree. |
| V3 | PDF reporting corrected | **VERIFIED BY EXECUTABLE TEST** | 21 tests pass, including never-larger and byte-accurate savings. New tests add the missing states (see §3). |
| V4 | Image compression format-aware | **VERIFIED BY EXECUTABLE TEST** | Shipped engine executed against a real encoder: JPEG→20 KB met (51,117 ≤ 51,200 B), PNG lossless, JPEG alpha flattening reported. |
| V5 | Six trust pages added | **VERIFIED BY SOURCE INSPECTION** | Six static files emitted; each contains exactly one `<script>` — an `application/ld+json` block, i.e. **no executable JavaScript**. |
| V6 | Preview tools noindexed | **VERIFIED BY SOURCE INSPECTION** | OCR page: `noindex,follow`, absent from sitemap. `pdf-to-image` is now live and indexable (this phase). |
| V7 | SEO build verification added | **VERIFIED BY EXECUTABLE TEST** | Runs inside `npm run build`; 37 URLs verified, 1 quarantined. |
| V8 | CI install issues addressed | **VERIFIED BY EXECUTABLE TEST** | `npm ci` succeeds from the committed lockfile (235 packages). |
| V9 | 36 indexable routes | **Outdated** | 37 now, because the PDF rasteriser shipped. Counts are derived from data, not hard-coded. |
| V10 | "Hydration may replace static trust pages" (phase-1 §4.1 blocker) | **FALSE for trust pages** | Trust pages are standalone documents with **no app bundle reference**; React never mounts on them, so there is nothing to hydrate or replace. The concern only applies to `/`, hub and tool pages, where a prerendered block is replaced on first render (unmeasured CLS, still open). |
| V11 | "`_headers` cannot match by hostname; preview noindex needs a dashboard rule" (phase-1 §6/§8) | **FALSE — corrected and fixed** | Cloudflare's official Headers documentation (last updated 12 Nov 2026) documents host placeholders, including `https://:version.:project.pages.dev/*` with `X-Robots-Tag: noindex`. Implemented in this phase. |
| V12 | "15 automated engine suites passing" on the homepage | **FALSE claim in product copy** | Hard-coded and drifting. Replaced with "Engine tests run in CI on every change". |

## 3. Newly discovered defects (this phase)

| # | Defect | Severity | Status |
|---|---|---|---|
| N1 | `Processed locally in {executionDurationMs ?? 24} ms` invented **24 ms** when the timer was unknown | High (fabricated metric) | Fixed — renders `—` |
| N2 | PDF engine had only 3 of the 6 required outcome states; "already under the ceiling" and "no gain" were indistinguishable | High | Fixed — 4 states + thrown errors |
| N3 | Image engine trusted the *requested* MIME, so a browser that silently encodes PNG would have produced `photo-20kb.webp` containing PNG bytes | High (corrupt-looking download) | Fixed — `Blob.type` is now the source of truth (`actualMime`, `formatFallback`, extension derived) |
| N4 | PNG ran through up to 6 silent 0.82× downscales with no disclosure | High | Fixed — PNG stays lossless, downscaling is bounded, reported via `scaled`/dimensions |
| N5 | Contact page published a personal Gmail address that the owner never approved | **P0 release blocker** | Address removed from source, generated pages and previous reports; contact page now states the channel is pending owner approval |
| N6 | Both `bun.lock` and `package-lock.json` committed while CI used npm | Medium | `bun.lock` deleted; npm is the single package manager |
| N7 | PDF→image had no working engine but shipped a DPI selector that did nothing | Medium | Real pdf.js rasteriser shipped; selector, page range and format now functional |
| N8 | `dist/_headers` had no preview-host rule | Medium | Fixed (see V11) |
| N9 | No test executed the shipped image engine at all | High | 8 engine tests now execute it against a real encoder |

## 4. What remains blocked (cannot be resolved from this environment)

| Blocker | Why | Who unblocks |
|---|---|---|
| Browser-level verification of every scenario in mission §15 | No browser binary, no CDN, no apt | Owner or CI with network (suite prepared: `scripts/e2e/README.md`) |
| Approved public contact address | Publishing a guess would repeat defect N5 | **Owner decision** |
| Google Search Console sitemap error | No GSC access; cannot see the exact Google-reported message | Owner (export the error text) |
| Actual Core Web Vitals and indexation | No CrUX/GSC | Owner |
| Cloudflare edge behaviour (trailing slash, header application) | Requires a deployment; forbidden here | Owner, after review |
| Portal photo/signature specifications | Official pages publish per-project, not per-site; only one portal home page could be checked today | Research task, see `PORTAL-REQUIREMENTS-REFERENCE.md` |

## 5. Difference between previous reported results and current reality

| Metric | Phase-1 report | Verified now |
|---|---|---|
| Tests | 21 passing | 21 at baseline; **36 after this phase's additions** |
| Indexable routes | 36 | **37** |
| Preview tools | 2 (pdf-to-image, OCR) | **1 (OCR)** — the rasteriser is real now |
| Live tools | 23 | **24** |
| `bun.lock` | Not mentioned | Existed and duplicated npm's lockfile — removed |
| Contact address | Published | Withdrawn pending approval |
