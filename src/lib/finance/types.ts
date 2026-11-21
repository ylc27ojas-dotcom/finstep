/**
 * Shared types for every calculator.
 *
 * A calculator is a pure function: it takes validated numeric inputs and
 * returns results, a step-by-step explanation and (where relevant) the
 * BA II Plus keystrokes. Keeping it pure means the same code runs in the
 * browser, in tests and in server-rendered examples.
 */

export type FieldKind = "number" | "percent" | "integer" | "select" | "list";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  id: string;
  label: string;
  kind: FieldKind;
  /** Default value as the user would type it (e.g. "6" for 6%). */
  defaultValue: string;
  min?: number;
  max?: number;
  /** Strict lower bound (value must be > exclusiveMin). */
  exclusiveMin?: number;
  step?: number;
  unit?: string;
  help?: string;
  placeholder?: string;
  options?: SelectOption[];
  /** For `list` fields: each item is a percentage and is converted to a decimal. */
  listOfPercent?: boolean;
  /** For `list` fields: maximum number of items. */
  maxItems?: number;
  /** Optional fields may be left blank; the calculator then skips the metric. */
  optional?: boolean;
  /** Only show (and validate) this field when the predicate is true. */
  showIf?: (values: Record<string, string>) => boolean;
}

/** Parsed inputs handed to `compute`. Blank optional fields become `null`. */
export type Inputs = Record<string, number | string | number[] | null>;

export interface Step {
  title: string;
  /** Plain-language reasoning shown before any formula. */
  text: string;
  /** Symbolic formula in TeX. */
  formula?: string;
  /** The same formula with the numbers substituted, in TeX. */
  working?: string;
}

export interface ResultItem {
  label: string;
  value: string;
  /** Marks the headline answer(s). */
  primary?: boolean;
  hint?: string;
}

export interface KeystrokeBlock {
  title: string;
  /** Each entry is one keystroke line, e.g. ["10", "N"] => type 10, press N. */
  lines: { input?: string; keys: string[]; note?: string }[];
  result?: string;
}

export interface TableData {
  title: string;
  columns: string[];
  rows: string[][];
  caption?: string;
}

export interface CalcOutput {
  results: ResultItem[];
  steps: Step[];
  keystrokes?: KeystrokeBlock[];
  tables?: TableData[];
  /** Exam-style takeaways. */
  insights?: string[];
}

export interface FormulaRef {
  name: string;
  tex: string;
  note?: string;
}

export interface Preset {
  label: string;
  values: Record<string, string>;
}

export type CalculatorCategory =
  | "Fixed income"
  | "Rates"
  | "Derivatives"
  | "Risk"
  | "Portfolio";

export interface CalculatorDef {
  slug: string;
  name: string;
  /** Short name for cards and navigation. */
  shortName: string;
  category: CalculatorCategory;
  /** One-line summary for cards and meta descriptions. */
  tagline: string;
  /** Exam syllabus area, shown as a badge. */
  syllabus: string;
  fields: FieldDef[];
  presets?: Preset[];
  formulas: FormulaRef[];
  compute: (inputs: Inputs) => CalcOutput;
}

/** Thrown by a calculator when inputs are individually valid but jointly impossible. */
export class InputError extends Error {
  constructor(
    message: string,
    public readonly fieldId?: string,
  ) {
    super(message);
    this.name = "InputError";
  }
}
