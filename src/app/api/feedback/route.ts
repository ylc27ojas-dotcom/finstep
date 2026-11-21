import { z } from "zod";
import { calculatorSlugs } from "@/lib/finance/registry";
import { ensureSchema, getSql } from "@/lib/db";
import { clientIp, isSameOrigin, json, rateLimit, readJson } from "@/lib/api";

const Body = z.object({
  kind: z.enum(["wrong-answer", "idea", "bug", "praise"]),
  message: z.string().trim().min(3, "Please write a few words.").max(2000, "Please keep it under 2,000 characters."),
  email: z.email("That email address doesn't look right.").max(200).optional(),
  slug: z.enum(calculatorSlugs as [string, ...string[]]).optional(),
  pageUrl: z.string().max(500).optional(),
  website: z.string().max(200).optional(), // honeypot
});

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!rateLimit(`feedback:${clientIp(req)}`, 5, 10 * 60_000)) {
    return json({ error: "You've sent a lot of feedback — please wait a few minutes." }, 429);
  }

  const parsed = Body.safeParse(await readJson(req));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return json({ error: first?.message ?? "Invalid feedback." }, 400);
  }
  const data = parsed.data;

  // Bots fill every field; pretend success so they don't retry.
  if (data.website) return json({ ok: true }, 201);

  const sql = getSql();
  if (!sql) {
    return json({ error: "Feedback storage isn't connected yet. Please try again later." }, 503);
  }

  try {
    await ensureSchema(sql);
    await sql`
      INSERT INTO feedback (kind, slug, message, email, page_url)
      VALUES (${data.kind}, ${data.slug ?? null}, ${data.message}, ${data.email ?? null}, ${data.pageUrl ?? null})`;
    return json({ ok: true }, 201);
  } catch (err) {
    console.error("feedback insert failed", err);
    return json({ error: "Could not save your feedback. Please try again." }, 500);
  }
}
