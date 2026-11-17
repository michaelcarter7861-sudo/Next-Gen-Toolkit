# Design Implementation and QA

**Date:** 2026-11-16
**Honest constraint:** this environment has **no browser**, so no screenshots could be captured and **no visual claim is made about the rendered result**. What follows separates (a) changes made in code, (b) what can be verified statically, and (c) what still needs a human/browser pass.

## 1. Phase-1 design diagnosis (unchanged, still correct)

The interface reads as an AI-template SaaS site: purple→indigo gradient hero, oversized marketing H1, rounded cards everywhere, badge soup, and a font stack (`Plus Jakarta Sans` → `Inter`) that is never actually loaded.

## 2. What this phase changed in the code

| Change | Before | After | Why |
|---|---|---|---|
| Hero background | `bg-gradient-to-b from-[#F4F0FF] via-[#F8F7FC] to-[#F8F7FC]` (dark: three-stop indigo gradient) | flat `#F8F7FC` / `#131520` with a hairline border | removes the single most generic visual tell |
| Hero eyebrow | three claims: "Your Digital Toolkit · 25 Free Browser Utilities · Local Processing on Core Tools" | one factual line generated from the catalogue: "24 tools available now · 24 process files entirely on your device" | claims cannot drift from reality |
| Exact-size entry | buried one click deeper | three preset chips (20/50/100 KB) under the primary search, deep-linking `?kb=20` | the wedge job reachable from the first screen |
| Homepage stat | hard-coded "15 Automated Engine Suites Passing" | "Engine tests run in CI on every change" | the number was already wrong |
| Result panel | text rows of metrics | **ByteGauge**: original → target → result on a ruler, colour-coded by outcome, with `role="img"` and a text summary | makes correctness visible instead of asserted |
| Focus indicator | browser default, inconsistent | 2 px accent ring via `:focus-visible` in both themes | WCAG 2.2 visible focus |
| Reduced motion | none | global `prefers-reduced-motion` block | WCAG 2.3.3 |
| Native controls | light-only chrome in dark mode | `color-scheme` on `:root`/`html.dark` + meta tag | no light flashes |
| Command palette | no focus management | focus moves in, Tab is trapped, Escape closes, focus restored on close, body scroll locked | WCAG 2.4.3 / 2.1.2 |
| Touch targets | some 24–28 px icon buttons | close button and DPI buttons ≥ 44 px; text inputs `min-h-11` | WCAG 2.5.8 |

## 3. The byte gauge

Renders only measured values. It states the target, shows the achieved bytes against it, and colours the outcome: emerald = target met, amber = smaller but still over, rose = no reduction. The example in the phase-1 strategy document used invented sample numbers in the hero; that was **rejected** — the gauge appears only where real results exist.

## 4. Statically verifiable accessibility facts

| Check | Result | Method |
|---|---|---|
| Dark-mode hub H1 contrast | fixed (`dark:text-white` on `#171927`) | source |
| Live regions on async output | present on text, diff, processing notice and gauge | source |
| Modal ARIA | `role="dialog"`, `aria-modal="true"`, labelled, `aria-label` on the search field | source |
| Icon buttons labelled | verified on modal close, search, theme controls | source |
| Form labels | every select/input in the touched components has a `<label for>` or `aria-label` | source |
| Skip link | present | source |
| Reduced-motion respected | rule present | source |
| `color-scheme` | meta + CSS | build output |
| Trust pages usable without JS | 6 pages contain only a JSON-LD `<script>` | build output |

## 5. What still requires a real browser

1. Screenshot review at 320 / 375 / 430 / 768 / 1024 / 1440 / 1920 px (light + dark).
2. Whether the prerender→React swap causes visible layout shift on the homepage.
3. Real contrast measurement on gradient-free surfaces (static hex maths suggests compliance, but this was not measured with a tool).
4. Tab order across the full page and the mobile menu.
5. `toBlob` format fallback per browser (covered at runtime, not tested per engine).
6. Mobile file-picker behaviour (camera vs gallery).

## 6. Prepared browser suite

`scripts/e2e/run.mjs` (Playwright) covers: trust pages with and without JS, direct navigation to every route, refresh on nested routes, history navigation, image compression in three formats, MIME/extension consistency, already-under-target and impossible targets, PDF optimisation states, the preview tool, keyboard navigation, dark mode and console-error capture. It writes screenshots to `audit/screenshots/` when run.

```bash
npm run build
npx playwright install chromium   # requires network access to the Playwright CDN
node scripts/e2e/run.mjs          # BASE_URL and BROWSER env vars supported
```

## 7. Remaining UX gaps

| Gap | Impact | Priority |
|---|---|---|
| Tool pages are text-heavy above the drop zone | Users scroll before acting | P1 |
| Before/after image comparison absent | Competitor parity (TinyPNG slider) | P2 |
| No sticky mobile action bar | Primary action can be off-screen on small phones | P2 |
| Six colour tokens duplicated across components | Drift risk, slow redesigns | P2 |
| Font stack still not self-hosted | Extra network hope, generic look | P2 |
