# SEO, Search Console and Trust — Second Phase

**Date:** 2026-11-16
**No ranking, traffic or indexation outcome is claimed.** Where Search Console data would be needed, that is stated as a limitation.

## 1. Technical SEO state, verified from the built output

| Item | State | Verification |
|---|---|---|
| Indexable URLs | **37** (24 live tools + 5 hubs + 6 trust pages + home + sitemap page) | `verify-seo-build.ts` inside `npm run build` |
| Preview routes | **1** (`/image-tools/image-to-text-ocr/`), `noindex,follow`, excluded from sitemap | build assertion + regenerated HTML |
| PDF→image | now **live**: `index,follow`, present in sitemap, canonical present | build assertion |
| Canonicals | one per route, asserted for all 37 | build assertion |
| Sitemap | valid XML, 37 `<loc>` entries, derived from catalogue data | workflow + build assertion |
| `robots.txt` | references `https://nextgentoolkit.pages.dev/sitemap.xml` only | build assertion |
| Dead sitemap aliases | none in `_headers` | build assertion |
| OG image | PNG, 1200×630 asserted by signature and IHDR bytes; 95 kB | build assertion |
| 404 | exists, `noindex` | build assertion |
| Trust pages | 6, no executable JS, canonical + JSON-LD each | build + source |
| Structured data | Organization/WebSite without the retired `SearchAction`; Tool/FAQPage/HowTo retained as machine-readable vocabulary; no fake reviews | source |

## 2. The preview-deployment indexing problem — resolved, with a correction

**Phase-1 finding (now marked FALSE):** "`_headers` cannot match by hostname, so preview noindex needs a dashboard rule."

**Correct position (OBSERVED ON OFFICIAL EXTERNAL SOURCE, 2026-11-16):** Cloudflare's Pages Headers documentation (last updated 12 November 2026) explicitly documents host placeholders and gives this exact example:

```
https://:project.pages.dev/*
  X-Robots-Tag: noindex

https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
```

**What was implemented:** only the **two-placeholder** form, which matches hosts with at least three labels (`<alias>.nextgentoolkit.pages.dev`). The production host `nextgentoolkit.pages.dev` has two labels, so it does **not** match that rule. The single-placeholder form was deliberately **not** used, because the production site is itself served from a `*.pages.dev` host and that rule would noindex production.

**Residual risk, stated plainly:** Cloudflare's matching is only observable from the edge. It has **not** been verified against a live deployment here, and deploying was out of scope.

**Verification commands (run after the owner deploys):**
```bash
# preview alias: must return the noindex tag
curl -sI https://<branch-alias>.nextgentoolkit.pages.dev/ | grep -i x-robots-tag
# production: must return NOTHING for that tag
curl -sI https://nextgentoolkit.pages.dev/ | grep -i x-robots-tag
```
If production ever returns `noindex`, revert the rule immediately.

## 3. Trailing slashes

| Aspect | Status |
|---|---|
| Canonical form | every canonical ends with `/` |
| Internal links | generated to `/<path>/`, matching canonical |
| Edge behaviour (308 to trailing slash?) | **UNVERIFIED** — requires a live response; Cloudflare Pages serves both `/x` and `/x/` from `dist/x/index.html` |
| Duplicate-content risk | low while canonicals are consistent, but only a live crawl can confirm |

Documented command for the owner: `curl -sI https://nextgentoolkit.pages.dev/about` and inspect the status/`location`.

## 4. Google Search Console sitemap error

The phase-1 diagnostic noted that URL Inspection succeeded while the Sitemaps report showed a fetch error. **No GSC access exists in this environment**, so this cannot be diagnosed directly. What can be stated from the repository:

| Possible cause | Evidence for | Evidence against | How to confirm |
|---|---|---|---|
| Host/property mismatch (`sc-domain:` vs URL-prefix) | Canonical host is `nextgentoolkit.pages.dev` | Nothing in repo contradicts it | GSC → property type; submit the sitemap under the matching property |
| Googlebot fetch blocked | `robots.txt` allows everything and points at one sitemap | — | GSC → robots.txt report; `site:` check |
| Sitemap served with the wrong content type | `_headers` sets `application/xml; charset=utf-8` | Header only applies on Cloudflare | `curl -sI .../sitemap.xml` |
| Redirect hop on `/sitemap.xml` | No `_redirects` file in the repo | — | `curl -sIL` and count hops |
| Stale cached error | GSC error text can lag after a fix | — | Remove and re-submit; wait |
| Invalid XML after deploy | Local XML parses and is asserted by the build | Only the *deployed* copy matters | Fetch the live sitemap and run it through a validator |

**Honest conclusion:** the cause is **not established**. It cannot be called "indexing delay" and it cannot be called "fixed". The decisive evidence (the exact error string and the fetched-URL list) lives in the owner's Search Console.

## 5. Metadata and structured data

- Titles are unique and keyword-first; descriptions are unique per route and asserted at build time.
- The retired sitelinks-searchbox markup is gone; HowTo and FAQPage remain as vocabulary only (Google removed those rich results in Sep 2023 and May 2026 respectively).
- Trust pages carry `WebPage` + `BreadcrumbList` with real dates.
- No `AggregateRating`, no `Review`, no invented author credentials.

## 6. Privacy and trust review — against the actual implementation

| Statement on the site | Reality | Verdict |
|---|---|---|
| "Core tools process files in your browser" | 24 live tools run local engines | accurate |
| "Nothing is uploaded" | no `fetch` in any live engine path | accurate for files; **analytics still transmits page-level data** |
| GTM disclosure | privacy page names Google Tag Manager | accurate |
| "No consent banner" | true — and that is a **legal exposure**, not a feature | flagged P0 |
| Contact channel | removed pending owner approval | **fixed this phase** |
| "GDPR compliant" style claims | none published | good |

**Blocking items before any privacy claim is strengthened:** a consent mechanism (or removal of GTM), and an owner-approved contact route.

## 7. Content opportunities (evidence-ranked)

| Opportunity | Why it can work | Evidence | Effort |
|---|---|---|---|
| Verified portal size reference | Nobody in the observed competitor set publishes it | Competitor review §4; portal protocol | 3–4 d research |
| Original compression benchmark ("we measured 40 PDFs") | Citable, reproducible, unduplicable without the work | GEO literature: statistics and citations raise AI-answer inclusion | 3 d |
| Honest comparison pages (incl. where competitors win) | Comparative intent is unserved | Sejda/PDF24 already do local processing — saying so builds trust | 2 d |
| Troubleshooting "my upload was rejected" | Matches the urgent intent exactly | Scenario analysis | 2 d |
| Thin keyword variants | Would add crawlable pages without value | — | **Rejected** |
