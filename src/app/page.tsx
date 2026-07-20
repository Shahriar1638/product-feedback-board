import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { connectDB } from "@/lib/db/connect";
import Feedback from "@/models/Feedback.model";
import VoteTracker from "@/models/VoteTracker.model";
import { hashFallbackId } from "@/lib/utils/identifier";
import type { IFeedback } from "@/models/Feedback.model";
import FeedbackFilters from "@/components/feedback/FeedbackFilters";
import FeedbackList from "@/components/feedback/FeedbackList";
import BoardHeader from "@/components/feedback/BoardHeader";
import BoardLoadSequence from "@/components/feedback/BoardLoadSequence";

export const dynamic = "force-dynamic";

async function getFeedbacks(): Promise<IFeedback[]> {
  await connectDB();
  const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();

  const cookieStore = await cookies();
  const voterId = cookieStore.get("voter_id")?.value;
  if (voterId) {
    const headerStore = await headers();
    const ip = headerStore.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const userAgent = headerStore.get("user-agent") || "unknown";
    const fallbackId = hashFallbackId(ip, userAgent);

    const feedbackIds = feedbacks.map((f) => f._id);
    const userVotes = await VoteTracker.find({
      feedbackId: { $in: feedbackIds },
      voterId: { $in: [voterId, fallbackId] },
    }).lean();

    const voteMap = new Map(userVotes.map((v) => [String(v.feedbackId), v.voteType]));
    return JSON.parse(JSON.stringify(feedbacks.map((f) => ({
      ...f,
      userVote: voteMap.get(String(f._id)) ?? null,
    }))));
  }

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
