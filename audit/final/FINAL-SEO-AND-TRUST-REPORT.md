# Final SEO and Trust Report

Measured 2026-11-16 by `npm run build`, which runs `scripts/generate-seo-pages.ts` then
`scripts/verify-seo-build.ts` and fails the build on regressions.

## Measured output

```
Indexable URLs: 37 (tools indexable: 24/25; preview excluded: image-to-text-ocr)
Verified 37 indexable routes, 1 quarantined preview routes, 6 trust pages, robots,
headers and the 1200x630 OG PNG.
```

- **37 indexable URLs** = 24 tool pages + home + 6 trust pages + category/list pages.
- **`image-to-text-ocr` is quarantined**: it exists, is reachable, but is `noindex` and is
  excluded from the sitemap until the OCR workflow is judged acceptable end to end. A preview
  page that a curious user can use is honest; one that search engines index as a finished
  product is not.
- **Trust pages (6)**: About, Contact, Privacy, Terms, How it works, Security/processing.
- Every page carries a canonical, an OG image (1200×630 PNG, generated), a title ≤ 60 chars
  where automated, and a description in range.
- `robots.txt` and `_headers` are generated; `_headers` includes the Cloudflare Pages preview
  rule using host placeholders (`https://:project.pages.dev/*` and
  `https://:version.:project.pages.dev/*`) so preview deployments are `noindex` while
  production is indexable.

## Search strategy expressed as intent, not invented volume

No keyword volume, difficulty score or ranking position is published anywhere in this project:
the tools to measure them were not available, and estimates would be fabrication. What the
page set does encode is intent:

| Intent class | Example query shape | Landing page | Why it can win |
|---|---|---|---|
| Constraint | "compress image to 20 kb" | ceiling tool | The number is in the title and the tool answers with a gauge |
| Conversion | "pdf to jpg" | pdf-to-image | Real pdf.js rasterisation in-tab, no watermark |
| Repair | "split pdf online" | split | Works offline in the tab |
| Developer | "json formatter", "jwt decoder" | dev tools | Zero upload, instant |
| Definitional | "what is a passport photo size" | trust/how-it-works | Honest explanation, no fake portal specs |

## Internal linking

Every tool page links to (a) the other tools in its family, (b) the processing/privacy page,
(c) the tools index. Anchor text is the job name, not "click here".

## Trust content — what it says and does not say

- Says: files are processed in the browser for the listed tools; uploads are not performed;
  the page can be used offline after load; what happens to the page when JavaScript is off.
- Does **not** say: "100% private", "GDPR compliant", "CCPA compliant", "bank-grade",
  "we never log anything". GTM is present and the consent gap is documented as an accepted
  risk (owner decision D2), so any absolute privacy slogan would be false.
- Contact address remains unset (`PUBLIC_CONTACT = null`) until the owner supplies and approves
  one; the site does not invent a support email.

## Known SEO debt

1. No measurement of Core Web Vitals in the field (no CrUX/GSC data collected this run).
2. No Search Console property verified for this branch's preview; indexation cannot be claimed.
3. Backlinks: zero known. Nothing here promises rankings or traffic.
4. The diagnostic GitHub Pages deployment is a duplicate of production content; it should stay
   `noindex` (verified in `_headers`/meta) to avoid duplicate-content ambiguity.
