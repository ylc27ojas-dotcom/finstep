import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "standardwebhooks";

// In-memory stand-in for the Neon client: records every query.
const queries: string[] = [];
const fakeSql = vi.fn(async (strings: TemplateStringsArray) => {
  queries.push(strings.join("?"));
  return [];
});
let dbAvailable = false;

vi.mock("@/lib/db", () => ({
  getSql: () => (dbAvailable ? fakeSql : null),
  isDbConfigured: () => dbAvailable,
  ensureSchema: async () => {},
}));

const { POST: feedback } = await import("./feedback/route");
const { POST: usage } = await import("./usage/route");
const { POST: webhook } = await import("./webhooks/dodo/route");

let ipCounter = 0;
function req(path: string, body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${ipCounter}`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  queries.length = 0;
  dbAvailable = false;
});
afterEach(() => {
  delete process.env.DODO_WEBHOOK_SECRET;
});

describe("POST /api/feedback", () => {
  it("rejects too-short messages", async () => {
    const res = await feedback(req("/api/feedback", { kind: "idea", message: "x" }));
    expect(res.status).toBe(400);
  });

  it("rejects unknown kinds and bad emails", async () => {
    expect((await feedback(req("/api/feedback", { kind: "spam", message: "hello there" }))).status).toBe(400);
    expect((await feedback(req("/api/feedback", { kind: "idea", message: "hello there", email: "nope" }))).status).toBe(400);
  });

  it("returns 503 when the database is not configured", async () => {
    const res = await feedback(req("/api/feedback", { kind: "idea", message: "hello there" }));
    expect(res.status).toBe(503);
  });

  it("stores valid feedback", async () => {
    dbAvailable = true;
    const res = await feedback(req("/api/feedback", { kind: "wrong-answer", message: "Call price is off", slug: "black-scholes-greeks" }));
    expect(res.status).toBe(201);
    expect(queries.some((q) => q.includes("INSERT INTO feedback"))).toBe(true);
  });

  it("silently accepts honeypot submissions without storing them", async () => {
    dbAvailable = true;
    const res = await feedback(req("/api/feedback", { kind: "idea", message: "buy now", website: "spam.example" }));
    expect(res.status).toBe(201);
    expect(queries).toHaveLength(0);
  });

  it("blocks cross-origin browser posts", async () => {
    const res = await feedback(req("/api/feedback", { kind: "idea", message: "hello there" }, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });

  it("rate-limits a single client", async () => {
    dbAvailable = true;
    const make = () =>
      new Request("http://localhost/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "192.168.1.1" },
        body: JSON.stringify({ kind: "idea", message: "hello there" }),
      });
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await feedback(make())).status);
    expect(statuses.slice(0, 5).every((s) => s === 201)).toBe(true);
    expect(statuses[6]).toBe(429);
  });

  it("handles malformed JSON", async () => {
    const res = await feedback(req("/api/feedback", "{not json"));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/usage", () => {
  it("rejects unknown calculators", async () => {
    expect((await usage(req("/api/usage", { slug: "nope" }))).status).toBe(400);
  });

  it("accepts known calculators and upserts the count", async () => {
    dbAvailable = true;
    const res = await usage(req("/api/usage", { slug: "value-at-risk" }));
    expect(res.status).toBe(200);
    expect(queries.some((q) => q.includes("ON CONFLICT (slug)"))).toBe(true);
  });

  it("degrades gracefully without a database", async () => {
    expect((await usage(req("/api/usage", { slug: "value-at-risk" }))).status).toBe(202);
  });
});

describe("POST /api/webhooks/dodo", () => {
  const secret = "whsec_" + Buffer.from("test-secret-for-finstep-webhooks").toString("base64");
  const payload = JSON.stringify({
    type: "payment.succeeded",
    data: { payment_id: "pay_1", total_amount: 14900, currency: "INR", status: "succeeded", customer: { email: "a@b.co" } },
  });

  function signed(body: string, id = "msg_1") {
    const ts = new Date();
    const sig = new Webhook(secret).sign(id, ts, body);
    return new Request("http://localhost/api/webhooks/dodo", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "webhook-id": id,
        "webhook-timestamp": String(Math.floor(ts.getTime() / 1000)),
        "webhook-signature": sig,
      },
      body,
    });
  }

  it("returns 503 when no secret is configured", async () => {
    expect((await webhook(signed(payload))).status).toBe(503);
  });

  it("rejects bad signatures", async () => {
    process.env.DODO_WEBHOOK_SECRET = secret;
    const bad = signed(payload);
    const tampered = new Request(bad.url, { method: "POST", headers: bad.headers, body: payload.replace("14900", "1") });
    expect((await webhook(tampered)).status).toBe(401);
  });

  it("records a correctly signed payment event", async () => {
    process.env.DODO_WEBHOOK_SECRET = secret;
    dbAvailable = true;
    const res = await webhook(signed(payload));
    expect(res.status).toBe(200);
    expect(queries.some((q) => q.includes("INSERT INTO payments"))).toBe(true);
  });
});
