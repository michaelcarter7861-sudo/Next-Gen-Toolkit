# SEO, AEO and GEO Strategy

**Date:** 2026-11-16 · **Site:** `https://nextgentoolkit.pages.dev` · **Indexable URLs after this release:** 36

No ranking, traffic, or visibility improvement is claimed anywhere in this document. Google's documented guidance and the current SERP feature set inform the decisions; only field data after deploy can confirm outcomes.

---

## 1. Technical SEO — state after the fixes

| Item | Before | Now | Verified by |
|---|---|---|---|
| Prerendered routes | 32 (incl. 2 fabricated tools) | 36 | `tsx scripts/verify-seo-build.ts` inside `npm run build` |
| Canonical tags | present | present, asserted per route | build-time assertion |
| Static H1 per route | present but generic | present, keyword-bearing, asserted | build-time assertion |
| Rendered H1 | `"Get more done. With less effort."` | `"Free PDF, image, text & developer tools that run in your browser."` | source |
| Preview routes | indexable | `noindex,follow` + excluded from sitemap | build-time assertion + workflow grep |
| Sitemap | 32 URLs, no trust pages | 36 URLs, counts derived from data | workflow |
| robots.txt | disagreed with `server.ts` and with reality | single sitemap reference, asserted | build-time assertion |
| `_headers` | dead sitemap aliases, no security headers | real routes only, nosniff/Referrer-Policy/Permissions-Policy/HSTS, immutable assets | build-time assertion |
| OG image | 298 kB PNG | 95 kB PNG, 1200×630 asserted | byte/pixel assertions |
| Trust pages | none | About, Contact, Privacy, Terms, Editorial policy, Changelog | 6 static files |
| 404 | existed | exists, noindex asserted | build-time assertion |
| Structured data | Organization, WebSite + retired SearchAction, Tool, FAQPage, HowTo, BreadcrumbList | SearchAction removed; others retained with honest content | source |
| `llms.txt` | wrong GTM id, no preview disclaimer | corrected + disclaimer | source |

**Still open (do not claim as done):** `*.pages.dev` preview indexation (needs a Cloudflare Transform Rule — `_headers` cannot match hostnames), trailing-slash consistency at the edge (308 behaviour is platform-side), and CLS caused by the prerender→React swap (mechanism confirmed, magnitude unmeasured).

---

## 2. Structured-data decisions with dates

| Markup | Decision | Why |
|---|---|---|
| `HowTo` | **Keep the vocabulary, expect no rich result** | Google removed HowTo rich results in **September 2023** |
| `FAQPage` | **Keep as machine-readable Q&A, expect no rich result** | Google removed FAQ rich results for all sites on **7 May 2026** |
| `SearchAction` (sitelinks searchbox) | **Removed** | Feature retired **29 November 2024** |
| `Organization` + `WebSite` | **Retained, now with `sameAs` (repo) and a real contact point** | Site-name eligibility and entity consolidation |
| `SoftwareApplication` / `WebApplication` per tool | Retained | Correct entity type for a web utility |
| `BreadcrumbList` | Retained on hubs, tools and trust pages | Genuinely useful navigation signal |
| `AggregateRating` / `Review` | **Never added** | No real reviews exist; inventing them is a policy violation |
| `Dataset` for benchmark tables | Planned (P2) | Original data deserves schema when it exists |

The honest framing for the site copy: schema is for **machines that read it** (AI crawlers, Bing, aggregators), not for a guaranteed SERP decoration.

---

## 3. Content architecture

```
/                                  transactional hub, exact-size wedge
/image-tools/compress-image-to-kb/ money page — exact-size promise
/pdf-tools/                        hub (5 live + 1 preview)
/text-tools/, /developer-tools/, /seo-tools/, /generator-tools/
/about/ /contact/ /privacy/ /terms/ /editorial-policy/ /changelog/   trust cluster
/sitemap/                          crawlable index of every route
```

**Gap:** no comparative or reference content. The two page types that would earn links and citations do not exist yet:

| Missing page type | Example | Why it matters |
|---|---|---|
| Reference tables | "Passport photo size and KB limit by country, with sources" | Link magnet; no incumbent owns it; directly serves P1 |
| Evidence pages | "We measured 40 PDFs: what actually compresses" | Citation bait for AI answers; establishes the honesty brand |
| Comparison pages | "TinyPNG alternative for exact KB limits" | Captures comparative intent honestly |

---

## 4. Intent → page mapping (no volume data available)

| Intent | Target page | Status |
|---|---|---|
| compress image to 20/50/100 KB | `/image-tools/compress-image-to-kb/` | ✅ live, presets present |
| compress pdf to 100/200 kb | `/pdf-tools/compress-pdf/` | ◐ page live, copy rewritten to match reality |
| signature under 20 kb | — | ❌ roadmap P1 |
| passport photo size | — | ❌ roadmap P1 |
| merge pdf / split pdf / images to pdf | hub + tool pages | ✅ |
| json formatter / fix invalid json | `/developer-tools/*` | ✅ |
| jwt decoder | ✅ | ✅ |
| what size photo for form | — | ❌ roadmap P1 |

---

## 5. AEO — being the answer

AI answer engines quote passages that contain **specific numbers, sourced claims and clear structure**. Applying the Princeton GEO findings (citations +27.5%, statistics +30.6%, quotations +40.9%; keyword stuffing neutral-to-negative — [geojacker.com](https://geojacker.com), [sunilpratapsingh.com](https://sunilpratapsingh.com)):

| Tactic | Implementation in this repo | Status |
|---|---|---|
| Put the answer in the first 2 lines | Each tool page opens with a direct answer paragraph | ✅ |
| Ship real numbers with method and date | "Measured on 2026-11-16: 12.6 KB → 15.5 KB; the original is returned if optimisation would grow the file" | ◐ one measurement in place, needs a dedicated table |
| Define terms explicitly | Spec tables per tool | ✅ |
| Avoid adjective-only claims | Copy pass on `compress-pdf`; privacy FAQ absolutes still to rewrite | ◐ |
| Machine-readable discovery | `llms.txt`, `llms-full.txt` corrected | ✅ (with the caveat that Google does not use `llms.txt`) |
| Unique data | none yet | ❌ P2 |

**Reality check:** `llms.txt` is not read by Google ([seohandbook.co.uk](https://seohandbook.co.uk)); its value is for other AI crawlers and human readers. Do not budget for it.

---

## 6. GEO — visibility in AI answers

| Finding | Implication | Action |
|---|---|---|
| Zero-click share measured at 68% overall and AI Mode reportedly ~93% (multiple 2026 industry analyses; [searchenginejournal.com](https://www.searchenginejournal.com)) | Clicks to utility pages will not grow the way they did in 2019 | Optimise for being *cited* and for direct URL sharing, not for pure blue links |
| ~94% of AI Overview citations come from pages already ranking in the top 10 | AI visibility follows classic ranking | Fix fundamentals first; no GEO shortcut |
| Whatever LLM referral traffic exists is ~1% of visits | Do not build a strategy on referral volume | Treat as bonus |
| Brand mentions correlate with AI inclusion | Build entity presence (repo, changelog, consistent `sameAs`, maintainer identity) | ✅ partial |

Practical GEO checklist for each money page: a one-sentence answer, a measurement table with a date, a stated limitation, and a citation to an authoritative source where a claim is external.

---

## 7. Trust and E-E-A-T

| Lever | Status |
|---|---|
| Named maintainer + contact address | ✅ `/about/`, `/contact/` |
| Editorial and verification policy | ✅ `/editorial-policy/` |
| Public changelog with dates | ✅ `/changelog/` |
| Public repository | ✅ linked from About, Organization `sameAs` |
| Real reviews | ❌ none — and none were invented |
| Third-party validation | ❌ none yet (roadmap: open-source a benchmark dataset and invite replication) |
| Consent/analytics honesty | ◐ privacy page discloses GTM; a consent mechanism is still missing |

Author-level experience signals matter: search-quality guidance rewards demonstrable first-hand testing. The one asset this project can build that competitors cannot fake is **a public, reproducible measurement corpus**.

---

## 8. Measurement plan (after deploy)

| Week | Action | Tool |
|---|---|---|
| 1 | Verify 36 URLs in GSC; submit sitemap; inspect 5 money pages | Search Console |
| 1 | Confirm no preview route is indexed (`site:` check) | manual |
| 2 | Baseline Core Web Vitals (field) | GSC → CWV |
| 2–4 | Record query set in positions 8–20; pick 10 for content work | GSC |
| 4 | Log which AI engines cite the site for 20 prompts | manual, monthly |
| 6 | Compare download-completion events before/after | GA4 |

**No ranking commitment is made. The only promised outcome is that every page tells the truth about what it does.**
