import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Postgres access via Neon's HTTP driver (works on Vercel serverless functions
 * with no connection pooling to manage).
 *
 * The site is fully usable without a database: every caller checks
 * `getSql()` and degrades gracefully when it returns null.
 */

let client: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

function databaseUrl(): string | undefined {
  // Vercel's Neon integration sets DATABASE_URL; some setups use POSTGRES_URL.
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

export function isDbConfigured(): boolean {
  return Boolean(databaseUrl());
}

export function getSql(): NeonQueryFunction<false, false> | null {
  const url = databaseUrl();
  if (!url) return null;
  client ??= neon(url);
  return client;
}

/**
 * Creates tables on first use, once per server instance. Statements are
 * idempotent, so concurrent cold starts are safe. Mirrors db/schema.sql.
 */
export function ensureSchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  schemaReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS calc_usage (
        slug        TEXT PRIMARY KEY,
        count       BIGINT NOT NULL DEFAULT 0,
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id          BIGSERIAL PRIMARY KEY,
        kind        TEXT NOT NULL CHECK (kind IN ('wrong-answer', 'idea', 'bug', 'praise')),
        slug        TEXT,
        message     TEXT NOT NULL CHECK (char_length(message) BETWEEN 3 AND 2000),
        email       TEXT,
        page_url    TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id              TEXT PRIMARY KEY,
        event_type      TEXT NOT NULL,
        status          TEXT,
        amount_minor    BIGINT,
        currency        TEXT,
        customer_email  TEXT,
        payload         JSONB NOT NULL,
        received_at     TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
  })().catch((err) => {
    schemaReady = null; // retry on the next request
    throw err;
  });
  return schemaReady;
}
