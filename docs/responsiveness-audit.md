# Responsiveness Audit

A static read of the codebase identifying where the JT Dashboard's layout will degrade across viewport sizes. No live testing was performed — all findings are grounded in source references. Use this document as a punch list for fixes or as input to a follow-up Playwright / DevTools test pass.

## Scope & assumptions

- **In scope**: desktop (1280–1920), smaller laptop (1024–1280), tablet (768–1024).
- **Out of scope**: mobile (<768) — heavy d3 SVG visualizations are unlikely to be salvageable at that size without dedicated layouts; print.
- **Assumed audience**: existing site, viewed in modern Chrome/Safari, fullscreen-capable.
- **Design philosophy in code today**: a single fixed desktop layout. There are only **3 media queries** in the entire codebase and **zero Tailwind responsive prefixes** (`sm:`, `md:`, `lg:`, `xl:`). Adding responsive classes is the cheapest path forward.

---

## Per-view findings (worst-first)

### 1. Flow — highest risk

The right-side control panel and the legend gutter both consume fixed widths that don't shrink. The Sankey SVG to the left is forced into whatever's left over.

- [src/lib/Flow/components/InterviewFlow.svelte:690](src/lib/Flow/components/InterviewFlow.svelte#L690) — `<div class="control-panel flex w-[28rem] ...">` (448px). Never shrinks.
- [src/lib/Flow/components/InterviewFlow.svelte:600](src/lib/Flow/components/InterviewFlow.svelte#L600) — outer container `flex gap-[20pt]` plus `padding: 0pt 20pt 10pt` ([:727](src/lib/Flow/components/InterviewFlow.svelte#L727)). `pt` units don't scale.
- [src/lib/Flow/components/Combinations.svelte:185](src/lib/Flow/components/Combinations.svelte#L185) — combinations list uses `pr-46` (~11.5rem) for the legend gutter. Combined with the 28rem panel, this eats >40% of width on a 1280-wide viewport.
- [src/lib/Flow/components/sections/SectionHeader.svelte:202–207](src/lib/Flow/components/sections/SectionHeader.svelte#L202-L207) — fixed `height: 4.5rem` + JS-driven font shrink already in place; this is the one place that adapts to text length, but it does not adapt to viewport.
- [src/lib/Flow/components/Block.svelte:187](src/lib/Flow/components/Block.svelte#L187) — block tooltip `max-w-[18rem]` positioned `left-[100%]`. Will overflow the right edge whenever a block is on the right half of a narrow viewport.

**Predicted breakage**: at 1280 the Sankey gets cramped; at 1024 the columns inside Sankey collide; at 768 the right panel alone is 58% of viewport width and content is unusable.

### 2. MentalModel

A hard-coded 60/40 horizontal split with a square fixed-pixel SVG.

- [src/lib/MentalModel/MentalModel.svelte:169–199](src/lib/MentalModel/MentalModel.svelte#L169-L199) — outer `flex gap-6` with children `w-[60%]` (left, the MM viz) and `w-[40%]` (right, the code tooltip sidebar). No wrap, no breakpoint.
- [src/lib/MentalModel/PastExhibitionMMs.svelte:29](src/lib/MentalModel/PastExhibitionMMs.svelte#L29) — fixed `w-[45rem] h-[45rem]` (720×720px) per-participant SVG. At 1024 this overflows; at 768 it's wider than the viewport.
- ResizeObserver at [MentalModel.svelte:119](src/lib/MentalModel/MentalModel.svelte#L119) only tracks the tooltip element height for vertical clamping — it does not influence the 60/40 horizontal split.

**Predicted breakage**: at 1024 the 40% sidebar (~410px) is too narrow for the code tooltip's intended layout and may horizontally clip code labels; at 768 the past-exhibition view forces horizontal scroll.

### 3. Linking

Layout is mostly flex-based and adapts better than Flow/MentalModel, but several fixed minimums force horizontal scroll on tablet.

- [src/lib/Linking/ScenarioOverview.svelte:48](src/lib/Linking/ScenarioOverview.svelte#L48) — scenario buttons `w-[9rem] min-h-[4rem]`. At ~6 buttons that's ~54rem (864px) just for the row.
- [src/lib/Linking/ScenarioOverview.svelte:77](src/lib/Linking/ScenarioOverview.svelte#L77) — scenario content `min-w-[18rem]`.
- [src/lib/Linking/ScenarioCodes.svelte:50](src/lib/Linking/ScenarioCodes.svelte#L50) — info panel absolutely positioned `right-4 top-0.5`; OK structurally but its expanded panel uses fixed text widths.

**Predicted breakage**: scenario button row wraps unintentionally on small laptop; on tablet the row no longer fits a single line cleanly.

### 4. Sunburst

Gallery layout is the most adaptive of the visualization views, but the per-row count is implicit.

- [src/lib/Sunburst/Sunburst.svelte:114–120](src/lib/Sunburst/Sunburst.svelte#L114-L120) — scroll listener for the indicator only; no viewport adaptation.
- [src/lib/Sunburst/SunburstChart.svelte:752](src/lib/Sunburst/SunburstChart.svelte#L752) — chart tooltip `w-[22rem] max-h-[32rem]`.
- [src/lib/Sunburst/SunburstChart.svelte:808](src/lib/Sunburst/SunburstChart.svelte#L808) — has a `@media (max-width: 768px)` query (one of only three in the repo).
- [src/lib/Sunburst/Sunburst.svelte:525](src/lib/Sunburst/Sunburst.svelte#L525) — `@media (max-height: 800px)` reduces scroll-indicator opacity.

**Predicted breakage**: at 1024 the 2-per-row gallery becomes cramped but doesn't visibly break; tooltips can extend past viewport edges if the chart is near the right side.

### 5. Home — lowest risk

Already has a working tablet breakpoint and is the model to copy elsewhere.

- [src/lib/Home/Home.svelte:463](src/lib/Home/Home.svelte#L463) — `@media (max-width: 768px)` collapses the timeline grid from `[1fr 60px 1fr]` to a 2-col layout. This is the existing pattern to mirror in other views.

---

## Cross-cutting concerns

- **No vertical scroll fallback**: [src/App.svelte:217](src/App.svelte#L217) sets `<main class="w-screen h-screen overflow-hidden">`. When content can't fit, it's clipped, not scrolled. This makes every view's rigidity worse than it would otherwise be.
- **Fixed hero height**: [src/App.svelte:217](src/App.svelte#L217) `h-[60px]` plus title font `1.2rem` ([:367](src/App.svelte#L367)). Already small; less concern.
- **Typography in `pt`, not `rem`**: [src/app.css:255](src/app.css#L255) `body { font-size: 18pt; }` and [src/app.css:271–276](src/app.css#L271-L276) heading sizes 10–34pt. `pt` units are absolute and don't respond to viewport or root-font scaling. Recommend converting to `rem` (or `clamp()` for fluid type).
- **`pt`-based padding**: [src/lib/Flow/components/InterviewFlow.svelte:727](src/lib/Flow/components/InterviewFlow.svelte#L727) `padding: 0pt 20pt 10pt`. Same issue.
- **No Tailwind responsive prefixes anywhere**: a single grep for `\bmd:` / `\blg:` / `\bxl:` returns nothing in `src/`. This is the single biggest opportunity — Tailwind is already configured, the prefixes are free.
- **Tooltips with `left-[100%]` or fixed widths** in Flow/MM/Sunburst will overflow the viewport when their anchor is on the right side. Each needs a flip-to-left fallback or a `max-w` capped at remaining viewport.

---

## Per-viewport breakage matrix

| View | 1920 | 1440 | 1280 | 1024 | 768 |
|---|---|---|---|---|---|
| Home | OK | OK | OK | OK | OK (768 breakpoint kicks in) |
| Sunburst | OK | OK | OK | Cramped (gallery + tooltips overflow near edges) | Broken (per-chart layout assumes wider) |
| Linking | OK | OK | OK (button row tight) | Cramped (button row may wrap badly) | Broken (button row + content min-width exceeds viewport) |
| MentalModel | OK | OK | Cramped (40% sidebar ~410px) | Broken (sidebar too narrow; PastExhibitionMMs SVG overflows) | Broken (45rem SVG > viewport) |
| Flow | OK | OK (Sankey tight) | Cramped (Sankey squeezed; legend gutter eats width) | Broken (Sankey columns collide) | Broken (28rem panel = 58% of viewport) |

Legend: **OK** — designed for this size · **Cramped** — usable but visually crowded · **Broken** — content clipped, overlapping, or forces horizontal scroll.

---

## Prioritized fix list (top 5, high-impact / low-effort)

1. **Make Flow control panel responsive.**
   File: [src/lib/Flow/components/InterviewFlow.svelte:690](src/lib/Flow/components/InterviewFlow.svelte#L690).
   Replace `w-[28rem]` with `w-[20rem] xl:w-[28rem] lg:w-[22rem] md:w-[18rem]`. Also drop `padding: 0pt 20pt 10pt` ([:727](src/lib/Flow/components/InterviewFlow.svelte#L727)) for `padding: 0 1.25rem 0.625rem`.

2. **Make MentalModel split responsive.**
   File: [src/lib/MentalModel/MentalModel.svelte:170,199](src/lib/MentalModel/MentalModel.svelte#L170).
   Replace `w-[60%]` / `w-[40%]` with `w-full lg:w-[60%]` / `w-full lg:w-[40%]` plus `flex-col lg:flex-row` on the parent at [:169](src/lib/MentalModel/MentalModel.svelte#L169). Add `flex-wrap` so the SVG and sidebar stack on tablet.

3. **Cap PastExhibitionMMs SVG to viewport.**
   File: [src/lib/MentalModel/PastExhibitionMMs.svelte:29](src/lib/MentalModel/PastExhibitionMMs.svelte#L29).
   Replace `w-[45rem] h-[45rem]` with `w-full max-w-[45rem] aspect-square`.

4. **Allow vertical scroll fallback globally.**
   File: [src/App.svelte:217](src/App.svelte#L217).
   Replace `overflow-hidden` with `overflow-y-auto` (or `overflow-hidden lg:overflow-y-auto` if scroll on desktop is undesirable). Without this, every other fix is partially defeated.

5. **Convert typography from `pt` to `rem`.**
   File: [src/app.css:255,271–276](src/app.css#L255).
   Replace `body { font-size: 18pt }` with `body { font-size: 1rem }` (or `clamp(0.95rem, 0.9rem + 0.4vw, 1.15rem)` for fluid). Replace `h1: 34pt` etc. with rem equivalents (~2.25rem, 1.875rem, 1.5rem, 1.25rem, 1rem, 0.875rem). This unlocks the entire UA scaling chain.

Stretch (not in top 5 but worth noting):
- Linking scenario buttons → `w-32 md:w-36` instead of fixed `w-[9rem]`.
- Tooltips with `left-[100%]` (Flow Block, MM CodeTooltip) → add a flip-to-left fallback when near the right viewport edge.
- Adopt a project-wide convention: Home's `@media (max-width: 768px)` pattern, but using Tailwind `md:` / `lg:` prefixes instead of raw CSS.

---

## Suggested next steps

When you're ready to test (not just audit):

1. **Manual DevTools sweep** — open each view at 1920, 1440, 1280, 1024, 768 and compare against the matrix above. Note any cells where the prediction is wrong; that surfaces gaps in this audit.
2. **Playwright visual snapshots** — add `@playwright/test`, write a single spec that visits each route at the five widths, captures a full-page screenshot, and stores them under `tests/screenshots/`. Re-run after each fix to spot regressions.
3. **Pick one view to fix end-to-end first** — recommend Flow, since it is the worst offender and proving the responsive pattern there (28rem → responsive widths, `pt` → `rem`, tooltip flip) creates a template the other views can copy.
