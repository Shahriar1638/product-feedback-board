# Dispatch Board — Implementation Log

> **Project:** Product Feedback Board (Dispatch Board)
> **Date:** July 2026
> **Stack:** Next.js 16 · TypeScript · MongoDB/Mongoose · Tailwind v4 · Zod · React Hook Form · GSAP/Motion

---

## Session 1 — Project Bootstrap & Database (Phases 0–1)

### User Request
Build a Product Feedback Board ("Dispatch Board") — a Next.js 16 app with MongoDB/Mongoose, Tailwind v4, Zod, React Hook Form, GSAP/Motion animations, following strict DESIGN.md visual specs and Next.js 16 breaking changes.

### Decisions Made
- **Next.js 16 breaking changes** applied from day one: `middleware.ts` → `proxy.ts` with `proxy` export; async APIs; React 19 hooks.
- **Mongoose 9 breaking change**: `pre("validate")` no longer accepts `next()` callback — must use async/return.
- **DNS fix**: `dns.setServers(["1.1.1.1", "1.0.0.1"])` required in both `connect.ts` and `seed.ts` for Atlas SRV resolution.
- **`.env` renamed to `.env.local`**; URI variable is `MONGODB_URI` with `mongodb+srv://` protocol.

### What Was Built

#### Phase 0 — Project Init
- Next.js 16 app initialized with `src/` layout
- All deps installed: mongoose, zod, react-hook-form, @hookform/resolvers, sanitize-html, @types/sanitize-html, motion, gsap, @gsap/react, tsx, dotenv
- `.env.local` with `MONGODB_URI`
- `globals.css` with full DESIGN.md tokens via `@theme inline` (Tailwind v4)
- `layout.tsx` with Space Grotesk / DM Sans / IBM Plex Mono fonts

#### Phase 1 — Database Layer
- `src/lib/db/connect.ts` — cached Mongoose singleton + DNS fix
- `src/models/Feedback.model.ts` — schema, pre-validate hook, text index, 3 compound indexes
- `src/models/VoteTracker.model.ts` — schema, unique compound index
- `scripts/seed.ts` — 30 docs, 85+ votes, indexes verified via `npm run seed`

### Verification
- `npm run seed` completed successfully — all indexes confirmed
- TypeScript compilation passed

---

## Session 2 — Backend & Validation (Phase 2)

### User Request
Implement Phase 2 — Backend Foundations: validation schemas, utilities, proxy.

### What Was Built

- `src/lib/validations/feedback.schema.ts` — Zod create schema
- `src/lib/validations/query.schema.ts` — Zod query schema
- `src/lib/utils/sanitize.ts` — strip-all HTML sanitizer
- `src/lib/utils/identifier.ts` — `getOrCreateVoterId` + `hashFallbackId` (async `cookies()`)
- `src/lib/utils/rate-limit.ts` — in-memory Map rate limiter
- `src/proxy.ts` — cookie issuance + rate limiting (Next.js 16 convention, not middleware)

### Key Decisions
- Used `proxy` export (not `middleware` default) per Next.js 16
- Rate limiting: 30 requests/minute per voter ID on mutation routes
- Sanitizer strips all HTML tags — no `dangerouslySetInnerHTML` anywhere

---

## Session 3 — Server Actions & API Routes (Phase 3)

### User Request
Implement Phase 3 — Server Actions & API Routes.

### What Was Built

- `src/actions/feedback.actions.ts` — `createFeedback` + `deleteFeedback` server actions with connectDB/try-catch/503
- `src/app/api/feedback/route.ts` — GET scaffold
- `src/app/api/feedback/[id]/vote/route.ts` — POST scaffold with async `params`

### Verification
- Build passed clean

---

## Session 4 — UI Primitives & Feedback Grid (Phase 4)

### User Request
Implement Phase 4 — UI Primitives & Feedback Grid.

### What Was Built

- `src/components/ui/Button.tsx` — 4 variants (primary, secondary, danger, ghost), 3 sizes
- `src/components/ui/Input.tsx` — label + error display
- `src/components/ui/Select.tsx` — custom dropdown
- `src/components/ui/Skeleton.tsx` — shimmer loading
- `src/app/api/feedback/route.ts` — full GET with text search + compound index selection + category/priority filters
- `src/components/feedback/FeedbackCard.tsx` — category badge, priority dots, net votes, timeAgo
- `src/components/feedback/FeedbackGrid.tsx` — responsive grid + empty state + skeleton
- `src/app/page.tsx` — Server Component with data fetch, header, filters, grid
- `src/components/feedback/FeedbackList.tsx` — client-side re-query bridge

### Verification
- Build passed clean

---

## Session 5 — Create Feedback Flow (Phase 5)

### User Request
Implement Phase 5 — Create Feedback Flow.

### What Was Built

- Full `createFeedback` action with sanitize + revalidatePath
- `src/components/feedback/FeedbackForm.tsx` — `useActionState` from `react` (not `react-dom`), `useFormStatus`, segmented category/priority radio controls, field-level errors, pending state, success reset

### Key Decisions
- `useActionState` imported from `"react"` per Next.js 16 / React 19 (not `"react-dom"`)
- Segmented radio controls (not dropdowns) per DESIGN.md §3.5

---

## Session 6 — Filtering & Search (Phase 6)

### User Request
Implement Phase 6 — Filtering & Search.

### What Was Built

- `src/hooks/useDebounce.ts` — generic 400ms debounce
- `src/hooks/useFeedbackQueryState.ts` — URL sync for filter/sort/search
- `src/components/feedback/FeedbackFilters.tsx` — search + 3 selects
- `FeedbackList` re-fetches on filter changes

### Verification
- Build passed clean

---

## Session 7 — Design Compliance Revision

### User Request
Revise Phases 2–6 against DESIGN.md and AGENTS.md.

### Gaps Found & Fixed

| Gap | Fix | DESIGN.md Spec |
|---|---|---|
| Header missing "New Feedback" button | Added amber button with `+ New Feedback` | §3.1 |
| Submit button wrong color | Changed to `current-teal` fill | §3.5 |
| Empty state missing clear filters button | Added "Clear Filters" button | §3.8 |

### Cross-Check Summary

| Spec | Status |
|---|---|
| §3.1 Header: ink-raised, 72px, sticky, mono title, amber button | ✅ |
| §3.2 Filter bar: under header, ink-raised, border, custom selects | ✅ |
| §3.3 Card: paper bg, category pills, priority dots, 3-line clamp | ✅ |
| §3.5 Form: segmented controls, teal submit, mono labels | ✅ |
| §3.8 Empty: "NO SIGNAL" + clear filters; skeleton shimmer loading | ✅ |
| §1.1 Colors: all 8 tokens used correctly | ✅ |
| §1.2 Typography: display/body/mono fonts applied | ✅ |
| §1.3 Radius: card 12px, button 8px, badge 999px | ✅ |
| §1.4 Motion: transitions use --dur-micro, --ease-standard | ✅ |

### AGENTS.md (Next.js 16) Compliance
- `proxy.ts` not `middleware.ts` ✅
- Async `params` in route handlers ✅
- `useActionState` from `react` (not `react-dom`) ✅
- `revalidatePath` from `next/cache` ✅

---

## Session 8 — Voting, Delete & Security (Phases 7–9)

### User Request
Implement Phases 7, 8, and 9.

### What Was Built

#### Phase 7 — Interactive Voting

**`src/app/api/feedback/[id]/vote/route.ts` — Full vote logic:**
- Validates ObjectId
- Resolves `voterId` from Cookie header
- **First vote:** `VoteTracker.create()` → catch `E11000` → `409 Already Voted`. On success: atomic `$inc` on Feedback
- **Vote switch (up→down):** `VoteTracker.findOne()` → different `voteType` → Mongoose `session.withTransaction()`: update tracker + `$inc` both counters atomically
- Returns `{ feedbackId, voteType, upvotes, downvotes }`

**`src/hooks/useOptimisticVote.ts`:**
- `userVote` local state (`null | "up" | "down"`)
- `optimisticNet` computed from initial + local deltas
- On click: apply instantly → `fetch POST` → rollback on non-2xx
- Toggle behavior: clicking same vote again removes it

**`src/components/feedback/VoteButtons.tsx` (DESIGN.md §3.4):**
- `[▲ button] [flip-counter] [▼ button]` horizontal layout
- Flip-digit cells: `bg-ink/[0.06]` on paper, radius 4px, 2px gap
- Color: positive=teal, negative=rust, zero=graphite
- Active vote: filled accent background; other: outlined border
- `aria-label="Upvote"` / `aria-label="Downvote"` on buttons

**Wired into `FeedbackCard.tsx`** — replaced static vote display.

#### Phase 8 — Delete Flow

**`src/actions/feedback.actions.ts` — Full `deleteFeedback`:**
- Validates ObjectId
- `Feedback.findByIdAndDelete()`
- `VoteTracker.deleteMany({ feedbackId })` — cascade delete
- `revalidatePath("/")`

**`src/components/ui/Modal.tsx` — Accessible base:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Focus trap (Tab/Shift+Tab cycle)
- `Esc` to close
- Body scroll lock on mount
- Click outside overlay to close

**`src/components/feedback/DeleteConfirmModal.tsx`:**
- Uses `Modal` component
- Header: "Delete Feedback?"
- Confirm/Cancel buttons
- Pending state: confirm button disabled + "Deleting..." text
- Calls `deleteFeedback(id)` → `router.refresh()` on success

**`FeedbackCard.tsx` — Delete trigger:**
- Small trash icon button (top-right corner)
- `aria-label={`Delete ${feedback.title}`}`
- Opens `DeleteConfirmModal`
- Card re-renders without full page reload

#### Phase 9 — Security & Error Boundaries

**`src/app/not-found.tsx`:**
- "SIGNAL LOST" heading + description + "Return to Board" link

**`src/app/error.tsx`:**
- Client component boundary
- "TRANSMISSION ERROR" heading + "Retry" button with `reset()`

**Security verification:**
- `dangerouslySetInnerHTML` grep: **0 matches** ✅
- Zod validation on create ✅
- MongoDB injection-safe via Mongoose ODM ✅
- Proxy rate limiting on `/vote` ✅

### Verification
- Build passed clean (zero type errors)

---

## Session 9 — Polish, Accessibility & Final QA (Phase 10)

### User Request
Implement Phase 10.

### What Was Built

| Task | Implementation |
|---|---|
| `aria-label` on all icon-only buttons | Upvote, Downvote (VoteButtons), Delete (FeedbackCard) |
| `aria-label` + `aria-expanded` + `role="listbox"` on Select | Trigger button + dropdown listbox + `role="option"` + `aria-selected` |
| `aria-label` on form inputs | Radio inputs (category/priority), textarea (description) |
| WCAG AA contrast check | Primary text passes AA; badges are decorative (title conveys meaning) |
| `next/font` optimized loading | Space Grotesk, DM Sans, IBM Plex Mono via `next/font/google` |
| Responsive layout | 1-col mobile (375px), 2-col tablet (768px), 3-col desktop (1280px+) |
| `README.md` | Setup steps, env vars, architecture, voter-identity/anti-abuse docs |
| `npm run build` | Zero type errors, zero warnings |

### Files Modified
- `src/components/ui/Select.tsx` — aria-label, aria-expanded, role="listbox", role="option", aria-selected
- `src/components/feedback/FeedbackForm.tsx` — aria-label on radio inputs and textarea
- `README.md` — created

---

## Final File Inventory

```
src/
├── app/
│   ├── layout.tsx                          # Root layout with fonts
│   ├── page.tsx                            # Server Component homepage
│   ├── not-found.tsx                       # 404 boundary
│   ├── error.tsx                           # Error boundary
│   ├── globals.css                         # Design tokens + Tailwind v4 theme
│   └── api/feedback/
│       ├── route.ts                        # GET with search/filter/sort
│       └── [id]/vote/route.ts              # POST with E11000 + transaction
├── actions/
│   └── feedback.actions.ts                 # createFeedback, deleteFeedback
├── components/
│   ├── feedback/
│   │   ├── FeedbackCard.tsx                # Card with vote buttons + delete
│   │   ├── FeedbackFilters.tsx             # Search + 3 selects
│   │   ├── FeedbackForm.tsx                # useActionState form
│   │   ├── FeedbackGrid.tsx               # Responsive grid + empty state
│   │   ├── FeedbackList.tsx                # Client-side re-query bridge
│   │   ├── VoteButtons.tsx                 # Flip-counter vote UI
│   │   └── DeleteConfirmModal.tsx          # Confirm delete dialog
│   └── ui/
│       ├── Button.tsx                      # 4 variants, 3 sizes
│       ├── Input.tsx                       # Label + error
│       ├── Modal.tsx                       # Accessible dialog
│       ├── Select.tsx                      # Custom dropdown
│       └── Skeleton.tsx                    # Shimmer loading
├── hooks/
│   ├── useDebounce.ts                      # Generic debounce
│   ├── useFeedbackQueryState.ts            # URL ↔ filter state
│   └── useOptimisticVote.ts               # Optimistic voting
├── lib/
│   ├── db/connect.ts                       # Cached Mongoose singleton
│   ├── validations/
│   │   ├── feedback.schema.ts              # Zod create schema
│   │   └── query.schema.ts                 # Zod query schema
│   └── utils/
│       ├── identifier.ts                   # Voter ID management
│       ├── rate-limit.ts                   # In-memory rate limiter
│       └── sanitize.ts                     # HTML sanitizer
├── models/
│   ├── Feedback.model.ts                   # Schema + 5 indexes
│   └── VoteTracker.model.ts                # Schema + unique compound index
├── proxy.ts                                # Cookie + rate limiting (Next.js 16)
├── types/
│   └── feedback.types.ts                   # Category, Priority, SortMode, VoteType
scripts/
└── seed.ts                                 # 30 docs + 85 votes + index verification
```

---

## Breaking Changes Handled

| Breaking Change | Resolution |
|---|---|
| Next.js 16: `middleware.ts` → `proxy.ts` | `export function proxy()` + `export const config` |
| Next.js 16: `useActionState` from `react` | `import { useActionState } from "react"` |
| Next.js 16: Async `params` in route handlers | `{ params }: { params: Promise<{ id: string }> }` |
| Next.js 16: `next lint` removed | Not used |
| Mongoose 9: `pre("validate")` no callback | Async function, return instead of `next()` |
| Mongoose 9: `FilterQuery` → `QueryFilter` | Used Mongoose 9 types |
| Tailwind v4: `@apply` removed | Used `@theme inline` + CSS custom properties |

---

## Commands Used

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run seed             # Seed database

# DNS fix (in seed.ts and connect.ts)
dns.setServers(["1.1.1.1", "1.0.0.1"])

# Verification
npx next build           # Zero errors, zero warnings
```
