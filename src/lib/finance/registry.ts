import type { CalculatorDef, CalcOutput } from "./types";
import { InputError } from "./types";
import { parseInputs } from "./inputs";
import { bondPrice } from "./calculators/bond-price";
import { duration } from "./calculators/duration";
import { compounding } from "./calculators/compounding";
import { forwardRates } from "./calculators/forward-rates";
import { forwardPrice } from "./calculators/forward-price";
import { blackScholes } from "./calculators/black-scholes";
import { valueAtRisk } from "./calculators/var";
import { performance } from "./calculators/performance";

/** Display order on the site. */
export const calculators: CalculatorDef[] = [
  bondPrice,
  duration,
  compounding,
  forwardRates,
  forwardPrice,
  blackScholes,
  valueAtRisk,
  performance,
];

export const calculatorSlugs = calculators.map((c) => c.slug);

export function getCalculator(slug: string): CalculatorDef | undefined {
  return calculators.find((c) => c.slug === slug);
}

export type RunResult =
  | { ok: true; output: CalcOutput }
  | { ok: false; fieldErrors: Record<string, string>; message: string };

/**
 * Validates raw inputs and runs the calculator. Never throws: any failure is
 * turned into a message the UI can show next to the right field.
 */
export function runCalculator(def: CalculatorDef, raw: Record<string, string>): RunResult {
  const { inputs, errors } = parseInputs(def, raw);
  if (Object.keys(errors).length > 0) {
    return { ok: false, fieldErrors: errors, message: "Fix the highlighted inputs to see the answer." };
  }
  try {
    const output = def.compute(inputs);
    const bad = output.results.some((r) => r.value === "—" || /NaN|Infinity/.test(r.value));
    if (bad) {
      return { ok: false, fieldErrors: {}, message: "These inputs produce an undefined result. Try less extreme values." };
    }
    return { ok: true, output };
  } catch (err) {
    if (err instanceof InputError) {
      return {
        ok: false,
        fieldErrors: err.fieldId ? { [err.fieldId]: err.message } : {},
        message: err.message,
      };
    }
    return {
      ok: false,
      fieldErrors: {},
      message: "Something went wrong with these inputs. Please check them, or report it with the feedback form.",
    };
  }
}
