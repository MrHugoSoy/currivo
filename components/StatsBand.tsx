"use client";
export default function StatsBand() {
  const stats = [
    { n: "4,200+", l: "CVs generados" },
    { n: "15+", l: "Plantillas" },
    { n: "3 min", l: "Tiempo promedio" },
    { n: "4.8/5", l: "Calificación" },
    { n: "Gratis", l: "El primero" },
  ];
  return (
    <div style={{ background: "var(--ink)", padding: "22px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px", display: "flex", gap: 48, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        {stats.map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 48 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, letterSpacing: "-1px", color: "#fff", lineHeight: 1 }}>{s.n}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.l}</span>
            </div>
            {i < stats.length - 1 && <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
