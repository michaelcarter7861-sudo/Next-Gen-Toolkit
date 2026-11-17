# NextGenToolkit — 90-Day Roadmap

**Date:** 2026-11-16 · **Assumes:** one maintainer, part-time, no budget for paid infrastructure · **Constraint:** no server-side file processing

Prioritisation key — **P0** stops trust loss · **P1** makes the promise true · **P2** builds durable advantage · **P3** optional growth.
Impact scores are judgements (H/M/L), not measurements.

---

## P0 — Trust critical (complete in this release unless noted)

| # | Item | User impact | Business impact | Search opportunity | Feasibility | Cost | Maintenance | Risk | Evidence |
|---|---|---|---|---|---|---|---|---|---|
| P0-1 | Remove fabricated PDF→image and OCR output; label Preview, noindex, exclude from sitemap | H | H (removes the "it lied" failure) | Neutral (removes 2 ghost pages) | Done | 0 | None | Low | Verified V2, V1 |
| P0-2 | Honest PDF compression reporting (never larger, real target check, status in UI) | H | H | Improves exact-size page quality | Done | 0 | Low | Low | V3, V4, V5 |
| P0-3 | Format-aware image compression + downscale fallback | H | H | Supports WebP/AVIF-adjacent intent | Done | 0 | Low | Low | V6, N1 |
| P0-4 | Fix `npm install`, CI YAML, add lockfile | L (direct) | H (deploys are trustworthy again) | None | Done | 0 | Low | Low | V8, V9, V10 |
| P0-5 | Trust pages + contact + changelog + editorial policy | H | H (E-E-A-T, ad-review readiness) | Indirect | Done | 0 | Low | Low | V26 |
| P0-6 | Homepage/hub H1, dark-mode H1, sitemap counts, `metadata.json`, `llms.txt` | M | M | Direct | Done | 0 | Low | Low | V12, V14, V15, V16, V17 |
| P0-7 | Security headers + immutable assets | L | M | Minor (CWV) | Done | 0 | Low | Low | V29 |
| **P0-8** | **`.pages.dev` preview noindex via Cloudflare Transform Rule** | L | M (duplicate-content risk) | Prevents dilution | 30 min in dashboard | 0 | None | Low | V30, N8 |
| **P0-9** | **Resolve GTM consent: add Consent Mode v2 default-denied, or remove GTM** | M | H (legal + privacy claim) | Neutral | 0.5 day | 0 | Low | Medium | V27, V28 |

## P1 — Make the promise true (days 1–45)

| # | Item | User impact | Business | Search | Feasibility | Cost | Maint. | Risk | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| P1-1 | **Real PDF→image via pdf.js** (worker, own canvas, page range, scale, ZIP) | H | H | High (large query set) | Medium — pdf.js is mature; bundle +175 kB gzip already paid | 2–3 days | Medium | Medium (Worker + canvas memory) | High |
| P1-2 | **True PDF target-size engine**: rasterise pages at DPI solving for `targetBytes`, rebuild; state quality trade-off | H | H | Very high (the core promise) | Medium | 3–5 days | Medium | Medium (text becomes image — must be disclosed) | High |
| P1-3 | **Real OCR** via `tesseract.js` with local WASM/model, English + Urdu/Hindi traineddata optional | M | H | High | Medium-high (model download ≈ 2–4 MB; slow on low-end) | 2–4 days | Medium | Medium | Medium |
| P1-4 | **Signature + passport-photo modes** (crop-to-spec, high-contrast, exact KB) | H | H | High, highly specific | Low | 1–2 days | Low | Low | High |
| P1-5 | **Verified portal-size reference** (country → document → dimensions + KB ceiling + source URL + date) | H | H | Very high; nobody owns it | Low (research heavy, not code) | 3–4 days research | Medium (specs change) | Low | High |
| P1-6 | **Route-level code splitting + catalogue lazy-load**; move canvas/PDF work to a Worker | M | M | CWV | Low-medium | 1 day | Low | Low | High |
| P1-7 | Accessibility sweep: `prefers-reduced-motion`, focus trap in `CommandModal`, 44 px targets, `color-scheme` | M | L | Minor | Low | 1 day | Low | Low | High |
| P1-8 | Remove or actually host the AI assistant | M | M | Minor | Low | 0.5 day | Low | Low | High |

## P2 — Durable advantage (days 45–75)

| # | Item | User impact | Business | Search | Feasibility | Cost | Maint. | Risk |
|---|---|---|---|---|---|---|---|---|
| P2-1 | **Public measurement corpus** ("we compressed 40 real PDFs — here is what happened"), reproducible script + dataset in repo | M | H | Very high (citation bait, GEO) | Medium | 3 days | Medium | Low |
| P2-2 | **Offline/PWA**: service worker, install prompt, "works with no network" demo page | M | H (proof of the privacy claim) | Medium | Low | 1–2 days | Medium | Low |
| P2-3 | **Workflow chaining**: carry file + settings across compress → resize → EXIF strip → image-to-PDF | H | M | Medium | Medium | 2–3 days | Medium | Low |
| P2-4 | **Productised embed widget** (`<iframe>` + postMessage API + noindex host protection) | M | H (distribution) | Low | Medium | 3 days | Medium | Medium |
| P2-5 | Comparison pages ("TinyPNG alternative for exact KB limits") — honest tables, dated | M | M | High (comparative intent) | Low | 2 days | Low | Low |
| P2-6 | Design system pass: byte gauge as identity, one typeface, flat surfaces | M | M | Indirect (engagement) | Low-medium | 3 days | Low | Low |
| P2-7 | Delete `server.ts`; add ESLint; add Lighthouse CI budget | L | M | Minor | Low | 1 day | Low | Low |

## P3 — Growth experiments (days 75–90)

| # | Item | Effort | Success test (falsifiable) |
|---|---|---|---|
| P3-1 | Batch ZIP improvements + saved presets | 2 days | ≥15% of sessions use batch |
| P3-2 | Original data assets (compression benchmark tables, per-format size guides) | 2 days | ≥3 external citations within 60 days |
| P3-3 | $0 link-building: open-source the benchmark script, publish on relevant communities | 1 day/week | ≥5 referring domains/month |
| P3-4 | Sponsor slot on the portal reference tables (only after 20k sessions) | 1 day | An offer exists at all |
| P3-5 | Multilingual UI strings (ur, hi, bn) | 3 days | Non-English sessions measurable |

---

## 30 / 60 / 90

### Days 1–30 — finish P0, start P1
- [ ] Cloudflare Transform Rule: `X-Robots-Tag: noindex` for `*.pages.dev` non-production hosts (P0-8)
- [ ] Consent Mode v2 or remove GTM (P0-9)
- [ ] Deploy this release; verify 36 URLs in Search Console, submit sitemap
- [ ] P1-1 PDF→image with pdf.js (behind a feature flag until browser-tested)
- [ ] P1-4 signature + passport modes
- [ ] P1-6 code splitting + Worker
- **Exit criteria:** zero advertised-but-unimplemented features; `site:` shows no preview URL.

### Days 31–60 — the core promise
- [ ] P1-2 true PDF target-size engine, disclosed trade-offs
- [ ] P1-5 portal-size reference (10 countries minimum, each with a source URL and date)
- [ ] P1-3 OCR behind `status:'preview'` until bundle/perf validated, then flip to live
- [ ] P1-7 accessibility sweep
- **Exit criteria:** every live tool does what its page says on a 5-year-old Android phone.

### Days 61–90 — advantage and measurement
- [ ] P2-1 measurement corpus published with reproducible script
- [ ] P2-2 offline/PWA + network-block proof page
- [ ] P2-3 workflow chaining
- [ ] P2-5 comparison pages
- [ ] P2-6 design system pass (byte gauge)
- **Exit criteria:** a sceptic can verify the privacy claim in under 60 seconds, and the site has one asset no competitor can copy.

---

## Metrics to watch (and how)

| Metric | Source | Baseline |
|---|---|---|
| Download completion rate per exact-size page | GA4 events (`compress_success` / `compress_target_missed`) | not yet instrumented — **P1 task** |
| Returning-user share (30-day) | GA4 | unknown |
| Field LCP/INP/CLS | Search Console CWV | unknown |
| Indexed vs submitted URL count | GSC Pages | unknown |
| Queries in positions 8–20 | GSC | unknown |
| AI citations for 20 tracked prompts | manual monthly log | unknown |

Nothing above is claimed as measured today. Instrumentation is the first P1 task precisely because decisions should stop relying on inference.

---

## Explicit rejections

| Idea | Verdict |
|---|---|
| "Add 50 more tools" | Rejected — 25 adequate tools already exceed one maintainer's maintenance budget |
| "AI-powered PDF chat" | Rejected — requires a server, competes with funded products, contradicts the local promise |
| "Office ↔ PDF conversion" | Rejected — LibreOffice on a server breaks both the cost model and the privacy claim |
| "Accounts, cloud storage, sync" | Rejected — creates exactly the data liability the product avoids |
| "Aggressive ad monetisation" | Rejected for now — destroys the only differentiator |
| "Buy backlinks" | Rejected — the honest-data route is cheaper and survivable |
| "Chase AI Overview placement" | Rejected as a tactic — be citable instead; ~94% of AIO citations come from pages already in the top 10 |

---

## Dependency and risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Maintainer bandwidth (single person) | High | High | Ship fewer, better tools; keep the honest-limitation habit; automate verification in the build |
| pdf.js / tesseract bundle size hurts mobile | Medium | Medium | Lazy-load per tool, Worker, measure on throttled 3G before flipping `status` to live |
| Portal specifications change | High | Medium | Every row carries a source URL and a "last verified" date; review quarterly |
| A future fabricated-output regression | Low after tests | Very high | Regression guard test + build assertions + preview-status gate |
| Privacy claim challenged | Low | High | Publish the DevTools proof; add offline mode; never claim more than verified |
