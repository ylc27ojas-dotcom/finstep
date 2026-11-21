"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getCalculator, runCalculator } from "@/lib/finance/registry";
import { defaultValues, isVisible } from "@/lib/finance/inputs";
import type { CalculatorDef, FieldDef } from "@/lib/finance/types";
import { Results } from "./Results";
import { Steps } from "./Steps";
import { Keystrokes } from "./Keystrokes";
import { DataTable } from "./DataTable";

const MAX_PARAM_LENGTH = 200;

function readParams(def: CalculatorDef): Record<string, string> | null {
  const params = new URLSearchParams(window.location.search);
  let found = false;
  const next = defaultValues(def);
  for (const f of def.fields) {
    const v = params.get(f.id);
    if (v !== null) {
      next[f.id] = v.slice(0, MAX_PARAM_LENGTH);
      found = true;
    }
  }
  return found ? next : null;
}

function buildQuery(def: CalculatorDef, values: Record<string, string>): string {
  const params = new URLSearchParams();
  for (const f of def.fields) {
    if (isVisible(f, values)) params.set(f.id, values[f.id] ?? "");
  }
  return params.toString();
}

export function CalculatorView({ slug }: { slug: string }) {
  const def = getCalculator(slug);
  if (!def) throw new Error(`Unknown calculator: ${slug}`);
  return <CalculatorInner def={def} />;
}

function CalculatorInner({ def }: { def: CalculatorDef }) {
  const [values, setValues] = useState<Record<string, string>>(() => defaultValues(def));
  const [interacted, setInteracted] = useState(false);
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);
  const pinged = useRef(false);

  // Restore inputs from a shared link once, after hydration.
  useEffect(() => {
    const fromUrl = readParams(def);
    if (fromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
      setValues(fromUrl);
      setInteracted(true);
    }
  }, [def]);

  const result = useMemo(() => runCalculator(def, values), [def, values]);

  // Keep the URL in sync so any state can be shared.
  useEffect(() => {
    if (!interacted) return;
    const t = window.setTimeout(() => {
      const query = buildQuery(def, values);
      window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
    }, 350);
    return () => window.clearTimeout(t);
  }, [def, values, interacted]);

  // Count one "problem solved" per page view, once the user has actually used the calculator.
  useEffect(() => {
    if (!interacted || !result.ok || pinged.current) return;
    const t = window.setTimeout(() => {
      pinged.current = true;
      fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: def.slug }),
        keepalive: true,
      }).catch(() => {
        /* analytics must never break the calculator */
      });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [interacted, result.ok, def.slug]);

  const update = (id: string, value: string) => {
    setInteracted(true);
    setValues((v) => ({ ...v, [id]: value }));
  };

  const applyPreset = (preset: Record<string, string>) => {
    setInteracted(true);
    setValues({ ...defaultValues(def), ...preset });
  };

  const reset = () => {
    setValues(defaultValues(def));
    setInteracted(false);
    window.history.replaceState(null, "", window.location.pathname);
  };

  const flash = (kind: "link" | "summary") => {
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  };

  const shareUrl = () => `${window.location.origin}${window.location.pathname}?${buildQuery(def, values)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      flash("link");
    } catch {
      window.prompt("Copy this link:", shareUrl());
    }
  };

  const copySummary = async () => {
    if (!result.ok) return;
    const lines = [
      def.name,
      ...def.fields
        .filter((f) => isVisible(f, values) && values[f.id] !== "")
        .map((f) => `${f.label}: ${displayValue(f, values[f.id])}`),
      "",
      ...result.output.results.map((r) => `${r.label}: ${r.value}`),
      "",
      `Full working: ${shareUrl()}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      flash("summary");
    } catch {
      /* clipboard blocked; nothing else to do */
    }
  };

  const visibleFields = def.fields.filter((f) => isVisible(f, values));
  const fieldErrors = result.ok ? {} : result.fieldErrors;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,370px)_minmax(0,1fr)]">
      {/* Inputs */}
      <section aria-labelledby="inputs-heading" className="rounded-2xl border border-line bg-card p-5 shadow-sm lg:sticky lg:top-20">
        <div className="flex items-center justify-between">
          <h2 id="inputs-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
            Inputs
          </h2>
          <button type="button" onClick={reset} className="no-print text-sm font-medium text-muted hover:text-ink">
            Reset
          </button>
        </div>

        {def.presets && def.presets.length > 0 && (
          <div className="no-print mt-4">
            <p className="text-xs font-medium text-muted">Try an example</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {def.presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.values)}
                  className="rounded-full border border-line bg-paper px-3 py-1.5 text-left text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:bg-accent-soft"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form className="mt-5 space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
          {visibleFields.map((f) => (
            <Field key={f.id} field={f} value={values[f.id] ?? ""} error={fieldErrors[f.id]} onChange={(v) => update(f.id, v)} />
          ))}
        </form>
      </section>

      {/* Output */}
      <section aria-labelledby="results-heading" aria-live="polite" className="print-full min-w-0 space-y-6">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="results-heading" className="text-sm font-semibold uppercase tracking-wider text-muted">
              Answer
            </h2>
            <div className="no-print flex flex-wrap gap-2">
              <ActionButton onClick={copyLink} disabled={!result.ok}>
                {copied === "link" ? "Link copied ✓" : "Share link"}
              </ActionButton>
              <ActionButton onClick={copySummary} disabled={!result.ok}>
                {copied === "summary" ? "Copied ✓" : "Copy answer"}
              </ActionButton>
              <ActionButton onClick={() => window.print()} disabled={!result.ok}>
                Print
              </ActionButton>
            </div>
          </div>

          {result.ok ? (
            <Results items={result.output.results} />
          ) : (
            <div role="alert" className="mt-4 rounded-xl border border-tip/20 bg-tip-soft px-4 py-3 text-sm text-ink">
              {result.message}
            </div>
          )}
        </div>

        {result.ok && (
          <>
            <Steps steps={result.output.steps} />

            {result.output.keystrokes?.map((k) => (
              <Keystrokes key={k.title} block={k} />
            ))}

            {result.output.tables?.map((t) => (
              <DataTable key={t.title} table={t} />
            ))}

            {result.output.insights && result.output.insights.length > 0 && (
              <div className="rounded-2xl border border-tip/20 bg-tip-soft p-5 sm:p-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-tip">
                  <span aria-hidden="true">★</span> Exam takeaways
                </h3>
                <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed text-ink">
                  {result.output.insights.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-tip" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function displayValue(f: FieldDef, raw: string): string {
  if (f.kind === "select") return f.options?.find((o) => o.value === raw)?.label ?? raw;
  if (f.kind === "percent") return `${raw}%`;
  return f.unit ? `${raw} ${f.unit}` : raw;
}

function ActionButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function Field({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = `field-${field.id}`;
  const describedBy = error ? `${id}-error` : field.help ? `${id}-help` : undefined;
  const suffix = field.kind === "percent" ? "%" : field.unit;
  const base =
    "w-full rounded-xl border bg-paper px-3.5 py-2.5 text-[0.95rem] text-ink transition-colors placeholder:text-muted/60 focus:bg-white focus:outline-none focus:ring-2";
  const state = error ? "border-danger/60 focus:ring-danger/20" : "border-line focus:border-accent focus:ring-accent/15";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium text-ink">
        <span>{field.label}</span>
        {field.optional && <span className="text-xs font-normal text-muted">optional</span>}
      </label>
      {field.kind === "select" ? (
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`${base} ${state} appearance-none pr-10`}
          >
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M5.5 7.5l4.5 4.5 4.5-4.5" />
          </svg>
        </div>
      ) : (
        <div className="relative">
          <input
            id={id}
            type="text"
            inputMode={field.kind === "list" ? "text" : "decimal"}
            autoComplete="off"
            spellCheck={false}
            value={value}
            placeholder={field.placeholder ?? (field.optional ? "Leave blank to skip" : undefined)}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`${base} ${state} tabular font-mono ${suffix ? "pr-14" : ""}`}
          />
          {suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted">{suffix}</span>
          )}
        </div>
      )}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : field.help ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs leading-5 text-muted">
          {field.help}
        </p>
      ) : null}
    </div>
  );
}
