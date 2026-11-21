import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { ensureSchema, getSql } from "@/lib/db";
import { json } from "@/lib/api";

/**
 * Dodo Payments webhook (Standard Webhooks spec).
 * Verifies the signature, then records the event idempotently by webhook-id.
 */
export async function POST(req: Request) {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) return json({ error: "Webhook not configured" }, 503);

  const raw = await req.text();
  if (raw.length > 256_000) return json({ error: "Payload too large" }, 413);

  const headers = {
    "webhook-id": req.headers.get("webhook-id") ?? "",
    "webhook-signature": req.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
  };

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = new Webhook(secret).verify(raw, headers) as typeof event;
  } catch (err) {
    if (err instanceof WebhookVerificationError) return json({ error: "Invalid signature" }, 401);
    console.error("webhook verification error", err);
    return json({ error: "Invalid webhook" }, 400);
  }

  const sql = getSql();
  if (!sql) {
    // Let Dodo retry later rather than silently dropping a payment event.
    return json({ error: "Storage unavailable" }, 503);
  }

  const data = event.data ?? {};
  const customer = (data.customer ?? {}) as Record<string, unknown>;
  const amount = typeof data.total_amount === "number" ? data.total_amount : null;

  try {
    await ensureSchema(sql);
    await sql`
      INSERT INTO payments (id, event_type, status, amount_minor, currency, customer_email, payload)
      VALUES (
        ${headers["webhook-id"]},
        ${event.type ?? "unknown"},
        ${typeof data.status === "string" ? data.status : null},
        ${amount},
        ${typeof data.currency === "string" ? data.currency : null},
        ${typeof customer.email === "string" ? customer.email : null},
        ${JSON.stringify(event)}::jsonb
      )
      ON CONFLICT (id) DO NOTHING`;
    return json({ received: true });
  } catch (err) {
    console.error("payment insert failed", err);
    return json({ error: "Could not record event" }, 500);
  }
}
