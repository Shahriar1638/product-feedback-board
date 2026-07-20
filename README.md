# Dispatch Board — Product Feedback Board

A Next.js 16 application for collecting and managing product feedback with optimistic voting, real-time filtering, and a distinctive split-flap visual language.

## Tech Stack

- **Framework:** Next.js 16 (App Router, `src/` layout, Proxy)
- **Language:** TypeScript
- **Database:** MongoDB Atlas + Mongoose 9
- **Styling:** Tailwind CSS v4
- **Forms:** React Hook Form + Zod
- **Animations:** GSAP + Motion
- **Runtime:** React 19

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### 3. Seed the database

```bash
npm run seed
```

This creates 30 feedback entries with 85+ votes and verifies all indexes.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run seed` | Seed database with 30 sample entries |
| `npm run lint` | Run ESLint |

## Architecture

See [SPEC.md](./SPEC.md) for the full architecture blueprint.

### Folder Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Server Component — initial data fetch
│   ├── not-found.tsx           # 404 boundary
│   ├── error.tsx               # Error boundary
│   ├── globals.css             # Design tokens + Tailwind v4 theme
│   └── api/feedback/
│       ├── route.ts            # GET — list with search/filter/sort
│       └── [id]/vote/route.ts  # POST — upvote/downvote
├── actions/
│   └── feedback.actions.ts     # Server Actions (create, delete)
├── components/
│   ├── feedback/               # Domain components
│   └── ui/                     # Primitives (Button, Input, Select, Modal, Skeleton)
├── hooks/                      # Custom hooks
├── lib/
│   ├── db/connect.ts           # Cached Mongoose singleton
│   ├── validations/            # Zod schemas
│   └── utils/                  # Sanitize, rate-limit, identifier
├── models/                     # Mongoose schemas (Feedback, VoteTracker)
└── types/                      # TypeScript types
```

## Voter Identity & Anti-Abuse

This application uses a **cookie-based voter identity** system:

1. **Cookie Issuance:** A `voter_id` cookie (UUID v4) is issued via the proxy (`src/proxy.ts`) on the first request if none exists. The cookie is `httpOnly`, `secure` in production, `sameSite: lax`, with a 1-year expiry.

2. **Vote Tracking:** Each vote is tracked by `(feedbackId, voterId)` in the `VoteTracker` collection with a unique compound index. This prevents duplicate votes per user per feedback item.

3. **Vote Switching:** If a user changes their vote (up → down), a Mongoose transaction atomically updates the `VoteTracker` and both `Feedback` counters.

4. **Rate Limiting:** In-memory rate limiting (30 requests/minute per voter ID) is applied to all mutation endpoints via the proxy.

5. **Limitations:** This approach is suitable for internal tools and trusted-user scenarios. For anonymous public-facing applications, consider adding CAPTCHA, email verification, or IP-based restrictions.

## Design System

The visual language follows a "dispatch board" metaphor with:

- **Dark ink** (`#10141C`) background
- **Warm paper** (`#F5F1E6`) cards
- **Amber** for priority and primary actions
- **Teal** for positive votes and confirmations
- **Rust** for bugs, negative votes, and destructive actions
- **Split-flap counter** for vote display
- Space Grotesk (display), DM Sans (body), IBM Plex Mono (mono)

See [DESIGN.md](./DESIGN.md) for the complete visual specification.
