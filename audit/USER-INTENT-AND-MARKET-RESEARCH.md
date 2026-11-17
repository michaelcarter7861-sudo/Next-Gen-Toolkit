# User Intent and Market Research

**Research date:** 2026-11-16
**Constraint:** no keyword-volume tool, no Search Console access, no analytics access in this environment. **No search volume, difficulty or traffic numbers are stated.** Intent structure below is derived from product behaviour, competitor page structure and publicly documented portal requirements — not from volume data.

---

## 1. Who actually needs this product

| # | Persona | Urgent job | Constraints | Why they abandon a tool | Why they return | Trust requirement |
|---|---|---|---|---|---|---|
| P1 | **Exam / government applicant** (Pakistan, India, Bangladesh, Nigeria) | Get a photo or signature under an exact KB ceiling before a portal deadline | Phone camera, 2–5 MB originals, slow data, one attempt, anxiety | Output rejected by portal; unclear size; forced signup; ad interstitial | It worked first time and told them the exact bytes | Proof of output size; no upload; clear steps |
| P2 | **Student / academic** submitting assignments | Merge scans, shrink PDFs under a limit, convert images to PDF | Shared laptop, free-tier caps, deadline pressure | "Limit reached, come back tomorrow" | Speed + no account | Free, predictable, no watermark |
| P3 | **Freelancer / small business** sending invoices, IDs, contracts | Strip metadata, compress, merge, protect sensitive docs | Client confidentiality, mixed devices | Doubt about where files go | Repeatable, auditable, offline | Explicit data-handling statement |
| P4 | **Developer** | Fix JSON, decode JWT, test regex, count tokens, diff code | Clipboard-heavy workflow, no patience for signup | Slow UI, lost input on refresh, ads | Keyboard flow, chaining, accurate output | Accuracy + no data exfiltration |
| P5 | **Designer / content creator** | Bulk WebP/AVIF, social crops, QR assets | Large batches, quality sensitivity | Quality loss not previewed; batch caps | Before/after preview, batch ZIP | Visual fidelity + speed |
| P6 | **Privacy/security-conscious user** | Sanitise EXIF/PDF metadata, generate secrets | Distrust of any server | Any unexplained network request | Verifiable offline behaviour | Proof, not promises |
| P7 | **Low-end device / low-bandwidth user** | One quick operation on a cheap Android | 2 GB RAM, unstable network | Heavy JS bundle, upload timeouts | Small payload, works offline | Speed and resilience |
| P8 | **Office professional** | Compress a deck, split a report, remove pages | Corporate laptop, no software install rights | Blocked by IT, unclear licences | Web-only, no install | Legitimacy (legal pages, contact) |

**Primary audience recommendation:** P1 + P2 (exact-size document completion) because the job is urgent, repeatable, and the incumbent free tiers are weakest precisely there. P4 is the best secondary audience because developers generate links and word-of-mouth disproportionate to their numbers.

---

## 2. Intent taxonomy applied to this product

| Intent | Example query shape | What the SERP rewards | Current coverage |
|---|---|---|---|
| Transactional / tool-seeking | "compress image to 20kb" | A working tool above the fold | ✅ live |
| Exact-output / constraint | "50kb photo for form", "signature 20kb" | Presets + proof of output + guidance | ◐ presets exist, no dedicated page |
| Urgent problem-solving | "pdf too large to upload" | Immediate fix, no signup | ◐ copy only |
| Comparative | "tinypng alternative", "offline pdf compressor" | Comparison table, honest trade-offs | ❌ |
| Informational | "what size photo for passport" | Reference table, citations | ◐ FAQ fragments |
| Workflow | "merge then compress pdf" | Chained tools | ◐ next-step links |
| Navigational | "nextgentoolkit" | Brand site | ❌ (no brand demand yet) |
| Developer troubleshooting | "json unexpected token fix" | Error explanation + fix tool | ◐ repair works, no error-index content |
| Educational | "how does jpeg compression work" | Depth, diagrams, author | ❌ |

---

## 3. Scenario analysis (the part most tool sites skip)

### 3.1 Image compression — eight different jobs behind one keyword

| Scenario | Real need | Product gap today |
|---|---|---|
| Portal rejects 20 KB photo | Exact ceiling + pixel guidance | ✅ delivered; ❌ no dimension guidance per portal |
| Passport photo spec | Aspect ratio + face framing | ❌ no crop-to-spec |
| Signature under 10–20 KB | High contrast, tiny canvas | ❌ no signature mode |
| E-commerce bulk | Batch, WebP, consistent naming | ◐ batch exists, naming is per-file only |
| Website performance | WebP/AVIF, quality control | ✅ after format fix |
| Social crop | Presets, cover crop | ✅ |
| Offline/confidential | Works with network blocked | ◐ works, not installable/offline-proven |
| "Did it actually shrink?" | Honest before/after | ✅ result panel now reports real bytes |

### 3.2 PDF compression — the job is not "compress", it is "get under the limit"

| Scenario | What actually works | Current state |
|---|---|---|
| Text PDF, 3 MB, needs 200 KB | Structural rebuild usually insufficient; needs image downsampling | ❌ engine cannot; page now says so |
| Scanned PDF, 8 MB, needs 500 KB | Re-rasterise at lower DPI | ❌ (engine not shipped) |
| Metadata cleanup before sharing | Strip Info/XMP | ✅ genuine |
| Merge + compress before upload | Chaining | ◐ chain exists, second step may not reach target |

**Implication:** the honest product decision is either (a) ship a rasteriser (pdf.js + canvas) so the promise becomes true, or (b) stop promising exact PDF ceilings. This release chose (b) plus honest reporting; (a) is item P1-3 in the roadmap.

---

## 4. Pain points with evidence

| Pain | Evidence | Strength |
|---|---|---|
| Free tiers are gated by downloads | Smallpdf free column: "Limited document downloads", "Daily download limit" on nearly every tool (observed 2026-11-16) | Strong, vendor-stated |
| Strong compression is paid | Smallpdf: "Strong Compression" listed only under Pro (observed 2026-11-16) | Strong, vendor-stated |
| OCR is paid | Smallpdf "PDF OCR" Pro row; iLovePDF "OCR PDF (Advanced)" Premium row (observed 2026-11-16) | Strong, vendor-stated |
| Batch limits on free | TinyPNG: "Up to 20 images, max 5 MB each" (observed 2026-11-16) | Strong, vendor-stated |
| Upload retention ambiguity | TinyPNG FAQ: retained "maximum of 48 hours" (observed 2026-11-16) | Strong, vendor-stated |
| Users distrust unexplained uploads | Inference from the existence of an "offline/no upload" competitive lane | Hypothesis — needs review-site evidence |
| Portal size requirements are poorly documented | The site's own founders targeted 20/50/100 KB presets; no single verified reference exists in the repo | Hypothesis — needs a sourced portal table |

---

## 5. Opportunity map

| Opportunity | Demand signal | Feasibility | Differentiation | Priority |
|---|---|---|---|---|
| Verified portal-size reference (per country/document, with source + date) | Repeated preset naming in the product's own data; competitor silence | High (research, not code) | Very high — nobody authoritative owns this | **P1** |
| Real PDF→image (pdf.js) | Advertised today, unimplemented | Medium (bundle + worker) | High | **P1** |
| Real OCR (tesseract.js, local) | Advertised today, unimplemented | Medium-high (model download, perf) | High vs paid competitors | **P1** |
| True PDF target-size engine (rasterise + rebuild) | Core promise | Medium | Very high | **P1** |
| Workflow chaining with carried settings | Existing "next step" links | Low-medium | Medium-high | **P2** |
| Offline/PWA install | Privacy lane | Low | High (proof of claim) | **P2** |
| Embeddable tool for teachers/blogs | Snippet exists | Low | Medium (distribution) | **P2** |
| Original compression benchmarks | GEO + links | Medium | High | **P2** |
| Developer context packer (repo → tokens) | Partial today | Low-medium | Medium | **P3** |

---

## 6. What NOT to build

| Idea | Why reject |
|---|---|
| Office ↔ PDF conversion | Requires server-side LibreOffice; breaks the local promise and the cost model |
| Cloud storage / accounts | Creates the liability the product exists to avoid |
| Video compression | Browser codecs unreliable, expectations impossible to meet |
| E-signature | Legal/identity requirements far beyond current scope |
| "1000 tools" breadth | Maintenance debt without a reason to choose us |
| AI chat wrapper | Competes with free, better-funded products; undermines the utility positioning |

---

## 7. Next research steps

1. Instrument the site (GA4 events) and collect 30 days of real use to replace inference with data.
2. Export GSC queries at 30 days; prioritise queries in positions 8–20.
3. Collect 50 verbatim complaints with URLs before publishing any "users hate X" claim.
4. Interview 5 target users (students/applicants) about the portal-size workflow.
