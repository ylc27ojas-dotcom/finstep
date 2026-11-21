"use client";

import { useState } from "react";
import type { TableData } from "@/lib/finance/types";

const COLLAPSE_AT = 24;
const NUMERIC = /^[-−+]?[\d.,]+%?$/;

export function DataTable({ table }: { table: TableData }) {
  const [expanded, setExpanded] = useState(false);
  const long = table.rows.length > COLLAPSE_AT;
  const rows = long && !expanded ? [...table.rows.slice(0, 12), null, ...table.rows.slice(-4)] : table.rows;

  return (
    <div className="rounded-2xl border border-line bg-card shadow-sm">
      <h2 className="px-5 pt-5 text-sm font-semibold uppercase tracking-wider text-muted sm:px-6">{table.title}</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="tabular w-full text-sm">
          <thead>
            <tr className="border-y border-line bg-paper">
              {table.columns.map((c) => (
                <th key={c} scope="col" className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-ink first:pl-5 sm:first:pl-6">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) =>
              row === null ? (
                <tr key="gap">
                  <td colSpan={table.columns.length} className="px-5 py-2 text-center text-xs text-muted sm:px-6">
                    … {table.rows.length - 16} more rows …
                  </td>
                </tr>
              ) : (
                <tr key={i} className="border-b border-line/70 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className={`whitespace-nowrap px-4 py-2 first:pl-5 sm:first:pl-6 ${j === 0 ? "text-ink" : NUMERIC.test(cell) ? "font-mono text-ink-soft" : "text-muted"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      {(table.caption || long) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-6">
          {table.caption && <p className="text-xs leading-5 text-muted">{table.caption}</p>}
          {long && (
            <button type="button" onClick={() => setExpanded((v) => !v)} className="no-print text-sm font-medium text-accent-ink hover:text-accent">
              {expanded ? "Collapse" : `Show all ${table.rows.length} rows`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
