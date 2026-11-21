import { describe, expect, it } from "vitest";
import { normCdf, normInv } from "./math";
import { calculators, getCalculator, runCalculator } from "./registry";
import { defaultValues, parseInputs } from "./inputs";
import type { CalcOutput } from "./types";

function run(slug: string, values: Record<string, string>): CalcOutput {
  const def = getCalculator(slug)!;
  const res = runCalculator(def, { ...defaultValues(def), ...values });
  if (!res.ok) throw new Error(`${slug}: ${res.message} ${JSON.stringify(res.fieldErrors)}`);
  return res.output;
}

/** Reads a result by label and converts "1,234.5%" style strings to numbers. */
function value(out: CalcOutput, label: string): number {
  const item = out.results.find((r) => r.label === label);
  if (!item) throw new Error(`No result "${label}" in ${out.results.map((r) => r.label).join(", ")}`);
  return Number(item.value.replace(/[,%]|\s*yrs/g, ""));
}

describe("normal distribution helpers", () => {
  it("matches standard table values", () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 12);
    expect(normCdf(1.96)).toBeCloseTo(0.9750021, 7);
    expect(normCdf(-1.645)).toBeCloseTo(0.0499849, 6);
    expect(normInv(0.95)).toBeCloseTo(1.6448536, 6);
    expect(normInv(0.99)).toBeCloseTo(2.3263479, 6);
    expect(normInv(0.001)).toBeCloseTo(-3.0902323, 6);
  });

  it("normInv is the inverse of normCdf", () => {
    for (const p of [0.0001, 0.01, 0.2, 0.5, 0.7, 0.975, 0.9999]) {
      expect(normCdf(normInv(p))).toBeCloseTo(p, 10);
    }
  });
});

describe("bond price & yield", () => {
  it("prices a 5-year 6% semiannual bond at an 8% yield", () => {
    const out = run("bond-price-yield", { mode: "price", face: "1000", coupon: "6", years: "5", freq: "2", ytm: "8" });
    expect(value(out, "Bond price")).toBeCloseTo(918.89, 2);
  });

  it("prices at par when coupon equals yield", () => {
    const out = run("bond-price-yield", { mode: "price", face: "100", coupon: "7", years: "10", freq: "2", ytm: "7" });
    expect(value(out, "Bond price")).toBeCloseTo(100, 8);
  });

  it("recovers the yield from the price", () => {
    const out = run("bond-price-yield", { mode: "yield", face: "1000", coupon: "6", years: "5", freq: "2", price: "918.891" });
    expect(value(out, "Yield to maturity")).toBeCloseTo(8, 3);
  });

  it("rejects fractional periods with a clear message", () => {
    const def = getCalculator("bond-price-yield")!;
    const res = runCalculator(def, { ...defaultValues(def), years: "2.3", freq: "2" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors.years).toMatch(/whole number/);
  });
});

describe("duration & convexity", () => {
  it("matches the textbook 3-year 10% annual bond", () => {
    const out = run("duration-convexity", { face: "100", coupon: "10", years: "3", freq: "1", ytm: "10", shift: "100" });
    expect(value(out, "Bond price")).toBeCloseTo(100, 6);
    expect(value(out, "Macaulay duration")).toBeCloseTo(2.7355, 4);
    expect(value(out, "Modified duration")).toBeCloseTo(2.4869, 4);
    expect(value(out, "Convexity")).toBeCloseTo(8.7562, 3);
    expect(value(out, "DV01")).toBeCloseTo(0.0249, 4);
  });

  it("gives a zero-coupon bond a duration equal to its maturity", () => {
    const out = run("duration-convexity", { face: "100", coupon: "0", years: "10", freq: "1", ytm: "5", shift: "10" });
    expect(value(out, "Macaulay duration")).toBeCloseTo(10, 8);
  });
});

describe("compounding converter", () => {
  it("converts 10% semiannual to continuous", () => {
    const out = run("compounding-converter", { rate: "10", from: "2", to: "cont" });
    expect(value(out, "Effective annual rate (EAR)")).toBeCloseTo(10.25, 4);
    expect(value(out, "Equivalent continuous rate")).toBeCloseTo(9.758, 3);
  });

  it("converts 8% continuous to annual", () => {
    const out = run("compounding-converter", { rate: "8", from: "cont", to: "1" });
    expect(value(out, "Equivalent annual rate")).toBeCloseTo(8.3287, 4);
  });
});

describe("spot & forward rates", () => {
  it("computes the 1y1y forward from 5% and 6% spots", () => {
    const out = run("spot-forward-rates", { spots: "5, 6", comp: "annual", from: "1", to: "2" });
    expect(value(out, "Forward rate f(1, 2)")).toBeCloseTo(7.0095, 4);
  });

  it("uses the additive rule for continuous rates", () => {
    const out = run("spot-forward-rates", { spots: "5, 6", comp: "cont", from: "1", to: "2" });
    expect(value(out, "Forward rate f(1, 2)")).toBeCloseTo(7, 8);
  });

  it("flags a forward that ends beyond the curve", () => {
    const def = getCalculator("spot-forward-rates")!;
    const res = runCalculator(def, { ...defaultValues(def), spots: "5, 6", to: "5" });
    expect(res.ok).toBe(false);
  });
});

describe("forward pricing", () => {
  it("prices a forward on a non-dividend stock", () => {
    const out = run("forward-futures-price", { type: "none", spot: "40", r: "5", T: "0.25", market: "" });
    expect(value(out, "Fair forward price F₀")).toBeCloseTo(40.5031, 4);
  });

  it("subtracts the present value of a dividend", () => {
    const out = run("forward-futures-price", { type: "cash", spot: "50", r: "8", T: "1", div: "2", divT: "0.5", market: "" });
    const expected = (50 - 2 * Math.exp(-0.04)) * Math.exp(0.08);
    expect(value(out, "Fair forward price F₀")).toBeCloseTo(expected, 4);
  });

  it("detects cash-and-carry arbitrage", () => {
    const out = run("forward-futures-price", { type: "yield", spot: "1000", r: "6", T: "0.5", q: "2", market: "1050" });
    const fair = 1000 * Math.exp(0.04 * 0.5);
    expect(value(out, "Arbitrage profit per unit (at T)")).toBeCloseTo(1050 - fair, 4);
  });
});

describe("Black-Scholes-Merton", () => {
  it("matches Hull's example (S=42, K=40, T=0.5, r=10%, σ=20%)", () => {
    const out = run("black-scholes-greeks", { S: "42", K: "40", T: "0.5", r: "10", sigma: "20", q: "0" });
    expect(value(out, "Call price")).toBeCloseTo(4.7594, 3);
    expect(value(out, "Put price")).toBeCloseTo(0.8086, 3);
    expect(value(out, "d₁")).toBeCloseTo(0.7693, 4);
    expect(value(out, "d₂")).toBeCloseTo(0.6278, 4);
  });

  it("satisfies put-call parity with a dividend yield", () => {
    const out = run("black-scholes-greeks", { S: "1000", K: "1050", T: "0.25", r: "6", sigma: "18", q: "3" });
    const c = value(out, "Call price");
    const p = value(out, "Put price");
    expect(c - p).toBeCloseTo(1000 * Math.exp(-0.03 * 0.25) - 1050 * Math.exp(-0.06 * 0.25), 3);
  });
});

describe("value at risk", () => {
  it("computes 10-day 99% VaR and 1-day ES for a $1m position", () => {
    const out = run("value-at-risk", { mode: "single", period: "daily", conf: "99", horizon: "10", value: "1000000", sigma: "1", mu: "0" });
    expect(value(out, "10-day VaR (99.0%)")).toBeCloseTo(73565.6, 0);
    expect(value(out, "1-day VaR")).toBeCloseTo(23263.48, 1);
    expect(value(out, "Expected shortfall")).toBeCloseTo(26652.142 * Math.sqrt(10), 0);
  });

  it("gives the diversification benefit for two assets", () => {
    const out = run("value-at-risk", { mode: "portfolio", period: "daily", conf: "95", horizon: "1", valueA: "100", sigmaA: "10", valueB: "100", sigmaB: "10", rho: "1" });
    expect(value(out, "Diversification benefit")).toBeCloseTo(0, 6);
  });
});

describe("risk-adjusted performance", () => {
  it("computes Sharpe, Treynor, Jensen and M²", () => {
    const out = run("sharpe-treynor-jensen", { rp: "12", rf: "4", sp: "20", beta: "1.2", rm: "10", sm: "15", rb: "", te: "", dd: "" });
    expect(value(out, "Sharpe ratio")).toBeCloseTo(0.4, 8);
    expect(value(out, "Treynor ratio")).toBeCloseTo(6.6667, 4);
    expect(value(out, "Jensen's alpha")).toBeCloseTo(0.8, 8);
    expect(value(out, "M² (Modigliani)")).toBeCloseTo(10, 8);
  });
});

describe("input handling", () => {
  it("accepts commas and percent signs", () => {
    const def = getCalculator("bond-price-yield")!;
    const { inputs, errors } = parseInputs(def, { ...defaultValues(def), face: "1,000", coupon: "6%" });
    expect(errors).toEqual({});
    expect(inputs.face).toBe(1000);
    expect(inputs.coupon).toBeCloseTo(0.06, 12);
  });

  it("reports required and invalid fields", () => {
    const def = getCalculator("black-scholes-greeks")!;
    const res = runCalculator(def, { ...defaultValues(def), S: "", sigma: "abc" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.fieldErrors.S).toBe("Required");
      expect(res.fieldErrors.sigma).toBe("Enter a number");
    }
  });

  it("never throws, whatever the user types", () => {
    const junk = ["", "0", "-1", "1e308", "NaN", "abc", "9999999", "0.0000001", "-0", "1,2,3"];
    for (const def of calculators) {
      for (const field of def.fields) {
        for (const j of junk) {
          const raw = { ...defaultValues(def), [field.id]: j };
          expect(() => runCalculator(def, raw)).not.toThrow();
        }
      }
    }
  });

  it("runs every preset and default without errors", () => {
    for (const def of calculators) {
      const base = runCalculator(def, defaultValues(def));
      expect(base.ok, `${def.slug} defaults`).toBe(true);
      for (const preset of def.presets ?? []) {
        const res = runCalculator(def, { ...defaultValues(def), ...preset.values });
        expect(res.ok, `${def.slug} preset ${preset.label}`).toBe(true);
      }
    }
  });
});
