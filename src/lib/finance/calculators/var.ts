import type { CalculatorDef, CalcOutput, Step } from "../types";
import { getNum, getStr } from "../inputs";
import { normInv, normPdf } from "../math";
import { num, pct, plain, tnum, tpct } from "../format";

const CONF_OPTIONS = [
  { value: "90", label: "90%" },
  { value: "95", label: "95%" },
  { value: "97.5", label: "97.5%" },
  { value: "99", label: "99%" },
  { value: "99.5", label: "99.5%" },
  { value: "99.9", label: "99.9%" },
];

const isPortfolio = (v: Record<string, string>) => v.mode === "portfolio";
const isAnnual = (v: Record<string, string>) => v.period === "annual";

export const valueAtRisk: CalculatorDef = {
  slug: "value-at-risk",
  name: "Value at Risk (VaR) & Expected Shortfall Calculator",
  shortName: "VaR & expected shortfall",
  category: "Risk",
  tagline:
    "Parametric (normal) VaR and expected shortfall for one asset or a two-asset portfolio, with square-root-of-time scaling and the diversification benefit.",
  syllabus: "FRM I · Valuation & Risk Models · Quantitative Analysis",
  fields: [
    {
      id: "mode",
      label: "Position",
      kind: "select",
      defaultValue: "single",
      options: [
        { value: "single", label: "Single asset / portfolio" },
        { value: "portfolio", label: "Two-asset portfolio (diversification)" },
      ],
    },
    {
      id: "period",
      label: "Volatility & return inputs are",
      kind: "select",
      defaultValue: "daily",
      options: [
        { value: "daily", label: "Daily" },
        { value: "annual", label: "Annual" },
      ],
    },
    { id: "conf", label: "Confidence level", kind: "select", defaultValue: "99", options: CONF_OPTIONS },
    { id: "horizon", label: "Horizon", kind: "number", defaultValue: "10", exclusiveMin: 0, max: 2520, unit: "days" },
    { id: "days", label: "Trading days per year", kind: "integer", defaultValue: "252", min: 1, max: 366, showIf: isAnnual },
    { id: "value", label: "Position value", kind: "number", defaultValue: "1000000", exclusiveMin: 0, max: 1e15, showIf: (v) => !isPortfolio(v) },
    { id: "sigma", label: "Volatility σ", kind: "percent", defaultValue: "1", exclusiveMin: 0, max: 500, unit: "%", showIf: (v) => !isPortfolio(v) },
    {
      id: "mu",
      label: "Expected return μ",
      kind: "percent",
      defaultValue: "0",
      min: -100,
      max: 500,
      unit: "%",
      help: "Leave at 0 for the usual “zero-mean” VaR. A positive mean reduces VaR.",
      showIf: (v) => !isPortfolio(v),
    },
    { id: "valueA", label: "Value in asset A", kind: "number", defaultValue: "600000", min: 0, max: 1e15, showIf: isPortfolio },
    { id: "sigmaA", label: "Volatility of A", kind: "percent", defaultValue: "1.2", exclusiveMin: 0, max: 500, unit: "%", showIf: isPortfolio },
    { id: "valueB", label: "Value in asset B", kind: "number", defaultValue: "400000", min: 0, max: 1e15, showIf: isPortfolio },
    { id: "sigmaB", label: "Volatility of B", kind: "percent", defaultValue: "0.8", exclusiveMin: 0, max: 500, unit: "%", showIf: isPortfolio },
    { id: "rho", label: "Correlation ρ(A, B)", kind: "number", defaultValue: "0.3", min: -1, max: 1, showIf: isPortfolio },
  ],
  presets: [
    { label: "$1m, 1% daily vol, 99%, 10 days", values: { mode: "single", period: "daily", conf: "99", horizon: "10", value: "1000000", sigma: "1", mu: "0" } },
    { label: "Annual inputs: 20% vol, 8% mean, 95%, 1 day", values: { mode: "single", period: "annual", conf: "95", horizon: "1", days: "252", value: "5000000", sigma: "20", mu: "8" } },
    { label: "Two assets, ρ = 0.3, 99%, 1 day", values: { mode: "portfolio", period: "daily", conf: "99", horizon: "1", valueA: "600000", sigmaA: "1.2", valueB: "400000", sigmaB: "0.8", rho: "0.3" } },
  ],
  formulas: [
    { name: "Normal VaR", tex: String.raw`\text{VaR} = V\,(z_c\,\sigma\sqrt{h} - \mu h)` },
    { name: "Expected shortfall", tex: String.raw`\text{ES} = V\left(\sigma\sqrt{h}\,\frac{\varphi(z_c)}{1-c} - \mu h\right)` },
    { name: "Square-root-of-time", tex: String.raw`\text{VaR}_{h} = \text{VaR}_{1}\times\sqrt{h}` },
    { name: "Two-asset volatility", tex: String.raw`\sigma_p^2 = w_A^2\sigma_A^2 + w_B^2\sigma_B^2 + 2\rho\,w_Aw_B\sigma_A\sigma_B` },
    { name: "Diversified VaR", tex: String.raw`\text{VaR}_p = \sqrt{\text{VaR}_A^2 + \text{VaR}_B^2 + 2\rho\,\text{VaR}_A\text{VaR}_B}` },
  ],
  compute(inputs): CalcOutput {
    const mode = getStr(inputs, "mode");
    const annual = getStr(inputs, "period") === "annual";
    const c = Number(getStr(inputs, "conf")) / 100;
    const h = getNum(inputs, "horizon");
    const days = annual ? getNum(inputs, "days") : 1;
    const z = normInv(c);
    const esMult = normPdf(z) / (1 - c);
    const sqrtH = Math.sqrt(h);

    // Convert annual inputs to daily first, then scale to the horizon.
    const toDailyVol = (s: number) => (annual ? s / Math.sqrt(days) : s);
    const toDailyMean = (m: number) => (annual ? m / days : m);

    const steps: Step[] = [
      {
        title: "Find the z-value for the confidence level",
        text: `VaR at ${num(c * 100, 1)}% confidence is the loss that is exceeded only ${num((1 - c) * 100, 1)}% of the time. On a standard normal curve that cut-off sits z standard deviations below the mean.`,
        formula: String.raw`z_c = N^{-1}(c)`,
        working: String.raw`z_{${plain(c * 100)}\%} = ${tnum(z, 4)}`,
      },
    ];

    if (annual) {
      steps.push({
        title: "Convert annual inputs to daily",
        text: `Volatility scales with the square root of time and the mean scales linearly. Use ${days} trading days per year.`,
        formula: String.raw`\sigma_{day} = \frac{\sigma_{year}}{\sqrt{${days}}}, \qquad \mu_{day} = \frac{\mu_{year}}{${days}}`,
      });
    }

    if (mode === "portfolio") {
      const vA = getNum(inputs, "valueA");
      const vB = getNum(inputs, "valueB");
      const sA = toDailyVol(getNum(inputs, "sigmaA"));
      const sB = toDailyVol(getNum(inputs, "sigmaB"));
      const rho = getNum(inputs, "rho");
      const V = vA + vB;
      if (!(V > 0)) throw new Error("Portfolio value must be positive");

      const dA = vA * sA; // money volatility, 1 day
      const dB = vB * sB;
      const dP = Math.sqrt(Math.max(0, dA * dA + dB * dB + 2 * rho * dA * dB));
      const varA = z * dA * sqrtH;
      const varB = z * dB * sqrtH;
      const varP = z * dP * sqrtH;
      const undiversified = varA + varB;
      const benefit = undiversified - varP;
      const esP = esMult * dP * sqrtH;

      steps.push(
        {
          title: "Money volatility of each position (1 day)",
          text: "Multiply each position's value by its daily volatility to get the size of a one-standard-deviation move in currency.",
          formula: String.raw`\sigma_A^{\$} = V_A\,\sigma_A`,
          working: String.raw`\sigma_A^{\$} = ${tnum(vA, 0)}\times${tpct(sA, 4)} = ${tnum(dA, 2)}, \quad \sigma_B^{\$} = ${tnum(dB, 2)}`,
        },
        {
          title: "Combine them using the correlation",
          text: "Risks do not simply add: unless the assets are perfectly correlated, some losses offset gains elsewhere.",
          formula: String.raw`\sigma_p^{\$} = \sqrt{(\sigma_A^{\$})^2 + (\sigma_B^{\$})^2 + 2\rho\,\sigma_A^{\$}\sigma_B^{\$}}`,
          working: String.raw`\sigma_p^{\$} = \sqrt{${tnum(dA, 2)}^2 + ${tnum(dB, 2)}^2 + 2\times${tnum(rho, 2)}\times${tnum(dA, 2)}\times${tnum(dB, 2)}} = ${tnum(dP, 2)}`,
        },
        {
          title: `Individual VaRs over ${plain(h)} day${h === 1 ? "" : "s"}`,
          text: "Each position's VaR = z × money volatility × √horizon.",
          formula: String.raw`\text{VaR}_A = z_c\,\sigma_A^{\$}\sqrt{h}`,
          working: String.raw`\text{VaR}_A = ${tnum(z, 4)}\times${tnum(dA, 2)}\times\sqrt{${plain(h)}} = ${tnum(varA, 2)}, \quad \text{VaR}_B = ${tnum(varB, 2)}`,
        },
        {
          title: "Diversified portfolio VaR",
          text: "Apply the same formula to the combined volatility. You get the same answer by combining the individual VaRs with the correlation formula.",
          formula: String.raw`\text{VaR}_p = z_c\,\sigma_p^{\$}\sqrt{h}`,
          working: String.raw`\text{VaR}_p = ${tnum(z, 4)}\times${tnum(dP, 2)}\times\sqrt{${plain(h)}} = ${tnum(varP, 2)}`,
        },
        {
          title: "Diversification benefit",
          text: "Undiversified VaR assumes ρ = 1 (the two VaRs just add). The difference is what diversification saves you.",
          formula: String.raw`\text{Benefit} = (\text{VaR}_A + \text{VaR}_B) - \text{VaR}_p`,
          working: String.raw`(${tnum(varA, 2)} + ${tnum(varB, 2)}) - ${tnum(varP, 2)} = ${tnum(benefit, 2)}`,
        },
      );

      return {
        results: [
          { label: "Diversified portfolio VaR", value: num(varP, 2), primary: true, hint: `${num(c * 100, 1)}%, ${plain(h)}-day` },
          { label: "Undiversified VaR (ρ = 1)", value: num(undiversified, 2) },
          { label: "Diversification benefit", value: num(benefit, 2) },
          { label: "Expected shortfall (portfolio)", value: num(esP, 2) },
          { label: "VaR of A alone", value: num(varA, 2) },
          { label: "VaR of B alone", value: num(varB, 2) },
        ],
        steps,
        insights: [
          "Diversification benefit is zero when ρ = 1 and largest when ρ = −1.",
          `Portfolio volatility: ${pct(dP / V, 4)} per day on a value of ${num(V, 0)}.`,
          "Mean returns are ignored here (zero-mean VaR), as in most FRM diversification questions.",
        ],
      };
    }

    const V = getNum(inputs, "value");
    const sD = toDailyVol(getNum(inputs, "sigma"));
    const mD = toDailyMean(getNum(inputs, "mu"));
    const sH = sD * sqrtH;
    const mH = mD * h;
    const varPct = z * sH - mH;
    const esPct = esMult * sH - mH;
    const var1 = V * (z * sD - mD);

    steps.push(
      {
        title: `Scale volatility to ${plain(h)} day${h === 1 ? "" : "s"}`,
        text: "If daily returns are independent, variance adds up day by day, so volatility grows with the square root of time.",
        formula: String.raw`\sigma_h = \sigma_{day}\sqrt{h}`,
        working: String.raw`\sigma_h = ${tpct(sD, 4)}\times\sqrt{${plain(h)}} = ${tpct(sH, 4)}`,
      },
      {
        title: "Scale the mean",
        text: "Expected return grows in a straight line with time.",
        formula: String.raw`\mu_h = \mu_{day}\times h`,
        working: String.raw`\mu_h = ${tpct(mD, 6)}\times${plain(h)} = ${tpct(mH, 4)}`,
      },
      {
        title: "Value at Risk",
        text: "Go z standard deviations into the loss tail and subtract the expected gain. Multiply by the position value to get a currency amount.",
        formula: String.raw`\text{VaR} = V\,(z_c\,\sigma_h - \mu_h)`,
        working: String.raw`\text{VaR} = ${tnum(V, 0)}\times(${tnum(z, 4)}\times${tnum(sH, 6)} - ${tnum(mH, 6)}) = ${tnum(V * varPct, 2)}`,
      },
      {
        title: "Expected shortfall",
        text: "VaR tells you where the tail starts; expected shortfall tells you the average loss once you are in it. Under a normal distribution it uses the height of the curve at z divided by the tail probability.",
        formula: String.raw`\text{ES} = V\left(\sigma_h\frac{\varphi(z_c)}{1-c} - \mu_h\right)`,
        working: String.raw`\text{ES} = ${tnum(V, 0)}\times\left(${tnum(sH, 6)}\times\frac{${tnum(normPdf(z), 6)}}{${tnum(1 - c, 4)}} - ${tnum(mH, 6)}\right) = ${tnum(V * esPct, 2)}`,
      },
    );

    return {
      results: [
        { label: `${plain(h)}-day VaR (${num(c * 100, 1)}%)`, value: num(V * varPct, 2), primary: true, hint: `${pct(varPct, 4)} of the position` },
        { label: "Expected shortfall", value: num(V * esPct, 2), primary: true, hint: `${pct(esPct, 4)} of the position` },
        ...(h !== 1 ? [{ label: "1-day VaR", value: num(var1, 2) }] : []),
        { label: "z-value", value: num(z, 4) },
        { label: "Horizon volatility", value: pct(sH, 4) },
      ],
      steps,
      tables: [
        {
          title: "VaR across confidence levels",
          columns: ["Confidence", "z", "VaR", "Expected shortfall"],
          rows: CONF_OPTIONS.map((o) => {
            const cc = Number(o.value) / 100;
            const zz = normInv(cc);
            return [o.label, num(zz, 4), num(V * (zz * sH - mH), 2), num(V * (sH * (normPdf(zz) / (1 - cc)) - mH), 2)];
          }),
        },
      ],
      insights: [
        "ES is always larger than VaR at the same confidence level, and unlike VaR it is subadditive (a coherent risk measure).",
        "Square-root-of-time assumes independent, identically distributed returns — volatility clustering breaks it.",
        "Regulators moved from 99% VaR to 97.5% ES (FRTB); for a normal distribution the two are very close.",
      ],
    };
  },
};
