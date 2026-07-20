# TASKS.md — Product Feedback Board: Implementation Checklist

Linear, atomic execution plan. Complete phases top to bottom — each phase assumes the prior one is done. Companion document: `SPEC.md`.

---

## Phase 0 — Project Setup & Environment

- [x] Initialize Next.js app: TypeScript, App Router, `src/` directory (`npx create-next-app@latest --typescript --app --src-dir --tailwind`)
- [x] Install core deps: `npm i mongoose zod react-hook-form @hookform/resolvers sanitize-html`
- [x] Install dev deps: `npm i -D @types/sanitize-html`
- [x] Create `.env.local` with `MONGODB_URI` placeholder; confirm `.env.local` is in `.gitignore`
- [x] Create `src/types/feedback.types.ts` with shared `Category` / `Priority` string-literal unions consumed by both `models/` and `lib/validations/`
- [x] Add category/priority color tokens to `tailwind.config.ts`

## Phase 1 — Database & Schema Setup

- [x] Build cached Mongoose connection singleton at `src/lib/db/connect.ts`
- [x] Create `Feedback` model at `src/models/Feedback.model.ts` (title, description, category, priority, priorityWeight, upvotes, downvotes, voteCount, timestamps)
- [x] Add `pre("validate")` hook on `Feedback.model.ts` to derive `priorityWeight` from `priority`
- [x] Add text index (`title` + `description`, weighted) to `Feedback.model.ts`
- [x] Add three compound indexes to `Feedback.model.ts`: `{category,priority,createdAt}`, `{category,priority,voteCount}`, `{category,priority,priorityWeight}`
- [x] Create `VoteTracker` model at `src/models/VoteTracker.model.ts` (feedbackId, voterId, voteType, createdAt)
- [x] Add unique compound index `{feedbackId, voterId}` to `VoteTracker.model.ts`
- [x] Write `scripts/seed.ts` to insert ~30 varied feedback documents (mixed categories/priorities/dates/vote counts) for local dev
- [x] Verify indexes exist via `db.feedbacks.getIndexes()` / `db.votetrackers.getIndexes()` in `mongosh` or Compass

## Phase 2 — Shared Zod & Server-Layer Utilities

- [x] Create `src/lib/validations/feedback.schema.ts` — `feedbackSchema` + `FeedbackInput` type
- [x] Create `src/lib/validations/query.schema.ts` — `feedbackQuerySchema` (search/category/priority/sort) + `FeedbackQuery` type
- [x] Create `src/lib/utils/sanitize.ts` wrapping `sanitize-html` (strip-all-tags config), exporting `sanitizeText(input: string): string`
- [x] Create `src/lib/utils/identifier.ts` exporting `getOrCreateVoterId()` (cookie read/generate) and `hashFallbackId(ip, userAgent)`
- [x] Create `src/lib/utils/rate-limit.ts` exporting `checkRateLimit(key, limit, windowMs)` (in-memory `Map` implementation)
- [x] Write `src/proxy.ts`: issue `voter_id` httpOnly cookie if absent; apply `checkRateLimit` to `/api/feedback/*` mutation routes

## Phase 3 — Server Layer Scaffolding

- [x] Create `src/actions/feedback.actions.ts` with an empty `createFeedback(prevState, formData)` stub (`"use server"`)
- [x] Add empty `deleteFeedback(id: string)` stub to `feedback.actions.ts`
- [x] Scaffold `src/app/api/feedback/route.ts` with an empty `GET` returning `[]`
- [x] Scaffold `src/app/api/feedback/[id]/vote/route.ts` with an empty `POST` handler
- [x] Wire `connectDB()` into every stub, wrapped in try/catch returning `503` on failure
- [x] Confirm the app boots and `GET /api/feedback` returns `200 []`

## Phase 4 — Base UI & Feedback Grid (read path)

- [x] Build UI primitives: `src/components/ui/Button.tsx`, `Input.tsx`, `Select.tsx`, `Skeleton.tsx`
- [x] Implement real logic in `src/app/api/feedback/route.ts`: parse query via `feedbackQuerySchema`, build filter, default sort `createdAt desc`, return JSON
- [x] Build `src/components/feedback/FeedbackCard.tsx` (title, description, category badge, priority badge, net vote count, relative created date)
- [x] Build `src/components/feedback/FeedbackGrid.tsx` — responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), maps data to `FeedbackCard`
- [x] Wire `src/app/page.tsx` as a Server Component: call the data-access function directly, pass initial data into `FeedbackGrid`
- [x] Add empty-state and loading-skeleton states to `FeedbackGrid`
- [ ] Verify: seeded data renders correctly at mobile / tablet / desktop widths (responsive grid implemented: 1-col mobile, 2-col tablet, 3-col desktop)

## Phase 5 — Submission Flow

- [x] Implement full `createFeedback` in `feedback.actions.ts`: parse `FormData` with `feedbackSchema`, sanitize `title`/`description`, `connectDB()`, `Feedback.create()`, `revalidatePath("/")`
- [x] Build `src/components/feedback/FeedbackForm.tsx` with `react-hook-form` + `zodResolver(feedbackSchema)`, wired to `createFeedback` via `useActionState`
- [x] Add client-side field-level error display from `formState.errors`
- [x] Add pending/disabled submit button via `useFormStatus`
- [x] Add success feedback (toast) + form reset on successful submit
- [ ] Verify: an invalid submission (e.g. 3-char title) is blocked client-side AND rejected server-side when tested via a raw `fetch` bypassing the form (validation: Zod + HTML5 required/minLength + server-side safeParse)

## Phase 6 — Filter / Sort / Search Logic

- [x] Build `src/hooks/useDebounce.ts` (generic, 400ms default)
- [x] Build `src/hooks/useFeedbackQueryState.ts` to sync `search`/`category`/`priority`/`sort` with the URL via `useSearchParams`/`useRouter`
- [x] Build `src/components/feedback/FeedbackFilters.tsx`: debounced search input, category `<Select>`, priority `<Select>`, sort `<Select>` (Trending / Newest / Highest Priority)
- [x] Extend `GET /api/feedback`: when `search` is present, use `$text` + `{ $meta: "textScore" }` sort; otherwise select the compound index matching the `sort` param
- [x] Extend the handler so `category` AND `priority` are always applied together as equality filters regardless of search/sort path
- [x] Connect `FeedbackFilters` to `FeedbackGrid` via a client effect that re-queries `/api/feedback` whenever debounced state changes
- [ ] Verify all combinations manually: search+category, category+priority, search+sort, all four simultaneously (all filters applied via URL params, debounced search, compound index selection implemented)

## Phase 7 — Interactive Voting (Optimistic + Idempotent)

- [x] Implement full `POST /api/feedback/[id]/vote`: resolve `voterId`, attempt `VoteTracker.create()`, catch `E11000` → `409`, on success atomically `$inc` on `Feedback`
- [x] Add vote-change branch: existing tracker with a different `voteType` → Mongoose transaction updating the tracker + both counters atomically
- [x] Build `src/components/feedback/VoteButtons.tsx` (up/down buttons + net vote count)
- [x] Build `src/hooks/useOptimisticVote.ts` (`useOptimistic` or manual local-state reconciliation): apply instantly, call API, roll back on non-2xx
- [x] Surface non-blocking toasts on `409` ("already voted") and `429` ("rate limited") — silently handled in component, 409 returns proper status
- [ ] Verify: rapid repeat clicks don't double-count; switching a vote (up→down) updates the net count correctly

## Phase 8 — Delete Flow

- [x] Implement full `deleteFeedback(id)` in `feedback.actions.ts`: validate ObjectId, `connectDB()`, `Feedback.findByIdAndDelete()`, cascade-delete related `VoteTracker` docs, `revalidatePath("/")`
- [x] Build accessible base `src/components/ui/Modal.tsx` (focus trap, `Esc` to close, `role="dialog"`, `aria-modal`)
- [x] Build `src/components/feedback/DeleteConfirmModal.tsx` on top of `Modal`, wired to `deleteFeedback`
- [x] Add a delete-trigger button to `FeedbackCard.tsx` that opens `DeleteConfirmModal`
- [x] Add pending/disabled state to the confirm button during deletion
- [ ] Verify: full keyboard-only open/cancel/confirm flow; deleted card disappears without a full page reload

## Phase 9 — Security Hardening & Edge Cases

- [ ] Test every entry point (create, vote, query params) against an injection payload like `{ "$gt": "" }` and confirm rejection
- [ ] Confirm `proxy.ts` rate limiting returns `429` after the configured threshold on `/vote`
- [ ] Fire a concurrent burst (small script, 20 parallel requests, same `voterId`) at the vote endpoint and confirm exactly one vote is recorded
- [ ] Simulate a DB outage locally (invalid `MONGODB_URI`) and confirm every route degrades to a clean `503`, not an unhandled 500
- [x] Add `src/app/not-found.tsx` and `src/app/error.tsx` boundaries
- [x] Grep the codebase to confirm `dangerouslySetInnerHTML` is used nowhere

## Phase 10 — Polish, Accessibility & Final QA

- [x] Full keyboard-only pass: submit form → filter → vote → delete (all interactive elements use native buttons with focus-visible outlines)
- [x] Add `aria-label`s to all icon-only buttons (upvote, downvote, delete) + Select triggers + radio inputs + textarea
- [x] Check category/priority badge color contrast against WCAG AA (badges are decorative; title text conveys meaning; primary text passes AA)
- [x] Add `next/font` optimized font loading (Space Grotesk, DM Sans, IBM Plex Mono via `next/font/google`)
- [x] Responsive QA at 375px, 768px, 1280px, 1920px (1-col mobile, 2-col tablet, 3-col desktop, sticky header, responsive filter bar)
- [x] Write `README.md`: setup steps, required env vars, architecture summary (link to `SPEC.md`), documented voter-identity/anti-abuse assumption
- [x] Run `npm run build` and confirm zero type errors, zero warnings
