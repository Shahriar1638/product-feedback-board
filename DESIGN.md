# DESIGN.md — Product Feedback Board: Visual & Motion System

Companion to `SPEC.md` / `TASKS.md`. This document is the single source of truth for how the board *looks* and *moves*. Every value below is intentional — follow it exactly rather than substituting "similar" defaults. Where a decision is left open, it says so explicitly.

---

## 0. Direction

**Concept: "The Dispatch Board."** Feedback isn't a list of rows in a table — it's signal coming in from the field, logged onto a board the way a newsroom or an air-traffic desk logs incoming reports: physical index cards pinned to a dark instrument panel, vote counts that behave like a mechanical tally counter, category tags that read like routing codes. This gives every generic list-of-cards requirement a reason to look the way it looks, instead of a default SaaS-dashboard treatment.

This deliberately avoids the two most common AI-generated defaults: a cream background with a terracotta accent, and a near-black background with a single neon accent. Instead: a dark ink panel with **warm paper-toned cards** pinned on top of it, and **two** accent colors doing two different jobs (amber = attention/priority, teal = positive signal/votes) rather than one accent doing everything.

**Signature element:** the vote counter is a **split-flap tally** — when the count changes, the digits physically flip like an old departure board, not a generic count-up. This is the one bold, memorable move. Everything else on the page — spacing, type, motion — stays quiet and disciplined so that move lands.

---

## 1. Design Tokens

### 1.1 Color

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#10141C` | App background — deep ink-navy, never pure black |
| `--ink-raised` | `#171C26` | Elevated dark surfaces (header, filter bar) |
| `--paper` | `#F5F1E6` | Card surface — warm bone paper, the "index card" |
| `--graphite` | `#22242B` | Primary text on paper |
| `--fog` | `#8B93A7` | Secondary/muted text on ink; placeholder text on paper |
| `--signal-amber` | `#E8A33D` | Priority/attention accent (High priority, warnings, focus ring on primary actions) |
| `--current-teal` | `#3FC1B0` | Vote/trending accent (upvotes, positive state, "Trending" sort active) |
| `--alert-rust` | `#C25A45` | Errors, downvote state, destructive actions only |

Do not introduce a ninth color. Category badges (Bug/Feature/Improvement) reuse `--alert-rust`, `--current-teal`, `--signal-amber` respectively at 14% opacity fills with full-opacity text — categories borrow the vote/priority palette rather than getting their own set, which keeps the whole board legible as one system.

### 1.2 Typography

Three roles, three typefaces — never substitute Inter/system-ui as a silent default:

- **Display** (`--font-display`): `"Space Grotesk"`, weights 500/600/700 — headings, the board title, empty-state headlines. Geometric and slightly technical, sets the "instrument panel" tone.
- **Body** (`--font-body`): `"General Sans"`, weights 400/500 — descriptions, form labels, body copy. Warm and readable against the paper cards.
- **Mono** (`--font-mono`): `"IBM Plex Mono"`, weights 400/500 — vote counts, timestamps, category codes, the "ID" feel. This is what makes the dispatch-board metaphor read as intentional rather than decorative.

Type scale (rem, 16px base):

| Role | Size | Line-height | Weight | Font |
|---|---|---|---|---|
| Board title (h1) | 2.5 | 1.1 | 700 | Display |
| Section heading (h2) | 1.5 | 1.2 | 600 | Display |
| Card title | 1.125 | 1.3 | 600 | Display |
| Body | 0.9375 | 1.55 | 400 | Body |
| Label / eyebrow | 0.75, uppercase, tracking 0.08em | 1.2 | 500 | Mono |
| Vote count | 1.25 | 1 | 500 | Mono |
| Timestamp / meta | 0.75 | 1.2 | 400 | Mono |

### 1.3 Spacing, Radius, Elevation

- Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64` (px) — no arbitrary values outside this scale.
- Radius: cards `12px`, buttons/inputs `8px`, badges/pills `999px` (full), modal `16px`. Nothing is `0` (rejects the harsh broadsheet look) and nothing exceeds `16px` (rejects generic bubbly-SaaS look).
- Elevation is warm, not neutral-gray — shadows are tinted from `--ink`, not `#000`:
  - Card resting: `0 1px 2px rgba(16,20,28,0.35), 0 1px 1px rgba(16,20,28,0.2)`
  - Card hover/raised: `0 12px 24px -8px rgba(16,20,28,0.5), 0 4px 8px -4px rgba(16,20,28,0.3)`
  - Modal: `0 24px 48px -12px rgba(16,20,28,0.6)`

### 1.4 Motion Tokens (define once, reuse everywhere)

```css
:root {
  --ease-standard: cubic-bezier(0.22, 1, 0.36, 1);   /* smooth decel — most entrances */
  --ease-emphasis:  cubic-bezier(0.16, 1, 0.3, 1);    /* stronger decel — modals, hero */
  --ease-inout:     cubic-bezier(0.65, 0, 0.35, 1);   /* symmetric — toggles, flips */

  --dur-micro: 120ms;      /* hover, press */
  --dur-standard: 260ms;   /* enter/exit of components */
  --dur-deliberate: 480ms; /* page-load choreography, modal */
}
```

Only these three eases and three durations are used anywhere in the app. If a component seems to need a fourth value, that's a signal to reuse one of these instead, not add one.

---

## 2. Layout Concept

```
┌──────────────────────────────────────────────────────────┐
│  DISPATCH BOARD           [+ New Feedback]                │  ← --ink-raised header, pins on scroll
├──────────────────────────────────────────────────────────┤
│  [ search…      ] [Category ▾] [Priority ▾] [Sort: ▾]     │  ← filter bar, compacts on scroll
├──────────────────────────────────────────────────────────┤
│                                                             │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│   │ paper card │  │ paper card │  │ paper card │           │  ← 3-col grid desktop
│   │  BUG · Hi  │  │ FEAT · Med │  │ IMPR · Low │           │     2-col tablet, 1-col mobile
│   │  title...  │  │  title...  │  │  title...  │           │     cards float on --ink
│   │  ▲ 042 ▼   │  │  ▲ 018 ▼   │  │  ▲ 003 ▼   │           │
│   └────────────┘  └────────────┘  └────────────┘          │
│                                                             │
└──────────────────────────────────────────────────────────┘
```

The dark `--ink` background is the "board"; paper cards are pinned to it with a visible shadow so they read as physically resting on top, not just a color-swapped card. This single relationship (dark panel + paper cards) is what carries the whole metaphor — don't dilute it with a light-mode toggle or a third surface color.

---

## 3. Component Specs

### 3.1 Header — `src/components/feedback/` (new `BoardHeader.tsx`) or `app/page.tsx`

- Background `--ink-raised`, height 72px, sticky top.
- Title in Mono, uppercase, tracking 0.1em, small (0.875rem), reading "DISPATCH BOARD" — this is a label, not the h1; keep the actual page `<h1>` visually secondary but semantically primary for a11y.
- Primary "New Feedback" button: `--signal-amber` fill, `--graphite` text, radius 8px.

### 3.2 Filter Bar — `src/components/feedback/FeedbackFilters.tsx`

- Sits directly under header, `--ink-raised`, 1px bottom border `rgba(245,241,230,0.08)`.
- Search input: Mono placeholder text, left-aligned icon, full-width on mobile.
- Category / Priority / Sort: custom `<Select>` (not native `<select>` chrome) — paper-colored dropdown panel on open, matching card surface so the metaphor holds (filters "pull a card" to configure the board).
- **Scroll behavior (GSAP):** past 80px scroll, bar height animates 72px → 52px, search input font-size 0.9375rem → 0.8125rem, filter labels collapse to icon-only. See §4.2.

### 3.3 Feedback Card — `src/components/feedback/FeedbackCard.tsx`

- `--paper` background, `--graphite` text, 12px radius, 20px padding.
- Top row: category badge (pill, tinted per §1.1) + priority indicator — priority is a set of 1/2/3 filled dots in `--signal-amber`, not a text label, echoing a signal-strength meter.
- Title: Display 1.125rem/600.
- Description: Body, clamped to 3 lines with ellipsis, "See more" link opens a centered modal with the full content.
- Footer row: `VoteButtons` (left) + relative timestamp in Mono, right-aligned, e.g. `2h ago`.
- Delete trigger: a small icon button, top-right corner, opacity 0 at rest → 1 on card hover/focus (desktop only; always visible on touch).

### 3.4 Vote Buttons — `src/components/feedback/VoteButtons.tsx` (the signature element)

- Structure: `[▲ counter] [▼ counter]`, horizontal, Mono digits — upvote and downvote counts are displayed separately rather than as a single net number.
- Upvote count renders in `--current-teal`, downvote count in `--alert-rust`.
- Each counter renders as individual digit cells, each with a static background `rgba(16,20,28,0.06)` on paper, radius 4px, 2px gap between cells.
- Active vote state (the button matching the user's current vote) gets a filled background in its accent color; the other stays outlined.

### 3.5 Feedback Form — `src/components/feedback/FeedbackForm.tsx`

- Rendered inside a right-side slide-over panel (not a full modal) on desktop ≥1024px, full-screen sheet on mobile — a form this short doesn't need to eclipse the whole board, and a slide-over keeps the dispatch-board visible as context.
- Field labels: Mono, uppercase, small, `--fog` on the panel's own `--ink-raised` background (the form panel uses the dark surface, not paper — it's "writing a new entry," not "reading a filed one").
- Category/Priority as segmented control (3 buttons in a row), not a dropdown — fewer options, faster to scan, more tactile.
- Submit button: `--current-teal` fill (this is the one place teal is used as a fill rather than an accent, marking it as the "positive/forward" action of the whole app).

### 3.6 Delete Confirmation — `src/components/feedback/DeleteConfirmModal.tsx`

- Centered modal, `--ink-raised` surface (not paper — this is a system action, not a card), `--alert-rust` accent on the confirm button only.
- Copy: "Remove this entry from the board?" — stays in the dispatch-board voice, not a generic "Are you sure?".

### 3.7 Toast / Notifications

- Bottom-right on desktop, bottom-center on mobile. `--ink-raised` surface, left border 3px in status color (teal success / rust error / amber rate-limit).
- Used for: vote rollback ("Vote didn't go through — try again"), rate-limit ("Slow down — try again in a moment"), delete confirmation ("Entry removed").

### 3.8 Empty / Loading / Error States

- Empty grid: centered Mono label `NO SIGNAL` (large, `--fog`) + Body subtext "No feedback matches these filters." + a button to clear filters. Keep this playful line — it's the one place the metaphor gets to be a little fun.
- Loading: skeleton cards using `--paper` at 40% opacity with a slow shimmer (see §4.6) — never a spinner.
- Error (503 etc.): same empty-state layout, Mono label `OFF THE AIR`, subtext explaining the board couldn't load, retry button.

---

## 4. Motion System

**Division of labor** (don't blur this line — it keeps the codebase predictable):

- **GSAP** (`gsap` + `@gsap/react`'s `useGSAP` hook, `ScrollTrigger` plugin) owns: page-load choreography, scroll-driven behavior (filter bar compacting), and the vote flip-counter. These are timeline-based, DOM-level, and performance-critical.
- **Motion** (`motion/react`, formerly Framer Motion) owns: everything driven by React state/props — hover/press micro-interactions, modal and toast mount/unmount (`AnimatePresence`), grid re-ordering when filters/sort change (`layout` animations), and form validation feedback. These map naturally onto component render state.

Install:

```bash
npm i motion gsap @gsap/react
```

Global rule: **animate only `transform` and `opacity`**. Never animate `width`, `height`, `top`, `left`, or `box-shadow` directly — for the filter-bar compaction, animate a `scale`/`translateY` on inner content and cross-fade a pre-sized container instead of tweening `height`, and for elevation changes, cross-fade between two pre-rendered shadow layers rather than animating `box-shadow`.

### 4.1 Page Load (GSAP, `app/page.tsx` or a `BoardHeader`/`FeedbackGrid` wrapper)

```tsx
"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export function BoardLoadSequence({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "var(--ease-standard)" } });
    tl.from(".board-header", { opacity: 0, y: -12, duration: 0.4 })
      .from(".board-filters", { opacity: 0, y: -8, duration: 0.3 }, "-=0.15")
      .from(".feedback-card", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.04,
      }, "-=0.1");
  }, { scope });

  return <div ref={scope}>{children}</div>;
}
```

- Cap the stagger to the **first 12 cards**; beyond that, remaining cards render at full opacity immediately (`gsap.set`) so a large board doesn't feel slow to settle.
- `useGSAP` (not raw `useEffect`) — it scopes selectors and auto-cleans on unmount, which matters once filtering starts mounting/unmounting cards.

### 4.2 Scroll-Driven Filter Bar (GSAP + ScrollTrigger)

```tsx
useGSAP(() => {
  ScrollTrigger.create({
    start: "top+=80 top",
    onEnter: () => gsap.to(".board-filters", { "--bar-h": "52px", duration: 0.25, ease: "var(--ease-inout)" }),
    onLeaveBack: () => gsap.to(".board-filters", { "--bar-h": "72px", duration: 0.25, ease: "var(--ease-inout)" }),
  });
}, { scope });
```

- Use `toggleActions`/`onEnter`/`onLeaveBack`, not `scrub` — this is a discrete state change (compact vs. full), not something that should track the scrollbar 1:1.
- Add `markers: true` while building, remove before shipping.

### 4.3 Card Hover / Press (Motion, `FeedbackCard.tsx`)

```tsx
<motion.div
  className="feedback-card"
  whileHover={{ y: -4, scale: 1.01 }}
  whileTap={{ scale: 0.99 }}
  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
>
```

- Pair with the elevation cross-fade from §4 (two stacked shadow layers, hover layer fades to `opacity: 1`).

### 4.4 The Flip-Counter (GSAP — this is the signature element, `VoteButtons.tsx`)

On a vote-count change, each digit that differs from its previous value gets a 3D flip:

```tsx
useGSAP(() => {
  if (prevValue.current === value) return;
  const digits = gsap.utils.toArray<HTMLElement>(".vote-digit");
  gsap.timeline()
    .to(digits, {
      rotateX: 90,
      duration: 0.09,
      stagger: 0.04,
      ease: "power1.in",
      onComplete: () => setDisplayValue(value), // swap text mid-flip
    })
    .to(digits, { rotateX: 0, duration: 0.12, stagger: 0.04, ease: "power2.out" });

  gsap.fromTo(
    ".vote-pulse-ring",
    { scale: 0.8, opacity: 0.6 },
    { scale: 1.6, opacity: 0, duration: 0.4, ease: "var(--ease-standard)" }
  );
  prevValue.current = value;
}, [value]);
```

- Each `.vote-digit` needs `transform-style: preserve-3d` and a small `perspective` on its parent for the flip to read correctly.
- Digit color transitions instantly to `--current-teal` (upvote) or `--alert-rust` (downvote) at the flip midpoint, then settles to the resting color rule from §3.4 after 400ms.
- This is the **one** flourish allowed to feel a little theatrical. Keep every other animation in this document quieter than this one, on purpose.

### 4.5 Grid Re-ordering on Filter/Sort Change (Motion, `FeedbackGrid.tsx`)

```tsx
<AnimatePresence mode="popLayout">
  {items.map((item) => (
    <motion.div
      key={item._id}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 350, damping: 32 }}
    >
      <FeedbackCard {...item} />
    </motion.div>
  ))}
</AnimatePresence>
```

- `layout` handles cards smoothly sliding to new grid positions when sort changes; `AnimatePresence` handles cards that no longer match an active filter fading/scaling out rather than snapping away.

### 4.6 Modal & Toast (Motion, `Modal.tsx` / toast primitive)

- Backdrop: `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}`, 200ms, scrim color `rgba(16,20,28,0.7)`.
- Panel: `initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}`, 260ms `--ease-emphasis` in / 180ms out (exits faster than it enters — standard UX convention, don't make the user wait on the way out).
- Toast: enters from `x: 40, opacity: 0` → `x: 0, opacity: 1` over 220ms; auto-dismiss at 3.5s unless hovered; exits to `x: 24, opacity: 0` over 180ms.
- Skeleton shimmer: a single looping `backgroundPosition` gradient sweep, 1.4s, linear, `repeat: Infinity` — the only intentionally-infinite animation in the app; everything else runs once per trigger.

### 4.7 Form Validation Feedback (Motion)

```tsx
<motion.div
  animate={hasError ? { x: [0, -4, 4, -3, 3, 0] } : {}}
  transition={{ duration: 0.3 }}
>
```

- Paired with the field's border color transitioning to `--alert-rust` — the shake is secondary confirmation, never the only signal.

### 4.8 Optimistic Vote Rollback (Motion + GSAP together)

On a `409`/`429`/`503` from the vote endpoint (per `SPEC.md` §4.4):

1. GSAP flip-counter (§4.4) reverses immediately back to the prior value using the same flip timeline.
2. Motion applies the shake keyframes from §4.7 to the vote button itself.
3. A toast (§4.6) explains what happened.

---

## 5. Accessibility & Restraint

- **`prefers-reduced-motion` is mandatory, not optional.** Wrap every GSAP timeline in `gsap.matchMedia()`:

  ```tsx
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => { /* full timeline */ });
  mm.add("(prefers-reduced-motion: reduce)", () => { /* instant gsap.set(), no tween */ });
  ```

  For Motion, read `useReducedMotion()` and swap `transition` to `{ duration: 0.01 }` with no `scale`/`y`/`rotateX` — opacity-only crossfades survive, transforms don't. The flip-counter specifically: under reduced motion, the digits update instantly with no rotation, keeping only the color flash.
- Every interactive element (buttons, selects, vote controls) has a visible focus ring using `--signal-amber` at 2px offset — never remove `:focus-visible` outlines to "clean up" the design.
- Color is never the only signal: priority also has dot-count, vote direction also has icon direction (▲/▼), not just color.
- Contrast check: `--graphite` on `--paper` and `--paper` on `--ink-raised` both clear WCAG AA for body text; `--fog` on `--ink` is for secondary/meta text only, not body copy.

## 6. Do / Don't Checklist for the Agent

- **Do** reuse the three eases and three durations from §1.4 everywhere. **Don't** invent a fourth easing curve for "just this one component."
- **Do** let the flip-counter be the loudest thing on the page. **Don't** add competing flourishes (confetti, bouncy entrances, parallax backgrounds) elsewhere — they'll fight it.
- **Do** animate `transform`/`opacity` only. **Don't** animate `height`, `width`, or `box-shadow` directly — use the cross-fade/pre-sized-container patterns described above.
- **Do** cap stagger sequences (12 cards max) so large data sets stay snappy. **Don't** stagger-animate an unbounded list.
- **Do** test every animated flow with OS-level reduced-motion turned on before calling a component done.
- **Do** keep GSAP for scroll/timeline/flip work and Motion for React-state-driven UI, per §4's division of labor. **Don't** reach for GSAP to animate a component's own mount/unmount state — that's `AnimatePresence`'s job — and don't reach for Motion to drive `ScrollTrigger`-style scroll choreography.
