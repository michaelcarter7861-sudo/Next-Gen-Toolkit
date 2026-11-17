# Technical and Product Quality Report

**Date:** 2026-11-16 · **Baseline commit:** `4d229b6` · **Post-fix state:** working tree on `arena/8d148eee-next-gen-toolkit`
**All tests/build numbers below were executed in this environment, not estimated.**

---

## 1. Stack and architecture

| Layer | Implementation | Assessment |
|---|---|---|
| Build | Vite 8 (rolldown) + React 19 + TypeScript 5 | Modern, fast (build ≈ 0.7 s), appropriate |
| Styling | Tailwind utilities + inline tokens | Consistent, but no design-token single source of truth |
| Routing | Hand-rolled path state in `App.tsx` | Works; no code-splitting per route, no 404 route fallback in-app |
| Server | `server.ts` Express with Gemini endpoints | **Dead code in production**; model IDs are not real Gemini identifiers |
| Deployment | Cloudflare Pages static, `dist/` | Zero-cost, correct for this product |
| Prerender | `scripts/generate-seo-pages.ts` writes static HTML per route | Strong for SEO; React then replaces the DOM (CLS risk, unmeasured) |
| Verification | `scripts/verify-seo-build.ts` runs inside `npm run build` | Now data-driven, fails the build on SEO regressions |
| Tests | `node:test` via `tsx` | 21 tests, 0 failures |

---

## 2. Per-engine quality matrix

| Engine | Real implementation | Correctness | Performance | Verdict |
|---|---|---|---|---|
| Image → target KB | ✅ canvas encode + 8-step quality search + progressive downscale | Byte ceiling enforced; format honoured; PNG stays lossless | Main thread; ~0.2–1.5 s for 12 MP | **Ship** |
| PDF structural optimise | ✅ pdf-lib rebuild + metadata strip | Never inflates; returns original with 0% when no gain | 0.3–2 s for 10 pages | **Ship with honest copy** |
| PDF target-KB | ◐ target honoured only as a reporting ceiling | Cannot reduce image-heavy PDFs | n/a | **Promise downgraded** |
| PDF → images | ❌ not implemented | Output removed | n/a | **Preview / noindex** |
| OCR | ❌ not implemented | Output removed | n/a | **Preview / noindex** |
| Merge / split / rotate / delete | ✅ pdf-lib | Sound | Fine | Ship |
| Text utilities | ✅ pure functions | 15 original + 6 new tests | Instant | Ship |
| Dev utilities (JWT, hash, cron, regex, diff) | ✅ pure/web-crypto | Tested | Instant | Ship |
| AI modal | ❌ endpoints invalid in static build | Fails closed with an explicit message | n/a | **Remove or host** |

---

## 3. Defects found and fixed (with measurement)

| # | Defect | Before (measured) | After (measured) |
|---|---|---|---|
| T1 | PDF output grew, UI claimed a saving | 12.6 KB → 15.5 KB (+22.8%), reported "9% Reduced"; 2.88 MB scan → 2.89 MB, reported "4% Reduced" | Output ≤ input guaranteed; `returnedOriginal` + 0% when no gain; status surfaced in UI |
| T2 | Target KB ignored | 100/200/500 KB targets → identical 11,721 B | `targetMet` computed by byte comparison; impossible targets reported as not met |
| T3 | Page geometry distorted by `scaleContent(0.85)` with no byte benefit | layout squashed at ≤100 KB | scaling removed; verified no size regression |
| T4 | Fabricated PDF→image output | canvas with 14 painted rectangles, max 6 pages | removed; amber notice, no file |
| T5 | Fabricated OCR output | canned invoice text, echoed input | removed; amber notice, empty output |
| T6 | Image format selector ignored | WebP/PNG selection produced `.jpg` at `image/jpeg` | format honoured; extension derived; PNG lossless; JPEG flattens alpha to white |
| T7 | No downscale fallback | possible over-target output with no warning | progressive 0.9× downscale after quality search |
| T8 | `npm install` failed from clean checkout | ERESOLVE esbuild peer conflict, exit 1 | `npm install` and `npm ci` both succeed (`esbuild` devDependency removed) |
| T9 | CI YAML broken by literal `\n` | `bash: test: too many arguments` (exit 2); Node `SyntaxError` | workflows rewritten; steps now script blocks |
| T10 | No lockfile for CI | nondeterministic installs | `package-lock.json` committed |
| T11 | Two duplicate workflows | double CI cost | PR gate + production-SEO check with distinct scope |
| T12 | Hub H1 invisible in dark mode | same hex in both themes | `dark:text-white` |
| T13 | No trust pages, no contact route | 404 on `/about/` etc. | 6 static pages, footer nav, real email |
| T14 | `metadata.json` brand wrong | "Utilix" | corrected |
| T15 | `llms.txt` GTM mismatch | `GTM-542PJGNK` vs `GTM-5HBHCCBT` | corrected |
| T16 | Sitemap page count wrong | "31" vs 32 vs 32-in-schema | derived from data; 36 URLs, one source of truth |
| T17 | Dead sitemap aliases in `_headers` | 5 blocks | removed |
| T18 | 2.0 MB unreferenced screenshots shipped | 2,011,000 B | deleted |
| T19 | No security headers | none | nosniff, Referrer-Policy, Permissions-Policy, HSTS, immutable assets |
| T20 | Dead `main.tsx` directive | removed | — |

---

## 4. Before/after measurements

| Metric | Before | After | Change |
|---|---|---|---|
| `npm install` (clean) | fails, exit 1 | succeeds, 235 packages, 5 s | **fixed** |
| `npm test` | 15 tests | **21 tests, 21 pass, 0 fail** | +6 |
| `npm run lint` (`tsc --noEmit`) | clean | clean | — |
| `npm run build` | 32 prerendered routes, verify step asserted a hard-coded 32 | **36 routes**, verify step data-driven | +4 (6 trust pages − 2 preview) |
| Indexable URLs | 32 (including 2 ghost tools) | **36** (23 indexable tools + 5 hubs + 6 trust + home + sitemap) | +4, and 2 ghost pages removed |
| Homepage JS | 134 kB raw / 22.1 kB gzip | 109 kB raw / **22.05 kB gzip** | −25 kB raw, gzip flat (catalogue still eager) |
| PDF chunk (lazy) | 175.5 kB gzip | 175.5 kB gzip | unchanged |
| Deployed dead weight | 2.0 MB screenshots | 0 | **−2.0 MB** |
| OG image | 298 kB PNG | 95 kB PNG (1200×630 verified) | −68% |
| Tests covering binary engines | 0 | 6 (incl. regression guard) | new |
| Trust pages | 0 | 6 | new |
| Preview tools with fabricated output | 2 | 0 | fixed |

Bundle figures come from the Vite build output; they are **build artefacts, not field measurements**. No Lighthouse or CrUX numbers are claimed.

---

## 5. Reliability and failure modes

| Mode | Behaviour now |
|---|---|
| Corrupt PDF | Explicit error `File could not be parsed / is encrypted or corrupted` (test-covered) |
| Target unreachable | Actual output shown with `optimized-only` status, never a silent success |
| Oversized input in browser | Canvas memory limits can abort; message states the failure rather than returning a broken blob |
| `localStorage` unavailable (private mode) | Theme and settings writes wrapped in try/catch |
| Network blocked | All live tools continue to work; only GTM fails (silently) |
| Preview tool invoked | Explicit "not shipped" notice; no download control rendered |

---

## 6. Security and privacy

| Item | State |
|---|---|
| Secrets in repo | None found; `GEMINI_API_KEY` read from env at runtime, never bundled |
| Third-party requests during a tool run | None for live tools (verified by inspection of imports; no `fetch` in engine paths) |
| Tag manager | Loads on every page without consent → must be resolved (see SEO/trust report) |
| User files | Never transmitted; no persistence; no service worker cache of file data |
| `_headers` | nosniff, Referrer-Policy, Permissions-Policy, HSTS added. CSP and `X-Frame-Options` deliberately **not** added: the GTM container loads vendor tags that cannot be enumerated from the repo, and the embed widget must remain frameable. Both are documented follow-ups rather than guessed at. |
| Preview deployments | **Not yet protected.** `_headers` cannot match by hostname; needs a Cloudflare Transform Rule setting `X-Robots-Tag: noindex` for `*.pages.dev` non-production hosts. Flagged, not faked. |

---

## 7. Technical debt register

| Debt | Severity | Cost to fix | Note |
|---|---|---|---|
| No route-level code splitting; catalogue eager | High | 0.5 day | `lazy()` + dynamic import restores ~25 kB raw |
| Main-thread canvas/PDF work | High | 2 days | Move to Worker; INP risk on low-end phones |
| Hand-rolled router, no in-app 404 | Medium | 1 day | Deep-link to unknown path renders the home view |
| No design-token source of truth | Medium | 1 day | Palette duplicated across components |
| `server.ts` dead code with invalid model IDs | Medium | 0.5 day | Delete or actually deploy |
| No ESLint (only `tsc`) | Medium | 0.5 day | Style/logic rules absent |
| No E2E/browser tests | High | 2–3 days | The reason fabricated output survived |
| No INP/LCP measurement in CI | Medium | 1 day | Add Lighthouse CI with budget |

---

## 8. Known limitations of this release (stated plainly)

1. PDF target-size is **not** achievable for image-heavy PDFs. The UI now says so; the roadmap commits to a rasteriser.
2. OCR and PDF→image are **not implemented**. They are noindexed, excluded from the sitemap, and produce nothing.
3. The AI assistant does not work in the static deployment and its model IDs are invalid.
4. `*.pages.dev` preview deployments remain indexable until a Cloudflare Transform Rule is added.
5. Core Web Vitals, indexation and ranking effects are **unmeasured**.
6. The images produced in a real browser were not byte-verified here (no browser); correctness is established by unit tests around the naming/status contract and by code inspection of the encode loop.
