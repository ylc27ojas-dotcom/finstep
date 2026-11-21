import { NextResponse, type NextRequest } from "next/server";
import { CALCULATOR_SLUGS, POST_SLUGS } from "@/lib/known-routes";

const calculators = new Set<string>(CALCULATOR_SLUGS);
const postSet = new Set<string>(POST_SLUGS);

/**
 * Pages are streamed, so a notFound() inside a dynamic route would arrive with
 * a 200 status. Unknown slugs are caught here instead and served the real 404.
 */
export function proxy(request: NextRequest) {
  const [, section, slug, extra] = request.nextUrl.pathname.split("/");
  const known = section === "calculators" ? calculators : postSet;
  if (slug && !extra && !known.has(slug)) {
    return NextResponse.rewrite(new URL("/__not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/calculators/:slug", "/blog/:slug"],
};
