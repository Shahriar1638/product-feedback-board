"use client";

import { useRouter } from "next/navigation";
import type { IFeedback } from "@/models/Feedback.model";
import FeedbackCard from "./FeedbackCard";
import Skeleton from "@/components/ui/Skeleton";

interface FeedbackGridProps {
  feedbacks: IFeedback[];
  loading?: boolean;
}

export default function FeedbackGrid({ feedbacks, loading }: FeedbackGridProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52" />
        ))}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="font-mono text-lg font-medium uppercase tracking-wider text-fog">
          NO SIGNAL
        </p>
        <p className="font-body text-sm text-fog/70">
          No feedback matches these filters.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 rounded-[var(--radius-button)] border border-fog/20 px-4 py-2 font-mono text-xs uppercase tracking-wider text-fog transition-colors hover:border-fog/40 hover:text-paper"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {feedbacks.map((fb) => (
        <FeedbackCard key={String(fb._id)} feedback={fb} />
      ))}
    </div>
  );
}
