"use client";

export function PrintButton({ label = "Print / save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-xl border border-line-strong bg-card px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white"
    >
      {label}
    </button>
  );
}
