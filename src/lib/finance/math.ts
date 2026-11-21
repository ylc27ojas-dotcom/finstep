/**
 * Numerical helpers used by the calculators.
 * All functions are pure and deterministic.
 */

const SQRT_2PI = Math.sqrt(2 * Math.PI);

/** Standard normal probability density φ(x). */
export function normPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / SQRT_2PI;
}

/**
 * Standard normal cumulative distribution N(x).
 * Hart (1968) algorithm as presented by West (2005), accurate to double precision.
 */
export function normCdf(x: number): number {
  const xAbs = Math.abs(x);
  if (xAbs > 37) return x < 0 ? 0 : 1;

  const exponential = Math.exp(-(xAbs * xAbs) / 2);
  let cumnorm: number;

  if (xAbs < 7.07106781186547) {
    let build = 3.52624965998911e-2 * xAbs + 0.700383064443688;
    build = build * xAbs + 6.37396220353165;
    build = build * xAbs + 33.912866078383;
    build = build * xAbs + 112.079291497871;
    build = build * xAbs + 221.213596169931;
    build = build * xAbs + 220.206867912376;
    cumnorm = exponential * build;
    build = 8.83883476483184e-2 * xAbs + 1.75566716318264;
    build = build * xAbs + 16.064177579207;
    build = build * xAbs + 86.7807322029461;
    build = build * xAbs + 296.564248779674;
    build = build * xAbs + 637.333633378831;
    build = build * xAbs + 793.826512519948;
    build = build * xAbs + 440.413735824752;
    cumnorm = cumnorm / build;
  } else {
    let build = xAbs + 0.65;
    build = xAbs + 4 / build;
    build = xAbs + 3 / build;
    build = xAbs + 2 / build;
    build = xAbs + 1 / build;
    cumnorm = exponential / build / 2.506628274631;
  }

  return x > 0 ? 1 - cumnorm : cumnorm;
}

/**
 * Inverse standard normal: returns z such that N(z) = p.
 * Acklam's rational approximation with one Halley refinement step.
 */
export function normInv(p: number): number {
  if (!(p > 0 && p < 1)) {
    throw new RangeError("Probability must be strictly between 0 and 1");
  }

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let x: number;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    x =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    x =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    x =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  // One step of Halley's method brings the error to ~1e-15.
  const e = normCdf(x) - p;
  const u = e * SQRT_2PI * Math.exp((x * x) / 2);
  return x - u / (1 + (x * u) / 2);
}

/**
 * Finds x in [lo, hi] with f(x) = 0 by bisection.
 * The caller must supply a bracket where f changes sign.
 * Bisection is slower than Newton but cannot diverge, which matters
 * more than speed for a user-facing calculator.
 */
export function bisect(
  f: (x: number) => number,
  lo: number,
  hi: number,
  tol = 1e-13,
  maxIter = 300,
): number {
  let fLo = f(lo);
  const fHi = f(hi);
  if (fLo === 0) return lo;
  if (fHi === 0) return hi;
  if (Math.sign(fLo) === Math.sign(fHi)) {
    throw new RangeError("Root is not bracketed");
  }
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    const fMid = f(mid);
    if (fMid === 0 || (hi - lo) / 2 < tol) return mid;
    if (Math.sign(fMid) === Math.sign(fLo)) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/** True when x is within `eps` of a whole number. */
export function isWhole(x: number, eps = 1e-9): boolean {
  return Math.abs(x - Math.round(x)) < eps;
}
