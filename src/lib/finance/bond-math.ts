import { InputError } from "./types";
import { bisect, isWhole } from "./math";

export interface BondSpec {
  face: number;
  /** Annual coupon rate as a decimal. */
  couponRate: number;
  years: number;
  /** Coupon payments per year. */
  freq: number;
}

export interface BondTerms extends BondSpec {
  periods: number;
  couponPerPeriod: number;
}

export const MAX_PERIODS = 1200;

/** Validates that the valuation date falls on a coupon date and returns per-period terms. */
export function bondTerms(spec: BondSpec): BondTerms {
  const rawPeriods = spec.years * spec.freq;
  if (!isWhole(rawPeriods, 1e-6)) {
    throw new InputError(
      `Years × payments per year must be a whole number of periods (got ${rawPeriods.toFixed(3)}). ` +
        "This calculator values the bond on a coupon date.",
      "years",
    );
  }
  const periods = Math.round(rawPeriods);
  if (periods < 1) {
    throw new InputError("The bond needs at least one coupon period.", "years");
  }
  if (periods > MAX_PERIODS) {
    throw new InputError(
      `That is ${periods} periods; the maximum supported is ${MAX_PERIODS}.`,
      "years",
    );
  }
  return {
    ...spec,
    periods,
    couponPerPeriod: (spec.face * spec.couponRate) / spec.freq,
  };
}

/** Present value of an annuity of 1 per period for n periods at rate i per period. */
export function annuityFactor(i: number, n: number): number {
  if (Math.abs(i) < 1e-12) return n;
  return (1 - Math.pow(1 + i, -n)) / i;
}

/** Bond price for a periodic yield `i`. */
export function priceAtPeriodicYield(t: BondTerms, i: number): number {
  return (
    t.couponPerPeriod * annuityFactor(i, t.periods) +
    t.face * Math.pow(1 + i, -t.periods)
  );
}

/** Solves for the periodic yield that reproduces `price`. */
export function periodicYieldFromPrice(t: BondTerms, price: number): number {
  const f = (i: number) => priceAtPeriodicYield(t, i) - price;
  const lo = -0.5;
  let hi = 1;
  if (f(lo) < 0) {
    throw new InputError(
      "That price is too high to be consistent with any sensible yield. Check the price and face value.",
      "price",
    );
  }
  while (f(hi) > 0 && hi < 1e6) hi *= 10;
  if (f(hi) > 0) {
    throw new InputError(
      "That price is too low to be consistent with any sensible yield.",
      "price",
    );
  }
  return bisect(f, lo, hi);
}
