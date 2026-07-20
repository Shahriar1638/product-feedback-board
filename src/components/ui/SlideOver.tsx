"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, type ReactNode } from "react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function SlideOver({ open, onClose, children, title }: SlideOverProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-graphite/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || "Feedback form"}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-ink-raised p-6 shadow-2xl sm:max-w-lg sm:rounded-l-[var(--radius-modal)]"
          >
            <div className="flex items-center justify-between border-b border-paper/8 pb-4">
              {title && (
                <h2 className="font-mono text-sm font-medium uppercase tracking-[0.1em] text-fog">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="flex h-8 w-8 items-center justify-center rounded text-fog/50 transition-colors hover:bg-fog/10 hover:text-paper"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
            <div className="pt-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
