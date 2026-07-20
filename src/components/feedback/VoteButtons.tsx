"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useOptimisticVote } from "@/hooks/useOptimisticVote";
import { useToast } from "@/hooks/useToast";

interface VoteButtonsProps {
  feedbackId: string;
  initialUpvotes: number;
  initialDownvotes: number;
}

function FlipDigit({ value }: { value: string }) {
  return (
    <span
      className="vote-digit inline-flex h-7 w-5 items-center justify-center rounded bg-ink/[0.06] font-mono text-sm font-medium"
      style={{ transformStyle: "preserve-3d" }}
    >
      {value}
    </span>
  );
}

function CountDisplay({ count }: { count: number }) {
  const digits = String(count).split("");
  return (
    <div className="flex items-center gap-0.5" style={{ perspective: "120px" }}>
      {digits.map((d, i) => (
        <FlipDigit key={`${i}-${d}`} value={d} />
      ))}
    </div>
  );
}

export default function VoteButtons({
  feedbackId,
  initialUpvotes,
  initialDownvotes,
}: VoteButtonsProps) {
  const { userVote, optimisticUp, optimisticDown, pending, vote } = useOptimisticVote({
    feedbackId,
    initialUpvotes,
    initialDownvotes,
  });
  const { addToast } = useToast();

  const handleClick = useCallback(
    async (voteType: "up" | "down") => {
      const result = await vote(voteType);
      if (result && !result.ok) {
        if (result.status === 409) {
          addToast("Already voted this way", "info");
        } else if (result.status === 429) {
          addToast("Slow down — try again in a moment", "error");
        } else {
          addToast("Vote didn't go through — try again", "error");
        }
      }
    },
    [vote, addToast]
  );

  return (
    <div className="flex items-center gap-3">
      {/* Upvote */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleClick("up")}
          disabled={pending}
          aria-label="Upvote"
          className={`flex h-8 w-8 items-center justify-center rounded transition-all duration-[var(--dur-micro)] active:scale-95 ${
            userVote === "up"
              ? "bg-current-teal text-paper"
              : "border border-fog/25 text-fog hover:border-current-teal hover:text-current-teal"
          } ${pending ? "opacity-50" : ""}`}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 0L11 5H1L6 0Z" />
          </svg>
        </button>
        <span className="font-mono text-sm font-medium text-current-teal">
          <CountDisplay count={optimisticUp} />
        </span>
      </div>

      {/* Downvote */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleClick("down")}
          disabled={pending}
          aria-label="Downvote"
          className={`flex h-8 w-8 items-center justify-center rounded transition-all duration-[var(--dur-micro)] active:scale-95 ${
            userVote === "down"
              ? "bg-alert-rust text-paper"
              : "border border-fog/25 text-fog hover:border-alert-rust hover:text-alert-rust"
          } ${pending ? "opacity-50" : ""}`}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8L1 3H11L6 8Z" />
          </svg>
        </button>
        <span className="font-mono text-sm font-medium text-alert-rust">
          <CountDisplay count={optimisticDown} />
        </span>
      </div>
    </div>
  );
}
