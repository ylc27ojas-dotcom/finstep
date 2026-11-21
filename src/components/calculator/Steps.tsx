import type { Step } from "@/lib/finance/types";
import { Tex } from "@/components/Tex";

export function Steps({ steps }: { steps: Step[] }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Step-by-step working</h2>
      <ol className="mt-5">
        {steps.map((s, i) => (
          <li key={`${i}-${s.title}`} className="relative pb-7 pl-11 last:pb-0">
            {i < steps.length - 1 && <span aria-hidden="true" className="absolute left-[0.95rem] top-8 bottom-0 w-px bg-line" />}
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-accent/30 bg-accent-soft font-mono text-sm font-semibold text-accent-ink"
            >
              {i + 1}
            </span>
            <h3 className="pt-1 text-[1.02rem] font-semibold text-ink">{s.title}</h3>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">{s.text}</p>
            {s.formula && (
              <div className="mt-3 rounded-lg border border-line bg-paper px-3 text-ink">
                <Tex tex={s.formula} block />
              </div>
            )}
            {s.working && (
              <div className="mt-2 rounded-lg border border-accent/20 bg-accent-soft/60 px-3 text-ink">
                <Tex tex={s.working} block />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
