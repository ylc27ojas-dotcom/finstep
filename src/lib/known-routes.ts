/**
 * Slugs for the dynamic routes, kept dependency-free so the proxy stays tiny.
 * A unit test checks these lists match the calculator registry and posts.
 */
export const CALCULATOR_SLUGS = [
  "bond-price-yield",
  "duration-convexity",
  "compounding-converter",
  "spot-forward-rates",
  "forward-futures-price",
  "black-scholes-greeks",
  "value-at-risk",
  "sharpe-treynor-jensen",
] as const;

export const POST_SLUGS = [
  "ba-ii-plus-bond-price-ytm-keystrokes",
  "macaulay-vs-modified-duration",
  "continuous-vs-discrete-compounding",
  "value-at-risk-expected-shortfall-frm",
  "forward-rates-from-spot-rates",
  "cost-of-carry-forward-price",
  "black-scholes-d1-d2-by-hand",
  "sharpe-treynor-jensen-information-ratio",
] as const;
