"use client";

import { useEffect, useState } from "react";

/** Live "problems solved" count from the database. Renders nothing if the API is unavailable. */
export function SolvedCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/stats", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { total?: number } | null) => {
        if (data && typeof data.total === "number" && data.total > 0) setTotal(data.total);
      })
      .catch(() => {
        /* counter is decorative */
      });
    return () => controller.abort();
  }, []);

  if (total === null) return null;
  return (
    <span>
      {" "}
      · <strong className="tabular font-semibold text-ink">{total.toLocaleString("en-US")}</strong> problems solved
    </span>
  );
}
