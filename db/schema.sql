-- FinStep database schema (Postgres / Neon).
-- The app creates these tables automatically on first use (src/lib/db.ts);
-- this file documents them and can be run manually in the Neon SQL editor.

CREATE TABLE IF NOT EXISTS calc_usage (
  slug        TEXT PRIMARY KEY,
  count       BIGINT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback (
  id          BIGSERIAL PRIMARY KEY,
  kind        TEXT NOT NULL CHECK (kind IN ('wrong-answer', 'idea', 'bug', 'praise')),
  slug        TEXT,
  message     TEXT NOT NULL CHECK (char_length(message) BETWEEN 3 AND 2000),
  email       TEXT,
  page_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY,          -- webhook-id header (idempotency key)
  event_type      TEXT NOT NULL,
  status          TEXT,
  amount_minor    BIGINT,
  currency        TEXT,
  customer_email  TEXT,
  payload         JSONB NOT NULL,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
