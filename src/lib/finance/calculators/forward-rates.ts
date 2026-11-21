import type { CalculatorDef, CalcOutput } from "../types";
import { InputError } from "../types";
import { getList, getNum, getStr } from "../inputs";
import { num, pct, tnum, tpct } from "../format";

export const forwardRates: CalculatorDef = {
  slug: "spot-forward-rates",
  name: "Spot Rates → Forward Rates, Discount Factors & Par Yields",
  shortName: "Spot & forward rates",
  category: "Rates",
  tagline:
    "Turn a spot curve into discount factors, one-year forwards, any forward f(a,b) and par yields using the no-arbitrage argument.",
  syllabus: "FRM I · Valuation & Risk Models · CFA I · Fixed Income",
  fields: [
    {
      id: "spots",
      label: "Spot rates for years 1, 2, 3, …",
      kind: "list",
      listOfPercent: true,
      maxItems: 30,
      defaultValue: "5, 5.5, 6, 6.25",
      min: -10,
      max: 50,
      unit: "%",
      help: "Comma-separated annual spot (zero) rates in %, one per year starting at year 1.",
    },
    {
      id: "comp",
      label: "Spot rates are compounded",
      kind: "select",
      defaultValue: "annual",
      options: [
        { value: "annual", label: "Annually" },
        { value: "cont", label: "Continuously" },
      ],
    },
    { id: "from", label: "Forward starts in year", kind: "integer", defaultValue: "1", min: 0, max: 29 },
    { id: "to", label: "Forward ends in year", kind: "integer", defaultValue: "3", min: 1, max: 30 },
  ],
  presets: [
    { label: "Upward-sloping curve", values: { spots: "5, 5.5, 6, 6.25", comp: "annual", from: "1", to: "3" } },
    { label: "Two-year example: 5% and 6%", values: { spots: "5, 6", comp: "annual", from: "1", to: "2" } },
    { label: "Continuous: 3%, 3.5%, 4%", values: { spots: "3, 3.5, 4", comp: "cont", from: "1", to: "3" } },
  ],
  formulas: [
    { name: "Discount factor", tex: String.raw`d_t = \frac{1}{(1+S_t)^t} \quad\text{or}\quad d_t = e^{-S_t t}` },
    { name: "Forward rate (annual)", tex: String.raw`(1+S_b)^b = (1+S_a)^a\,(1+f_{a,b})^{b-a}` },
    { name: "Forward rate (continuous)", tex: String.raw`f_{a,b} = \frac{S_b\,b - S_a\,a}{b-a}` },
    { name: "Par yield", tex: String.raw`c_n = \frac{1 - d_n}{\sum_{t=1}^{n} d_t}` },
  ],
  compute(inputs): CalcOutput {
    const spots = getList(inputs, "spots");
    const comp = getStr(inputs, "comp");
    const a = getNum(inputs, "from");
    const b = getNum(inputs, "to");
    const n = spots.length;

    if (b > n) {
      throw new InputError(`You entered ${n} spot rate${n > 1 ? "s" : ""}, so the forward can end in year ${n} at most.`, "to");
    }
    if (a >= b) throw new InputError("The forward must start before it ends.", "from");

    const cont = comp === "cont";
    const S = (t: number) => (t === 0 ? 0 : spots[t - 1]);
    const growth = (t: number) => (cont ? Math.exp(S(t) * t) : Math.pow(1 + S(t), t));
    for (let t = 1; t <= n; t++) {
      if (!cont && 1 + S(t) <= 0) throw new InputError("Spot rates must be above -100%.", "spots");
    }

    const df = (t: number) => 1 / growth(t);
    const fwd = (x: number, y: number) =>
      cont
        ? (S(y) * y - S(x) * x) / (y - x)
        : Math.pow(growth(y) / growth(x), 1 / (y - x)) - 1;

    let sumDf = 0;
    const rows: string[][] = [];
    for (let t = 1; t <= n; t++) {
      sumDf += df(t);
      const par = (1 - df(t)) / sumDf;
      rows.push([
        String(t),
        pct(S(t), 4),
        num(df(t), 6),
        t === 1 ? pct(S(1), 4) : pct(fwd(t - 1, t), 4),
        pct(par, 4),
      ]);
    }

    const fab = fwd(a, b);
    const span = b - a;
    const compLabel = cont ? "continuously compounded" : "annually compounded";

    const steps = cont
      ? [
          {
            title: "Discount factors",
            text: "Each spot rate tells you what 1 received at year t is worth today.",
            formula: String.raw`d_t = e^{-S_t\,t}`,
            working: String.raw`d_{${b}} = e^{-${tnum(S(b), 6)} \times ${b}} = ${tnum(df(b), 6)}`,
          },
          {
            title: "The no-arbitrage idea",
            text: `Investing for ${b} years at the ${b}-year spot rate must give the same result as investing for ${a} year${a === 1 ? "" : "s"} and then locking in the forward rate for the remaining ${span}. Otherwise you could borrow one way and lend the other for a free profit.`,
            formula: String.raw`e^{S_b\,b} = e^{S_a\,a}\,e^{f_{a,b}(b-a)}`,
          },
          {
            title: `Solve for the forward rate from year ${a} to ${b}`,
            text: "With continuous compounding the exponents simply add, so the forward is a weighted difference of spot rates.",
            formula: String.raw`f_{a,b} = \frac{S_b\,b - S_a\,a}{b-a}`,
            working: String.raw`f_{${a},${b}} = \frac{${tnum(S(b), 6)}\times${b} - ${tnum(S(a), 6)}\times${a}}{${span}} = ${tpct(fab, 4)}`,
          },
        ]
      : [
          {
            title: "Discount factors",
            text: "Each spot rate tells you what 1 received at year t is worth today.",
            formula: String.raw`d_t = \frac{1}{(1+S_t)^t}`,
            working: String.raw`d_{${b}} = \frac{1}{(1+${tnum(S(b), 6)})^{${b}}} = ${tnum(df(b), 6)}`,
          },
          {
            title: "The no-arbitrage idea",
            text: `Investing for ${b} years at the ${b}-year spot rate must give the same result as investing for ${a} year${a === 1 ? "" : "s"} and then locking in the forward rate for the remaining ${span}. Otherwise you could borrow one way and lend the other for a free profit.`,
            formula: String.raw`(1+S_b)^b = (1+S_a)^a\,(1+f_{a,b})^{b-a}`,
          },
          {
            title: `Solve for the forward rate from year ${a} to ${b}`,
            text: `Divide the ${b}-year growth by the ${a}-year growth, then take the ${span === 1 ? "result" : `${span}-th root`} to get an annual rate.`,
            formula: String.raw`f_{a,b} = \left[\frac{(1+S_b)^b}{(1+S_a)^a}\right]^{\frac{1}{b-a}} - 1`,
            working: String.raw`f_{${a},${b}} = \left[\frac{${tnum(growth(b), 6)}}{${tnum(growth(a), 6)}}\right]^{\frac{1}{${span}}} - 1 = ${tpct(fab, 4)}`,
          },
        ];

    steps.push(
      {
        title: "One-year forwards along the curve",
        text: "Repeating the same logic for each consecutive year gives the one-year forward curve in the table. When spot rates rise with maturity, forwards sit above spots — the forward is the marginal rate that pulls the average up.",
        formula: cont ? String.raw`f_{t-1,t} = S_t\,t - S_{t-1}(t-1)` : String.raw`1+f_{t-1,t} = \frac{(1+S_t)^t}{(1+S_{t-1})^{t-1}}`,
        working: "",
      },
      {
        title: "Par yields",
        text: "A par yield is the coupon rate that makes a bond priced off this curve worth exactly 100. Coupons are discounted with all the factors so far; the face value with the last one.",
        formula: String.raw`c_n = \frac{1 - d_n}{\sum_{t=1}^{n} d_t}`,
        working: String.raw`c_{${n}} = \frac{1 - ${tnum(df(n), 6)}}{${tnum(sumDf, 6)}} = ${tpct((1 - df(n)) / sumDf, 4)}`,
      },
    );

    return {
      results: [
        { label: `Forward rate f(${a}, ${b})`, value: pct(fab, 4), primary: true, hint: `${span}-year rate starting in year ${a}, ${compLabel}` },
        { label: `Discount factor d(${b})`, value: num(df(b), 6) },
        { label: `${n}-year par yield`, value: pct((1 - df(n)) / sumDf, 4) },
      ],
      steps: steps.map((s) => (s.working === "" ? { ...s, working: undefined } : s)),
      tables: [
        {
          title: "Curve table",
          columns: ["Year", "Spot rate", "Discount factor", "1-yr forward f(t−1, t)", "Par yield"],
          rows,
        },
      ],
      insights: [
        "Upward-sloping spot curve → forwards above spots → par yields slightly below spots.",
        "A forward rate is not a forecast; it is the rate that removes arbitrage today.",
      ],
    };
  },
};
