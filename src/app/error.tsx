"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink">
      <h1 className="font-mono text-2xl font-medium uppercase tracking-[0.1em] text-alert-rust">
        TRANSMISSION ERROR
      </h1>
      <p className="font-body text-sm text-fog/70">
        Something went wrong. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-[var(--radius-button)] bg-signal-amber px-5 py-2 font-mono text-sm font-medium text-graphite transition-all hover:brightness-110 active:scale-[0.97]"
      >
        Retry
      </button>
    </div>
  );
}
