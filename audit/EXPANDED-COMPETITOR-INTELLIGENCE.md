# Expanded Competitor Intelligence

**Research date:** 2026-11-16 · All vendor figures below were **observed on the vendor's own page on that date** and are labelled OBSERVED. No traffic, market-share or keyword-volume figures appear anywhere: no tool was available to measure them.

## 1. Directly observed products

| Competitor | Observed promise | Free tier (observed) | Paid tier (observed) | Architecture (observed) | What it means for us |
|---|---|---|---|---|---|
| **iLovePDF** | "All PDF tools" suite | Limited document processing; core tools incl. Compress, OCR PDF (basic) | Premium **$5/mo annual ($60/yr)** or **$9/mo**; adds unlimited processing, Workflows, signatures, regional processing, 2,000 AI credits | Server-side | Breadth and price floor we cannot beat on breadth |
| **Smallpdf** | "30+ document tools", Pro adds "Strong Compression" + OCR | $0, **"Limited document downloads"**, daily download caps on nearly every tool, limited file size | **Pro $15/mo**, Team $12/seat/mo | Server-side; FAQ states files are deleted from servers after processing | The two things portal users need (strong compression, OCR) are exactly the paid ones |
| **Sejda** | Desktop-grade PDF editing in browser, plus a desktop app | Free: **page and hourly limits**, limited uploads, tool-specific limits, no signup | Web Week Pass **$5/7 days**, Web Monthly **$7.50/mo**, **Desktop+Web Annual $63/yr** | **Split**: Web = server-side, **Desktop = local processing** | Important: local processing is *already sold* by Sejda — as a **download for $63/yr** |
| **PDF24** | "Free and easy" full PDF suite | **Free, "no artificial limits"**, ad-supported | None for the web tools | Server-side for web; **PDF24 Creator desktop app processes locally** | Also already offers local + free + unlimited. "Free and unlimited" is not a differentiator any more |
| **CloudConvert** | API-first conversion, 200+ formats | Free **10 credits/day**, 1 GB max, 5 min max, 5 concurrent | **$17 / 1,000 credits** one-off; **$9/mo** subscription, ~1 credit/minute | Server-side API | Serves a different job (automation), not portal byte ceilings |
| **TinyPNG** | Best-in-class PNG/JPEG/AVIF/JXL optimisation | **20 images, max 5 MB each** | Web Pro / Ultra, API | Server-side, uploads retained **up to 48 h** | No exact-KB control: quality levels only |
| **JSONLint** | Strict JSON validation + format/compress | Free, no account, open-source engine | None visible | Client-side | Mature; trust and brand, not features, are the gap |

Third-party observation: Trustpilot's company page for Smallpdf (fetched 2026-11-16) shows **4.8/5 across 5,535 reviews**, and its own AI-generated review summary states that some reviewers were unhappy with **"unexpected charges and confusing subscription policies"** and that a few felt **"certain specific tools did not work as smoothly as expected"**. Treat this as a third-party summary of unverified reviews, not as a measured failure rate.

## 2. Corrections to the phase-1 competitor report

| Phase-1 claim | Correction |
|---|---|
| "No upload" is the core moat | **Overstated.** Sejda (Desktop, $63/yr) and PDF24 (Creator, free) both already process files locally — as installable desktop software. The defensible claim is narrower and better: **local processing with zero install, in a browser tab, with byte-verified output**. |
| Free + no limits is a differentiator | **False.** PDF24 is free, ad-supported and states "no artificial limits". Our advantage is not "free", it is "no server, so there is no reason to invent a limit". |
| Competitors cannot match local processing | **False in the long run.** They chose server-side for margins and features. That is a strategic constraint, not a technical impossibility — but it is expensive for them to reverse for individual files. |

## 3. Where incumbents are genuinely better

| Area | Stronger competitor | Can we close it? |
|---|---|---|
| Office ↔ PDF conversion fidelity | iLovePDF, Smallpdf, CloudConvert (server LibreOffice) | **No** — needs a server. Do not attempt. |
| E-signature workflows | Smallpdf, iLovePDF | **No** — legal/identity scope far beyond a utility |
| OCR quality on poor scans | Adobe, ABBYY-class engines | **Not soon** — tesseract.js will be acceptable, not best-in-class |
| Brand trust, review volume, support | All of them | Only by time and verifiable behaviour, not by copy |
| Batch throughput on 500 MB files | Server-side products | **No** — device memory is the ceiling; disclose it |
| Design polish | Smallpdf, TinyPNG | Partly — see `DESIGN-IMPLEMENTATION-AND-QA.md` |

## 4. Where they are structurally weak (and we can win)

| Weakness | Evidence | Our counter-move |
|---|---|---|
| Free tiers are gated exactly where students/applicants need them | Smallpdf free column: daily download limits; "Strong Compression" and OCR are Pro rows (observed) | No caps on local operations, unlimited files per run |
| No exact byte-ceiling control | TinyPNG/iLovePDF/Smallpdf expose quality levels, not "under 20 KB" | Byte-verified target with `met-target` / `best-effort` states and a measured byte gauge |
| Uploads retained server-side | TinyPNG: up to 48 h retention; Sejda web: "process them on our servers" | Files never leave the device; verifiable in DevTools; offline-capable |
| Local processing costs money and an install | Sejda Desktop $63/yr; PDF24 Creator is a Windows/desktop install | Browser tab, zero install, zero cost |
| Portal-specific guidance absent | None of the observed products publishes per-portal requirements | Verified portal reference tables (research task, see `PORTAL-REQUIREMENTS-REFERENCE.md`) |
| Poor failure communication | Trustpilot summary flags tools that "did not work as smoothly as expected" (unverified reviews) | Every result states what happened, including "could not reach the limit" |

## 5. Not verified in this run

PDF24 individual tool limits, Adobe Acrobat online limits, Squoosh, Photopea, CyberChef, Regex101, JWT.io, QR Code Monkey, LanguageTool, WordCounter and CharacterCountOnline were **not fetched**. No claim about their limits is made here. A Reddit/App-Store feedback sweep was **not completed** (no systematic access verified), so no user-complaint statistics are reported.

## 6. Strategic reading

1. **"Free and unlimited" is dead as a position.** PDF24 owns it with ads and a desktop app.
2. **"No upload" is strong but not unique** — it must be *verifiable* and *installable-free* to matter.
3. The one job nobody in the observed set does well: **make a file satisfy a specific portal's byte and pixel rule, and prove it did**. That is a narrow, unglamorous, defensible position.
4. CloudConvert's credit model shows the floor price for *conversion*; our local tools have no marginal cost, so pricing should never be used to gate accuracy.
