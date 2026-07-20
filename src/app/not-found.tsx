import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink">
      <h1 className="font-mono text-2xl font-medium uppercase tracking-[0.1em] text-fog">
        SIGNAL LOST
      </h1>
      <p className="font-body text-sm text-fog/70">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-[var(--radius-button)] bg-signal-amber px-5 py-2 font-mono text-sm font-medium text-graphite transition-all hover:brightness-110 active:scale-[0.97]"
      >
        Return to Board
      </Link>
    </div>
  );
}
