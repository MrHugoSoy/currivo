import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "resumika — Generador de CV con IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontBold = await readFile(join(process.cwd(), "public/fonts/DMSans-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#fffefc",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          fontFamily: "DMSans",
          position: "relative",
        }}
      >
        {/* green accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "#2a5236", display: "flex" }} />

        {/* logo */}
        <div style={{ fontSize: 56, fontWeight: 700, color: "#1a1814", letterSpacing: "-2px", marginBottom: 24, display: "flex" }}>
          resumi<span style={{ color: "#2a5236" }}>ka</span>
        </div>

        {/* headline */}
        <div style={{ fontSize: 36, fontWeight: 700, color: "#1a1814", textAlign: "center", maxWidth: 800, lineHeight: 1.2, marginBottom: 20, display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
          Genera tu CV profesional con IA en 3 minutos
        </div>

        {/* markets */}
        <div style={{ display: "flex", gap: 16, marginBottom: 36 }}>
          {["🇲🇽 México", "🇺🇸 USA", "🇨🇦 Canadá"].map((m) => (
            <div key={m} style={{ background: "#edf4ef", color: "#2a5236", border: "1px solid rgba(42,82,54,.2)", borderRadius: 100, padding: "8px 20px", fontSize: 20, fontWeight: 600, display: "flex" }}>
              {m}
            </div>
          ))}
        </div>

        {/* cta */}
        <div style={{ background: "#2a5236", color: "#fff", borderRadius: 8, padding: "14px 36px", fontSize: 22, fontWeight: 700, display: "flex" }}>
          resumika.com — Gratis
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "DMSans", data: fontBold, style: "normal", weight: 700 }],
    }
  );
}
