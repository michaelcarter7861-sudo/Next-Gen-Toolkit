# Product and User Research — Second Phase

**Date:** 2026-11-16
**Limits:** no keyword-volume platform, no Search Console, no analytics. **No demand numbers are stated.** Segment behaviour below is INFERRED from product/portal structure and competitor pricing, and every inference that drives a decision is flagged as such.

## 1. Segments and jobs-to-be-done

| Segment | Job (verbatim shape) | Trigger | Device | Abandonment cause | Trust signal needed |
|---|---|---|---|---|---|
| Exam / government applicant (PK, IN, BD) | "Make this photo under 20 KB so the form accepts it" | Deadline, one attempt, rejection message | Cheap Android | Output rejected; unclear size; signup wall | Exact output bytes + "no upload" proof |
| Student | "Merge my scans into one PDF under the limit" | Submission deadline | Shared laptop | Daily download cap | No account, no cap |
| Freelancer / small business | "Send an ID/contract without leaking metadata" | Client request | Desktop | Uncertainty about where the file goes | Metadata handling explained, locally proven |
| Developer | "Fix this JSON / decode this JWT / test this regex" | Build failure | Desktop | Signup, ads, lost input | Instant, keyboard-first, accurate |
| Designer | "Batch-convert and keep quality" | Asset pipeline | Desktop | Batch caps, no before/after | Visual comparison + ZIP |
| Privacy-conscious user | "Sanitise this file" | Sharing a sensitive document | Desktop | Any unexplained network call | DevTools-verifiable behaviour |
| Low-bandwidth / low-end device | "One small operation, fast" | Field work, travel | Old Android on 3G | Heavy JS, timeout | Small payload, offline-capable |
| Office professional | "Compress this deck for email" | Corporate mail limit | Corporate laptop | Install blocked | Legal pages, no install |

**Primary:** applicant + student (urgent, repeatable, incumbents gate exactly this).
**Secondary:** developer (links, word of mouth, cheap to serve).

## 2. Intent taxonomy with coverage

| Intent type | Example wording shape | Required page behaviour | Current coverage |
|---|---|---|---|
| Transactional | "compress image to 20kb" | Tool above the fold, presets | ✅ (deep link `?kb=20` now works) |
| Exact-constraint | "photo under 50 kb for form" | Presets + proof of output | ✅ for images; ⚠️ PDF cannot honour exact targets |
| Urgent problem-solving | "pdf too large to upload" | Immediate fix + next step | ◐ copy only; no raster-based PDF reduction |
| Comparative | "tinypng alternative exact size" | Honest table incl. where they win | ❌ not written |
| Informational | "what photo size does <portal> need" | Sourced table with dates | ❌ protocol only |
| Workflow | "merge then compress" | Chained tools with carried settings | ◐ next-step links |
| Developer troubleshooting | "unexpected token json fix" | Error explanation + fix action | ◐ repair works; no error index |
| Navigational | "nextgentoolkit" | Site | ❌ no brand demand yet |

## 3. Scenario analysis (product gaps, ranked)

| Scenario | Desired outcome | Current friction | Gap | Feasibility | Differentiation |
|---|---|---|---|---|---|
| Photo over 20 KB for a portal | Accepted upload | Must guess which preset | No per-portal preset | High | High |
| Signature under 10–20 KB | Accepted upload | No crop/contrast mode | No signature mode | Low | High |
| Passport-style photo | Correct dimensions + ratio | No aspect crop | No crop-to-spec | Medium | High |
| Many images, consistent output | Same naming/size | Per-file naming | Batch naming scheme | Low | Medium |
| Sensitive image, never uploaded | Provable local processing | Works, but not provable in-product | Offline mode / network-idle claim | Low | High |
| PDF rejected for size | Under the limit | Structural optimiser cannot shrink scans | Rasterise-and-rebuild engine | Medium | Very high |
| Scanned PDF needs real text | Extract text | OCR is preview only | tesseract.js + offline model | Medium | High |
| PDF pages as images | PNG/JPG exports | **Now works** (pdf.js) | — | Done | Medium |
| Developer multi-file context | One packed view | Partial | Improve batch UX | Low | Medium |

## 4. Evidence quality per claim

| Claim | Evidence | Confidence |
|---|---|---|
| Free tiers are gated on the exact operations applicants need | Smallpdf pricing table: daily download caps; "Strong Compression" and OCR are Pro rows (observed 2026-11-16); iLovePDF premium removes limits (observed) | High |
| Exact-size control is rare | TinyPNG, iLovePDF and Smallpdf expose quality levels, not byte ceilings (observed) | High |
| Local processing is not unique | Sejda Desktop ($63/yr) and PDF24 Creator process locally (observed) | High |
| Portal requirements are poorly documented | One official portal checked; requirements live in per-project ads (observed) | Medium — sample of one |
| Users distrust uploads | Inferred from the existence of a local-processing market and desktop products | **Low — needs review/forum evidence** |
| Mobile abandonment is high | No data | **Unknown — do not claim** |

## 5. Opportunity ranking

| Opportunity | User value | Evidence | Differentiation | Cost | Risk | Priority |
|---|---|---|---|---|---|---|
| True PDF target-size engine (rasterise + rebuild, disclose text loss) | High | Internal measurement: scans do not shrink today | Very high | 3–5 d | Medium | **P1** |
| Portal reference (sourced, dated) | High | Protocol ready, nothing verified | Very high | 3–4 d research | Low | **P1** |
| Signature / passport modes | High | Scenario analysis | High | 1–2 d | Low | **P1** |
| Real OCR (offline model) | Medium | Preview tool exists | High vs paid competitors | 2–4 d | Medium | **P2** |
| Offline/PWA + visible network-idle proof | Medium | Privacy lane | High (makes the claim checkable) | 1–2 d | Low | **P2** |
| Workflow chaining with carried settings | Medium | Existing next-step links | Medium | 2–3 d | Low | **P2** |
| Original compression benchmark corpus | Medium | Needed for credibility | High | 3 d | Low | **P2** |
| Embeddable widget | Medium | Snippet exists | Medium (distribution) | 3 d | Medium | **P3** |
| More developer tools | Low | Diminishing | Low | — | — | **Reject** |

## 6. What changed from the phase-1 research

- Personas were reorganised around the **job** rather than the demographic, because the same applicant and the same freelancer want different things from the same page.
- "Local processing" was demoted from *unique advantage* to *advantage that must be demonstrated*, because two competitors already ship it as desktop software.
- The PDF rasteriser moved from "strategy idea" to shipped implementation; the remaining PDF problem is the **target-size** engine, not page export.
- The portal reference is now explicitly a **research deliverable with a protocol**, not a copywriting idea.
