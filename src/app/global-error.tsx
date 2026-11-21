"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fbfbf8", color: "#0b1220", margin: 0 }}>
        <div style={{ maxWidth: 480, margin: "15vh auto", padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>FinStep hit an error</h1>
          <p style={{ color: "#5b6474" }}>Please reload the page. If the problem continues, try again in a few minutes.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, padding: "12px 20px", borderRadius: 12, background: "#0b1220", color: "white", border: 0, fontWeight: 600, cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
