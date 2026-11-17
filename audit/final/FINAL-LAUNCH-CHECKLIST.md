# Launch Checklist

Written 2026-11-16 for the Cloudflare Pages production host
`https://nextgentoolkit.pages.dev/`. Owner-only actions are marked **[owner]**;
they were deliberately not performed by the agent (no production deploy, no DNS,
no account changes).

## 1. Before merging

- [x] `npm ci` → 244 packages, exit 0
- [x] `npm run lint` → clean
- [x] `npm test` → 61 unit/integration tests
- [x] `npm run build` → 37 indexable URLs, manifest, 5 icons, OG PNG
- [x] Browser suite green on Chromium (GitHub Actions)
- [x] axe-core scan: zero critical/serious violations
- [x] Firefox and WebKit suites green
- [ ] Read the accessibility report once with a human eye (`audit/a11y/report.json` artifact)

## 2. Merge and deploy

- [ ] **[owner]** Merge the pull request into `main` (squash or merge, either is fine —
      CI runs on both the branch and the PR).
- [ ] **[owner]** Cloudflare Pages builds `main` and publishes to production.
- [ ] **[owner]** Confirm the deployment log shows `Browser, accessibility and
      cross-browser checks` green for the merged commit.

## 3. Verify production (5 minutes, exact commands)

```bash
# 1. Pages render and the canonical is correct
curl -s https://nextgentoolkit.pages.dev/ | grep -o '<link rel="canonical" href="[^"]*"'

# 2. Preview deployments are noindexed, production is not
curl -sI https://nextgentoolkit.pages.dev/ | grep -i x-robots-tag          # expect nothing
curl -sI https://<branch>.nextgentoolkit.pages.dev/ | grep -i x-robots-tag # expect: noindex

# 3. Discovery files
curl -s https://nextgentoolkit.pages.dev/robots.txt | head -5
curl -s https://nextgentoolkit.pages.dev/sitemap.xml | grep -c '<loc>'     # expect 37
curl -sI https://nextgentoolkit.pages.dev/manifest.webmanifest             # expect 200 + application/manifest+json

# 4. Security headers
curl -sI https://nextgentoolkit.pages.dev/ | grep -Ei 'strict-transport|referrer-policy|permissions-policy|x-content-type'
```

- [ ] All five checks pass. If the preview header is missing, the `_headers`
      placeholder rule did not match the alias shape — re-read
      `public/_headers` and Cloudflare's host-placeholder documentation before
      changing anything else.

## 4. Search Console

- [ ] **[owner]** Add the production property (DNS or HTML-tag verification).
- [ ] Submit `https://nextgentoolkit.pages.dev/sitemap.xml`.
- [ ] Request indexing for the home page and the three flagship tools
      (`compress-image-to-kb`, `compress-pdf`, `pdf-to-image`).
- [ ] Re-check in 7 days: coverage (any excluded URLs?), Core Web Vitals, and
      which queries actually appear. Do not publish any ranking claim before this.

## 5. Post-launch monitoring (first week)

- [ ] Cloudflare Analytics: 5xx rate, top paths, country mix.
- [ ] Check the browser console on production once per browser (Chrome, Safari,
      Firefox) — the suite runs against a local build, not the CDN.
- [ ] Watch for the known GTM consent gap (accepted risk, D2): confirm no
      unexpected vendor requests appear in the network panel.
- [ ] `image-to-text-ocr` must stay `noindex` until the OCR acceptance criteria
      are met — verify it is absent from `sitemap.xml`.

## 6. Rollback

Cloudflare Pages keeps every deployment. If a regression ships:
**[owner]** → Pages → Deployments → select the previous successful deployment →
"Rollback". Static assets are immutable and the HTML is revalidated on every
request, so a rollback takes effect immediately; no cache purge is required for
HTML. Then revert the offending commit on `main` so the next build matches what
is live.

## 7. What is intentionally not launching

| Item | Why |
|---|---|
| OCR tool in the index | Workflow not proven on low-end Android / offline; stays a noindex preview |
| Portal preset library | No portal specification has been verified against an official document yet |
| Accounts, billing, team seats | No payment integration exists; nothing is promised on the site |
| Contact email | Owner has not approved a public address (`PUBLIC_CONTACT = null`) |
| Consent management platform | Owner decision D2 — GTM ships as-is, documented as accepted risk |
| Service worker / offline install | Manifest is installable, but there is no offline cache yet; claiming offline would be false |
