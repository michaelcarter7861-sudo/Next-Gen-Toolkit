# Final Product Strategy and Growth Plan

Derived from the verified competitor set (`FINAL-COMPETITOR-INTELLIGENCE.md`), the shipped
product and the owner's four decisions. No traffic, revenue or ranking figure in this document
is a forecast; every number is either a price read off a vendor page or a count measured in
this repository.

## Position

> **The file tool that tells you the truth about the limit.**
> In-tab processing, exact target sizes, and an honest answer when the target is impossible.

Three defensible claims, all verifiable by the user:

1. **No upload** for the listed tools — check DevTools, nothing leaves the tab.
2. **Exact ceiling with a verdict** — "20 KB reached" or "smallest possible is 34 KB", never a
   silent failure.
3. **No account, no watermark, no task counter** — against iLovePDF's daily caps, Smallpdf's
   "limited downloads" and CloudConvert's credits.

## Where the money is (analysis only — nothing implemented)

- Competitors gate **strong compression** and **OCR** (Smallpdf) and **batch/credits**
  (CloudConvert, TinyPNG API). Those are the willingness-to-pay features.
- A flat $3–5/month tier for unlimited batch + exact sizes undercuts Smallpdf Pro ($15) and
  matches iLovePDF Premium ($5 annual) while remaining simpler to explain.
- Do **not** meter. Metering is the industry norm and the industry's most-complained-about
  behaviour (billing confusion dominates Smallpdf's Trustpilot summary).

## 30 / 60 / 90 days

**Days 1–30 — close the honesty gaps.**
Finish the OCR decision (enable only if the whole workflow is acceptable; otherwise keep it
quarantined), add the before/after preview, batch progress with cancel, and a real a11y pass
(axe in CI + one screen-reader session). Verify the preview `noindex` header on a real
Cloudflare preview deployment.

**Days 31–60 — earn the search entry.**
Ten worked-example pages (task, constraint, screenshots, honest limits) instead of ten
keyword-stuffed landing pages. Verify one portal specification properly (advertisement PDF,
page number, screenshot) and only then add a preset. Set up Search Console for production.

**Days 61–90 — retention and optional paid tier.**
"Recent jobs" stored locally (no account), shareable preset links, and a batch mode behind a
flat subscription. Measure: return-visit rate, downloads per session, and the ratio of
"ceiling reached" to "ceiling impossible" — that ratio is the product's core signal.

## Things this project will not do

- No "100% private" slogan while GTM is loaded.
- No GDPR/CCPA claim without legal review.
- No invented portal specifications, volumes, review quotes or customer counts.
- No rasterising "make this PDF exactly 500 KB" engine (owner decision D4).
- No silent upload of a file for a "better" result.
