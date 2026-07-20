"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { IFeedback } from "@/models/Feedback.model";
import VoteButtons from "./VoteButtons";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface FeedbackCardProps {
  feedback: IFeedback;
}

const CATEGORY_COLORS: Record<string, string> = {
  Bug: "bg-alert-rust/14 text-alert-rust",
  Feature: "bg-current-teal/14 text-current-teal",
  Improvement: "bg-signal-amber/14 text-signal-amber",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FeedbackCard({ feedback }: FeedbackCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <motion.div
        className="feedback-card relative flex flex-col gap-3 rounded-[var(--radius-card)] bg-paper p-5 shadow-[var(--shadow-card)]"
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={() => setDeleteOpen(true)}
          aria-label={`Delete ${feedback.title}`}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded text-fog/40 transition-colors hover:bg-alert-rust/10 hover:text-alert-rust"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 3.5h12M5.5 3.5V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5M11 3.5l-.5 8.5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1L3 3.5" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 font-mono text-[0.625rem] font-medium uppercase tracking-wider ${CATEGORY_COLORS[feedback.category]}`}
          >
            {feedback.category}
          </span>
          <span className="flex gap-0.5">
            {Array.from({ length: ["Low", "Medium", "High"].indexOf(feedback.priority) + 1 }).map(
              (_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-signal-amber" />
              )
            )}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold leading-tight text-graphite">
          {feedback.title}
        </h3>

        <p className="line-clamp-3 font-body text-sm leading-relaxed text-graphite/70">
          {feedback.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <VoteButtons
            feedbackId={String(feedback._id)}
            initialUpvotes={feedback.upvotes}
            initialDownvotes={feedback.downvotes}
          />
          <span className="font-mono text-[0.6875rem] text-fog">
            {timeAgo(feedback.createdAt)}
          </span>
        </div>
      </motion.div>

      <DeleteConfirmModal
        feedbackId={String(feedback._id)}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
