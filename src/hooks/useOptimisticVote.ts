"use client";

import { useState, useCallback } from "react";

interface UseOptimisticVoteOptions {
  feedbackId: string;
  initialUpvotes: number;
  initialDownvotes: number;
}

interface VoteResult {
  ok: boolean;
  status?: number;
}

export function useOptimisticVote({
  feedbackId,
  initialUpvotes,
  initialDownvotes,
}: UseOptimisticVoteOptions) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [optimisticUp, setOptimisticUp] = useState(initialUpvotes);
  const [optimisticDown, setOptimisticDown] = useState(initialDownvotes);
  const [pending, setPending] = useState(false);

  const vote = useCallback(
    async (voteType: "up" | "down"): Promise<VoteResult> => {
      if (pending) return { ok: false };

      // Same vote = no-op (server doesn't support un-voting)
      if (userVote === voteType) return { ok: true };

      const previousVote = userVote;
      const previousUp = optimisticUp;
      const previousDown = optimisticDown;

      // Optimistic update — new vote or switch
      setUserVote(voteType);
      if (voteType === "up") {
        setOptimisticUp((u) => u + 1);
        if (userVote === "down") setOptimisticDown((d) => d - 1);
      } else {
        setOptimisticDown((d) => d + 1);
        if (userVote === "up") setOptimisticUp((u) => u - 1);
      }

      setPending(true);
      try {
        const res = await fetch(`/api/feedback/${feedbackId}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Rollback
          setUserVote(previousVote);
          setOptimisticUp(previousUp);
          setOptimisticDown(previousDown);
          return { ok: false, status: res.status };
        }

        // Sync with server state
        setOptimisticUp(data.upvotes);
        setOptimisticDown(data.downvotes);
        return { ok: true };
      } catch {
        // Rollback on network error
        setUserVote(previousVote);
        setOptimisticUp(previousUp);
        setOptimisticDown(previousDown);
        return { ok: false };
      } finally {
        setPending(false);
      }
    },
    [feedbackId, userVote, optimisticUp, optimisticDown, pending]
  );

  return { userVote, optimisticUp, optimisticDown, pending, vote };
}
