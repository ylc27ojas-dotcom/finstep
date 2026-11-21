import type { CalculatorDef, FieldDef, Inputs } from "./types";

/** Reads a required numeric input (already validated by `parseInputs`). */
export function getNum(inputs: Inputs, id: string): number {
  const v = inputs[id];
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new Error(`Missing numeric input "${id}"`);
  }
  return v;
}

/** Reads an optional numeric input; blank optional fields are null. */
export function getOptNum(inputs: Inputs, id: string): number | null {
  const v = inputs[id];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function getStr(inputs: Inputs, id: string): string {
  const v = inputs[id];
  if (typeof v !== "string") throw new Error(`Missing select input "${id}"`);
  return v;
}

export function getList(inputs: Inputs, id: string): number[] {
  const v = inputs[id];
  if (!Array.isArray(v)) throw new Error(`Missing list input "${id}"`);
  return v;
}

export function isVisible(field: FieldDef, raw: Record<string, string>): boolean {
  return field.showIf ? field.showIf(raw) : true;
}

/** Default raw values for a calculator, as the user would type them. */
export function defaultValues(def: CalculatorDef): Record<string, string> {
  return Object.fromEntries(def.fields.map((f) => [f.id, f.defaultValue]));
}

function parseNumber(text: string): number {
  // Accept "1,000", " 6 ", "6%" — common ways people type numbers.
  const cleaned = text.replace(/[,\s%]/g, "");
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return NaN;
  return Number(cleaned);
}

function rangeError(field: FieldDef, x: number): string | null {
  const unit = field.kind === "percent" ? "%" : field.unit ? ` ${field.unit}` : "";
  if (field.exclusiveMin !== undefined && !(x > field.exclusiveMin)) {
    return `Must be greater than ${field.exclusiveMin}${unit}`;
  }
  if (field.min !== undefined && x < field.min) {
    return `Must be at least ${field.min}${unit}`;
  }
  if (field.max !== undefined && x > field.max) {
    return `Must be at most ${field.max}${unit}`;
  }
  return null;
}

export interface ParseResult {
  inputs: Inputs;
  errors: Record<string, string>;
}

/**
 * Validates raw text inputs against the field definitions and converts them
 * to numbers (percentages become decimals). Hidden fields are ignored.
 */
export function parseInputs(
  def: CalculatorDef,
  raw: Record<string, string>,
): ParseResult {
  const inputs: Inputs = {};
  const errors: Record<string, string> = {};

  for (const field of def.fields) {
    const text = (raw[field.id] ?? "").trim();

    if (!isVisible(field, raw)) {
      inputs[field.id] = null;
      continue;
    }

    if (field.kind === "select") {
      const ok = field.options?.some((o) => o.value === text);
      if (!ok) errors[field.id] = "Choose one of the options";
      else inputs[field.id] = text;
      continue;
    }

    if (text === "") {
      if (field.optional) inputs[field.id] = null;
      else errors[field.id] = "Required";
      continue;
    }

    if (field.kind === "list") {
      const parts = text.split(/[,;\s]+/).filter(Boolean);
      if (parts.length === 0) {
        errors[field.id] = "Enter at least one value";
        continue;
      }
      if (field.maxItems && parts.length > field.maxItems) {
        errors[field.id] = `Enter at most ${field.maxItems} values`;
        continue;
      }
      const values: number[] = [];
      let bad: string | null = null;
      for (const p of parts) {
        const x = parseNumber(p);
        if (!Number.isFinite(x)) {
          bad = `"${p}" is not a number`;
          break;
        }
        const r = rangeError(field, x);
        if (r) {
          bad = `${p}: ${r.toLowerCase()}`;
          break;
        }
        values.push(field.listOfPercent ? x / 100 : x);
      }
      if (bad) errors[field.id] = bad;
      else inputs[field.id] = values;
      continue;
    }

    const x = parseNumber(text);
    if (!Number.isFinite(x)) {
      errors[field.id] = "Enter a number";
      continue;
    }
    if (field.kind === "integer" && !Number.isInteger(x)) {
      errors[field.id] = "Enter a whole number";
      continue;
    }
    const r = rangeError(field, x);
    if (r) {
      errors[field.id] = r;
      continue;
    }
    inputs[field.id] = field.kind === "percent" ? x / 100 : x;
  }

  return { inputs, errors };
}
