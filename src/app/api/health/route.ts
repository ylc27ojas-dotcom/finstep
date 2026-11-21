import { connection } from "next/server";
import { getSql, isDbConfigured } from "@/lib/db";
import { json } from "@/lib/api";

/** Liveness + dependency check for uptime monitors. */
export async function GET() {
  await connection();
  let database: "ok" | "not_configured" | "error" = "not_configured";
  if (isDbConfigured()) {
    try {
      await getSql()!`SELECT 1`;
      database = "ok";
    } catch {
      database = "error";
    }
  }
  return json({ status: database === "error" ? "degraded" : "ok", database }, database === "error" ? 503 : 200);
}
