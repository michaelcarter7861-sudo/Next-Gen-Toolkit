# Implementation Changelog — 2026-11-16

Scope: verified P0 defects only. Every change below is justified by a reproduced finding in `INDEPENDENT-AUDIT-VERIFICATION.md`. Nothing was refactored for taste.

## Verification status

| Check | Command | Result |
|---|---|---|
| Type-check | `npm run lint` (`tsc --noEmit`) | **pass**, 0 errors |
| Unit tests | `npm test` | **21 pass / 0 fail** |
| Build + SEO assertions | `npm run build` | **pass**, 36 indexable routes, 2 quarantined |
| Clean install | `npm install` (no flags) | **pass** (previously ERESOLVE failure) |

---

## 1. `src/utils/binaryEngines.ts` — engines made honest

**Removed:** `renderPdfSummaryPreviewImages()` — drew a purple band and 14 rectangles on a canvas and returned them as "converted pages", capped at 6 pages.
**Reason:** fabricated output; verified by inspection and by the absence of any PDF rasteriser dependency.

**Replaced:** `compressPdfToTargetKb()` — new contract:

| Property | Behaviour |
|---|---|
| Never larger | if `optimised >= original`, the original is returned byte-for-byte |
| Honest saving | `savingsPercent` = real byte change; **0** when the original is returned (floor of `Math.max(4, …)` deleted) |
| Real target check | `targetMet = compressedSize <= targetKb*1024` |
| Status | `met-target` \| `optimized-only` \| `already-optimal` |
| No distortion | page `scaleContent()` removed (it changed layout, never byte size — measured) |

**Replaced:** `compressImageToExactKbClient()` — now format-aware:

- `image/webp` → WebP, `image/png` → PNG (lossless, quality `null`), `image/jpeg` → JPEG.
- JPEG only: transparent areas flattened onto **white** (previously alpha would have rendered black).
- Proportional downscale loop (0.9×) when quality search alone cannot meet the ceiling.
- Returns `iterations`, `achievedQuality`, `dimensions`, `targetMet`, `scaleApplied`, `requestedMime`, `originalSize`, `compressedSize`.
- New pure helpers `extensionForImageMime()` and `buildCompressedImageName()` (unit-tested).

**Changed:** the locally generated sample image no longer contains bank-statement-like or OCR-like text; it now says what it is.

## 2. `src/components/ToolWorkspace.tsx` — no fabricated results in the UI

| Branch | Before | After |
|---|---|---|
| PDF compress | filename asserted the target (`…-100kb.pdf`) regardless of real size; meta claimed "9% Reduced" | `…-optimised.pdf`; meta shows measured `Change` and honest `Status` |
| PDF → images | downloaded a placeholder canvas image | amber "not shipped" notice (`PDF_RENDER_NOTICE`), no download control |
| Image compress | passed no format; always `.jpg` | passes `imageOutputFormat`; meta shows `Result`, `Output`, `Lossless` |
| OCR | canned invoice text when input was empty | empty output + `OCR_NOTICE` |
| Preview tools | no visual signal | "Preview — engine not shipped" badge |
| Async state | silent | `processingNotice` live region, cleared at the start of each run |
| Outputs | not announced | `aria-live="polite"` + `aria-label` on text and diff outputs; outputs now `readOnly` |

## 3. `src/data/toolsCatalog.ts`

- Added `status?: 'live' | 'preview'`.
- `compress-pdf`: rewritten as "Offline PDF Optimizer" with an AEO answer that states the real capability and the limitation, plus an FAQ ("will it always reach 100/200 KB?" → **no**, and why).
- `pdf-to-image` and `image-to-text-ocr`: `status: 'preview'`, honest short descriptions and value propositions.

## 4. `src/data/sitePages.ts` (new) + `scripts/generate-seo-pages.ts`

Six trust pages generated as **static HTML with no JavaScript**: `/about/`, `/contact/`, `/privacy/`, `/terms/`, `/editorial-policy/`, `/changelog/` — each with canonical, JSON-LD (`WebPage` + `BreadcrumbList`), dark-mode CSS, and a shared trust footer. Contact is `[contact address withheld — owner approval required]`; the repository and licence are disclosed; GTM is disclosed; localStorage keys are listed; preview-vs-live status is defined; the changelog is dated.

Generator changes:
- `noindex` support; preview tools emit `noindex,follow` and are excluded from the sitemap.
- Sitemap and indexable-count logic is data-derived (`INDEXABLE_TOOLS`, `PREVIEW_TOOLS`, `INDEXABLE_URL_COUNT`), which removes the "31 vs 32" contradiction.
- `_headers` rewritten: real routes only, charset + cache for discovery files, immutable `/assets/*`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS. **No CSP and no `X-Frame-Options`** — deliberate, documented in the technical report.

## 5. `scripts/verify-seo-build.ts` (new, replaces `.mjs`)

Expected URLs are derived from the catalogue and trust-page data instead of a hard-coded `32`. Asserts: canonicals, static H1s, preview noindex + sitemap exclusion, privacy/contact content, robots reference, security headers, OG PNG signature and 1200×630 dimensions, 404 noindex.

## 6. Client shell

- `src/App.tsx`: H1 changed from a slogan to a keyword-bearing statement; theme now persists in `localStorage['ngt_theme_v1']` and defaults to `prefers-color-scheme`; footer gained a crawlable trust nav.
- `src/components/SchemaHeadInjector.tsx`: retired `SearchAction` removed; runtime `meta[name=robots]` set to `noindex,follow` for preview tools so client-side navigation cannot re-index them; homepage title keyword-first.
- `src/components/CategoryHubView.tsx`: dark-mode H1 fixed.
- `src/main.tsx`: removed a no-op DOM call for an element that does not exist.
- `index.html`: static H1 and title aligned with the React H1 (both keyword-bearing) to reduce the visual jump on hydration.

## 7. Build, CI and hygiene

- `package.json`: removed the conflicting `esbuild` devDependency (**root cause** of the ERESOLVE failure); test script now runs both suites; build runs the TS verifier.
- `package-lock.json`: committed (CI can use `npm ci` reproducibly).
- `.github/workflows/quality-checks.yml`: rewritten — `npm ci`, tests, type-check, build, artifact upload.
- `.github/workflows/seo-check.yml`: rewritten — production-origin build check with real shell blocks (literal `\n` gone), sitemap/trust/preview invariants, and a Node assertion instead of an inline escaped string.
- Deleted `public/assets/aistudio/*` (2.0 MB, zero references).
- `public/llms.txt`: GTM id corrected to `GTM-5HBHCCBT`; preview disclaimer added.
- `public/llms-full.txt`: preview-status section added at the top.

## 8. Tests added — `src/utils/binaryEngines.test.ts`

1. PDF output is never larger than the input (50/100/200 KB targets), and 0% is reported when the original is returned.
2. An unreachable 1 KB target reports `targetMet: false` and a non-success status.
3. Reported savings equal the measured byte change.
4. A corrupt PDF rejects with a clear message.
5. Filename/extension helpers follow the selected format (including files with no extension).
6. **Regression guard**: the source tree must not contain `Simulated document lines`, `OCR VERIFICATION LINE`, or `Math.max(4,`.

## 9. Files changed

```
modified:  .github/workflows/quality-checks.yml, .github/workflows/seo-check.yml
modified:  index.html, metadata.json, package.json, public/_headers, public/sitemap.xml
modified:  public/llms.txt, public/llms-full.txt, public/og-cover.png
modified:  scripts/generate-seo-pages.ts
modified:  src/App.tsx, src/main.tsx
modified:  src/components/SchemaHeadInjector.tsx, src/components/ToolWorkspace.tsx, src/components/CategoryHubView.tsx
modified:  src/data/toolsCatalog.ts
modified:  src/utils/binaryEngines.ts
added:     src/data/sitePages.ts, src/utils/binaryEngines.test.ts, scripts/verify-seo-build.ts
added:     package-lock.json, audit/*.md (9 reports)
deleted:   scripts/verify-seo-build.mjs, public/assets/aistudio/ (5 files, 2.0 MB)
```

## 10. Regression record

| Risk introduced | Mitigation | Verified |
|---|---|---|
| Removing page scaling could make PDFs larger | Measured: output ≤ input; original returned when no gain | unit test 1 |
| Format-aware image path could break JPEG output | JPEG remains default; alpha flattened to white | helper tests + inspection |
| Preview noindex could deindex a working tool | Only tools with `status:'preview'` are affected; the other 23 stay indexable | build assertion |
| New trust pages could break the sitemap count | Counts derived from data | build assertion |
| Header changes could break asset caching | Immutable rule limited to hashed `/assets/*` | manual review |
| Removing `esbuild` could break the build | Build passes on rolldown/Vite 8 | build + tests |
| Lockfile could pin a broken tree | Clean `npm install` and `npm ci` both verified | install run |

## 11. Deliberately not changed

- `.gitignore` still excludes `package-lock.json`-adjacent patterns only; the lockfile is now intentionally tracked.
- `server.ts` left in place (dead in production) — deleting it is a scope decision, recorded as P2.
- AI modal left in place but non-functional; recorded as P1.
- No CSP / `X-Frame-Options` added (would break GTM vendor tags or the embed widget).
- Preview deployments remain indexable until a Cloudflare Transform Rule is added — infrastructure, not repo.
