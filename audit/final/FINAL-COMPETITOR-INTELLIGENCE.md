# Final Competitor Intelligence

Retrieved: 2026-11-16 (UTC). Prices are list prices shown on official pages on that date, in
the currency the page displayed (USD unless stated). Nothing here is a quote, ranking or
review score invented by this project. Where a page did not state a limit, that is written
as "not stated" instead of a guess. Renewal/tax behaviour was not verified for any vendor.

## Method and its limits

- Every row marked *verified* was read off the vendor's own page during the research window.
- Controlled side-by-side testing (same file, same target, timing) was **not** performed; no
  vendor was pushed through a scripted benchmark. Any performance claim below is either the
  vendor's own wording (quoted as such) or absent.
- Free-tier terms change without notice. Treat every number as "as displayed on 2026-11-16".

## Verified table

| Vendor | Primary model | Server or local | Free tier as displayed | Paid entry point | Notes relevant to NextGenToolkit |
|---|---|---|---|---|---|
| iLovePDF | Server suite (PDF) | Server | Free account with daily task cap and file-size cap (cap value is not shown on the pricing page visited) | Premium $5/mo billed annually ($60/yr) or $9/mo month-to-month | Classic freemium anchor; AI credits bundled in 2026 |
| Smallpdf | Server suite (PDF) | Server | Free tier exists but downloads are explicitly "Limited document downloads" | Pro $15/mo; Team $12/seat/mo | "Strong Compression" and OCR are paid rows — the two features we treat as premium-free |
| PDF24 | Ad-supported free tools | Server (web tools) | Free, ad-supported, vendor states "no artificial limits" | Paid product is the offline PDF24 Creator (Windows) | Closest philosophical competitor for "no artificial limits" |
| Sejda | Server + local desktop | Both | Web: 3 tasks/hour, 50 MB / 200 pages (as previously recorded from sejda.com/upgrade) | Web Week Pass $5/7 days, Web Monthly $7.50/mo, **Desktop+Web Annual $63/yr** | Only vendor that openly sells a local-processing desktop app — proof that "local" is a real market segment, not a niche |
| CloudConvert | Paid API + UI | Server | 10 credits/day, 1 GB, 5 min per job | $9/mo subscription or $17 per 1,000 credits | Credit accounting is the opposite of our flat model; Office conversions cost 2–4 credits |
| TinyPNG | Server image API | Server | 20 images per batch, 5 MB each | Developer API is paid, per-image | Compression by quality level only — no exact-KB ceiling, which is our differentiator |
| JSONLint | Client-side dev tool | Local (browser) | Free, no account, open-source engine | None observed | Proves a single-purpose client-side dev tool sustains traffic |
| iLoveIMG | Server image suite | Server | Free tier exists; compress landing page states no numeric limit | Paid tiers exist (not priced on the landing page) | Broad suite; no exact-target compression |
| Adobe Acrobat online | Server suite | Server | Free basic tasks with account | Subscription (not fetched this window) | Not evaluated this window — listed as **not verified** |
| 123apps | Server utility suite | Server | Not fetched this window | Not fetched | **Not verified** |
| Squoosh | Client-side (WASM) | Local | Free, open source, no upload | None | Direct architectural comparable: our image engine is also in-browser |
| Photopea | Client-side editor | Local | Free with ads | Paid ad-free tier | Local heavy editor; different job |
| FreeConvert | Server | Server | Not fetched this window | Not fetched | **Not verified** |
| Regex101 / JWT.io / CyberChef / QR Code Monkey / LanguageTool / WordCounter / CharacterCountOnline | Single-purpose web tools | Mixed (CyberChef local, others server or mixed) | Free tiers or fully free | Some have paid tiers | Not fetched individually this window; treated as **not verified** |

## What the verified set actually says

1. **Nobody we verified offers an exact output-size ceiling for images.** TinyPNG and
   iLoveIMG compress by quality level; Smallpdf sells "Strong Compression" as a feature, not a
   number. "Compress this photo to under 20 KB for a government form" is therefore an
   underserved job, and it is the job that NextGenToolkit's ceiling tool performs.
2. **OCR and strong compression are the paid gate at the biggest vendor.** Smallpdf's paywall
   rows are exactly the two things our tools do in the browser for free. That is a defensible
   wedge, and it is also a warning: those features are where vendors believe the willingness
   to pay is.
3. **Local processing is a sold product, not a marketing fiction.** Sejda Desktop and PDF24
   Creator both exist as paid/free desktop software. That vindicates D4-style honesty: we can
   say "this file never left the tab" without claiming the category is unique.
4. **Credit metering is the industry norm** (CloudConvert, iLovePDF AI credits, TinyPNG API).
   Our flat, unmetered model is simpler to explain and impossible to compare line-for-line in
   a pricing table — a messaging problem, not a product problem.

## Where we are genuinely weaker

- Batch and account features (cloud storage connectors, team seats, audit history) — we have none.
- Vendor trust signals (years in market, brand recall, enterprise logos) — we have none yet.
- Office ⇄ PDF conversion (docx/xlsx/pptx) — we do not do it at all; CloudConvert charges
  2–4 credits because it is genuinely expensive.
- Marketing spend and SEO domain age — competitors rank for "compress pdf" queries today.

## Where we are genuinely stronger

- Exact target ceilings for images, with the reachable-or-not answer stated honestly.
- Per-file, in-tab PDF and image processing with no upload — verifiable by opening DevTools.
- No account, no watermark, no task counter.
- One consistent UI across PDF, image and text jobs, including a real PDF→image rasteriser in
  the browser (pdf.js), which free competitors gate or watermark.

## Pricing implication (analysis, not a commitment)

A flat $3–5/month tier for "no per-task limits + exact target sizes + batch" would sit below
Smallpdf Pro ($15) and iLovePDF Premium ($5 annual) and above free. Nothing was changed in the
product this run; there is no billing code, and no price was published.
