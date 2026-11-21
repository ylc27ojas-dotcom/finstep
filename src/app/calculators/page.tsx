import type { Metadata } from "next";
import Link from "next/link";
import { calculators } from "@/lib/finance/registry";
import type { CalculatorCategory } from "@/lib/finance/types";

export const metadata: Metadata = {
  title: "FRM & CFA Calculators with Step-by-Step Working",
  description:
    "Eight free exam-style finance calculators: bond price and YTM, duration and convexity, compounding, forward rates, forward prices, Black-Scholes, VaR and performance ratios.",
  alternates: { canonical: "/calculators" },
};

const ORDER: CalculatorCategory[] = ["Fixed income", "Rates", "Derivatives", "Risk", "Portfolio"];

export default function CalculatorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Calculators</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Pick a topic. Every calculator explains each step in plain English, shows the formula with your numbers, and gives the
        BA II Plus keystrokes where they apply.
      </p>

      <div className="mt-10 space-y-12">
        {ORDER.map((cat) => {
          const items = calculators.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat} aria-labelledby={`cat-${cat}`}>
              <h2 id={`cat-${cat}`} className="text-sm font-semibold uppercase tracking-wider text-muted">
                {cat}
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {items.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/calculators/${c.slug}`}
                    className="group rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_30px_-18px_rgb(11_18_32/0.4)]"
                  >
                    <span className="text-lg font-semibold text-ink">{c.shortName}</span>
                    <span className="mt-2 block leading-relaxed text-muted">{c.tagline}</span>
                    <span className="mt-4 inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-ink">{c.syllabus}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
