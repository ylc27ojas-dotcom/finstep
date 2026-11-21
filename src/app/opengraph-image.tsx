import { ogSize, renderOgImage } from "@/lib/og";

export const alt = "FinStep — FRM & CFA calculators that show every step";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "FRM Part I · CFA Level I",
    title: "Finance calculators that show their working",
    subtitle: "Bond pricing, duration, forward rates, Black-Scholes, VaR and more.",
  });
}
