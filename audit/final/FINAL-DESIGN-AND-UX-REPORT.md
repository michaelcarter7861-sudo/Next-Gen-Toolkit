# Final Design and UX Report

State of the shipped interface on branch `arena/8d148eee-next-gen-toolkit`, inspected in source
this run and exercised in a real browser by `scripts/e2e/run.mjs` (see
`FINAL-ENGINEERING-AND-TEST-REPORT.md` for the executed/passed split).

## The design system as implemented

| Layer | Implementation | Notes |
|---|---|---|
| Colour | CSS custom properties in `src/index.css`, single dark/light token set | No hard-coded hex in component styles for surfaces/text; accent used only for primary action and gauge |
| Type | System font stack, fluid `clamp()` headings | No webfont request — zero layout shift from font loading |
| Spacing | 4 px base scale via utility classes | Consistent card padding across tools |
| Surfaces | Card + panel + notice (info/warn/error) | Notices carry the honesty messaging (fallback, truncation, page cap) |
| Components | `ToolWorkspace`, `ByteGauge`, `CommandModal`, `ToolCard`, `TrustPageLayout` | `ByteGauge` is the ceiling tool's signature element |
| Motion | Transitions on hover/focus only, no entrance animation | Respects `prefers-reduced-motion` for the drop zone pulse |

## Strengths

- **The ceiling is visible before the download.** `ByteGauge` shows the target, the produced
  size and the reachable/unreachable verdict as one bar, so "did it work" is answered without
  opening a file manager.
- **Every tool shares one workspace.** Drop zone → controls → results → per-item download.
  Learning one tool teaches the other twenty-three.
- **Honest states are designed, not bolted on.** Four distinct PDF outcome messages, two
  distinct image messages (`conversionSkipped` vs `formatFallback`), and page-cap vs
  pixel-budget notices each have their own copy and tone.
- **Keyboard-complete.** Command palette is focus-trapped, closes on Escape, restores focus to
  the trigger; every control is reachable by tab; visible focus ring is never removed.

## Gaps found this run and fixed

| Gap | Fix |
|---|---|
| PDF→image inherited the split tool's `1-2` range, so a one-page PDF errored out of the box | rendering defaults to `all`; splitting keeps `1-2` |
| A deliberate no-conversion ("already under 20 KB") was reported as a browser codec failure | `conversionSkipped` state with its own sentence |
| Aggregate memory could blow up on a 200-page PDF even though each page was under the per-page cap | 120 MP per-document budget with the truncation reason shown |

## Gaps still open (design work, not bugs)

1. **No batch progress beyond a spinner.** A 200-page render shows a static message. Needs
   `x of n` plus cancel.
2. **No side-by-side before/after preview.** Users must download to judge quality. A slider
   preview for the image tools would remove the main reason people retry.
3. **Preset discovery.** The hero presets exist but the tool pages do not surface the three
   most likely follow-on jobs ("signature too big?", "PDF too large?", "need JPG?").
4. **Mobile ergonomics at 320 px.** Layout does not overflow (verified), but the download row
   wraps to two lines and the gauge label truncates.
5. **Empty state of the results list** is blank rather than explanatory.

## Accessibility (WCAG 2.2 AA) — honest position

- Semantic landmarks, one `h1` per page, labelled form controls, `aria-live="polite"` on the
  result summary: implemented.
- Automated scans: **0 run** (no axe-core in the toolchain). Manual screen-reader pass:
  **0 run**. So the claim is "built to the standard", not "certified against it".
- Target size (2.5.8): interactive targets are ≥ 44 px on touch layouts.
- Focus not obscured (2.4.11): sticky header accounted for with scroll-margin.
