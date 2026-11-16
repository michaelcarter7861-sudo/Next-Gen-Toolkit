# Final Portal Requirements Database

Retrieved: 2026-11-16. **Status: 0 of the ≥5 requested application-specific official specs
could be verified in this run.** The requirement below is the one that could be sourced to a
public body's own site; the rest are marked *unverified* with the reason. No number on this
page was inferred from a blog, a coaching site or a memory of a form.

## Verified

| Body | Document | Requirement | Source | Retrieved |
|---|---|---|---|---|
| NTS (National Testing Service, Pakistan) | Test registration flow (NAT/GAT/TOEIC products) | The public home page lists test products and registration entry points but does **not** publish a single site-wide photo or signature dimension/size specification; per-project instructions govern | https://www.nts.org.pk/ | 2026-11-16 |

That is the honest state of the database. It is still useful: it establishes that a
"one size fits all portals" preset list would be fabricated, which is why the product ships
**generic, user-controlled ceilings** rather than pretending to know each portal's rule.

## Unverified — do not use as product copy

| Body / application | Commonly claimed rule | Why it is not in the verified table |
|---|---|---|
| FPSC (Federal Public Service Commission, Pakistan) | Photo and signature size/dimension rules | Official advertisement PDFs were not retrievable within the egress policy this run; no page-number citation obtained |
| PPSC (Punjab Public Service Commission) | Photo ≤ some KB, signature ≤ some KB | Same — not retrieved |
| NTS per-project advertisements | Photo/signature boxes on the application form | Only the site landing page was reachable |
| IBPS / SSC (India) | Photo 20–50 KB, signature 10–20 KB, specific pixel boxes | Not retrieved this run |
| BPSC / Bangladesh government e-forms | Photo and signature ceilings | Not retrieved this run |
| UPSC online application | Photo/signature JPEG with pixel bounds | Not retrieved this run |

Every "commonly claimed" cell above is deliberately left without numbers. Publishing a
remembered threshold as if it were the portal's rule is exactly the failure mode this project
has banned.

## Verification procedure (repeatable, cheap)

1. Open the official body's domain only — never an aggregator or a coaching site.
2. Find the advertisement or instruction PDF for the specific recruitment cycle and record:
   issuing body, advertisement number, page number, exact wording, retrieval date.
3. Screenshot the page; store under `audit/portal-evidence/<body>-<year>-p<N>.png`.
4. Only then may a preset be added to `src/data/` — and it must carry the citation in a code
   comment plus a "source" line in the UI.

## Product consequence (already implemented)

Because no portal rule is verified, the tools expose a free-text ceiling input (KB) and a
resolution control, default to no cropping, and never auto-crop a face. The presets that do
exist are *structural* (e.g. "ID photo 35×45 mm at 300 DPI" is a geometry conversion, not a
claim about any portal). This is the only defensible design until the table above has rows.
