/**
 * Formatting helpers. Display strings use en-US grouping (1,234.56),
 * which matches how FRM and CFA questions are printed.
 */

function clean(x: number): number {
  // Avoid "-0.00" in output.
  return Object.is(x, -0) || Math.abs(x) < 1e-12 ? 0 : x;
}

/** Number with a fixed number of decimals and thousands separators. */
export function num(x: number, dp = 2): string {
  if (!Number.isFinite(x)) return "—";
  return clean(x).toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

/** Decimal rate shown as a percentage, e.g. 0.0612 -> "6.1200%". */
export function pct(x: number, dp = 4): string {
  if (!Number.isFinite(x)) return "—";
  return `${num(x * 100, dp)}%`;
}

/** Number formatted for TeX: grouping commas need braces so KaTeX keeps them tight. */
export function tnum(x: number, dp = 4): string {
  return num(x, dp).replace(/,/g, "{,}");
}

/** Percentage formatted for TeX. */
export function tpct(x: number, dp = 4): string {
  return `${tnum(x * 100, dp)}\\%`;
}

/** Trims trailing zeros for keystroke inputs: 3.000000 -> "3", 2.5 -> "2.5". */
export function plain(x: number, maxDp = 6): string {
  if (!Number.isFinite(x)) return "—";
  const fixed = clean(x).toFixed(maxDp);
  return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
}

/** Rate for the BA II Plus I/Y register (entered as a percentage). */
export function iy(rateDecimal: number): string {
  return plain(rateDecimal * 100, 6);
}
