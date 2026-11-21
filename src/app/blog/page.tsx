import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/content/posts";
import { getCalculator } from "@/lib/finance/registry";

export const metadata: Metadata = {
  title: "FRM & CFA Study Guides",
  description:
    "Plain-English guides to duration, VaR, Black-Scholes, forward rates, compounding and BA II Plus keystrokes — every example fully worked.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Study guides</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Short, plain-English walkthroughs of the calculations that show up most in FRM Part I and CFA Level I. Every number is
        worked out in full.
      </p>
      <ul className="mt-10 space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="block rounded-2xl border border-line bg-card p-6 transition-colors hover:border-accent/40">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <time dateTime={p.date}>{formatDate(p.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{p.readMinutes} min read</span>
                <span aria-hidden="true">·</span>
                <span>{getCalculator(p.calculator)?.category}</span>
              </div>
              <h2 className="mt-2 text-xl font-semibold leading-snug text-ink">{p.title}</h2>
              <p className="mt-2 leading-relaxed text-muted">{p.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
