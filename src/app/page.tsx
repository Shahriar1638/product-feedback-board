import { Suspense } from "react";
import { connectDB } from "@/lib/db/connect";
import Feedback from "@/models/Feedback.model";
import type { IFeedback } from "@/models/Feedback.model";
import FeedbackFilters from "@/components/feedback/FeedbackFilters";
import FeedbackList from "@/components/feedback/FeedbackList";

export const dynamic = "force-dynamic";

async function getFeedbacks(): Promise<IFeedback[]> {
  await connectDB();
  const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(feedbacks));
}

export default async function Home() {
  const feedbacks = await getFeedbacks();

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-paper/8 bg-ink-raised px-6">
        <h1 className="font-mono text-sm font-medium uppercase tracking-[0.1em] text-fog">
          DISPATCH BOARD
        </h1>
        <button className="rounded-[var(--radius-button)] bg-signal-amber px-4 py-2 font-mono text-sm font-medium text-graphite transition-all hover:brightness-110 active:scale-[0.97]">
          + New Feedback
        </button>
      </header>

      <Suspense>
        <FeedbackFilters />
      </Suspense>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <FeedbackList initialData={feedbacks} />
      </main>
    </div>
  );
}
