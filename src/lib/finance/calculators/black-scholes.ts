import type { CalculatorDef, CalcOutput } from "../types";
import { getNum } from "../inputs";
import { normCdf, normPdf } from "../math";
import { num, plain, tnum } from "../format";

export const blackScholes: CalculatorDef = {
  slug: "black-scholes-greeks",
  name: "Black-Scholes-Merton Option Price & Greeks Calculator",
  shortName: "Black-Scholes & Greeks",
  category: "Derivatives",
  tagline:
    "European call and put prices, d₁, d₂, N(d), all five Greeks and a put-call parity check — computed by hand, step by step.",
  syllabus: "FRM I · Valuation & Risk Models · CFA I · Derivatives",
  fields: [
    { id: "S", label: "Stock price S₀", kind: "number", defaultValue: "42", exclusiveMin: 0, max: 1e12 },
    { id: "K", label: "Strike price K", kind: "number", defaultValue: "40", exclusiveMin: 0, max: 1e12 },
    { id: "T", label: "Time to expiry", kind: "number", defaultValue: "0.5", exclusiveMin: 0, max: 50, unit: "years" },
    { id: "r", label: "Risk-free rate (continuous)", kind: "percent", defaultValue: "10", min: -10, max: 100, unit: "%" },
    { id: "sigma", label: "Volatility σ (annual)", kind: "percent", defaultValue: "20", exclusiveMin: 0, max: 500, unit: "%" },
    { id: "q", label: "Dividend yield q (continuous)", kind: "percent", defaultValue: "0", min: 0, max: 100, unit: "%", help: "Use 0 for a non-dividend-paying stock." },
  ],
  presets: [
    { label: "Classic: S 42, K 40, 6 months, r 10%, σ 20%", values: { S: "42", K: "40", T: "0.5", r: "10", sigma: "20", q: "0" } },
    { label: "At-the-money, 1 year, σ 30%", values: { S: "100", K: "100", T: "1", r: "5", sigma: "30", q: "0" } },
    { label: "Index option with 3% dividend yield", values: { S: "1000", K: "1050", T: "0.25", r: "6", sigma: "18", q: "3" } },
  ],
  formulas: [
    { name: "d₁ and d₂", tex: String.raw`d_1 = \frac{\ln(S_0/K) + (r - q + \sigma^2/2)T}{\sigma\sqrt{T}}, \quad d_2 = d_1 - \sigma\sqrt{T}` },
    { name: "Call", tex: String.raw`c = S_0e^{-qT}N(d_1) - Ke^{-rT}N(d_2)` },
    { name: "Put", tex: String.raw`p = Ke^{-rT}N(-d_2) - S_0e^{-qT}N(-d_1)` },
    { name: "Put-call parity", tex: String.raw`c - p = S_0e^{-qT} - Ke^{-rT}` },
    { name: "Delta & gamma", tex: String.raw`\Delta_c = e^{-qT}N(d_1), \quad \Gamma = \frac{e^{-qT}N'(d_1)}{S_0\sigma\sqrt{T}}` },
  ],
  compute(inputs): CalcOutput {
    const S = getNum(inputs, "S");
    const K = getNum(inputs, "K");
    const T = getNum(inputs, "T");
    const r = getNum(inputs, "r");
    const sigma = getNum(inputs, "sigma");
    const q = getNum(inputs, "q");

    const sqrtT = Math.sqrt(T);
    const volT = sigma * sqrtT;
    const lnSK = Math.log(S / K);
    const drift = (r - q + (sigma * sigma) / 2) * T;
    const d1 = (lnSK + drift) / volT;
    const d2 = d1 - volT;
    const Nd1 = normCdf(d1);
    const Nd2 = normCdf(d2);
    const Nmd1 = normCdf(-d1);
    const Nmd2 = normCdf(-d2);
    const discS = S * Math.exp(-q * T);
    const discK = K * Math.exp(-r * T);
    const call = discS * Nd1 - discK * Nd2;
    const put = discK * Nmd2 - discS * Nmd1;
    const pdf = normPdf(d1);

    const deltaC = Math.exp(-q * T) * Nd1;
    const deltaP = Math.exp(-q * T) * (Nd1 - 1);
    const gamma = (Math.exp(-q * T) * pdf) / (S * volT);
    const vega = discS * pdf * sqrtT; // per 1.00 change in σ
    const thetaC = -(discS * pdf * sigma) / (2 * sqrtT) - r * discK * Nd2 + q * discS * Nd1;
    const thetaP = -(discS * pdf * sigma) / (2 * sqrtT) + r * discK * Nmd2 - q * discS * Nmd1;
    const rhoC = K * T * Math.exp(-r * T) * Nd2;
    const rhoP = -K * T * Math.exp(-r * T) * Nmd2;

    const moneyness = S > K * 1.0001 ? "in the money" : S < K * 0.9999 ? "out of the money" : "at the money";

    return {
      results: [
        { label: "Call price", value: num(call, 4), primary: true },
        { label: "Put price", value: num(put, 4), primary: true },
        { label: "d₁", value: num(d1, 4) },
        { label: "d₂", value: num(d2, 4) },
        { label: "N(d₁)", value: num(Nd1, 4) },
        { label: "N(d₂)", value: num(Nd2, 4), hint: "Risk-neutral probability the call finishes in the money" },
      ],
      tables: [
        {
          title: "The Greeks",
          columns: ["Greek", "Call", "Put", "Meaning"],
          rows: [
            ["Delta", num(deltaC, 4), num(deltaP, 4), "Change in option price per 1 change in S"],
            ["Gamma", num(gamma, 4), num(gamma, 4), "Change in delta per 1 change in S"],
            ["Vega (per 1% σ)", num(vega / 100, 4), num(vega / 100, 4), "Change in price if volatility rises 1 point"],
            ["Theta (per year)", num(thetaC, 4), num(thetaP, 4), "Time decay per year"],
            ["Theta (per day)", num(thetaC / 365, 4), num(thetaP / 365, 4), "Time decay per calendar day"],
            ["Rho (per 1% r)", num(rhoC / 100, 4), num(rhoP / 100, 4), "Change in price if r rises 1 point"],
          ],
          caption: "Gamma and vega are the same for a call and a put with the same strike and expiry.",
        },
      ],
      steps: [
        {
          title: "How far is the stock from the strike?",
          text: `The stock is ${moneyness}. ln(S₀/K) measures the gap in percentage (log) terms; positive means the call is already in the money.`,
          formula: String.raw`\ln\!\left(\frac{S_0}{K}\right)`,
          working: String.raw`\ln\!\left(\frac{${tnum(S, 4)}}{${tnum(K, 4)}}\right) = ${tnum(lnSK, 6)}`,
        },
        {
          title: "Compute d₁",
          text: "Add the expected drift over the option's life, then divide by the volatility over that life. d₁ is the distance to the strike measured in standard deviations.",
          formula: String.raw`d_1 = \frac{\ln(S_0/K) + (r - q + \sigma^2/2)\,T}{\sigma\sqrt{T}}`,
          working: String.raw`d_1 = \frac{${tnum(lnSK, 6)} + (${tnum(r, 4)} - ${tnum(q, 4)} + ${tnum(sigma, 4)}^2/2)\times${tnum(T, 4)}}{${tnum(sigma, 4)}\times\sqrt{${tnum(T, 4)}}} = \frac{${tnum(lnSK + drift, 6)}}{${tnum(volT, 6)}} = ${tnum(d1, 4)}`,
        },
        {
          title: "Compute d₂",
          text: "Subtract one volatility-over-life from d₁.",
          formula: String.raw`d_2 = d_1 - \sigma\sqrt{T}`,
          working: String.raw`d_2 = ${tnum(d1, 4)} - ${tnum(volT, 4)} = ${tnum(d2, 4)}`,
        },
        {
          title: "Look up the normal probabilities",
          text: "Use the standard normal table (the exam provides one). Small rounding differences from the table are normal.",
          working: String.raw`N(d_1) = ${tnum(Nd1, 4)},\;\; N(d_2) = ${tnum(Nd2, 4)},\;\; N(-d_1) = ${tnum(Nmd1, 4)},\;\; N(-d_2) = ${tnum(Nmd2, 4)}`,
        },
        {
          title: "Call price",
          text: "What you expect to receive (the stock, weighted by N(d₁)) minus what you expect to pay (the discounted strike, weighted by N(d₂)).",
          formula: String.raw`c = S_0e^{-qT}N(d_1) - Ke^{-rT}N(d_2)`,
          working: String.raw`c = ${tnum(discS, 4)}\times${tnum(Nd1, 4)} - ${tnum(discK, 4)}\times${tnum(Nd2, 4)} = ${tnum(call, 4)}`,
        },
        {
          title: "Put price",
          text: "Mirror image: receive the discounted strike, give up the stock, using the probabilities of the opposite outcomes.",
          formula: String.raw`p = Ke^{-rT}N(-d_2) - S_0e^{-qT}N(-d_1)`,
          working: String.raw`p = ${tnum(discK, 4)}\times${tnum(Nmd2, 4)} - ${tnum(discS, 4)}\times${tnum(Nmd1, 4)} = ${tnum(put, 4)}`,
        },
        {
          title: "Check with put-call parity",
          text: "A call minus a put with the same strike behaves like a forward. Both sides must match.",
          formula: String.raw`c - p = S_0e^{-qT} - Ke^{-rT}`,
          working: String.raw`${tnum(call, 4)} - ${tnum(put, 4)} = ${tnum(call - put, 4)} \quad\text{and}\quad ${tnum(discS, 4)} - ${tnum(discK, 4)} = ${tnum(discS - discK, 4)}\;\checkmark`,
        },
      ],
      keystrokes: [
        {
          title: "BA II Plus — d₁ step by step",
          lines: [
            { input: `${plain(S)} ÷ ${plain(K)} =`, keys: ["LN"], note: `ln(S/K) = ${num(lnSK, 6)}` },
            { keys: ["STO", "1"], note: "Store it" },
            { input: plain(sigma), keys: ["x²"] },
            { input: `÷ 2 + ${plain(r - q)} = × ${plain(T)} =`, keys: [], note: `Drift = ${num(drift, 6)}` },
            { input: "+", keys: ["RCL", "1"] },
            { input: `= ÷ ( ${plain(sigma)} × ${plain(T)}`, keys: ["√x"] },
            { input: ") =", keys: [], note: `d₁ = ${num(d1, 4)}` },
          ],
          result: "The BA II Plus has no N(d) key — read N(d₁), N(d₂) from the normal table.",
        },
      ],
      insights: [
        "Higher volatility raises both call and put values (vega > 0).",
        "Call delta is between 0 and 1; put delta = call delta − e^(−qT).",
        "N(d₂) is the risk-neutral probability of exercise; N(d₁) is the call's hedge ratio (when q = 0).",
      ],
    };
  },
};
