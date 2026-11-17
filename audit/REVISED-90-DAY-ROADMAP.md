# Revised 90-Day Roadmap

**Date:** 2026-11-16 · Supersedes the phase-1 roadmap where they differ.
Priority levels: **P0** correctness/trust · **P1** core quality · **P2** differentiation · **P3** optional.

## Owner decisions required before day 1

| # | Decision | Blocks | Default if no answer |
|---|---|---|---|
| D1 | Approve a public contact address (or a form endpoint) | Trust pages, legal review, support route | Contact stays "pending approval" |
| D2 | Keep or remove Google Tag Manager; if keep, add Consent Mode v2 (default denied) | Privacy claim, EU/UK exposure | Keep as-is with the current disclosure |
| D3 | Approve removing the non-functional AI launcher | Bundle size, honesty | Keep, still non-functional |
| D4 | ~~Approve the PDF target-size strategy~~ **DECIDED 2026-11-16: keep honest limits** — no rasterising target-size engine | — | Decided |
| D2 | ~~Consent Mode vs GTM removal~~ **DECIDED: keep GTM for now** as an accepted risk | — | Decided |
| D3 | ~~AI launcher~~ **DECIDED: host later** — entry points hidden now | — | Decided |

## Days 1–30 — close the P0s and prove the basics

| Item | Why | Evidence | Risk | Confidence | Measure of done |
|---|---|---|---|---|---|
| Deploy this branch behind review | Nothing here is live | — | Low | High | 37 URLs live; OCR still noindexed |
| Remove the personal contact data (done in branch) + add approved one (D1) | Release blocker | Phase-2 N5 | Low | High | Generated pages contain only approved contact data |
| Consent Mode v2 or GTM removal (D2) | Privacy claim vs reality | Phase-2 §6 privacy review | Medium | High | `gtag('consent','default',{denied})` before the container, verified in DevTools |
| Verify the preview-host header on a real deployment | Phase-1 claim was false; new rule unverified at the edge | `curl -sI` commands in the SEO report | Medium | High | Preview returns `noindex`, production does not |
| Run the browser suite (`npm run test:e2e`) | No browser was available to the auditor | `scripts/e2e/` | Low | High | All scenarios pass, screenshots archived |
| Push the Search Console error text to the repo | Only the owner can see it | SEO report §4 | Low | High | Cause identified or ruled out |
| Instrument product events (tool opened, run, target met/missed, download, next tool) with no file data | Decisions currently rest on inference | Phase-1 §13 | Low | High | Events visible in GA4 |

## Days 31–60 — make the PDF promise true

| Item | Why | Cost | Risk | Confidence |
|---|---|---|---|---|
| ~~True target-size PDF engine~~ → replaced by **clear positioning**: keep structural optimisation, state the limitation on the page, and route scan owners to the new PDF→image + image compression chain | Owner decision D4: do not turn documents into images silently | 0.5 d copy + 1 d chain UX | Low | High |
| Portal reference v1: ≥5 portals, each with quoted requirement, URL and date | Highest-value differentiation available | 3–4 d research | Low | High |
| Signature and passport-photo modes (crop-to-spec, high contrast, exact KB) | Two of the three top scenarios | 1–2 d | Low | High |
| Route-level splitting + catalogue lazy-load | 89 kB eager chunk on every page | 1 d | Low | High |
| Move canvas/PDF work into a Web Worker | Main-thread jank on low-end phones | 2 d | Medium | Medium |
| Offline/PWA shell + "no network" demonstration page | Makes the privacy claim checkable | 1–2 d | Low | High |

## Days 61–90 — advantage

| Item | Why | Cost | Confidence |
|---|---|---|---|
| OCR with a locally hosted model, English first; keep `preview` until a browser run passes | The one remaining preview tool | 2–4 d | Medium |
| Public measurement corpus ("we compressed 40 documents") with a reproducible script | Citable asset nobody can copy without the work | 3 d | High |
| Honest comparison pages incl. where Sejda/PDF24 beat us on local processing | Comparative intent; trust | 2 d | High |
| Before/after slider for images | Competitor parity | 1 d | High |
| Design pass: self-hosted Inter subset, six design tokens, sticky mobile action bar | Removes the template look; mobile completion | 3 d | High |
| Embeddable widget with postMessage API | Distribution | 3 d | Medium |

## Measurement plan

| Metric | Source | Baseline today |
|---|---|---|
| Run completion rate per exact-size tool | GA4 events | **not instrumented** |
| Target-met vs best-effort ratio | engine result property | measurable, not yet collected |
| Time to result (p50/p95) | `executionDurationMs` | measured per run, not aggregated |
| Mobile share and completion | GA4 | unknown |
| Field LCP/INP/CLS | GSC → CWV | unknown |
| Indexed vs submitted URLs | GSC | unknown |

## Dependencies and sequencing

`D1/D2 → deploy → edge verification → browser suite` must complete before any content or SEO work, because several trust statements depend on D1/D2 and because the header rule cannot be verified without a deployment.

## Explicit rejections (unchanged and reinforced)

Office↔PDF conversion · accounts/cloud storage · video compression · e-signature · advertising-driven growth · broad keyword page generation · any AI wrapper without a user job. PDF24 (free, no limits, ads) and Sejda (local desktop at $63/yr) already occupy the "free/unlimited" and "local" positions; we compete on **verified byte outcomes**, not on those claims.
