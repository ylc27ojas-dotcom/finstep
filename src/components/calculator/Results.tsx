import type { ResultItem } from "@/lib/finance/types";

export function Results({ items }: { items: ResultItem[] }) {
  const primary = items.filter((r) => r.primary);
  const secondary = items.filter((r) => !r.primary);

  return (
    <div className="mt-4">
      <div className={`grid gap-3 ${primary.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {primary.map((r) => (
          <div key={r.label} className="rounded-xl bg-ink px-5 py-4 text-white">
            <p className="text-sm text-white/70">{r.label}</p>
            <p className="tabular mt-1 font-mono text-3xl font-semibold tracking-tight sm:text-[2.1rem]">{r.value}</p>
            {r.hint && <p className="mt-1 text-xs text-white/60">{r.hint}</p>}
          </div>
        ))}
      </div>
      {secondary.length > 0 && (
        <dl className="mt-3 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2">
          {secondary.map((r) => (
            <div key={r.label} className="bg-card px-4 py-3">
              <dt className="text-xs text-muted">{r.label}</dt>
              <dd className="tabular mt-0.5 font-mono text-base font-semibold text-ink">{r.value}</dd>
              {r.hint && <dd className="mt-0.5 text-xs text-muted">{r.hint}</dd>}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
