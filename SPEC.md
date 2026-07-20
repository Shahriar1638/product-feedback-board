# SPEC.md — Product Feedback Board: Architecture Blueprint

## 1. Tech Stack & Architecture

**Stack:** Next.js 16 (App Router, `src/` layout) · TypeScript · MongoDB · Mongoose · Tailwind CSS v4 · Zod · React Hook Form

### 1.1 Folder Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                        # Server Component — initial data fetch
│   ├── globals.css
│   ├── error.tsx
│   ├── not-found.tsx
│   └── api/
│       └── feedback/
│           ├── route.ts                # GET  — list w/ search, filter, sort
│           └── [id]/
│               └── vote/
│                   └── route.ts        # POST — upvote / downvote
├── actions/
│   └── feedback.actions.ts             # Server Actions: createFeedback, deleteFeedback
├── components/
│   ├── feedback/
│   │   ├── FeedbackForm.tsx
│   │   ├── FeedbackGrid.tsx
│   │   ├── FeedbackCard.tsx
│   │   ├── FeedbackFilters.tsx
│   │   ├── VoteButtons.tsx
│   │   └── DeleteConfirmModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Skeleton.tsx
├── hooks/
│   ├── useDebounce.ts
│   ├── useOptimisticVote.ts
│   └── useFeedbackQueryState.ts        # URL <-> filter/sort/search state
├── lib/
│   ├── db/
│   │   └── connect.ts                  # Cached Mongoose connection singleton
│   ├── validations/
│   │   ├── feedback.schema.ts          # Shared Zod schema (create form)
│   │   └── query.schema.ts             # Zod schema for search/filter/sort params
│   └── utils/
│       ├── sanitize.ts
│       ├── identifier.ts               # anonymous voter-id (cookie) helpers
│       └── rate-limit.ts
├── models/
│   ├── Feedback.model.ts
│   └── VoteTracker.model.ts
├── types/
│   └── feedback.types.ts
└── proxy.ts                            # voter-id cookie issuance + rate limiting
```

### 1.2 API Paradigm Decision: Server Actions vs. Route Handlers

**Recommendation: a deliberate hybrid, not an all-or-nothing choice.** Each mutation is routed to whichever mechanism its runtime behavior actually needs.

| Operation | Mechanism | Why |
|---|---|---|
| List feedback (search/filter/sort) | **Route Handler** — `GET /api/feedback` | This state must live in the URL query string (`?search=&category=&sort=`) to stay shareable, bookmarkable, and back-button-friendly, and it's triggered repeatedly from a debounced client input. Server Actions are POST-only RPC calls — they have no GET semantics, aren't cacheable, and can't be driven by a query string. |
| Create feedback | **Server Action** — `createFeedback` | A single form submission. Gets progressive enhancement (works before JS hydrates), integrates natively with `useActionState`/`useFormStatus` for pending UI, and calls `revalidatePath()` directly — no client-side JSON round-trip needed. |
| Delete feedback | **Server Action** — `deleteFeedback` | Same reasoning as create: a single mutating submission from inside the confirmation modal, with automatic revalidation. |
| Vote (upvote/downvote) | **Route Handler** — `POST /api/feedback/[id]/vote` | Voting needs (a) a fast, granular JSON response the client uses to reconcile or roll back an **optimistic update**, (b) precise HTTP status codes (`200`, `409` duplicate vote, `429` rate-limited) that the client branches on, and (c) to be matched by `proxy.ts` for per-identifier rate limiting. Route Handlers compose cleanly with proxy matchers; a Server Action is just a POST to the current page URL and doesn't expose this level of control. |

**Rule of thumb applied throughout:** if the operation is a whole-page form submission with a simple success/failure outcome → **Server Action**. If the operation needs REST semantics (GET-ability, specific status codes, middleware interception, or a response shape a client optimistically reconciles against) → **Route Handler**.

### 1.3 Rendering Strategy

`page.tsx` is a Server Component that calls the data-access layer directly (imports and calls the Mongoose query function in-process) rather than `fetch`-ing its own API route — this avoids a wasted network hop for the initial paint. It renders `<FeedbackGrid initialData={...} />`. All subsequent filter/search/sort/vote interactions happen client-side against the Route Handlers described above.

---

## 2. MongoDB Database Design

### 2.1 `Feedback` Schema

```ts
// src/models/Feedback.model.ts
import { Schema, model, models, Document } from "mongoose";

export type Category = "Bug" | "Feature" | "Improvement";
export type Priority = "Low" | "Medium" | "High";

export interface IFeedback extends Document {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  priorityWeight: number;   // 1=Low, 2=Medium, 3=High — enables numeric sort
  upvotes: number;
  downvotes: number;
  voteCount: number;        // upvotes - downvotes, denormalized for sort/display
  createdAt: Date;
  updatedAt: Date;
}

const PRIORITY_WEIGHT: Record<Priority, number> = { Low: 1, Medium: 2, High: 3 };

const FeedbackSchema = new Schema<IFeedback>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, enum: ["Bug", "Feature", "Improvement"], required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], required: true },
    priorityWeight: { type: Number, required: true },
    upvotes: { type: Number, default: 0, min: 0 },
    downvotes: { type: Number, default: 0, min: 0 },
    voteCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

FeedbackSchema.pre("validate", function () {
  if (this.priority) this.priorityWeight = PRIORITY_WEIGHT[this.priority as Priority];
});

// --- Indexes — see §2.3 for rationale ---
FeedbackSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 5, description: 1 }, name: "FeedbackTextIndex" }
);
FeedbackSchema.index({ category: 1, priority: 1, createdAt: -1 });
FeedbackSchema.index({ category: 1, priority: 1, voteCount: -1 });
FeedbackSchema.index({ category: 1, priority: 1, priorityWeight: -1 });
FeedbackSchema.index({ createdAt: -1 });

export default models.Feedback || model<IFeedback>("Feedback", FeedbackSchema);
```

### 2.2 `VoteTracker` Schema (vote persistence / idempotency)

```ts
// src/models/VoteTracker.model.ts
import { Schema, model, models, Document } from "mongoose";

export interface IVoteTracker extends Document {
  feedbackId: Schema.Types.ObjectId;
  voterId: string;          // signed cookie UUID, or IP+UA hash fallback
  voteType: "up" | "down";
  createdAt: Date;
}

const VoteTrackerSchema = new Schema<IVoteTracker>(
  {
    feedbackId: { type: Schema.Types.ObjectId, ref: "Feedback", required: true },
    voterId: { type: String, required: true },
    voteType: { type: String, enum: ["up", "down"], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

// One vote per (feedback, voter) — enforced at the storage layer, not just in app logic
VoteTrackerSchema.index({ feedbackId: 1, voterId: 1 }, { unique: true });

export default models.VoteTracker || model<IVoteTracker>("VoteTracker", VoteTrackerSchema);
```

**Voter identity strategy (lightweight, no-auth):** on first request, `proxy.ts` issues a long-lived, `httpOnly`, signed cookie (`voter_id`, a `crypto.randomUUID()`) if none exists — this is the primary identifier written to `VoteTracker.voterId`. As defense-in-depth for clients that strip cookies, also compute a SHA-256 hash of `IP + User-Agent` server-side and check it against existing tracker records for that feedback item. Reject the vote if *either* identifier already has a record. This is explicitly a pragmatic mitigation for a take-home scope, not a cryptographic guarantee — document this assumption in the README.

### 2.3 Indexing Strategy

The core challenge: simultaneous text search, dual-field filtering (category + priority), and three different sort modes, all optionally combined. MongoDB can generally only use one index per query stage, and a `$text` search index cannot be combined with a secondary compound sort in the same query plan — so the Route Handler branches its query strategy:

- **When `search` is present:** use `$text: { $search }` against `FeedbackTextIndex`, sort by `{ score: { $meta: "textScore" } }` (relevance). `category`/`priority` are still applied as equality filters alongside the text search — Mongo can intersect these efficiently. Manual sort selection (Trending/Newest/Priority) is suppressed while a search term is active, since relevance is the more meaningful order for search results; this is surfaced in the UI (sort control disables/relabels itself during an active search).
- **When `search` is absent:** the selected sort determines which compound index services the query, following the **ESR rule** (Equality fields, then Sort field, then Range):
  - Sort = *Trending* → `{ category: 1, priority: 1, voteCount: -1 }`
  - Sort = *Newest* → `{ category: 1, priority: 1, createdAt: -1 }`
  - Sort = *Highest Priority* → `{ category: 1, priority: 1, priorityWeight: -1 }`
- Because `category` and `priority` filters are both optional (zero, one, or both may be active), each compound index still serves partial-filter queries efficiently — MongoDB can use a leading subset of a compound index (e.g. a `category`-only query still benefits from `{category:1, priority:1, createdAt:-1}`, using the index for the equality match and sorting the reduced result set).
- `VoteTracker`'s unique compound index `{feedbackId:1, voterId:1}` does double duty: it enforces vote idempotency at the storage layer (rejecting duplicates atomically even under a race, via a `E11000` error) and gives O(log n) "has this voter already voted?" lookups.
- Action item during development: run `.explain("executionStats")` against a realistically seeded collection (see TASKS.md Phase 1) to confirm no query falls back to a full `COLLSCAN`.

---

## 3. Data Validation & Type Safety

A single Zod schema is the source of truth for both the client form and every server entry point — types are always derived (`z.infer`), never hand-duplicated.

```ts
// src/lib/validations/feedback.schema.ts
import { z } from "zod";

export const feedbackSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  category: z.enum(["Bug", "Feature", "Improvement"]),
  priority: z.enum(["Low", "Medium", "High"]),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
```

```ts
// src/lib/validations/query.schema.ts
import { z } from "zod";

export const feedbackQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.enum(["Bug", "Feature", "Improvement"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  sort: z.enum(["trending", "newest", "priority"]).default("newest"),
});

export type FeedbackQuery = z.infer<typeof feedbackQuerySchema>;
```

**Client — React Hook Form:**
```tsx
const form = useForm<FeedbackInput>({
  resolver: zodResolver(feedbackSchema),
  defaultValues: { title: "", description: "", category: "Feature", priority: "Medium" },
});
```

**Server — Server Action (never trust client input, re-validate):**
```ts
"use server";
import { feedbackSchema } from "@/lib/validations/feedback.schema";

export async function createFeedback(_prev: unknown, formData: FormData) {
  const parsed = feedbackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, errors: parsed.error.flatten().fieldErrors };
  // sanitize -> connectDB() -> Feedback.create(parsed.data) -> revalidatePath("/")
}
```

**Server — Route Handler (query params):**
```ts
export async function GET(req: NextRequest) {
  const parsed = feedbackQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  // build Mongoose filter from parsed.data only
}
```

Because a Zod schema is a plain JS object with zero server-only dependencies, the exact same `feedbackSchema` import works in a `"use client"` component and inside a server-only module — this is what keeps validation logic single-sourced instead of duplicated and drifting.

---

## 4. Security & Edge Cases

### 4.1 XSS Mitigation
- React escapes interpolated text by default — `dangerouslySetInnerHTML` is not used anywhere in this app, which is the primary defense.
- Defense-in-depth: `title`/`description` are run through `sanitize-html` (configured to strip *all* tags, since this is plain-text feedback, not rich text) inside `src/lib/utils/sanitize.ts`, applied after Zod validation and before `Feedback.create()`.

### 4.2 NoSQL Injection Protection
- Zod's `safeParse` with explicit types (`z.string()`, `z.enum()`) is the first gate — a payload like `{ "$gt": "" }` for `category` fails enum validation and never reaches Mongoose.
- Mongoose filters are built explicitly, field by field, from *parsed* Zod output only — raw `req.body`/`searchParams` objects are never spread directly into a query filter.
- A recursive sanitizer (`mongo-sanitize` or a small custom stripper) is applied as a second belt, stripping any key starting with `$` or containing `.`.
- Mongoose's own schema typing rejects mismatched types on write as a third layer.

### 4.3 API Rate Limiting
- `proxy.ts` applies a token-bucket/fixed-window limiter — `@upstash/ratelimit` + Redis for a real deployment, or a documented in-memory `Map`-based fallback for the take-home context (explicitly noted as non-durable across serverless instances) — keyed by the `voter_id` cookie, falling back to IP.
- Scoped via matcher to mutation endpoints only (`vote`, `create`, `delete`) — the read-only `GET` list stays more permissive.
- Suggested budget: 10 votes/minute, 5 submissions/hour per identifier. Over-limit returns `429` with `Retry-After`; the client's optimistic-vote logic uses this to roll back and surface a message.

### 4.4 Race Conditions During Concurrent Voting Bursts
- Never read-then-write vote counts (`find` → mutate in JS → `save()`) — under concurrent bursts this silently loses updates. Always use a single atomic `findOneAndUpdate` with `$inc`.
- The "has this voter already voted?" check and the counter increment are one logical unit. Two approaches, applied contextually:
  1. **Unique-index-as-lock (first vote):** attempt `VoteTracker.create({ feedbackId, voterId, voteType })` first. An `E11000` duplicate-key error means the voter already voted → return `409`, and the `Feedback` document is never touched. Only on insert success does the handler atomically `$inc` the `Feedback` counters. The unique index itself is the race-proof guard — no transaction required.
  2. **Multi-document transaction (changing an existing vote):** switching a vote (up → down) requires decrementing one counter and incrementing another across two documents consistently — this is wrapped in a Mongoose session/transaction. MongoDB Atlas's default replica-set deployment supports this without extra setup.

### 4.5 Database Disconnection Resilience
- A cached singleton connection (mandatory in serverless/Next.js to avoid exhausting MongoDB's connection limit across hot-reloads and lambda invocations):

```ts
// src/lib/db/connect.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

interface Cached { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null; }
declare global { var _mongoose: Cached | undefined; }

const cached: Cached = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false, maxPoolSize: 10 });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // don't poison the cache — allow retry on next call
    throw e;
  }
  return cached.conn;
}
```
- `bufferCommands: false` fails fast instead of silently queuing operations against a dead connection.
- Every Route Handler / Server Action wraps its DB call in try/catch; on failure, returns a generic `503 Service Unavailable` (never leaks the raw driver error) and logs the real error server-side.
- Client-side, a `503` or network failure on the vote endpoint is treated as a rollback signal for the optimistic update — the UI never claims a vote succeeded when it didn't.
