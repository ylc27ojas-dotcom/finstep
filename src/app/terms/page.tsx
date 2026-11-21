import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using FinStep and buying the Pro PDF.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Terms of use</h1>
      <p className="mt-2 text-sm text-muted">Last updated 21 November 2026</p>
      <div className="prose-fin mt-8">
        <h2>Study use only</h2>
        <p>
          FinStep is an educational tool for exam preparation. Results are provided as-is and are not investment, tax or
          trading advice. Always check important figures independently.
        </p>
        <h2>Accuracy</h2>
        <p>
          We test the calculators against published textbook examples, but mistakes are possible. If an answer looks wrong,
          please report it with the feedback form and we will fix it.
        </p>
        <h2>Pro PDF</h2>
        <p>
          The Pro PDF is a one-time digital purchase for personal use. Please don&apos;t redistribute it. If you are not happy,
          contact us within 7 days of purchase for a full refund.
        </p>
        <h2>Trademarks</h2>
        <p>
          FRM® is a trademark of the Global Association of Risk Professionals (GARP). CFA® is a trademark of CFA Institute.
          BA II Plus is a trademark of Texas Instruments. FinStep is not affiliated with or endorsed by any of them.
        </p>
      </div>
    </div>
  );
}
