import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page doesn&apos;t exist</h1>
      <p className="mt-3 text-muted">The link may be broken, or the page may have moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/calculators" className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink-soft">
          Browse calculators
        </Link>
        <Link href="/" className="rounded-xl border border-line-strong bg-card px-5 py-3 text-sm font-semibold hover:bg-white">
          Home
        </Link>
      </div>
    </div>
  );
}
