import katex from "katex";

interface TexProps {
  tex: string;
  block?: boolean;
  className?: string;
}

/**
 * Renders TeX with KaTeX. Works in both server and client components;
 * on the server the HTML is produced at build time, so no JS is shipped
 * for static formulas.
 */
export function Tex({ tex, block = false, className = "" }: TexProps) {
  const html = katex.renderToString(tex, {
    displayMode: block,
    throwOnError: false,
    strict: "ignore",
    output: "htmlAndMathml",
  });
  if (block) {
    return <div className={`tex-block ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
