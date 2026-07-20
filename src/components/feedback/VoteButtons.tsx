"use client";

import { useCallback } from "react";
import { useOptimisticVote } from "@/hooks/useOptimisticVote";

interface VoteButtonsProps {
  feedbackId: string;
  initialUpvotes: number;
  initialDownvotes: number;
}

function FlipDigit({ value, color }: { value: string; color: string }) {
  return (
    <span
      className={`inline-flex h-7 w-5 items-center justify-center rounded bg-ink/[0.06] font-mono text-sm font-medium ${color}`}
    >
      {value}
    </span>
  );
}

function FlipCounter({ net }: { net: number }) {
  const isNegative = net < 0;
  const absStr = String(Math.abs(net));
  const digits = absStr.split("");

  const color = isNegative
    ? "text-alert-rust"
    : net > 0
      ? "text-current-teal"
      : "text-graphite";

  return (
    <div className="flex items-center gap-0.5">
      {isNegative && <span className={`mr-0.5 font-mono text-sm font-medium ${color}`}>-</span>}
      {digits.map((d, i) => (
        <FlipDigit key={`${i}-${d}`} value={d} color={color} />
      ))}
    </div>
  );
}

export default function VoteButtons({
  feedbackId,
  initialUpvotes,
  initialDownvotes,
}: VoteButtonsProps) {
  const { userVote, net, pending, vote } = useOptimisticVote({
    feedbackId,
    initialUpvotes,
    initialDownvotes,
  });

  const handleClick = useCallback(
    async (voteType: "up" | "down") => {
      const result = await vote(voteType);
      if (result && !result.ok && result.status === 409) {
        // Silently handle — user already voted
      }
    },
    [vote]
  );

  return (
    <div className="flex items-center gap-1.5">
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

      <FlipCounter net={net} />

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
    </div>
  );
}
