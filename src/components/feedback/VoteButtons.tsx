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

function FlipDigit({ value, color, digitRef }: { value: string; color: string; digitRef?: (el: HTMLSpanElement | null) => void }) {
  return (
    <span
      ref={digitRef}
      className={`vote-digit inline-flex h-7 w-5 items-center justify-center rounded bg-ink/[0.06] font-mono text-sm font-medium ${color}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {value}
    </span>
  );
}

function FlipCounter({ net, prevNet }: { net: number; prevNet: number }) {
  const digitsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (prevNet === net) return;
    const digits = gsap.utils.toArray<HTMLElement>(".vote-digit");
    if (digits.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline()
        .to(digits, {
          rotateX: 90,
          duration: 0.09,
          stagger: 0.04,
          ease: "power1.in",
          onComplete: () => {
            // Force re-render by setting state in parent
          },
        })
        .to(digits, { rotateX: 0, duration: 0.12, stagger: 0.04, ease: "power2.out" });

      gsap.fromTo(
        ".vote-pulse-ring",
        { scale: 0.8, opacity: 0.6 },
        { scale: 1.6, opacity: 0, duration: 0.4, ease: "var(--ease-standard)" }
      );
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(digits, { rotateX: 0 });
    });
  }, [net]);

  const isNegative = net < 0;
  const absStr = String(Math.abs(net));
  const digits = absStr.split("");

  const color = isNegative
    ? "text-alert-rust"
    : net > 0
      ? "text-current-teal"
      : "text-graphite";

  return (
    <div ref={containerRef} className="relative flex items-center gap-0.5" style={{ perspective: "120px" }}>
      {isNegative && <span className={`mr-0.5 font-mono text-sm font-medium ${color}`}>-</span>}
      {digits.map((d, i) => (
        <FlipDigit key={`${i}-${d}`} value={d} color={color} />
      ))}
      <span className="vote-pulse-ring absolute inset-0 rounded-full" />
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
  const { addToast } = useToast();
  const [prevNet, setPrevNet] = useState(net);

  useEffect(() => {
    if (prevNet !== net) {
      const timer = setTimeout(() => setPrevNet(net), 400);
      return () => clearTimeout(timer);
    }
  }, [net, prevNet]);

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

      <FlipCounter net={net} prevNet={prevNet} />

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
