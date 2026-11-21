import type { CalculatorDef, CalcOutput, ResultItem, Step } from "../types";
import { InputError } from "../types";
import { getNum, getOptNum } from "../inputs";
import { num, pct, tnum, tpct } from "../format";

export const performance: CalculatorDef = {
  slug: "sharpe-treynor-jensen",
  name: "Sharpe, Treynor, Jensen's Alpha, M², Information & Sortino Ratio Calculator",
  shortName: "Risk-adjusted performance",
  category: "Portfolio",
  tagline:
    "Every risk-adjusted performance measure from one set of inputs, with a plain-English read-out of what each one means.",
  syllabus: "FRM I · Foundations of Risk Management · CFA I · Portfolio Management",
  fields: [
    { id: "rp", label: "Portfolio return Rp", kind: "percent", defaultValue: "12", min: -100, max: 1000, unit: "%" },
    { id: "rf", label: "Risk-free rate Rf", kind: "percent", defaultValue: "4", min: -10, max: 100, unit: "%" },
    { id: "sp", label: "Portfolio volatility σp", kind: "percent", defaultValue: "20", exclusiveMin: 0, max: 500, unit: "%" },
    { id: "beta", label: "Portfolio beta βp", kind: "number", defaultValue: "1.2", min: -10, max: 10 },
    { id: "rm", label: "Market return Rm", kind: "percent", defaultValue: "10", min: -100, max: 1000, unit: "%" },
    { id: "sm", label: "Market volatility σm (optional)", kind: "percent", defaultValue: "15", exclusiveMin: 0, max: 500, unit: "%", optional: true, help: "Needed for M²." },
    { id: "rb", label: "Benchmark return Rb (optional)", kind: "percent", defaultValue: "", min: -100, max: 1000, unit: "%", optional: true, help: "With tracking error, gives the information ratio." },
    { id: "te", label: "Tracking error (optional)", kind: "percent", defaultValue: "", exclusiveMin: 0, max: 500, unit: "%", optional: true },
    { id: "dd", label: "Downside deviation (optional)", kind: "percent", defaultValue: "", exclusiveMin: 0, max: 500, unit: "%", optional: true, help: "Below the risk-free rate; gives the Sortino ratio." },
  ],
  presets: [
    { label: "Fund vs market (CAPM)", values: { rp: "12", rf: "4", sp: "20", beta: "1.2", rm: "10", sm: "15", rb: "", te: "", dd: "" } },
    { label: "Active fund vs benchmark", values: { rp: "9.5", rf: "3", sp: "16", beta: "0.9", rm: "8", sm: "14", rb: "8", te: "3", dd: "9" } },
  ],
  formulas: [
    { name: "Sharpe ratio", tex: String.raw`S = \frac{R_p - R_f}{\sigma_p}` },
    { name: "Treynor ratio", tex: String.raw`T = \frac{R_p - R_f}{\beta_p}` },
    { name: "Jensen's alpha", tex: String.raw`\alpha = R_p - \left[R_f + \beta_p(R_m - R_f)\right]` },
    { name: "M²", tex: String.raw`M^2 = R_f + S_p\,\sigma_m` },
    { name: "Information ratio", tex: String.raw`IR = \frac{R_p - R_b}{TE}` },
    { name: "Sortino ratio", tex: String.raw`\text{Sortino} = \frac{R_p - R_f}{\sigma_{down}}` },
  ],
  compute(inputs): CalcOutput {
    const rp = getNum(inputs, "rp");
    const rf = getNum(inputs, "rf");
    const sp = getNum(inputs, "sp");
    const beta = getNum(inputs, "beta");
    const rm = getNum(inputs, "rm");
    const sm = getOptNum(inputs, "sm");
    const rb = getOptNum(inputs, "rb");
    const te = getOptNum(inputs, "te");
    const dd = getOptNum(inputs, "dd");

    if (Math.abs(beta) < 1e-9) {
      throw new InputError("Beta cannot be zero — the Treynor ratio would divide by zero.", "beta");
    }
    if ((rb === null) !== (te === null)) {
      throw new InputError("Enter both benchmark return and tracking error for the information ratio, or leave both blank.", rb === null ? "rb" : "te");
    }

    const excess = rp - rf;
    const sharpe = excess / sp;
    const treynor = excess / beta;
    const capm = rf + beta * (rm - rf);
    const alpha = rp - capm;
    const marketSharpe = sm !== null ? (rm - rf) / sm : null;

    const results: ResultItem[] = [
      { label: "Sharpe ratio", value: num(sharpe, 4), primary: true },
      { label: "Treynor ratio", value: pct(treynor, 4) },
      { label: "Jensen's alpha", value: pct(alpha, 4), primary: true, hint: alpha > 0 ? "Beat its CAPM required return" : alpha < 0 ? "Fell short of its CAPM required return" : "Exactly as CAPM predicts" },
      { label: "CAPM required return", value: pct(capm, 4) },
    ];

    const steps: Step[] = [
      {
        title: "Excess return",
        text: "Every measure starts with the reward for taking risk: the return above what a risk-free asset pays.",
        formula: String.raw`R_p - R_f`,
        working: String.raw`${tpct(rp, 2)} - ${tpct(rf, 2)} = ${tpct(excess, 2)}`,
      },
      {
        title: "Sharpe ratio: reward per unit of total risk",
        text: "Divide by total volatility. Use it when the portfolio is the investor's whole wealth, so all of its risk matters.",
        formula: String.raw`S = \frac{R_p - R_f}{\sigma_p}`,
        working: String.raw`S = \frac{${tpct(excess, 2)}}{${tpct(sp, 2)}} = ${tnum(sharpe, 4)}`,
      },
      {
        title: "Treynor ratio: reward per unit of market risk",
        text: "Divide by beta instead. Use it when the portfolio is one part of a diversified whole, where only systematic risk matters.",
        formula: String.raw`T = \frac{R_p - R_f}{\beta_p}`,
        working: String.raw`T = \frac{${tpct(excess, 2)}}{${tnum(beta, 2)}} = ${tpct(treynor, 4)}`,
      },
      {
        title: "Jensen's alpha: return above CAPM",
        text: "First ask what CAPM says the portfolio should have earned for its beta, then compare with what it actually earned.",
        formula: String.raw`\alpha = R_p - \left[R_f + \beta_p(R_m - R_f)\right]`,
        working: String.raw`\alpha = ${tpct(rp, 2)} - \left[${tpct(rf, 2)} + ${tnum(beta, 2)}\times(${tpct(rm, 2)} - ${tpct(rf, 2)})\right] = ${tpct(rp, 2)} - ${tpct(capm, 4)} = ${tpct(alpha, 4)}`,
      },
    ];

    const insights: string[] = [];

    if (sm !== null && marketSharpe !== null) {
      const m2 = rf + sharpe * sm;
      results.push({ label: "M² (Modigliani)", value: pct(m2, 4) }, { label: "M² alpha vs market", value: pct(m2 - rm, 4) });
      steps.push({
        title: "M²: Sharpe ratio in percentage terms",
        text: "Imagine levering or de-levering the portfolio with the risk-free asset until it has the same volatility as the market. M² is the return it would then earn, so it can be compared directly with the market return.",
        formula: String.raw`M^2 = R_f + \frac{R_p - R_f}{\sigma_p}\,\sigma_m`,
        working: String.raw`M^2 = ${tpct(rf, 2)} + ${tnum(sharpe, 4)}\times${tpct(sm, 2)} = ${tpct(m2, 4)} \quad (\text{vs } R_m = ${tpct(rm, 2)})`,
      });
      insights.push(
        sharpe > marketSharpe
          ? `Sharpe ${num(sharpe, 4)} beats the market's ${num(marketSharpe, 4)}, so M² is above the market return.`
          : sharpe < marketSharpe
            ? `Sharpe ${num(sharpe, 4)} trails the market's ${num(marketSharpe, 4)}, so M² is below the market return.`
            : "The portfolio's Sharpe ratio equals the market's, so M² equals the market return.",
      );
    }

    if (rb !== null && te !== null) {
      const ir = (rp - rb) / te;
      results.push({ label: "Information ratio", value: num(ir, 4) });
      steps.push({
        title: "Information ratio: active return per unit of active risk",
        text: "For an active manager the benchmark is the bar. Active return is how much the portfolio beat it; tracking error is how much the gap wobbles.",
        formula: String.raw`IR = \frac{R_p - R_b}{TE}`,
        working: String.raw`IR = \frac{${tpct(rp, 2)} - ${tpct(rb, 2)}}{${tpct(te, 2)}} = ${tnum(ir, 4)}`,
      });
    }

    if (dd !== null) {
      const sortino = excess / dd;
      results.push({ label: "Sortino ratio", value: num(sortino, 4) });
      steps.push({
        title: "Sortino ratio: penalise only bad volatility",
        text: "Investors don't mind upside surprises. Sortino replaces total volatility with downside deviation (here measured below the risk-free rate).",
        formula: String.raw`\text{Sortino} = \frac{R_p - R_f}{\sigma_{down}}`,
        working: String.raw`\text{Sortino} = \frac{${tpct(excess, 2)}}{${tpct(dd, 2)}} = ${tnum(sortino, 4)}`,
      });
    }

    insights.push(
      "Sharpe and M² always rank portfolios the same way; Treynor and Jensen's alpha use beta, so they can disagree with Sharpe for poorly diversified portfolios.",
      "A positive Jensen's alpha means the portfolio plots above the security market line.",
    );

    return { results, steps, insights };
  },
};
