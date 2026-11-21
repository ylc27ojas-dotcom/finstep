import { Marked, type TokenizerAndRendererExtension } from "marked";
import katex from "katex";

function renderTex(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, { displayMode, throwOnError: false, strict: "ignore" });
}

/** $$ … $$ on its own lines → display math. */
const blockMath: TokenizerAndRendererExtension = {
  name: "blockMath",
  level: "block",
  start(src) {
    return src.indexOf("$$");
  },
  tokenizer(src) {
    const match = /^\$\$([\s\S]+?)\$\$(?:\n|$)/.exec(src);
    if (match) return { type: "blockMath", raw: match[0], text: match[1].trim() };
    return undefined;
  },
  renderer(token) {
    return `<div class="tex-block">${renderTex(token.text as string, true)}</div>\n`;
  },
};

/** $ … $ inside a paragraph → inline math. A "$" followed by a digit is treated as currency. */
const inlineMath: TokenizerAndRendererExtension = {
  name: "inlineMath",
  level: "inline",
  start(src) {
    const i = src.search(/\$(?!\d)/);
    return i === -1 ? undefined : i;
  },
  tokenizer(src) {
    const match = /^\$(?!\d)((?:\\\$|[^$\n])+?)\$/.exec(src);
    if (match) return { type: "inlineMath", raw: match[0], text: match[1].trim() };
    return undefined;
  },
  renderer(token) {
    return renderTex(token.text as string, false);
  },
};

const marked = new Marked({ gfm: true, async: false });
marked.use({ extensions: [blockMath, inlineMath] });

/**
 * Converts trusted, repo-authored markdown (with $TeX$) to HTML.
 * Never pass user input here: the output is injected without sanitising.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md) as string;
}
