import Link from "next/link";
import { calculators } from "@/lib/finance/registry";
import { LogoMark } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            <span className="font-semibold">FinStep</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Exam-style finance calculators for FRM and CFA candidates. Every answer shows its working and the BA II Plus
            keystrokes.
          </p>
          <p className="mt-4 text-xs leading-5 text-muted">
            For study purposes only — not investment advice. FRM® and CFA® are trademarks of GARP and CFA Institute, which
            do not endorse this site.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Calculators</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {calculators.map((c) => (
              <li key={c.slug}>
                <Link href={`/calculators/${c.slug}`} className="text-muted hover:text-ink">
                  {c.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">FinStep</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/formula-sheet" className="text-muted hover:text-ink">Formula sheet</Link></li>
            <li><Link href="/blog" className="text-muted hover:text-ink">Study guides</Link></li>
            <li><Link href="/pro" className="text-muted hover:text-ink">Pro PDF pack</Link></li>
            <li><Link href="/feedback" className="text-muted hover:text-ink">Send feedback</Link></li>
            <li><Link href="/privacy" className="text-muted hover:text-ink">Privacy</Link></li>
            <li><Link href="/terms" className="text-muted hover:text-ink">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
          © 2026 FinStep · Built by Ojas Gupta
        </p>
      </div>
    </footer>
  );
}
