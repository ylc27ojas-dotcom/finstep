import type { CalculatorDef, CalcOutput, Step } from "../types";
import {
  annuityFactor,
  bondTerms,
  periodicYieldFromPrice,
  priceAtPeriodicYield,
} from "../bond-math";
import { getNum, getStr } from "../inputs";
import { iy, num, pct, plain, tnum, tpct } from "../format";

export const FREQ_OPTIONS = [
  { value: "1", label: "Annual (1×/yr)" },
  { value: "2", label: "Semiannual (2×/yr)" },
  { value: "4", label: "Quarterly (4×/yr)" },
  { value: "12", label: "Monthly (12×/yr)" },
];

export const bondPrice: CalculatorDef = {
  slug: "bond-price-yield",
  name: "Bond Price & Yield to Maturity Calculator",
  shortName: "Bond price & YTM",
  category: "Fixed income",
  tagline:
    "Price a coupon bond from its yield, or back out the YTM from its price, with every discounting step shown.",
  syllabus: "FRM I · Valuation & Risk Models · CFA I · Fixed Income",
  fields: [
    {
      id: "mode",
      label: "What do you want to find?",
      kind: "select",
      defaultValue: "price",
      options: [
        { value: "price", label: "Price (I know the yield)" },
        { value: "yield", label: "Yield to maturity (I know the price)" },
      ],
    },
    {
      id: "face",
      label: "Face (par) value",
      kind: "number",
      defaultValue: "1000",
      exclusiveMin: 0,
      max: 1e12,
    },
    {
      id: "coupon",
      label: "Annual coupon rate",
      kind: "percent",
      defaultValue: "6",
      min: 0,
      max: 100,
      unit: "%",
    },
    {
      id: "years",
      label: "Years to maturity",
      kind: "number",
      defaultValue: "5",
      exclusiveMin: 0,
      max: 100,
      unit: "years",
    },
    {
      id: "freq",
      label: "Coupon frequency",
      kind: "select",
      defaultValue: "2",
      options: FREQ_OPTIONS,
    },
    {
      id: "ytm",
      label: "Yield to maturity (annual)",
      kind: "percent",
      defaultValue: "8",
      min: -10,
      max: 200,
      unit: "%",
      help: "Quoted as an annual rate compounded at the coupon frequency (bond-equivalent basis).",
      showIf: (v) => v.mode !== "yield",
    },
    {
      id: "price",
      label: "Market price",
      kind: "number",
      defaultValue: "918.89",
      exclusiveMin: 0,
      max: 1e13,
      help: "Clean price on a coupon date, in the same units as the face value.",
      showIf: (v) => v.mode === "yield",
    },
  ],
  presets: [
    {
      label: "Discount bond: 6% coupon, 8% yield",
      values: { mode: "price", face: "1000", coupon: "6", years: "5", freq: "2", ytm: "8" },
    },
    {
      label: "Premium bond: 10% annual coupon, 7% yield",
      values: { mode: "price", face: "100", coupon: "10", years: "3", freq: "1", ytm: "7" },
    },
    {
      label: "Find YTM: price 95, 5% semiannual, 4 years",
      values: { mode: "yield", face: "100", coupon: "5", years: "4", freq: "2", price: "95" },
    },
  ],
  formulas: [
    {
      name: "Bond price",
      tex: String.raw`P = C\cdot\frac{1-(1+i)^{-N}}{i} + \frac{F}{(1+i)^{N}}`,
      note: "C = coupon per period, i = yield per period, N = number of periods, F = face value.",
    },
    {
      name: "Current yield",
      tex: String.raw`\text{CY} = \frac{\text{annual coupon}}{P}`,
    },
    {
      name: "Effective annual yield",
      tex: String.raw`\text{EAY} = \left(1+\tfrac{y}{m}\right)^{m}-1`,
    },
  ],
  compute(inputs): CalcOutput {
    const mode = getStr(inputs, "mode");
    const face = getNum(inputs, "face");
    const couponRate = getNum(inputs, "coupon");
    const years = getNum(inputs, "years");
    const freq = Number(getStr(inputs, "freq"));
    const t = bondTerms({ face, couponRate, years, freq });
    const { periods: N, couponPerPeriod: C } = t;

    let i: number;
    let price: number;
    if (mode === "yield") {
      price = getNum(inputs, "price");
      i = periodicYieldFromPrice(t, price);
    } else {
      i = getNum(inputs, "ytm") / freq;
      if (i <= -1) throw new Error("Yield per period must be above -100%");
      price = priceAtPeriodicYield(t, i);
    }

    const ytm = i * freq;
    const eay = Math.pow(1 + i, freq) - 1;
    const pvCoupons = C * annuityFactor(i, N);
    const pvFace = face * Math.pow(1 + i, -N);
    const annualCoupon = face * couponRate;
    const currentYield = annualCoupon / price;
    const pctOfPar = (price / face) * 100;
    const relation =
      Math.abs(price - face) < face * 1e-9
        ? "at par"
        : price < face
          ? "at a discount"
          : "at a premium";

    const steps: Step[] = [
      {
        title: "Coupon paid each period",
        text: `The bond pays ${pct(couponRate, 2)} of face value a year, split into ${freq} equal payment${freq > 1 ? "s" : ""}.`,
        formula: String.raw`C = \frac{F \times c}{m}`,
        working: String.raw`C = \frac{${tnum(face, 2)} \times ${tpct(couponRate, 2)}}{${freq}} = ${tnum(C, 4)}`,
      },
      {
        title: "Number of periods",
        text: "Count how many coupon dates are left. Each one is a cash flow we must discount.",
        formula: String.raw`N = T \times m`,
        working: String.raw`N = ${plain(years)} \times ${freq} = ${N}`,
      },
    ];

    if (mode === "yield") {
      steps.push(
        {
          title: "Reason about the answer first",
          text:
            price < face
              ? `The bond trades below par (${num(price, 2)} < ${num(face, 2)}). Investors only pay less than face value if they need a return higher than the coupon, so the YTM must be above ${pct(couponRate, 2)}.`
              : price > face
                ? `The bond trades above par (${num(price, 2)} > ${num(face, 2)}). Investors accept paying more than face value only if the yield they need is below the coupon, so the YTM must be below ${pct(couponRate, 2)}.`
                : "The bond trades at par, so the YTM equals the coupon rate.",
        },
        {
          title: "Set up the price equation",
          text: "YTM is the single discount rate that makes the present value of all cash flows equal the market price. There is no algebraic shortcut, so we solve it by trial and error (the calculator uses a bisection search, the same idea your BA II Plus uses).",
          formula: String.raw`${tnum(price, 2)} = ${tnum(C, 4)}\cdot\frac{1-(1+i)^{-${N}}}{i} + \frac{${tnum(face, 2)}}{(1+i)^{${N}}}`,
        },
        {
          title: "Solve for the yield per period",
          text: "Plugging the solved rate back in reproduces the market price, which confirms the answer.",
          working: String.raw`i = ${tpct(i, 4)} \;\Rightarrow\; ${tnum(pvCoupons, 4)} + ${tnum(pvFace, 4)} = ${tnum(pvCoupons + pvFace, 2)}`,
        },
        {
          title: "Annualise the yield",
          text: "Bond yields are quoted on a bond-equivalent basis: multiply the periodic yield by the number of periods per year. The effective annual yield also counts interest-on-interest.",
          formula: String.raw`\text{YTM} = i \times m, \qquad \text{EAY} = (1+i)^{m}-1`,
          working: String.raw`\text{YTM} = ${tpct(i, 4)} \times ${freq} = ${tpct(ytm, 4)}, \qquad \text{EAY} = ${tpct(eay, 4)}`,
        },
      );
    } else {
      steps.push(
        {
          title: "Yield per period",
          text: "The quoted yield is annual. Divide by the payment frequency to get the rate that matches one coupon period.",
          formula: String.raw`i = \frac{y}{m}`,
          working: String.raw`i = \frac{${tpct(ytm, 4)}}{${freq}} = ${tpct(i, 4)}`,
        },
        {
          title: "Present value of the coupons",
          text: "The coupons are equal payments every period, so they form an annuity. The annuity factor discounts all of them in one go.",
          formula: String.raw`PV_C = C\cdot\frac{1-(1+i)^{-N}}{i}`,
          working: String.raw`PV_C = ${tnum(C, 4)} \times ${tnum(annuityFactor(i, N), 6)} = ${tnum(pvCoupons, 4)}`,
        },
        {
          title: "Present value of the face value",
          text: "The face value comes back once, at maturity, so discount it over all N periods.",
          formula: String.raw`PV_F = \frac{F}{(1+i)^{N}}`,
          working: String.raw`PV_F = \frac{${tnum(face, 2)}}{(1+${tnum(i, 6)})^{${N}}} = ${tnum(pvFace, 4)}`,
        },
        {
          title: "Add them up",
          text: "The price is the total present value of everything the bond pays.",
          formula: String.raw`P = PV_C + PV_F`,
          working: String.raw`P = ${tnum(pvCoupons, 4)} + ${tnum(pvFace, 4)} = ${tnum(price, 4)}`,
        },
      );
    }

    const tvmLines =
      mode === "yield"
        ? [
            { keys: ["2ND", "CLR TVM"], note: "Clear old TVM values" },
            { input: String(N), keys: ["N"] },
            { input: `${plain(price, 4)} +/-`, keys: ["PV"], note: "Price is paid out, so it is negative" },
            { input: plain(C, 6), keys: ["PMT"] },
            { input: plain(face, 4), keys: ["FV"] },
            { keys: ["CPT", "I/Y"], note: `Shows ${num(i * 100, 4)} (yield per period)` },
            { input: `× ${freq} =`, keys: [], note: `YTM = ${num(ytm * 100, 4)}%` },
          ]
        : [
            { keys: ["2ND", "CLR TVM"], note: "Clear old TVM values" },
            { input: String(N), keys: ["N"] },
            { input: iy(i), keys: ["I/Y"], note: "Yield per period, in %" },
            { input: plain(C, 6), keys: ["PMT"] },
            { input: plain(face, 4), keys: ["FV"] },
            { keys: ["CPT", "PV"], note: `Shows −${num(price, 2)} (negative = you pay it)` },
          ];

    return {
      results: [
        mode === "yield"
          ? { label: "Yield to maturity", value: pct(ytm, 4), primary: true, hint: "Annual, bond-equivalent basis" }
          : { label: "Bond price", value: num(price, 2), primary: true, hint: `${num(pctOfPar, 4)}% of par` },
        mode === "yield"
          ? { label: "Yield per period", value: pct(i, 4) }
          : {
              label: price < face ? "Discount to par" : price > face ? "Premium over par" : "Premium / discount",
              value: num(Math.abs(price - face), 2),
            },
        { label: "Effective annual yield", value: pct(eay, 4) },
        { label: "Current yield", value: pct(currentYield, 4) },
        { label: "PV of coupons", value: num(pvCoupons, 2) },
        { label: "PV of face value", value: num(pvFace, 2) },
      ],
      steps,
      keystrokes: [
        {
          title: "BA II Plus — TVM worksheet",
          lines: [
            { keys: ["2ND", "P/Y"], input: undefined, note: "Set P/Y = 1 (type 1, ENTER, then 2ND QUIT) so I/Y means “per period”" },
            ...tvmLines,
          ],
          result: mode === "yield" ? `YTM ≈ ${num(ytm * 100, 4)}%` : `PV ≈ −${num(price, 2)}`,
        },
      ],
      insights: [
        `The bond trades ${relation}: ${
          relation === "at a discount"
            ? "coupon rate < yield"
            : relation === "at a premium"
              ? "coupon rate > yield"
              : "coupon rate = yield"
        }. Exam questions often test this relationship without any calculation.`,
        "Price and yield move in opposite directions: a higher discount rate shrinks every present value.",
        "As maturity approaches, a premium or discount bond's price is “pulled to par” if yields stay unchanged.",
      ],
    };
  },
};
