export interface CalculatorGuide {
  /** Markdown with $TeX$, shown under the calculator. */
  about: string;
  faqs: { q: string; a: string }[];
  /** Related blog post slug. */
  post?: string;
}

export const calculatorGuides: Record<string, CalculatorGuide> = {
  "bond-price-yield": {
    post: "ba-ii-plus-bond-price-ytm-keystrokes",
    about: `
## How bond pricing works

A plain coupon bond is just two sets of cash flows: equal **coupons** every period and the **face value** at maturity. Its price is what all of those are worth today when discounted at the market's required return, the **yield to maturity (YTM)**.

The logic before the formula:

- If investors want **more** return than the coupon pays, the only way to give it to them is a **lower price** — the bond trades at a discount.
- If they want **less** than the coupon, they will pay **more** than face value — a premium.
- If yield equals coupon, the bond trades at par.

$$P = C\\cdot\\frac{1-(1+i)^{-N}}{i} + \\frac{F}{(1+i)^{N}}$$

Here $C$ is the coupon per period, $i$ the yield per period, $N$ the number of periods and $F$ the face value. For semiannual bonds, halve both the coupon and the yield and double the number of years.

### Going the other way: price → YTM

YTM has no algebraic solution once there is more than one cash flow, so it is found by trial and error. Your BA II Plus does this when you press **CPT I/Y**; this calculator uses a bisection search, which always converges.
`,
    faqs: [
      {
        q: "Why is the PV negative on my BA II Plus?",
        a: "The calculator uses a cash-flow sign convention: money you receive (coupons, face value) is positive, so the price you pay comes out negative. Ignore the sign when reporting the price.",
      },
      {
        q: "Is the YTM here a bond-equivalent yield?",
        a: "Yes. The periodic yield is multiplied by the number of coupons per year, which is how bond yields are quoted. The effective annual yield is shown separately.",
      },
      {
        q: "Can I price a bond between coupon dates?",
        a: "This calculator values bonds on a coupon date, which is how most FRM and CFA Level I questions are set. Between coupon dates you would also need accrued interest and the clean/dirty price split.",
      },
    ],
  },
  "duration-convexity": {
    post: "macaulay-vs-modified-duration",
    about: `
## What duration and convexity measure

**Macaulay duration** is the weighted-average time until you receive the bond's cash flows, where each time is weighted by that cash flow's share of the price. It is measured in years.

**Modified duration** converts that into a sensitivity: the approximate percentage change in price for a 1-unit change in yield.

$$D_{mod} = \\frac{D_{mac}}{1 + y/m} \\qquad \\frac{\\Delta P}{P} \\approx -D_{mod}\\,\\Delta y$$

Duration treats the price–yield curve as a straight line. The real curve bends (it is **convex**), so duration alone overstates losses when yields rise and understates gains when they fall. Adding the convexity term fixes most of the error:

$$\\Delta P \\approx -D_{mod}\\,P\\,\\Delta y + \\tfrac{1}{2}\\,C\\,P\\,(\\Delta y)^2$$

**DV01** (dollar value of a basis point) expresses the same risk in currency: how much the price changes for a 0.01% move in yield. Traders use it to size hedges.

**Effective duration** is measured by actually repricing the bond with yields shifted down and up. It is the only duration that works for bonds with embedded options such as callables and MBS.
`,
    faqs: [
      {
        q: "Why is my convexity different from my textbook's?",
        a: "Some texts quote convexity in “per period squared” units or divide by 100. This calculator reports annualised convexity, so the price-change formula ½·C·P·(Δy)² works with Δy in decimals (0.01 for 100 bp).",
      },
      {
        q: "Does effective duration equal modified duration?",
        a: "For an option-free bond and a small yield shift, they are almost identical. The gap grows with the size of the shift because of convexity.",
      },
    ],
  },
  "compounding-converter": {
    post: "continuous-vs-discrete-compounding",
    about: `
## Think in growth, not formulas

Two rates are **equivalent** if they grow money by the same amount over a year. So every conversion is one idea applied twice:

1. Work out what 1 grows to in a year at the rate you have.
2. Find the rate, under the new compounding, that grows 1 to that same amount.

With $m$ compounding periods per year the growth is $(1 + R/m)^m$; with continuous compounding it is $e^{R}$. Setting the two equal gives the familiar conversion formulas:

$$R_c = m\\ln\\!\\left(1+\\frac{R_m}{m}\\right) \\qquad R_m = m\\left(e^{R_c/m}-1\\right)$$

The **effective annual rate** (EAR) is simply the growth minus one. It is the fairest way to compare rates quoted with different compounding.

FRM derivatives formulas — forward prices, Black-Scholes, interest rate parity — assume **continuous compounding**, so converting a quoted annual rate is often the first step in a question.
`,
    faqs: [
      {
        q: "Which compounding gives the highest EAR for the same stated rate?",
        a: "Continuous compounding. For a fixed stated rate, the more often interest is added, the more interest-on-interest you earn.",
      },
      {
        q: "How do I do this on the BA II Plus?",
        a: "Use the ICONV worksheet (2ND, 2) for discrete conversions: enter NOM and C/Y, compute EFF, then change C/Y and compute NOM. For continuous rates use the eˣ and LN keys, as shown in the keystroke panel.",
      },
    ],
  },
  "spot-forward-rates": {
    post: "forward-rates-from-spot-rates",
    about: `
## From spot rates to forward rates

A **spot rate** $S_t$ is the yield on a zero-coupon bond maturing at $t$. A **forward rate** $f_{a,b}$ is the rate you can lock in today for borrowing or lending between two future dates $a$ and $b$.

They are linked by a no-arbitrage argument: investing for $b$ years at the $b$-year spot rate must end with the same amount as investing for $a$ years and then rolling into the forward rate.

$$(1+S_b)^b = (1+S_a)^a\\,(1+f_{a,b})^{b-a}$$

With continuous compounding the exponents add up, which gives the neat formula $f_{a,b} = \\frac{S_b b - S_a a}{b-a}$.

From the same spot curve you also get **discount factors** $d_t$ — the price today of 1 paid at time $t$ — and **par yields**, the coupon rates at which bonds priced off the curve would trade at exactly par.
`,
    faqs: [
      {
        q: "Is a forward rate the market's forecast of future rates?",
        a: "Not necessarily. It is the rate that removes arbitrage today. Under the pure expectations theory it equals the expected future spot rate, but liquidity and term premiums usually make it higher.",
      },
      {
        q: "Why are the forwards above the spot rates?",
        a: "When the spot curve slopes upward, each extra year must earn more than the average so far to pull the average up — that marginal rate is the forward rate.",
      },
    ],
  },
  "forward-futures-price": {
    post: "cost-of-carry-forward-price",
    about: `
## The cost-of-carry model

There are two ways to own an asset at a future date $T$: buy it now and carry it, or enter a forward contract now and pay at $T$. With no arbitrage, both must cost the same. That gives the forward price:

$$F_0 = S_0\\,e^{(r + \\text{costs} - \\text{income})\\,T}$$

- **No income:** $F_0 = S_0e^{rT}$
- **Known cash income** (a dividend or coupon): subtract its present value, $F_0 = (S_0 - I)e^{rT}$
- **Known yield** (stock index): $F_0 = S_0e^{(r-q)T}$
- **Currencies:** the foreign interest rate acts like a yield, $F_0 = S_0e^{(r - r_f)T}$ (interest rate parity)
- **Commodities:** storage costs add, convenience yield subtracts, $F_0 = S_0e^{(r+u-y)T}$

If the quoted forward differs from fair value, there is an arbitrage: **cash-and-carry** when the forward is too expensive, **reverse cash-and-carry** when it is too cheap.
`,
    faqs: [
      {
        q: "Are forward and futures prices the same?",
        a: "When interest rates are known in advance, yes. With random rates they can differ slightly because futures are marked to market daily — FRM Part I usually ignores this.",
      },
      {
        q: "What does contango mean?",
        a: "The forward or futures price is above the spot price. Backwardation is the opposite, common for commodities with a high convenience yield.",
      },
    ],
  },
  "black-scholes-greeks": {
    post: "black-scholes-d1-d2-by-hand",
    about: `
## Black-Scholes-Merton in plain words

The BSM model prices a European option by assuming the stock follows a lognormal random walk and that you can hedge continuously. The call price is:

$$c = S_0e^{-qT}N(d_1) - Ke^{-rT}N(d_2)$$

Read it as **what you expect to receive minus what you expect to pay**, under risk-neutral probabilities:

- $Ke^{-rT}N(d_2)$: the strike, discounted to today, times the probability you will pay it (exercise).
- $S_0e^{-qT}N(d_1)$: the value of the stock you receive if you exercise.

$d_1$ and $d_2$ measure how far the stock is from the strike in units of volatility over the option's life:

$$d_1 = \\frac{\\ln(S_0/K) + (r - q + \\sigma^2/2)T}{\\sigma\\sqrt{T}}, \\qquad d_2 = d_1 - \\sigma\\sqrt{T}$$

The **Greeks** measure sensitivity: delta (stock price), gamma (delta's sensitivity), vega (volatility), theta (time) and rho (interest rates).
`,
    faqs: [
      {
        q: "Why don't my N(d) values match the table exactly?",
        a: "Normal tables round d to two decimals. This calculator evaluates N(d) exactly, so answers can differ in the third decimal place. Both are accepted in exams.",
      },
      {
        q: "Can I use this for American options?",
        a: "Only for American calls on non-dividend-paying stocks, which are never optimally exercised early and so equal European calls. Other American options need a binomial tree.",
      },
    ],
  },
  "value-at-risk": {
    post: "value-at-risk-expected-shortfall-frm",
    about: `
## Parametric VaR and expected shortfall

**Value at Risk** answers: *what loss will we not exceed with c% confidence over h days?* If returns are normal, the answer is a fixed number of standard deviations into the loss tail:

$$\\text{VaR} = V\\,(z_c\\,\\sigma\\sqrt{h} - \\mu h)$$

Volatility scales with the **square root of time** because variances of independent daily returns add up. The mean scales linearly. Many FRM questions set $\\mu = 0$.

VaR says nothing about how bad losses are beyond the cut-off. **Expected shortfall** (ES, also called conditional VaR) is the average loss given that VaR is exceeded:

$$\\text{ES} = V\\left(\\sigma\\sqrt{h}\\,\\frac{\\varphi(z_c)}{1-c} - \\mu h\\right)$$

For a **portfolio**, risks combine through the correlation. Unless $\\rho = 1$, the portfolio VaR is less than the sum of the individual VaRs — that difference is the **diversification benefit**.
`,
    faqs: [
      {
        q: "Which z-values should I memorise for the exam?",
        a: "1.645 for 95% and 2.326 for 99% (one-tailed). 1.282 for 90% and 1.96 for 97.5% also come up.",
      },
      {
        q: "Is ES always bigger than VaR?",
        a: "Yes, at the same confidence level, because it averages the losses beyond VaR. Unlike VaR, ES is subadditive, so it is a coherent risk measure.",
      },
    ],
  },
  "sharpe-treynor-jensen": {
    post: "sharpe-treynor-jensen-information-ratio",
    about: `
## Which performance measure when?

All of these measures reward **excess return** but penalise different kinds of risk:

| Measure | Risk used | Use it when |
|---|---|---|
| Sharpe ratio | Total volatility $\\sigma_p$ | The portfolio is the investor's whole wealth |
| Treynor ratio | Beta $\\beta_p$ | The portfolio is one part of a diversified whole |
| Jensen's alpha | CAPM required return | You want a percentage “beat” vs the security market line |
| M² | Total volatility, scaled to the market's | You want Sharpe's ranking in return units |
| Information ratio | Tracking error | Judging an active manager against a benchmark |
| Sortino ratio | Downside deviation | Upside volatility should not count as risk |

Sharpe and M² always rank portfolios identically. Treynor and Jensen's alpha can disagree with Sharpe when a portfolio carries a lot of diversifiable risk.
`,
    faqs: [
      {
        q: "Can the Treynor ratio be negative?",
        a: "Yes — if excess return is negative or beta is negative. Negative ratios are hard to compare, so interpret them with care.",
      },
      {
        q: "What is a good information ratio?",
        a: "Practitioners often treat 0.5 as good and 1.0 as exceptional over long periods, but it depends on the strategy.",
      },
    ],
  },
};
