import type { CalculatorDef, CalcOutput, Step } from "../types";
import { InputError } from "../types";
import { getNum, getOptNum, getStr } from "../inputs";
import { num, pct, plain, tnum } from "../format";

const ASSET_OPTIONS = [
  { value: "none", label: "No income (e.g. non-dividend stock, gold ignoring storage)" },
  { value: "cash", label: "Known cash income (e.g. a dividend)" },
  { value: "yield", label: "Known yield (e.g. stock index)" },
  { value: "fx", label: "Currency (foreign interest rate)" },
  { value: "commodity", label: "Commodity (storage cost & convenience yield)" },
];

export const forwardPrice: CalculatorDef = {
  slug: "forward-futures-price",
  name: "Forward & Futures Price Calculator (Cost of Carry)",
  shortName: "Forward / futures price",
  category: "Derivatives",
  tagline:
    "Fair forward price for stocks, indices, currencies and commodities — with a cash-and-carry arbitrage check.",
  syllabus: "FRM I · Financial Markets & Products · CFA I · Derivatives",
  fields: [
    { id: "type", label: "Underlying asset", kind: "select", defaultValue: "none", options: ASSET_OPTIONS },
    { id: "spot", label: "Spot price S₀", kind: "number", defaultValue: "40", exclusiveMin: 0, max: 1e12 },
    {
      id: "r",
      label: "Risk-free rate (continuous)",
      kind: "percent",
      defaultValue: "5",
      min: -10,
      max: 100,
      unit: "%",
      help: "For a currency forward, this is the domestic rate. Convert discrete rates with the compounding converter first.",
    },
    { id: "T", label: "Time to delivery", kind: "number", defaultValue: "1", exclusiveMin: 0, max: 50, unit: "years" },
    { id: "div", label: "Cash income amount", kind: "number", defaultValue: "2", min: 0, max: 1e12, showIf: (v) => v.type === "cash" },
    {
      id: "divT",
      label: "Income received at",
      kind: "number",
      defaultValue: "0.5",
      exclusiveMin: 0,
      max: 50,
      unit: "years",
      showIf: (v) => v.type === "cash",
    },
    { id: "q", label: "Dividend yield q (continuous)", kind: "percent", defaultValue: "2", min: -10, max: 100, unit: "%", showIf: (v) => v.type === "yield" },
    {
      id: "rf",
      label: "Foreign risk-free rate (continuous)",
      kind: "percent",
      defaultValue: "3",
      min: -10,
      max: 100,
      unit: "%",
      help: "Spot is quoted as domestic currency per 1 unit of foreign currency.",
      showIf: (v) => v.type === "fx",
    },
    { id: "u", label: "Storage cost u (continuous, % of value)", kind: "percent", defaultValue: "1", min: 0, max: 100, unit: "%", showIf: (v) => v.type === "commodity" },
    { id: "cy", label: "Convenience yield y (continuous)", kind: "percent", defaultValue: "0.5", min: 0, max: 100, unit: "%", showIf: (v) => v.type === "commodity" },
    {
      id: "market",
      label: "Quoted forward price (optional)",
      kind: "number",
      defaultValue: "",
      exclusiveMin: 0,
      max: 1e12,
      optional: true,
      help: "Enter a market quote to check for an arbitrage.",
    },
  ],
  presets: [
    { label: "Non-dividend stock: S₀ 40, r 5%, 3 months", values: { type: "none", spot: "40", r: "5", T: "0.25", market: "" } },
    { label: "Stock with a $2 dividend in 6 months", values: { type: "cash", spot: "50", r: "8", T: "1", div: "2", divT: "0.5", market: "" } },
    { label: "Index with 2% yield, mispriced at 1,050", values: { type: "yield", spot: "1000", r: "6", T: "0.5", q: "2", market: "1050" } },
    { label: "USD/INR: domestic 6.5%, foreign 4.5%", values: { type: "fx", spot: "83", r: "6.5", T: "1", rf: "4.5", market: "" } },
  ],
  formulas: [
    { name: "No income", tex: String.raw`F_0 = S_0\,e^{rT}` },
    { name: "Known cash income", tex: String.raw`F_0 = (S_0 - I)\,e^{rT}, \quad I = D\,e^{-r t_D}` },
    { name: "Known yield", tex: String.raw`F_0 = S_0\,e^{(r-q)T}` },
    { name: "Currency (interest rate parity)", tex: String.raw`F_0 = S_0\,e^{(r-r_f)T}` },
    { name: "Commodity", tex: String.raw`F_0 = S_0\,e^{(r+u-y)T}` },
  ],
  compute(inputs): CalcOutput {
    const type = getStr(inputs, "type");
    const S = getNum(inputs, "spot");
    const r = getNum(inputs, "r");
    const T = getNum(inputs, "T");
    const market = getOptNum(inputs, "market");

    let F: number;
    let carry: number; // net continuous carry rate (for the e^x keystroke)
    let base = S; // amount that is grown at the carry rate
    const steps: Step[] = [
      {
        title: "The cost-of-carry idea",
        text: "There are two ways to own the asset at time T: buy it today and hold it, or agree a forward price today and pay at T. Both must cost the same, otherwise traders would buy the cheap route and sell the expensive one. So the forward price = spot price grown at the cost of financing, adjusted for anything the asset pays or costs while you hold it.",
      },
    ];

    switch (type) {
      case "cash": {
        const D = getNum(inputs, "div");
        const tD = getNum(inputs, "divT");
        if (tD > T) {
          throw new InputError("The income must arrive on or before delivery to affect the forward price.", "divT");
        }
        const I = D * Math.exp(-r * tD);
        if (I >= S) throw new InputError("The present value of income cannot exceed the spot price.", "div");
        base = S - I;
        carry = r;
        F = base * Math.exp(r * T);
        steps.push(
          {
            title: "Present value of the income",
            text: "Whoever holds the asset receives the income; the forward buyer does not. So remove its value (in today's money) from the spot price.",
            formula: String.raw`I = D\,e^{-r\,t_D}`,
            working: String.raw`I = ${tnum(D, 4)}\,e^{-${tnum(r, 4)}\times${plain(tD)}} = ${tnum(I, 4)}`,
          },
          {
            title: "Grow the remaining value at the risk-free rate",
            formula: String.raw`F_0 = (S_0 - I)\,e^{rT}`,
            working: String.raw`F_0 = (${tnum(S, 4)} - ${tnum(I, 4)})\,e^{${tnum(r, 4)}\times${plain(T)}} = ${tnum(F, 4)}`,
            text: "",
          },
        );
        break;
      }
      case "yield": {
        const q = getNum(inputs, "q");
        carry = r - q;
        F = S * Math.exp(carry * T);
        steps.push({
          title: "Net carry = financing cost − yield received",
          text: "An index pays dividends continuously at rate q. Holding it costs r to finance but earns q, so the net growth rate is r − q.",
          formula: String.raw`F_0 = S_0\,e^{(r-q)T}`,
          working: String.raw`F_0 = ${tnum(S, 4)}\,e^{(${tnum(r, 4)}-${tnum(q, 4)})\times${plain(T)}} = ${tnum(F, 4)}`,
        });
        break;
      }
      case "fx": {
        const rf = getNum(inputs, "rf");
        carry = r - rf;
        F = S * Math.exp(carry * T);
        steps.push({
          title: "Interest rate parity",
          text: "Holding foreign currency earns the foreign rate rf, just like a dividend yield. If the domestic rate is higher, the foreign currency trades at a forward premium; if lower, at a discount.",
          formula: String.raw`F_0 = S_0\,e^{(r-r_f)T}`,
          working: String.raw`F_0 = ${tnum(S, 4)}\,e^{(${tnum(r, 4)}-${tnum(rf, 4)})\times${plain(T)}} = ${tnum(F, 4)}`,
        });
        break;
      }
      case "commodity": {
        const u = getNum(inputs, "u");
        const cy = getNum(inputs, "cy");
        carry = r + u - cy;
        F = S * Math.exp(carry * T);
        steps.push({
          title: "Add storage, subtract convenience yield",
          text: "Storing a physical commodity costs money (u), which raises the forward price. Holding the physical good can also be useful — e.g. to keep a factory running — and that benefit (the convenience yield y) lowers it.",
          formula: String.raw`F_0 = S_0\,e^{(r+u-y)T}`,
          working: String.raw`F_0 = ${tnum(S, 4)}\,e^{(${tnum(r, 4)}+${tnum(u, 4)}-${tnum(cy, 4)})\times${plain(T)}} = ${tnum(F, 4)}`,
        });
        break;
      }
      default: {
        carry = r;
        F = S * Math.exp(r * T);
        steps.push({
          title: "Grow the spot price at the risk-free rate",
          text: "The asset pays nothing while you hold it, so the only cost of carry is the interest you give up (or pay) to finance it.",
          formula: String.raw`F_0 = S_0\,e^{rT}`,
          working: String.raw`F_0 = ${tnum(S, 4)}\,e^{${tnum(r, 4)}\times${plain(T)}} = ${tnum(F, 4)}`,
        });
      }
    }

    const results = [
      { label: "Fair forward price F₀", value: num(F, 4), primary: true },
      { label: "Basis (S₀ − F₀)", value: num(S - F, 4), hint: F > S ? "Contango: forward above spot" : F < S ? "Backwardation: forward below spot" : "Flat" },
      { label: "Net carry rate", value: pct(carry, 4) },
    ];

    const insights = [
      "Futures and forwards have the same fair price when interest rates are known (FRM assumes this unless told otherwise).",
      "Exam trap: the dividend is removed at its present value, not its face amount.",
    ];

    if (market !== null) {
      const gap = market - F;
      const tol = Math.max(1e-8, F * 1e-9);
      if (gap > tol) {
        results.push({ label: "Arbitrage profit per unit (at T)", value: num(gap, 4), hint: "Cash-and-carry" });
        steps.push({
          title: "Arbitrage check: the quote is too high",
          text: `The market forward (${num(market, 4)}) is above the fair value (${num(F, 4)}). Cash-and-carry arbitrage: borrow ${num(base, 4)} at r, buy the asset today${type === "cash" ? " (using the income to repay part of the loan)" : ""}, and sell it forward at ${num(market, 4)}. At T deliver the asset, repay ${num(F, 4)} and keep the difference.`,
          formula: String.raw`\text{Profit} = F_{mkt} - F_0`,
          working: String.raw`${tnum(market, 4)} - ${tnum(F, 4)} = ${tnum(gap, 4)}`,
        });
      } else if (gap < -tol) {
        results.push({ label: "Arbitrage profit per unit (at T)", value: num(-gap, 4), hint: "Reverse cash-and-carry" });
        steps.push({
          title: "Arbitrage check: the quote is too low",
          text: `The market forward (${num(market, 4)}) is below the fair value (${num(F, 4)}). Reverse cash-and-carry: short the asset today, invest the proceeds at r, and buy forward at ${num(market, 4)}. At T your investment is worth ${num(F, 4)}; pay ${num(market, 4)} for the asset, return it, and keep the difference.`,
          formula: String.raw`\text{Profit} = F_0 - F_{mkt}`,
          working: String.raw`${tnum(F, 4)} - ${tnum(market, 4)} = ${tnum(-gap, 4)}`,
        });
      } else {
        steps.push({ title: "Arbitrage check", text: "The quote equals the fair value, so there is no arbitrage." });
      }
    }

    return {
      results,
      steps: steps.map((s) => ({ ...s, text: s.text || "Plug in the numbers." })),
      keystrokes: [
        {
          title: "BA II Plus — using eˣ",
          lines: [
            { input: `${plain(carry, 8)} × ${plain(T)} =`, keys: [], note: "Exponent (net carry × time)" },
            { keys: ["2ND", "eˣ"], note: `Growth factor ${num(Math.exp(carry * T), 6)}` },
            { input: `× ${plain(base, 6)} =`, keys: [], note: `F₀ = ${num(F, 4)}` },
          ],
        },
      ],
      insights,
    };
  },
};
