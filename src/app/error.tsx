"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 text-muted">
        Sorry about that. Try again, and if it keeps happening, let us know through the feedback page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink-soft">
          Try again
        </button>
        <Link href="/feedback" className="rounded-xl border border-line-strong bg-card px-5 py-3 text-sm font-semibold hover:bg-white">
          Report the problem
        </Link>
      </div>
      {error.digest && <p className="mt-6 font-mono text-xs text-muted">Reference: {error.digest}</p>}
    </div>
  );
}
