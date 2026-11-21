import { connection } from "next/server";
import { ensureSchema, getSql } from "@/lib/db";
import { json } from "@/lib/api";

/** Public, aggregate-only usage stats (shown on the landing page). */
export async function GET() {
  await connection(); // always run at request time; never prerender a stale count

  const sql = getSql();
  if (!sql) return json({ available: false }, 200);

  try {
    await ensureSchema(sql);
    const rows = (await sql`SELECT slug, count FROM calc_usage ORDER BY count DESC`) as { slug: string; count: string | number }[];
    const bySlug = Object.fromEntries(rows.map((r) => [r.slug, Number(r.count)]));
    const total = rows.reduce((sum, r) => sum + Number(r.count), 0);
    return json({ available: true, total, bySlug }, 200, {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    });
  } catch (err) {
    console.error("stats query failed", err);
    return json({ available: false }, 200);
  }
}
