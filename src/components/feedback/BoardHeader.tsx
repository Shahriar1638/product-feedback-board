"use client";

import { useState, useCallback } from "react";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import SlideOver from "@/components/ui/SlideOver";

export default function BoardHeader() {
  const [formOpen, setFormOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <>
      <header className="board-header sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-paper/8 bg-ink-raised px-6">
        <button
          onClick={handleRefresh}
          className="font-mono text-sm font-medium uppercase tracking-[0.1em] text-fog transition-colors hover:text-paper"
        >
          DISPATCH BOARD
        </button>
        <button
          onClick={() => setFormOpen(true)}
          className="rounded-[var(--radius-button)] bg-signal-amber px-4 py-2 font-mono text-sm font-medium text-graphite transition-all hover:brightness-110 active:scale-[0.97]"
        >
          + New Feedback
        </button>
      </header>
      <SlideOver open={formOpen} onClose={() => setFormOpen(false)} title="New Entry">
        <FeedbackForm onClose={() => setFormOpen(false)} />
      </SlideOver>
    </>
  );
}
