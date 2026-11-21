import type { Metadata } from "next";
import Link from "next/link";
import { calculators } from "@/lib/finance/registry";
import { Tex } from "@/components/Tex";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "FRM Part I Formula Sheet (Fixed Income, Derivatives, VaR, Performance)",
  description:
    "Every formula behind the FinStep calculators on one page: bond pricing, duration and convexity, compounding, forward rates, cost of carry, Black-Scholes, VaR, ES and performance ratios.",
  alternates: { canonical: "/formula-sheet" },
};

export default function FormulaSheetPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Formula sheet</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted">
            The formulas behind every FinStep calculator, grouped by topic. Click a heading to work a problem with it.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {calculators.map((c) => (
          <section key={c.slug} className="break-inside-avoid rounded-2xl border border-line bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-ink">{c.category}</p>
            <h2 className="mt-1 text-lg font-semibold">
              <Link href={`/calculators/${c.slug}`} className="hover:text-accent-ink">
                {c.shortName}
              </Link>
            </h2>
            <dl className="mt-4 space-y-4">
              {c.formulas.map((f) => (
                <div key={f.name}>
                  <dt className="text-sm font-medium text-ink">{f.name}</dt>
                  <dd className="mt-1 rounded-lg bg-paper px-2">
                    <Tex tex={f.tex} block />
                  </dd>
                  {f.note && <dd className="mt-1 text-xs leading-5 text-muted">{f.note}</dd>}
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
