import type { CalculatorDef, CalcOutput } from "../types";
import { InputError } from "../types";
import { bondTerms, priceAtPeriodicYield } from "../bond-math";
import { getNum, getStr } from "../inputs";
import { iy, num, pct, plain, tnum } from "../format";
import { FREQ_OPTIONS } from "./bond-price";

export const duration: CalculatorDef = {
  slug: "duration-convexity",
  name: "Duration, Convexity & DV01 Calculator",
  shortName: "Duration & convexity",
  category: "Fixed income",
  tagline:
    "Macaulay, modified and effective duration, convexity and DV01 — plus how well they predict a real price change.",
  syllabus: "FRM I · Valuation & Risk Models · CFA I · Fixed Income",
  fields: [
    { id: "face", label: "Face (par) value", kind: "number", defaultValue: "100", exclusiveMin: 0, max: 1e12 },
    { id: "coupon", label: "Annual coupon rate", kind: "percent", defaultValue: "10", min: 0, max: 100, unit: "%" },
    { id: "years", label: "Years to maturity", kind: "number", defaultValue: "3", exclusiveMin: 0, max: 100, unit: "years" },
    { id: "freq", label: "Coupon frequency", kind: "select", defaultValue: "1", options: FREQ_OPTIONS },
    { id: "ytm", label: "Yield to maturity (annual)", kind: "percent", defaultValue: "10", min: -10, max: 200, unit: "%" },
    {
      id: "shift",
      label: "Yield change to test",
      kind: "number",
      defaultValue: "100",
      min: 1,
      max: 1000,
      unit: "bp",
      help: "In basis points (100 bp = 1%). Used for the price-change estimate and effective duration.",
    },
  ],
  presets: [
    { label: "3-year 10% annual bond at par", values: { face: "100", coupon: "10", years: "3", freq: "1", ytm: "10", shift: "100" } },
    { label: "10-year zero-coupon bond", values: { face: "100", coupon: "0", years: "10", freq: "1", ytm: "5", shift: "100" } },
    { label: "30-year 4% semiannual, 200 bp shock", values: { face: "1000", coupon: "4", years: "30", freq: "2", ytm: "4.5", shift: "200" } },
  ],
  formulas: [
    { name: "Macaulay duration", tex: String.raw`D_{mac} = \sum_{k} t_k \cdot \frac{PV(CF_k)}{P}` },
    { name: "Modified duration", tex: String.raw`D_{mod} = \frac{D_{mac}}{1 + y/m}` },
    { name: "DV01", tex: String.raw`\text{DV01} = D_{mod} \times P \times 0.0001` },
    {
      name: "Convexity",
      tex: String.raw`C = \frac{1}{P\,m^{2}} \sum_{k=1}^{N} \frac{k(k+1)\,CF_k}{(1+i)^{k+2}}`,
    },
    {
      name: "Price change estimate",
      tex: String.raw`\Delta P \approx -D_{mod}\,P\,\Delta y + \tfrac{1}{2}\,C\,P\,(\Delta y)^2`,
    },
    {
      name: "Effective duration & convexity",
      tex: String.raw`D_{eff} = \frac{P_{-} - P_{+}}{2P_0\Delta y}, \quad C_{eff} = \frac{P_{-} + P_{+} - 2P_0}{P_0(\Delta y)^2}`,
    },
  ],
  compute(inputs): CalcOutput {
    const face = getNum(inputs, "face");
    const couponRate = getNum(inputs, "coupon");
    const years = getNum(inputs, "years");
    const freq = Number(getStr(inputs, "freq"));
    const y = getNum(inputs, "ytm");
    const dy = getNum(inputs, "shift") / 10000;
    const t = bondTerms({ face, couponRate, years, freq });
    const i = y / freq;
    if (i - dy / freq <= -1) {
      throw new InputError("The yield after the shift would be below -100% per period.", "shift");
    }

    const N = t.periods;
    const flows: { k: number; t: number; cf: number; df: number; pv: number }[] = [];
    let price = 0;
    let weightedTime = 0;
    let convexSum = 0;
    for (let k = 1; k <= N; k++) {
      const cf = t.couponPerPeriod + (k === N ? face : 0);
      const df = Math.pow(1 + i, -k);
      const pv = cf * df;
      price += pv;
      weightedTime += (k / freq) * pv;
      convexSum += (k * (k + 1) * cf) / Math.pow(1 + i, k + 2);
      flows.push({ k, t: k / freq, cf, df, pv });
    }
    if (!(price > 0)) throw new InputError("The bond has no positive value at this yield.", "ytm");

    const macD = weightedTime / price;
    const modD = macD / (1 + i);
    const dv01 = modD * price * 0.0001;
    const convexity = convexSum / (price * freq * freq);

    const pUp = priceAtPeriodicYield(t, i + dy / freq);
    const pDown = priceAtPeriodicYield(t, i - dy / freq);
    const effD = (pDown - pUp) / (2 * price * dy);
    const effC = (pDown + pUp - 2 * price) / (price * dy * dy);

    const durUp = -modD * price * dy;
    const convAdj = 0.5 * convexity * price * dy * dy;
    const estUp = durUp + convAdj;
    const estDown = -durUp + convAdj;
    const actualUp = pUp - price;
    const actualDown = pDown - price;
    const bp = Math.round(dy * 10000);

    // The t × PV / P column shows where duration comes from.
    const tableRows = flows.map((f) => [
      String(f.k),
      plain(f.t, 4),
      num(f.cf, 4),
      num(f.df, 6),
      num(f.pv, 4),
      num((f.t * f.pv) / price, 4),
    ]);

    return {
      results: [
        { label: "Macaulay duration", value: `${num(macD, 4)} yrs`, primary: true },
        { label: "Modified duration", value: num(modD, 4), primary: true, hint: `≈ ${num(modD, 2)}% price change per 1% yield move` },
        { label: "Convexity", value: num(convexity, 4) },
        { label: "DV01", value: num(dv01, 4), hint: "Price change for a 1 bp yield move" },
        { label: "Effective duration", value: num(effD, 4), hint: `From ±${bp} bp repricing` },
        { label: "Bond price", value: num(price, 4) },
      ],
      tables: [
        {
          title: "Cash-flow table",
          columns: ["Period k", "Time t (yrs)", "Cash flow", "Discount factor", "PV", "t × PV / P"],
          rows: tableRows,
          caption: `Sum of PV = price ${num(price, 4)}; sum of the last column = Macaulay duration ${num(macD, 4)} years.`,
        },
        {
          title: `Price change for a ${bp} bp move`,
          columns: ["Scenario", "Actual (full repricing)", "Duration only", "Duration + convexity"],
          rows: [
            [`Yield +${bp} bp`, num(actualUp, 4), num(durUp, 4), num(estUp, 4)],
            [`Yield −${bp} bp`, num(actualDown, 4), num(-durUp, 4), num(estDown, 4)],
          ],
          caption: "Duration alone understates gains and overstates losses; adding convexity closes most of the gap.",
        },
      ],
      steps: [
        {
          title: "Discount every cash flow",
          text: `List each of the ${N} payments, discount it at the yield per period i = ${pct(i, 4)}, and add them up. That sum is the price (see the cash-flow table).`,
          formula: String.raw`P = \sum_{k=1}^{N} \frac{CF_k}{(1+i)^k}`,
          working: String.raw`P = ${tnum(price, 4)}`,
        },
        {
          title: "Macaulay duration: the weighted-average time to cash",
          text: "Weight each payment's time by its share of the price. Big, late payments (like the face value) pull duration towards maturity; a zero-coupon bond's duration equals its maturity.",
          formula: String.raw`D_{mac} = \sum_k t_k \cdot \frac{PV_k}{P}`,
          working: String.raw`D_{mac} = \frac{${tnum(weightedTime, 4)}}{${tnum(price, 4)}} = ${tnum(macD, 4)}\text{ years}`,
        },
        {
          title: "Modified duration: price sensitivity",
          text: "Macaulay duration is a time measure. Dividing by (1 + yield per period) turns it into the percentage price change for a 1-unit change in yield.",
          formula: String.raw`D_{mod} = \frac{D_{mac}}{1 + y/m}`,
          working: String.raw`D_{mod} = \frac{${tnum(macD, 4)}}{1 + ${tnum(i, 6)}} = ${tnum(modD, 4)}`,
        },
        {
          title: "DV01: money value of one basis point",
          text: "Risk desks think in currency, not percent. DV01 is how much the price falls if the yield rises by 0.01%.",
          formula: String.raw`\text{DV01} = D_{mod} \times P \times 0.0001`,
          working: String.raw`\text{DV01} = ${tnum(modD, 4)} \times ${tnum(price, 4)} \times 0.0001 = ${tnum(dv01, 4)}`,
        },
        {
          title: "Convexity: the curvature correction",
          text: "The price–yield curve is bent, not straight. Convexity measures that bend; for an option-free bond it is always positive, which helps the holder.",
          formula: String.raw`C = \frac{1}{P\,m^2}\sum_{k} \frac{k(k+1)\,CF_k}{(1+i)^{k+2}}`,
          working: String.raw`C = \frac{${tnum(convexSum, 4)}}{${tnum(price, 4)} \times ${freq}^2} = ${tnum(convexity, 4)}`,
        },
        {
          title: `Estimate the price change for +${bp} bp`,
          text: "First-order (duration) effect plus second-order (convexity) effect.",
          formula: String.raw`\Delta P \approx -D_{mod}\,P\,\Delta y + \tfrac12\,C\,P\,(\Delta y)^2`,
          working: String.raw`\Delta P \approx ${tnum(durUp, 4)} + ${tnum(convAdj, 4)} = ${tnum(estUp, 4)} \quad(\text{actual: } ${tnum(actualUp, 4)})`,
        },
        {
          title: "Effective duration and convexity (repricing method)",
          text: `Reprice the bond with the yield ${bp} bp lower and ${bp} bp higher. This is how duration is measured for bonds with embedded options, and it matches modified duration for plain bonds when the shift is small.`,
          formula: String.raw`D_{eff} = \frac{P_- - P_+}{2P_0\,\Delta y}, \qquad C_{eff} = \frac{P_- + P_+ - 2P_0}{P_0\,(\Delta y)^2}`,
          working: String.raw`D_{eff} = \frac{${tnum(pDown, 4)} - ${tnum(pUp, 4)}}{2 \times ${tnum(price, 4)} \times ${tnum(dy, 4)}} = ${tnum(effD, 4)}, \quad C_{eff} = ${tnum(effC, 4)}`,
        },
      ],
      keystrokes: [
        {
          title: `BA II Plus — reprice at y − ${bp} bp and y + ${bp} bp`,
          lines: [
            { keys: ["2ND", "CLR TVM"] },
            { input: String(N), keys: ["N"] },
            { input: plain(t.couponPerPeriod, 6), keys: ["PMT"] },
            { input: plain(face, 4), keys: ["FV"] },
            { input: iy(i - dy / freq), keys: ["I/Y"], note: "Yield per period after a fall" },
            { keys: ["CPT", "PV"], note: `P− = ${num(pDown, 4)}` },
            { input: iy(i + dy / freq), keys: ["I/Y"], note: "Yield per period after a rise" },
            { keys: ["CPT", "PV"], note: `P+ = ${num(pUp, 4)}` },
          ],
          result: `D_eff = (P− − P+) / (2 × P₀ × Δy) = ${num(effD, 4)}`,
        },
      ],
      insights: [
        "Longer maturity, lower coupon and lower yield all increase duration.",
        `A ${bp} bp rise is estimated to move the price by ${num(estUp, 4)} (${pct(estUp / price, 3)}).`,
        "Exam favourite: modified duration ≈ % price change for a 100 bp move; DV01 is the currency change for 1 bp.",
      ],
    };
  },
};
