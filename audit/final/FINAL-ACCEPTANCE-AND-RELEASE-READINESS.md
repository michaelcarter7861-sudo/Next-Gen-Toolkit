# Final Acceptance and Release Readiness

Scored against the mission's own gates, on the evidence in this folder. "Not met" rows are
release blockers only where marked.

| # | Gate | Status | Evidence |
|---|---|---|---|
| 1 | Build reproduces from `npm ci` | **Met** | 244 packages, exit 0; `npm run build` green |
| 2 | Type safety | **Met** | `tsc --noEmit` clean |
| 3 | Unit/integration suite | **Met** | 61/61 |
| 4 | Browser suite executes and passes | **Met** | 42/42 Chromium, 42/42 WebKit, 41/41 Firefox (run on `1887292`) |
| 5 | Real PDF workflow end to end in a browser | **Met** | default all-pages render, impossible-range message, optimisation outcomes, cancellation between pages |
| 6 | Exact-size image ceiling with verification | **Met** | gauge parsed, download filename and byte count checked against the ceiling |
| 7 | No fabricated content in the UI | **Met** | OCR preview quarantined; fake invoice strings banned by guard test |
| 8 | Error states reachable and visible | **Met (after fix)** | engine errors were swallowed; now surfaced |
| 9 | Mobile layout at 320–430 px | **Met** | no horizontal overflow at 320/375/430/768/1024/1440/1920; ergonomics gaps listed in the design report |
| 10 | Dark/light parity | **Met** | theme applies, persists across reload |
| 11 | Keyboard operability | **Met (core paths)** | palette focus trap + Escape verified, visible focus rings, no focusable control without a name; a full manual tab-order audit is still listed as owed |
| 12 | WCAG 2.2 AA | **Automated baseline met; manual pass owed** | axe-core: 0 violations across 14 page families in light and dark. This is an automated baseline, not conformance — no screen-reader session has been run, so the site does not claim certification |
| 13 | Privacy claims bounded by reality | **Met** | no "100 % private", no GDPR/CCPA claim; GTM consent gap accepted by owner (D2) |
| 14 | Owner contact details not published | **Met** | `PUBLIC_CONTACT = null`, guard test bans the address and phone |
| 15 | SEO output verified | **Met** | 37 indexable, preview route noindex, sitemap, robots, `_headers` |
| 16 | Cloudflare preview `noindex` on a live preview deployment | **Rule shipped, live verification owed** | the host-scoped rule is generated and unit-checked by `verify-seo-build`; the `curl` check is in `FINAL-LAUNCH-CHECKLIST.md` because this sandbox cannot reach a preview deployment |
| 17 | OCR workflow acceptable end to end | **Not met → feature stays quarantined** | not proven on low-end Android or offline; correctly excluded from the sitemap |
| 18 | ≥30 public feedback items with URLs | **Not met** | sources unreachable; recorded as unavailable rather than invented |
| 19 | ≥5 verified portal specs | **Not met** | 1 partial (NTS landing page); rest marked unverified |
| 20 | Competitor pricing verified | **Met (9 vendors)** | others explicitly listed as not verified |

## Verdict

**Ready for a controlled release of the shipped tool set** (all four CI jobs green:
Chromium, Firefox, WebKit and axe-core) — PDF, image and text tools as they
exist today — with the quarantined OCR preview left out of the index. **Not ready** to claim
accessibility conformance, not ready to publish portal presets, and not ready to enable OCR.

## Release checklist (in order)

1. Merge to `main` only after CI on `main` is green (this run does not touch `main`).
   Follow `FINAL-LAUNCH-CHECKLIST.md` in order.
2. Deploy via Cloudflare Pages; confirm the preview `X-Robots-Tag: noindex` on a real preview
   URL with `curl -sI`.
3. Verify production `robots.txt`, `sitemap.xml` and one sample canonical resolve.
4. Add a manual screen-reader pass before claiming AA anywhere; the automated
   axe baseline is green but that is not certification.
5. Keep `image-to-text-ocr` out of the sitemap until the OCR acceptance test exists.
6. Verify the preview `noindex` header and the sitemap count on production (checklist §3).
