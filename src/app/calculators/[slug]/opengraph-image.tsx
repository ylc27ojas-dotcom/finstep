import { calculatorSlugs, getCalculator } from "@/lib/finance/registry";
import { ogSize, renderOgImage } from "@/lib/og";

export const alt = "FinStep calculator";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return calculatorSlugs.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = getCalculator(slug);
  return renderOgImage({
    eyebrow: def ? `${def.category} calculator` : "Calculator",
    title: def?.shortName ?? "FinStep",
    subtitle: def?.tagline ?? "Finance calculators that show their working.",
  });
}
