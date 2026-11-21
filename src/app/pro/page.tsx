import type { Metadata } from "next";
import Link from "next/link";
import { pro } from "@/lib/site";
import { calculators } from "@/lib/finance/registry";

export const metadata: Metadata = {
  title: "FinStep Pro PDF — Printable FRM Formula & BA II Plus Keystroke Pack",
  description:
    "A printable PDF with every FinStep formula, worked examples and BA II Plus keystroke sequences for last-week FRM Part I revision.",
  alternates: { canonical: "/pro" },
};

const INCLUDED = [
  "Every formula from all 8 calculators, laid out for printing",
  "BA II Plus key sequences for bonds, yields, compounding and repricing",
  "One fully worked example per topic, with the exam traps flagged",
  "z-value and N(d) quick-reference table",
  "Lifetime updates when new calculators are added",
];

export default function ProPage() {
  const ready = pro.checkoutUrl.startsWith("https://");
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-ink">FinStep Pro PDF</p>
          <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight">Your last-week revision pack, on paper.</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            The calculators stay free forever. The Pro PDF bundles everything into a clean, printable pack you can annotate in
            the final days before the exam — and buying it keeps FinStep running.
          </p>
          <ul className="mt-8 space-y-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-3">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 flex-none text-accent" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-ink-soft">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted">
            Covers: {calculators.map((c) => c.shortName).join(" · ")}.
          </p>
        </div>

        <div className="self-start rounded-2xl border border-line bg-card p-6 shadow-sm md:sticky md:top-24">
          <p className="text-sm font-medium text-muted">One-time payment</p>
          <p className="mt-1 font-mono text-4xl font-semibold">{pro.priceLabel}</p>
          <p className="mt-1 text-sm text-muted">Download link emailed right after payment.</p>
          {ready ? (
            <a
              href={pro.checkoutUrl}
              rel="noopener"
              className="mt-6 block rounded-xl bg-ink px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
            >
              Buy the Pro PDF
            </a>
          ) : (
            <div className="mt-6">
              <button type="button" disabled className="block w-full cursor-not-allowed rounded-xl bg-ink/40 px-5 py-3 text-sm font-semibold text-white">
                Checkout opening soon
              </button>
              <p className="mt-3 text-xs leading-5 text-muted">
                Payments are being set up. Meanwhile, the free <Link href="/formula-sheet" className="underline">formula sheet</Link>{" "}
                can be printed from your browser.
              </p>
            </div>
          )}
          <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-muted">
            Secure checkout by Dodo Payments (merchant of record). Cards and local payment methods supported. Not happy? Email within 7 days for a
            refund — see the <Link href="/terms" className="underline">terms</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
