import { z } from "zod";
import { calculatorSlugs } from "@/lib/finance/registry";
import { ensureSchema, getSql } from "@/lib/db";
import { clientIp, isSameOrigin, json, rateLimit, readJson } from "@/lib/api";

const Body = z.object({ slug: z.enum(calculatorSlugs as [string, ...string[]]) });

/** Records one anonymous "problem solved" for a calculator. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!rateLimit(`usage:${clientIp(req)}`, 60, 60_000)) return json({ error: "Too many requests" }, 429);

  const parsed = Body.safeParse(await readJson(req, 1_000));
  if (!parsed.success) return json({ error: "Invalid calculator" }, 400);

  const sql = getSql();
  if (!sql) return json({ ok: false, reason: "storage_unavailable" }, 202);

  try {
    await ensureSchema(sql);
    await sql`
      INSERT INTO calc_usage (slug, count) VALUES (${parsed.data.slug}, 1)
      ON CONFLICT (slug) DO UPDATE SET count = calc_usage.count + 1, updated_at = now()`;
    return json({ ok: true });
  } catch (err) {
    console.error("usage insert failed", err);
    return json({ ok: false, reason: "storage_error" }, 202);
  }
}
