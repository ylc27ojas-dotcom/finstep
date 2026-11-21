import type { CalculatorDef, CalcOutput, KeystrokeBlock } from "../types";
import { getNum, getOptNum, getStr } from "../inputs";
import { num, pct, plain, tnum, tpct } from "../format";

const COMP_OPTIONS = [
  { value: "1", label: "Annual" },
  { value: "2", label: "Semiannual" },
  { value: "4", label: "Quarterly" },
  { value: "12", label: "Monthly" },
  { value: "52", label: "Weekly" },
  { value: "365", label: "Daily (365)" },
  { value: "cont", label: "Continuous" },
];

const label = (v: string) => COMP_OPTIONS.find((o) => o.value === v)?.label.toLowerCase() ?? v;

/** Growth of 1 unit over one year at stated rate R compounded per `freq`. */
function growth(rate: number, freq: string): number {
  return freq === "cont" ? Math.exp(rate) : Math.pow(1 + rate / Number(freq), Number(freq));
}

/** Stated annual rate with compounding `freq` that produces one-year growth `g`. */
function rateFor(g: number, freq: string): number {
  return freq === "cont" ? Math.log(g) : Number(freq) * (Math.pow(g, 1 / Number(freq)) - 1);
}

function growthTex(rate: number, freq: string): string {
  return freq === "cont"
    ? String.raw`e^{${tnum(rate, 6)}}`
    : String.raw`\left(1 + \frac{${tnum(rate, 6)}}{${freq}}\right)^{${freq}}`;
}

export const compounding: CalculatorDef = {
  slug: "compounding-converter",
  name: "Compounding Converter (Continuous ↔ Discrete) & EAR Calculator",
  shortName: "Compounding converter",
  category: "Rates",
  tagline:
    "Convert any rate between annual, semiannual, monthly, daily and continuous compounding — reasoning from growth, not memorised formulas.",
  syllabus: "FRM I · Quantitative Analysis & Products · CFA I · Quant",
  fields: [
    { id: "rate", label: "Stated annual rate", kind: "percent", defaultValue: "10", min: -50, max: 500, unit: "%" },
    { id: "from", label: "Compounded", kind: "select", defaultValue: "2", options: COMP_OPTIONS },
    { id: "to", label: "Convert to", kind: "select", defaultValue: "cont", options: COMP_OPTIONS },
    {
      id: "principal",
      label: "Amount invested (optional)",
      kind: "number",
      defaultValue: "100",
      min: 0,
      max: 1e15,
      optional: true,
      help: "Leave blank to skip the future value.",
    },
    { id: "years", label: "Years invested", kind: "number", defaultValue: "1", min: 0, max: 200, unit: "years", optional: true },
  ],
  presets: [
    { label: "10% semiannual → continuous", values: { rate: "10", from: "2", to: "cont", principal: "100", years: "1" } },
    { label: "8% continuous → annual", values: { rate: "8", from: "cont", to: "1", principal: "100", years: "1" } },
    { label: "12% monthly → quarterly", values: { rate: "12", from: "12", to: "4", principal: "1000", years: "3" } },
  ],
  formulas: [
    { name: "One-year growth", tex: String.raw`g = \left(1+\frac{R_m}{m}\right)^{m} \quad\text{or}\quad g = e^{R_c}` },
    { name: "Effective annual rate", tex: String.raw`\text{EAR} = g - 1` },
    { name: "Discrete → continuous", tex: String.raw`R_c = m\,\ln\!\left(1+\frac{R_m}{m}\right)` },
    { name: "Continuous → discrete", tex: String.raw`R_m = m\left(e^{R_c/m}-1\right)` },
  ],
  compute(inputs): CalcOutput {
    const rate = getNum(inputs, "rate");
    const from = getStr(inputs, "from");
    const to = getStr(inputs, "to");
    const principal = getOptNum(inputs, "principal");
    const years = getOptNum(inputs, "years");

    if (from !== "cont" && rate / Number(from) <= -1) {
      throw new Error("Rate per period must be above -100%");
    }

    const g = growth(rate, from);
    const ear = g - 1;
    const target = rateFor(g, to);
    const check = growth(target, to);

    const steps = [
      {
        title: "What does 1 grow to in one year?",
        text: `Start from the logic, not a formula. At ${pct(rate, 4)} compounded ${label(from)}, one unit of money grows to g after a year. This growth factor is the thing both rates must agree on.`,
        formula:
          from === "cont" ? String.raw`g = e^{R}` : String.raw`g = \left(1+\frac{R}{m}\right)^{m}`,
        working: String.raw`g = ${growthTex(rate, from)} = ${tnum(g, 8)}`,
      },
      {
        title: "Effective annual rate",
        text: "Strip off the original unit: whatever is left is the true one-year return, including interest on interest.",
        formula: String.raw`\text{EAR} = g - 1`,
        working: String.raw`\text{EAR} = ${tnum(g, 8)} - 1 = ${tpct(ear, 4)}`,
      },
      {
        title: `Find the ${label(to)} rate that gives the same growth`,
        text:
          to === "cont"
            ? "With continuous compounding, growth is e^R. Set e^R equal to g and take the natural log of both sides."
            : `With ${label(to)} compounding (m = ${to}), growth is (1 + R/m)^m. Set it equal to g, take the m-th root, subtract 1 and multiply by m.`,
        formula:
          to === "cont"
            ? String.raw`e^{R'} = g \;\Rightarrow\; R' = \ln g`
            : String.raw`\left(1+\frac{R'}{${to}}\right)^{${to}} = g \;\Rightarrow\; R' = ${to}\left(g^{1/${to}} - 1\right)`,
        working:
          to === "cont"
            ? String.raw`R' = \ln(${tnum(g, 8)}) = ${tpct(target, 4)}`
            : String.raw`R' = ${to}\left(${tnum(g, 8)}^{1/${to}} - 1\right) = ${tpct(target, 4)}`,
      },
      {
        title: "Check",
        text: "Grow 1 unit for a year at the new rate. It must land on the same growth factor.",
        working: String.raw`${growthTex(target, to)} = ${tnum(check, 8)} \;\checkmark`,
      },
    ];

    const results = [
      { label: `Equivalent ${label(to)} rate`, value: pct(target, 4), primary: true },
      { label: "Effective annual rate (EAR)", value: pct(ear, 4) },
      { label: "Growth of 1 in one year", value: num(g, 6) },
    ];

    if (principal !== null && years !== null) {
      const fv = principal * Math.pow(g, years);
      results.push({ label: `Future value after ${plain(years)} yr`, value: num(fv, 2) });
      steps.push({
        title: "Future value",
        text: "Apply the one-year growth factor once for every year. Both rates give exactly the same answer — that is what “equivalent” means.",
        formula: String.raw`FV = PV \times g^{T}`,
        working: String.raw`FV = ${tnum(principal, 2)} \times ${tnum(g, 8)}^{${plain(years)}} = ${tnum(fv, 2)}`,
      });
    }

    const table = COMP_OPTIONS.map((o) => [o.label, pct(rateFor(g, o.value), 4)]);

    const keystrokes: KeystrokeBlock[] = [];
    if (from === to) {
      // Nothing to convert; no keystrokes needed.
    } else if (from !== "cont" && to !== "cont") {
      keystrokes.push({
        title: "BA II Plus — ICONV worksheet",
        lines: [
          { keys: ["2ND", "ICONV"] },
          { input: plain(rate * 100, 6), keys: ["ENTER"], note: "NOM = stated rate" },
          { keys: ["↓", "↓"], input: undefined, note: "Go to C/Y" },
          { input: from, keys: ["ENTER"], note: "Original compounding" },
          { keys: ["↑", "CPT"], note: `EFF = ${num(ear * 100, 4)}` },
          { keys: ["↓"], input: undefined },
          { input: to, keys: ["ENTER"], note: "New compounding" },
          { keys: ["↓", "CPT"], note: `NOM = ${num(target * 100, 4)}` },
        ],
        result: `${num(target * 100, 4)}% compounded ${label(to)}`,
      });
    } else if (from === "cont") {
      keystrokes.push({
        title: "BA II Plus — using e^x",
        lines: [
          { input: plain(rate, 8), keys: ["2ND", "eˣ"], note: `g = ${num(g, 6)}` },
          ...(to === "1"
            ? [{ input: "− 1 =", keys: [], note: `EAR = ${num(ear * 100, 4)}%` }]
            : [
                { input: `yˣ (1 ÷ ${to}) =`, keys: [], note: "m-th root of g" },
                { input: `− 1 = × ${to} =`, keys: [], note: `R′ = ${num(target * 100, 4)}%` },
              ]),
        ],
      });
    } else {
      keystrokes.push({
        title: "BA II Plus — using LN",
        lines: [
          from === "1"
            ? { input: plain(1 + rate, 8), keys: [], note: "1 + R" }
            : { input: `(1 + ${plain(rate, 8)} ÷ ${from}) yˣ ${from} =`, keys: [], note: `g = ${num(g, 6)}` },
          { keys: ["LN"], note: `R_c = ${num(target * 100, 4)}%` },
        ],
      });
    }

    return {
      results,
      steps,
      keystrokes,
      tables: [
        {
          title: "The same rate under every compounding convention",
          columns: ["Compounding", "Equivalent stated rate"],
          rows: table,
          caption: "All of these grow money by exactly the same amount over a year.",
        },
      ],
      insights: [
        "More frequent compounding needs a lower stated rate to produce the same growth; continuous is always the lowest.",
        "FRM derivatives pricing uses continuous compounding, so convert discrete rates before plugging them into e^(rT).",
      ],
    };
  },
};
