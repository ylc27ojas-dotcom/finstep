/**
 * Site-wide configuration. Change the name or domain here and every page,
 * sitemap entry, OG image and JSON-LD block picks it up.
 */

function normaliseUrl(raw: string | undefined): string {
  const fallback = "http://localhost:3000";
  if (!raw) return fallback;
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return fallback;
  }
}

export const site = {
  name: "FinStep",
  tagline: "Finance calculators that show their working",
  description:
    "Free FRM and CFA calculators that show every step: bond pricing, duration and convexity, forward rates, Black-Scholes, VaR and more — with the BA II Plus keystrokes.",
  url: normaliseUrl(process.env.NEXT_PUBLIC_SITE_URL),
  author: "Ojas Gupta",
  locale: "en_US",
  keywords: [
    "FRM calculator",
    "CFA calculator",
    "bond price calculator",
    "duration and convexity calculator",
    "BA II Plus keystrokes",
    "Black-Scholes calculator",
    "value at risk calculator",
    "forward rate calculator",
  ],
} as const;

export const pro = {
  checkoutUrl: process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL ?? "",
  priceLabel: process.env.NEXT_PUBLIC_PRO_PRICE_LABEL ?? "₹149",
};

export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}
