import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Shared social-card design: dark card, step mark, title and a strap line. */
export function renderOgImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#0b1220",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 46 }}>
            <div style={{ width: 14, height: 18, background: "#e7f3ef", borderRadius: 3 }} />
            <div style={{ width: 14, height: 31, background: "#6cc3ab", borderRadius: 3 }} />
            <div style={{ width: 14, height: 46, background: "#0e9c80", borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>FinStep</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 26, color: "#9fe3cf", textTransform: "uppercase", letterSpacing: 3 }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 48 ? 58 : 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 1040 }}>
            {title}
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.7)", lineHeight: 1.35, maxWidth: 1000 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 24, color: "rgba(255,255,255,0.55)" }}>
          Step-by-step working · BA II Plus keystrokes · Free
        </div>
      </div>
    ),
    ogSize,
  );
}
