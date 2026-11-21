import type { KeystrokeBlock } from "@/lib/finance/types";
import { Keycap } from "@/components/Keycap";

export function Keystrokes({ block }: { block: KeystrokeBlock }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[#1b1d21] text-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80">{block.title}</h2>
        <span className="hidden font-mono text-[0.7rem] uppercase tracking-widest text-white/40 sm:inline">Texas Instruments BA II Plus</span>
      </div>
      <ol className="divide-y divide-white/5 px-5 sm:px-6">
        {block.lines.map((line, i) => (
          <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5">
            <span className="w-5 flex-none font-mono text-xs text-white/35">{i + 1}</span>
            {line.input && <span className="tabular font-mono text-[0.95rem] text-[#9fe3cf]">{line.input}</span>}
            {line.keys.length > 0 && (
              <span className="flex flex-wrap gap-1.5">
                {line.keys.map((k, j) => (
                  <Keycap key={j} label={k} />
                ))}
              </span>
            )}
            {line.note && <span className="w-full pl-8 text-xs text-white/55 sm:ml-auto sm:w-auto sm:pl-0 sm:text-right">{line.note}</span>}
          </li>
        ))}
      </ol>
      {block.result && (
        <p className="border-t border-white/10 bg-white/5 px-5 py-3 font-mono text-sm text-[#9fe3cf] sm:px-6">{block.result}</p>
      )}
    </div>
  );
}
