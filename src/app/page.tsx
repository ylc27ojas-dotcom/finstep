import Link from "next/link";
import { calculators } from "@/lib/finance/registry";
import { posts } from "@/content/posts";
import { Keycap } from "@/components/Keycap";
import { Tex } from "@/components/Tex";
import { JsonLd } from "@/components/JsonLd";
import { SolvedCounter } from "@/components/SolvedCounter";
import { pro } from "@/lib/site";

const FAQS = [
  {
    q: "Is FinStep free?",
    a: "Yes. Every calculator, the formula sheet and the study guides are free and need no sign-up. An optional printable PDF pack supports the project.",
  },
  {
    q: "Which exams does it cover?",
    a: "The calculators follow FRM Part I (Valuation & Risk Models, Financial Markets & Products, Quantitative Analysis, Foundations of Risk Management) and the matching CFA Level I topics in fixed income, derivatives, quant and portfolio management.",
  },
  {
    q: "Why show BA II Plus keystrokes?",
    a: "Both GARP and CFA Institute allow the Texas Instruments BA II Plus in the exam room, and most candidates use it. Seeing the exact keys for each problem turns a formula you understand into marks on exam day.",
  },
  {
    q: "How accurate are the answers?",
    a: "Each calculator is tested against published textbook examples (for instance Hull's Black-Scholes example and standard duration examples). N(d) is computed exactly, so answers may differ from table look-ups in the third decimal.",
  },
  {
    q: "Do you store what I type?",
    a: "No. Calculations run in your browser. We only count how many problems are solved per calculator, with no inputs or personal data attached.",
  },
];

const FEATURES = [
  {
    title: "Logic before formulas",
    body: "Each step starts with the reasoning in plain English — why the bond trades at a discount, why volatility scales with √t — then the formula, then your numbers plugged in.",
    icon: (
      <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" />
    ),
  },
  {
    title: "Exact BA II Plus keystrokes",
    body: "Every time-value problem comes with the key sequence for the calculator you'll use in the exam, including the settings mistakes that cost marks.",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Share a solved problem",
    body: "Every input lives in the URL. Send your study group a link and they see the same question, the same answer and the same working.",
    icon: (
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" strokeLinecap="round" />
    ),
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="grid-paper relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              For FRM Part I & CFA Level I candidates
            </p>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Finance calculators that <span className="text-accent">show their working</span>.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted">
              Bond pricing, duration, forward rates, Black-Scholes, VaR and more. Every answer comes with the reasoning, the
              formula, your numbers plugged in and the exact BA II Plus keystrokes — so you learn the method, not just the
              number.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/calculators/bond-price-yield"
                className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ink-soft"
              >
                Solve a problem now
              </Link>
              <Link
                href="/calculators"
                className="rounded-xl border border-line-strong bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white"
              >
                See all 8 calculators
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted">
              Free · No sign-up · Works on your phone
              <SolvedCounter />
            </p>
          </div>

          {/* Worked-solution preview */}
          <div className="relative">
            <div className="rounded-2xl border border-line bg-card p-5 shadow-[0_20px_60px_-25px_rgb(11_18_32/0.35)] sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Bond price · worked solution</p>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.7rem] font-medium text-accent-ink">FRM I · VRM</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                5-year bond, face 1,000, 6% coupon paid semiannually, yield 8%.
              </p>
              <div className="mt-4 rounded-xl bg-ink px-4 py-3 text-white">
                <p className="text-xs text-white/60">Bond price</p>
                <p className="tabular font-mono text-3xl font-semibold">918.89</p>
              </div>
              <ol className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent-ink">1</span>
                  <span className="text-ink-soft">
                    Coupon 6% &lt; yield 8%, so the price must be <strong className="text-ink">below par</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent-ink">2</span>
                  <span className="min-w-0 flex-1 text-ink-soft">
                    Discount 10 coupons of 30 and the face value at 4% per period:
                    <span className="mt-1 block rounded-lg bg-paper px-2">
                      <Tex tex={String.raw`P = 30\cdot\frac{1-1.04^{-10}}{0.04} + \frac{1000}{1.04^{10}}`} block />
                    </span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-soft font-mono text-xs font-semibold text-accent-ink">3</span>
                  <span className="text-ink-soft">On the BA II Plus:</span>
                </li>
              </ol>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-2 rounded-xl bg-[#1b1d21] p-3 font-mono text-sm text-[#9fe3cf]">
                10 <Keycap label="N" /> 4 <Keycap label="I/Y" /> 30 <Keycap label="PMT" /> 1000 <Keycap label="FV" /> <Keycap label="CPT" />
                <Keycap label="PV" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage strip */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-5 text-sm text-muted sm:px-6">
          <span className="w-full text-center font-medium text-ink sm:w-auto">Covers</span>
          <span>Valuation & Risk Models</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>Financial Markets & Products</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>Quantitative Analysis</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span>Foundations of Risk Management</span>
        </div>
      </section>

      {/* Calculators */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Eight calculators for the questions that cost the most time</h2>
          <p className="mt-3 text-lg text-muted">Each one is built around how the exam asks the question, not how a spreadsheet would.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {calculators.map((c) => (
            <Link
              key={c.slug}
              href={`/calculators/${c.slug}`}
              className="group flex flex-col rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_30px_-18px_rgb(11_18_32/0.4)]"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink">{c.category}</span>
              <span className="mt-2 font-semibold leading-snug text-ink">{c.shortName}</span>
              <span className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{c.tagline}</span>
              <span className="mt-auto pt-4 text-sm font-medium text-ink group-hover:text-accent-ink">
                Open <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  {f.icon}
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Study guides</h2>
            <p className="mt-2 text-lg text-muted">Plain-English walkthroughs with fully worked numbers.</p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-accent-ink hover:text-accent">
            All guides →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="rounded-2xl border border-line bg-card p-5 transition-colors hover:border-accent/40">
              <span className="text-xs text-muted">{p.readMinutes} min read</span>
              <span className="mt-2 block font-semibold leading-snug text-ink">{p.title}</span>
              <span className="mt-2 line-clamp-3 block text-sm leading-relaxed text-muted">{p.description}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Pro CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-ink px-6 py-10 text-white sm:px-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9fe3cf]">FinStep Pro PDF</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">The whole formula sheet and keystroke guide, printable.</h2>
            <p className="mt-3 max-w-lg text-white/70">
              Every formula from the calculators plus BA II Plus key sequences on a few clean pages for your last week of
              revision.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <span className="font-mono text-3xl font-semibold">{pro.priceLabel}</span>
            <Link href="/pro" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent-soft">
              See what&apos;s inside
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-6">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Questions</h2>
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-card">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <span aria-hidden="true" className="text-xl text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
