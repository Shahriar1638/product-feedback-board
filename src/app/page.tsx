import { Suspense } from "react";
import { connectDB } from "@/lib/db/connect";
import Feedback from "@/models/Feedback.model";
import type { IFeedback } from "@/models/Feedback.model";
import FeedbackFilters from "@/components/feedback/FeedbackFilters";
import FeedbackList from "@/components/feedback/FeedbackList";
import BoardHeader from "@/components/feedback/BoardHeader";
import BoardLoadSequence from "@/components/feedback/BoardLoadSequence";

export const dynamic = "force-dynamic";

async function getFeedbacks(): Promise<IFeedback[]> {
  await connectDB();
  const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(feedbacks));
}

export default async function Home() {
  const feedbacks = await getFeedbacks();

  return (
    <BoardLoadSequence>
      <div className="min-h-screen bg-ink">
        <BoardHeader />
        <Suspense>
          <FeedbackFilters />
        </Suspense>
        <main className="mx-auto max-w-7xl px-6 py-8">
          <FeedbackList initialData={feedbacks} />
        </main>
      </div>
    </BoardLoadSequence>
  );
}
