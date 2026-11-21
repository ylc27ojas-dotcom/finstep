export interface Post {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  readMinutes: number;
  calculator: string;
  tags: string[];
  /** Markdown with $TeX$ and $$TeX$$. Repo-authored only. */
  body: string;
}

export const posts: Post[] = [
  {
    slug: "ba-ii-plus-bond-price-ytm-keystrokes",
    title: "BA II Plus Keystrokes for Bond Price and Yield to Maturity",
    description:
      "Price a coupon bond and solve for its YTM on the BA II Plus, step by step — plus the three settings mistakes that cost candidates marks.",
    date: "2026-11-21",
    readMinutes: 6,
    calculator: "bond-price-yield",
    tags: ["Fixed income", "BA II Plus", "FRM Part I", "CFA Level I"],
    body: `
Bond pricing is the single most common calculation in fixed income questions, and on exam day you will do it on a **Texas Instruments BA II Plus**. The good news: once the logic is clear, it is five keystrokes.

## The logic first

A coupon bond pays two things:

1. A fixed **coupon** every period.
2. The **face value** once, at maturity.

Its price is the present value of both, discounted at the yield to maturity. That's it. The TVM worksheet on the BA II Plus is built for exactly this pattern: equal payments (**PMT**) plus a lump sum at the end (**FV**).

Before you touch the calculator, reason about the answer:

- Coupon rate **below** the yield → price **below** par (discount bond).
- Coupon rate **above** the yield → price **above** par (premium bond).

If your final answer breaks this rule, you have made a keying mistake.

## Example 1: price from yield

> A 5-year bond with a face value of 1,000 pays a 6% coupon semiannually. The yield to maturity is 8%. What is its price?

Coupon 6% < yield 8%, so expect a price below 1,000.

Convert everything to **per period** first, because coupons arrive every six months:

| Input | Annual | Per period |
|---|---|---|
| Coupon | 6% × 1,000 = 60 | 60 ÷ 2 = **30** |
| Yield | 8% | 8% ÷ 2 = **4%** |
| Periods | 5 years | 5 × 2 = **10** |

Keystrokes:

| Keys | What it does |
|---|---|
| \`2ND\` \`CLR TVM\` | Clears old values |
| \`10\` \`N\` | 10 periods |
| \`4\` \`I/Y\` | 4% per period |
| \`30\` \`PMT\` | Coupon per period |
| \`1000\` \`FV\` | Face value at maturity |
| \`CPT\` \`PV\` | **−918.89** |

The price is **918.89**. The minus sign only means "money paid out".

The same answer by hand:

$$P = 30\\cdot\\frac{1-1.04^{-10}}{0.04} + \\frac{1000}{1.04^{10}} = 243.33 + 675.56 = 918.89$$

## Example 2: yield from price

Now flip it: the bond costs 918.89 — what yield does that imply? Keep N, PMT and FV, enter the price as a **negative** PV, and compute I/Y:

| Keys | What it does |
|---|---|
| \`918.89\` \`+/-\` \`PV\` | Price paid (negative) |
| \`CPT\` \`I/Y\` | **4.00** |

That is the yield **per half-year**. Multiply by 2 for the quoted YTM: **8%**.

## Example 3: a premium bond

> A 3-year bond with face value 100 pays a 10% annual coupon. The YTM is 7%.

Coupon above yield, so expect a premium. With annual coupons no conversion is needed: \`3\` \`N\`, \`7\` \`I/Y\`, \`10\` \`PMT\`, \`100\` \`FV\`, \`CPT\` \`PV\` → **−107.87**.

## The three mistakes that cost marks

1. **P/Y is not 1.** The BA II Plus ships with P/Y = 12. If it isn't set to 1, the calculator silently divides your I/Y by 12. Fix it once: \`2ND\` \`P/Y\` \`1\` \`ENTER\` \`2ND\` \`QUIT\`.
2. **Forgetting to convert to per-period values.** For semiannual bonds, halve the coupon and the yield, double the years — all three, every time.
3. **Wrong signs when solving for yield.** PV and FV must have opposite signs, otherwise you get "Error 5".

## Check your work in seconds

The [bond price & YTM calculator](/calculators/bond-price-yield) shows each of these steps with your own numbers, plus the exact keystrokes. Use it to check practice questions — then do the next one on the BA II Plus yourself.
`,
  },
  {
    slug: "macaulay-vs-modified-duration",
    title: "Macaulay vs Modified Duration (and Why Convexity Matters)",
    description:
      "What Macaulay duration, modified duration, DV01 and convexity really measure — with one bond worked through from cash flows to price change.",
    date: "2026-11-21",
    readMinutes: 7,
    calculator: "duration-convexity",
    tags: ["Fixed income", "Duration", "FRM Part I"],
    body: `
Duration is the first risk measure most finance students meet, and also the first one they mix up. There are really two ideas hiding under one name.

## Idea 1: Macaulay duration is a *time*

Imagine you hold a bond and wait for its cash. Some arrives early (coupons), most arrives late (the face value). Macaulay duration is the **average waiting time**, where each payment's time is weighted by how much of the bond's value it represents.

Take a **3-year bond, 10% annual coupon, face value 100, yield 10%**. Its price is 100 (coupon = yield). List the cash flows:

| Year t | Cash flow | PV at 10% | Weight (PV ÷ P) | t × weight |
|---|---|---|---|---|
| 1 | 10 | 9.0909 | 0.0909 | 0.0909 |
| 2 | 10 | 8.2645 | 0.0826 | 0.1653 |
| 3 | 110 | 82.6446 | 0.8264 | 2.4793 |
| | | **100.0000** | | **2.7355** |

The Macaulay duration is **2.7355 years** — less than the 3-year maturity because the coupons pull the average forward. A zero-coupon bond has only one cash flow, so its Macaulay duration equals its maturity.

## Idea 2: modified duration is a *sensitivity*

Risk managers don't care about waiting time; they care how much the price moves when yields move. Divide Macaulay duration by one plus the yield per period:

$$D_{mod} = \\frac{D_{mac}}{1+y/m} = \\frac{2.7355}{1.10} = 2.4869$$

Read this as: **if the yield rises by 1%, the price falls by about 2.49%.**

$$\\frac{\\Delta P}{P} \\approx -D_{mod}\\,\\Delta y = -2.4869 \\times 0.01 = -2.4869\\%$$

## DV01: the same thing in money

Traders size hedges in currency. DV01 is the price change for a **one basis point** move:

$$\\text{DV01} = D_{mod} \\times P \\times 0.0001 = 2.4869 \\times 100 \\times 0.0001 = 0.0249$$

## Why duration is not enough: convexity

Duration draws a **straight line** tangent to the price–yield curve. The real curve bends upward, so:

- when yields **rise**, the price falls by **less** than duration predicts;
- when yields **fall**, the price rises by **more** than duration predicts.

Convexity measures that curvature. For our bond it is **8.7562**, and the corrected estimate is:

$$\\frac{\\Delta P}{P} \\approx -D_{mod}\\,\\Delta y + \\tfrac{1}{2}\\,C\\,(\\Delta y)^2$$

For a 100 bp rise:

| Method | Estimated change |
|---|---|
| Duration only | −2.4869% |
| Duration + convexity | −2.4869% + ½ × 8.7562 × 0.0001 = **−2.4431%** |
| Actual (reprice at 11%) | **−2.4437%** |

Adding convexity takes the error from 0.04% to under 0.001%.

## Effective duration

For bonds with options (callables, mortgage-backed securities), cash flows change when yields change, so the cash-flow table above breaks down. Instead, **reprice** the bond with yields shifted down and up:

$$D_{eff} = \\frac{P_- - P_+}{2\\,P_0\\,\\Delta y}$$

For our plain bond with a 100 bp shift this gives 2.4875 — almost identical to modified duration, as it should be.

## Exam checklist

- Longer maturity, lower coupon, lower yield → **higher** duration.
- Modified duration ≈ % price change for a 100 bp move; DV01 is the currency change for 1 bp.
- Option-free bonds have **positive** convexity; callable bonds can show **negative** convexity at low yields.

Try it with your own bond in the [duration & convexity calculator](/calculators/duration-convexity) — it builds the cash-flow table for you and compares every estimate with full repricing.
`,
  },
  {
    slug: "continuous-vs-discrete-compounding",
    title: "Continuous vs Discrete Compounding: Converting Rates Step by Step",
    description:
      "Stop memorising conversion formulas. Convert any rate between annual, semiannual, quarterly and continuous compounding by reasoning from growth.",
    date: "2026-11-21",
    readMinutes: 5,
    calculator: "compounding-converter",
    tags: ["Rates", "Quantitative Analysis", "FRM Part I"],
    body: `
FRM questions love to quote a rate one way and then need it another way — a bond yield compounded semiannually feeding into a forward price that assumes continuous compounding. Instead of memorising four formulas, use one idea.

## The one idea: equal growth

Two rates are **equivalent** if 1 unit of money grows to the same amount after one year under both. So every conversion has two steps:

1. Find the one-year growth factor $g$ under the rate you have.
2. Find the rate under the new convention that produces the same $g$.

## Step 1: growth under each convention

With $m$ compounding periods a year, you earn $R/m$ each period, $m$ times:

$$g = \\left(1 + \\frac{R}{m}\\right)^{m}$$

With continuous compounding ($m \\to \\infty$) this becomes:

$$g = e^{R}$$

## Worked example: 10% semiannual → continuous

**Growth.** $g = (1 + 0.10/2)^2 = 1.05^2 = 1.1025$. One unit becomes 1.1025.

**Effective annual rate.** Strip off the original unit: $\\text{EAR} = 1.1025 - 1 = 10.25\\%$.

**Continuous rate with the same growth.** Set $e^{R_c} = 1.1025$ and take the natural log:

$$R_c = \\ln(1.1025) = 9.7580\\%$$

So 10% compounded semiannually is the same as 9.7580% compounded continuously.

## Worked example: 8% continuous → annual

**Growth.** $g = e^{0.08} = 1.083287$.

**Annual rate with the same growth.** With annual compounding, growth is simply $1 + R$, so $R = 8.3287\\%$.

## Worked example: 10% semiannual → quarterly

The growth is still 1.1025. With quarterly compounding, $(1 + R/4)^4 = 1.1025$. Take the fourth root, subtract one, multiply by four:

$$R_4 = 4\\left(1.1025^{1/4} - 1\\right) = 9.8780\\%$$

## The pattern to remember

Here is 10% semiannual expressed every possible way:

| Compounding | Equivalent rate |
|---|---|
| Annual | 10.2500% |
| Semiannual | 10.0000% |
| Quarterly | 9.8780% |
| Monthly | 9.7978% |
| Daily | 9.7593% |
| Continuous | 9.7580% |

The more often interest compounds, the **lower** the stated rate needed for the same growth. Continuous is always the lowest. If your converted rate goes the wrong way, recheck your keystrokes.

## On the BA II Plus

For discrete ↔ discrete, use the ICONV worksheet (\`2ND\` \`ICONV\`): enter NOM and C/Y, compute EFF, then change C/Y and compute NOM. For continuous rates, use \`LN\` (discrete → continuous) and \`2ND\` \`eˣ\` (continuous → discrete).

The [compounding converter](/calculators/compounding-converter) shows this growth-first working for any pair of conventions.
`,
  },
  {
    slug: "value-at-risk-expected-shortfall-frm",
    title: "How to Calculate VaR and Expected Shortfall for FRM Part I",
    description:
      "Parametric VaR, square-root-of-time scaling, expected shortfall and the diversification benefit — explained with fully worked numbers.",
    date: "2026-11-21",
    readMinutes: 8,
    calculator: "value-at-risk",
    tags: ["Risk", "VaR", "FRM Part I"],
    body: `
Value at Risk is the number senior management and regulators ask for first: **how much could we lose?** For FRM Part I you need to compute it quickly under the normal distribution and know exactly where it falls short.

## What VaR says (and doesn't)

> 1-day 99% VaR of 23,263 means: on 99 days out of 100 we expect to lose **less** than 23,263. On the remaining 1 day in 100, we lose **more** — and VaR does not say how much more.

## Step 1: the z-value

Under a normal distribution, the 1% worst outcomes start **2.326 standard deviations** below the mean. Memorise these one-tailed values:

| Confidence | z |
|---|---|
| 90% | 1.282 |
| 95% | 1.645 |
| 97.5% | 1.960 |
| 99% | 2.326 |

## Step 2: scale volatility to the horizon

If daily returns are independent, **variances** add up across days. Volatility is the square root of variance, so it grows with the **square root of time**:

$$\\sigma_h = \\sigma_{day}\\sqrt{h}$$

The mean, by contrast, grows in a straight line: $\\mu_h = \\mu_{day} \\times h$. Most FRM questions set the mean to zero.

## Step 3: VaR

$$\\text{VaR} = V\\,(z\\,\\sigma_h - \\mu_h)$$

**Example.** A 1,000,000 position has a daily volatility of 1% and zero mean.

- 1-day 99% VaR = 1,000,000 × 2.3263 × 0.01 = **23,263**
- 10-day 99% VaR = 23,263 × √10 = **73,566**

If volatility is given **annually**, first divide by √252 (trading days) to get the daily figure.

## Step 4: expected shortfall

Expected shortfall (ES) is the **average loss in the worst 1% of days**. Under normality:

$$\\text{ES} = V\\left(\\sigma_h\\,\\frac{\\varphi(z)}{1-c} - \\mu_h\\right)$$

where $\\varphi(z)$ is the height of the normal curve at $z$. At 99%, $\\varphi(2.3263) = 0.026652$, so:

$$\\text{ES}_{1\\text{-day}} = 1{,}000{,}000 \\times 0.01 \\times \\frac{0.026652}{0.01} = 26{,}652$$

ES is always larger than VaR at the same confidence level. It is also **subadditive** — the ES of a portfolio never exceeds the sum of its parts — which makes it a **coherent** risk measure. VaR is not.

## Two assets: the diversification benefit

> Position A is worth 600,000 with 1.2% daily volatility; position B is worth 400,000 with 0.8% daily volatility; correlation 0.3. Find the 1-day 99% VaR.

**Money volatility of each:** A: 600,000 × 1.2% = 7,200. B: 400,000 × 0.8% = 3,200.

**Combine with the correlation:**

$$\\sigma_p = \\sqrt{7200^2 + 3200^2 + 2(0.3)(7200)(3200)} = 8{,}712.29$$

**VaRs:**

| | VaR (99%, 1-day) |
|---|---|
| A alone | 2.3263 × 7,200 = 16,749.70 |
| B alone | 2.3263 × 3,200 = 7,444.31 |
| Sum (undiversified, ρ = 1) | 24,194.02 |
| Portfolio (ρ = 0.3) | 2.3263 × 8,712.29 = **20,267.82** |
| **Diversification benefit** | **3,926.20** |

The benefit is zero when ρ = 1 and largest when ρ = −1.

## Where parametric VaR breaks

- **Fat tails.** Real returns have more extreme days than the normal predicts, so normal VaR understates tail risk.
- **Volatility clustering.** Square-root-of-time assumes independent days; in a crisis, bad days follow bad days.
- **Non-linear positions.** Options don't have normally distributed P&L.

Plug your own numbers into the [VaR & expected shortfall calculator](/calculators/value-at-risk) — it shows VaR and ES across all confidence levels at once.
`,
  },
  {
    slug: "forward-rates-from-spot-rates",
    title: "Forward Rates from Spot Rates: A Plain-English Walkthrough",
    description:
      "Derive forward rates, discount factors and par yields from a spot curve using one no-arbitrage argument, with annual and continuous compounding.",
    date: "2026-11-21",
    readMinutes: 6,
    calculator: "spot-forward-rates",
    tags: ["Rates", "Term structure", "FRM Part I", "CFA Level I"],
    body: `
Spot rates, forward rates and par yields all describe the same yield curve from different angles. Once you see the single argument that connects them, every term-structure question becomes the same question.

## The vocabulary

- **Spot rate** $S_t$: the yield on a zero-coupon bond paying once at time $t$.
- **Forward rate** $f_{a,b}$: the rate you can lock in **today** for money lent from future time $a$ to future time $b$.
- **Discount factor** $d_t$: today's price of 1 received at time $t$.
- **Par yield**: the coupon rate at which a bond priced off the curve is worth exactly par.

## The no-arbitrage argument

You want to invest for two years. Two routes:

1. Buy a 2-year zero at the 2-year spot rate $S_2$.
2. Buy a 1-year zero at $S_1$, and today lock in the forward rate $f_{1,2}$ for the second year.

Both routes are riskless and start and end on the same dates, so they **must** end with the same money — otherwise you would borrow on the cheap route and lend on the expensive one.

$$(1+S_2)^2 = (1+S_1)(1+f_{1,2})$$

## Example: 5% and 6% spot rates

$$1 + f_{1,2} = \\frac{1.06^2}{1.05} = \\frac{1.1236}{1.05} = 1.070095$$

So the 1-year rate one year from now is **7.0095%**. It must be above 6%: the second year has to earn enough to lift the 2-year average from 5% up to 6%.

## A longer curve

Spot rates of 5%, 5.5%, 6% and 6.25% for years 1–4 give:

| Year | Spot | Discount factor | 1-yr forward | Par yield |
|---|---|---|---|---|
| 1 | 5.00% | 0.952381 | 5.0000% | 5.0000% |
| 2 | 5.50% | 0.898452 | 6.0024% | 5.4866% |
| 3 | 6.00% | 0.839619 | 7.0071% | 5.9611% |
| 4 | 6.25% | 0.784665 | 7.0035% | 6.1965% |

The forward from year 1 to year 3 is a 2-year rate, so take a square root:

$$f_{1,3} = \\left[\\frac{1.06^3}{1.05}\\right]^{1/2} - 1 = 6.5036\\%$$

## Par yields

A bond paying coupon $c$ for $n$ years is worth par when $c\\sum d_t + d_n = 1$. Solve for $c$:

$$c_n = \\frac{1 - d_n}{\\sum_{t=1}^{n} d_t}$$

For 4 years: $c_4 = (1 - 0.784665) / 3.475117 = 6.1965\\%$. On an upward-sloping curve, par yields sit slightly **below** spot rates, because the early coupons are discounted at lower rates.

## Continuous compounding makes it additive

With continuously compounded rates, growth is $e^{S t}$, and exponents add:

$$f_{a,b} = \\frac{S_b\\,b - S_a\\,a}{b - a}$$

Spot rates of 3%, 3.5% and 4%: $f_{1,3} = (0.04 \\times 3 - 0.03 \\times 1)/2 = 4.5\\%$.

## Exam reminders

- Upward-sloping spot curve → forward curve above it → par curve below it.
- Forward rates are not forecasts; they are the rates that rule out arbitrage today.

The [spot & forward rate calculator](/calculators/spot-forward-rates) builds this whole table from any spot curve you type in.
`,
  },
  {
    slug: "cost-of-carry-forward-price",
    title: "Cost of Carry: How Forward and Futures Prices Are Set",
    description:
      "One no-arbitrage idea prices forwards on stocks, indices, currencies and commodities — and tells you exactly how to arbitrage a mispriced quote.",
    date: "2026-11-21",
    readMinutes: 6,
    calculator: "forward-futures-price",
    tags: ["Derivatives", "Forwards", "FRM Part I"],
    body: `
Every forward-pricing formula in the FRM Part I syllabus comes from one comparison.

## Two ways to own the asset at time T

1. **Buy it today and carry it.** Pay the spot price $S_0$ now (financed at the risk-free rate $r$), collect any income it pays, pay any storage costs.
2. **Agree a forward price today**, pay $F_0$ at time $T$.

Both leave you owning the asset at $T$ with no risk, so they must cost the same. With continuous compounding:

$$F_0 = S_0\\,e^{(\\text{financing} + \\text{storage} - \\text{income})\\,T}$$

## Case 1: no income

A non-dividend stock trades at 40, $r = 5\\%$, delivery in 3 months:

$$F_0 = 40\\,e^{0.05 \\times 0.25} = 40.5031$$

## Case 2: known cash income

Whoever **holds** the stock collects the dividend; the forward buyer does not. So remove the dividend's **present value** before growing the price.

> Spot 50, $r$ = 8%, 1-year forward, dividend of 2 in six months.

$$I = 2\\,e^{-0.08 \\times 0.5} = 1.9216 \\qquad F_0 = (50 - 1.9216)\\,e^{0.08} = 52.0827$$

The classic trap is subtracting the full 2 instead of its present value.

## Case 3: known yield (stock indices)

An index pays dividends more or less continuously at yield $q$:

$$F_0 = S_0\\,e^{(r-q)T}$$

Index at 1,000, $r$ = 6%, $q$ = 2%, six months: $F_0 = 1000\\,e^{0.04 \\times 0.5} = 1{,}020.20$.

## Case 4: currencies

Holding foreign currency earns the foreign interest rate, which acts just like a dividend yield. This is **interest rate parity**:

$$F_0 = S_0\\,e^{(r - r_f)T}$$

With the spot at 83 (domestic per foreign), domestic rate 6.5% and foreign rate 4.5%, the 1-year forward is $83\\,e^{0.02} = 84.68$. The higher-rate currency trades at a forward discount.

## Case 5: commodities

Storage costs ($u$) add to the carry; the **convenience yield** ($y$) — the benefit of physically holding the good — subtracts:

$$F_0 = S_0\\,e^{(r + u - y)T}$$

## Spotting and trading an arbitrage

Suppose the index forward above is quoted at **1,050** instead of 1,020.20. It is too expensive, so **sell it** and build it cheaply yourself (**cash-and-carry**):

1. Borrow 1,000 and buy the index.
2. Sell the forward at 1,050.
3. At delivery, hand over the index, receive 1,050, and repay what the carry cost you: 1,020.20.

Riskless profit: **29.80** per unit.

If the quote is **too low**, do the reverse: short the asset, invest the cash, and buy forward (**reverse cash-and-carry**).

Use the [forward & futures price calculator](/calculators/forward-futures-price) to price any of these cases and check a quote for arbitrage.
`,
  },
  {
    slug: "black-scholes-d1-d2-by-hand",
    title: "Black-Scholes-Merton by Hand: d₁, d₂ and the Greeks",
    description:
      "Compute a Black-Scholes call and put step by step, understand what N(d₁) and N(d₂) mean, and verify with put-call parity.",
    date: "2026-11-21",
    readMinutes: 7,
    calculator: "black-scholes-greeks",
    tags: ["Derivatives", "Options", "FRM Part I"],
    body: `
The Black-Scholes-Merton formula looks intimidating, but it is a sequence of small, mechanical steps. Here is the full calculation for a standard textbook example.

> A stock trades at **42**. A European call and put have strike **40** and expire in **6 months**. The risk-free rate is **10%** and volatility is **20%** a year. No dividends.

## Step 1: how far in the money?

$$\\ln\\!\\left(\\frac{S_0}{K}\\right) = \\ln\\!\\left(\\frac{42}{40}\\right) = 0.048790$$

Positive, so the call is already in the money.

## Step 2: d₁

Add the expected drift over the option's life, then divide by the volatility over that life:

$$d_1 = \\frac{0.048790 + (0.10 + 0.20^2/2)(0.5)}{0.20\\sqrt{0.5}} = \\frac{0.048790 + 0.06}{0.141421} = 0.7693$$

## Step 3: d₂

$$d_2 = d_1 - \\sigma\\sqrt{T} = 0.7693 - 0.1414 = 0.6278$$

## Step 4: the probabilities

From the normal table: $N(d_1) = 0.7791$ and $N(d_2) = 0.7349$.

- $N(d_2)$ is the **risk-neutral probability** that the call is exercised.
- $N(d_1)$ is the call's **delta** — how many shares you would hold to hedge it.

## Step 5: the call

The discounted strike is $40\\,e^{-0.10 \\times 0.5} = 38.0492$.

$$c = 42 \\times 0.7791 - 38.0492 \\times 0.7349 = 4.76$$

Read it as: *value of the stock you expect to receive* minus *present value of the strike you expect to pay*.

## Step 6: the put

Use the opposite probabilities, $N(-d_1) = 0.2209$ and $N(-d_2) = 0.2651$:

$$p = 38.0492 \\times 0.2651 - 42 \\times 0.2209 = 0.81$$

## Step 7: check with put-call parity

$$c - p = S_0 - Ke^{-rT} \\quad\\Rightarrow\\quad 4.76 - 0.81 = 3.95 = 42 - 38.05 \\;\\checkmark$$

If parity fails, one of your N(d) look-ups is wrong.

## The Greeks for this option

| Greek | Call | Put | Meaning |
|---|---|---|---|
| Delta | 0.7791 | −0.2209 | Price change per 1 change in the stock |
| Gamma | 0.0500 | 0.0500 | Change in delta per 1 change in the stock |
| Vega (per 1%) | 0.0881 | 0.0881 | Price change if volatility rises 1 point |
| Theta (per year) | −4.56 | −0.75 | Time decay |
| Rho (per 1%) | 0.1398 | −0.0504 | Price change if rates rise 1 point |

Notice that gamma and vega are identical for the call and the put — a frequent exam question.

## Adding a dividend yield

For an index paying a continuous yield $q$, replace $S_0$ with $S_0e^{-qT}$ everywhere and use $r - q$ in the drift of $d_1$. Delta becomes $e^{-qT}N(d_1)$.

Run any option through the [Black-Scholes & Greeks calculator](/calculators/black-scholes-greeks) to see this exact working with your own inputs.
`,
  },
  {
    slug: "sharpe-treynor-jensen-information-ratio",
    title: "Sharpe, Treynor, Jensen's Alpha, M² and the Information Ratio: Which When?",
    description:
      "A side-by-side guide to risk-adjusted performance measures, including a worked example where Jensen's alpha and M² disagree.",
    date: "2026-11-21",
    readMinutes: 6,
    calculator: "sharpe-treynor-jensen",
    tags: ["Portfolio", "Performance measurement", "FRM Part I"],
    body: `
Raw returns are meaningless without risk: a fund that earned 12% by taking enormous bets is not better than one that earned 10% safely. Every performance measure divides or adjusts **excess return** by some measure of risk. The only question is *which* risk.

## The example

> A portfolio returned **12%** with volatility **20%** and beta **1.2**. The risk-free rate is **4%**. The market returned **10%** with volatility **15%**.

Excess return: 12% − 4% = **8%**.

## Sharpe ratio — total risk

$$S = \\frac{R_p - R_f}{\\sigma_p} = \\frac{8\\%}{20\\%} = 0.40$$

Use it when the portfolio is all the investor owns, so every bit of its volatility matters.

## Treynor ratio — market risk only

$$T = \\frac{R_p - R_f}{\\beta_p} = \\frac{8\\%}{1.2} = 6.67\\%$$

Use it when the portfolio is one piece of a diversified whole. Diversifiable risk washes out, so only beta counts.

## Jensen's alpha — beat the SML?

First, what should the portfolio have earned for its beta under CAPM?

$$R_f + \\beta_p(R_m - R_f) = 4\\% + 1.2 \\times 6\\% = 11.2\\%$$

$$\\alpha = 12\\% - 11.2\\% = 0.80\\%$$

Positive alpha: the portfolio plots **above** the security market line.

## M² — Sharpe in percentage points

Lever or de-lever the portfolio with the risk-free asset until its volatility matches the market's 15%. What would it then earn?

$$M^2 = R_f + S_p\\,\\sigma_m = 4\\% + 0.40 \\times 15\\% = 10.0\\%$$

That is exactly the market return, so the **M² alpha is zero**.

## Wait — a positive alpha but zero M²?

The two measures use different risk:

- **Jensen's alpha** only charges for beta. On that basis the portfolio did well.
- **M²** (like Sharpe) charges for **total** volatility. The market's Sharpe ratio is 6% ÷ 15% = 0.40 — identical to the portfolio's.

The portfolio carries diversifiable risk that Jensen ignores but Sharpe and M² penalise. For an investor holding only this portfolio, it offered nothing beyond the market.

## Information ratio — for active managers

Active managers are judged against a benchmark. Suppose another fund returned 9.5% against a benchmark of 8%, with a tracking error of 3%:

$$IR = \\frac{R_p - R_b}{TE} = \\frac{1.5\\%}{3\\%} = 0.50$$

## Sortino ratio — only bad volatility

Investors don't mind upside surprises. Sortino replaces total volatility with **downside deviation**. With the same fund (return 9.5%, risk-free 3%) and a downside deviation of 9%: $(9.5\\% - 3\\%) / 9\\% = 0.72$.

## Summary

| Measure | Risk in the denominator | Best for |
|---|---|---|
| Sharpe | Total volatility | Whole portfolio |
| Treynor | Beta | Part of a diversified portfolio |
| Jensen's alpha | Beta (via CAPM) | Percentage outperformance vs SML |
| M² | Total volatility | Sharpe ranking in % terms |
| Information ratio | Tracking error | Active managers vs benchmark |
| Sortino | Downside deviation | Asymmetric return profiles |

Compare your own portfolios in the [risk-adjusted performance calculator](/calculators/sharpe-treynor-jensen).
`,
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
