# Portal Requirements Reference (research protocol + verified status)

**Date:** 2026-11-16
**Status: no portal-specific numeric requirement is published in this document, because none could be verified today.** Publishing an unverified photo size, signature KB limit or dimension rule would be exactly the failure mode this project exists to avoid.

## 1. What was attempted

| Source | Result | Evidence |
|---|---|---|
| `https://www.nts.org.pk/` (National Testing Service, Pakistan) | Home page retrieved. It advertises test products (NAT, GAT, TOEIC) and tells candidates to check the site for updates, but **publishes no photo/signature size specification on the home page**. Requirements appear in individual project advertisements, which were not enumerated in this run. | OBSERVED ON OFFICIAL EXTERNAL SOURCE, 2026-11-16 |
| FPSC / PPSC / UPSC / SSC / BPSC portals | Not retrieved in this run | UNVERIFIED |
| Third-party "passport photo size" aggregators | Deliberately **not used** | Not authoritative; they are the reason wrong specs circulate |

## 2. Rules for this document

1. A row may only be added when an **official** page states the rule, with the URL and the date it was read.
2. One portal ≠ one country. Requirements differ per exam, per year and per document type.
3. If a portal changes or removes a rule, the row is marked stale rather than deleted — history matters.
4. If a requirement is ambiguous ("photo should be clear"), record the ambiguity. Do not translate it into pixels.
5. Any derived preset in the product must cite the row it came from.

## 3. Table schema (empty until verified)

| Portal | Country | Document | Max size | Min–max dimensions | Aspect ratio | Formats | Other rules | Source URL | Checked | Still active? |
|---|---|---|---|---|---|---|---|---|---|---|
| _none verified yet_ | | | | | | | | | | |

## 4. Research plan (ordered by expected value)

| Step | Action | Output |
|---|---|---|
| 1 | Collect the 10 most-cited application portals in PK/IN/BD from public exam-advertisement pages (not blogs) | Candidate URL list |
| 2 | For each, open the current advertisement/instruction PDF and extract the photo and signature clauses verbatim | Quoted requirement + page number |
| 3 | Archive the source (URL + retrieval date + quoted text) | Auditable row |
| 4 | Cross-check against the three most common third-party claims; record disagreements | Accuracy signal |
| 5 | Convert only unambiguous rules into product presets, with the source shown next to the preset | Feature with provenance |
| 6 | Re-verify every row quarterly; mark stale rows instead of deleting | Maintenance log |

## 5. Why this is worth doing

- No observed competitor publishes per-portal requirements (see `EXPANDED-COMPETITOR-INTELLIGENCE.md`).
- It converts a generic "compress to 20 KB" page into a page that answers a specific, urgent question.
- It is the only content asset that is simultaneously useful, citable and hard to copy without doing the same tedious verification work.

## 6. Honest limitation

This is currently **a protocol, not a dataset**. Until step 2 is completed for at least five portals, the product must not advertise "verified portal presets" anywhere — including the marketing copy.
