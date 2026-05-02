import React from "react";

interface SkProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: React.CSSProperties;
}

export function Sk({ width = "100%", height = 14, radius = 4, style }: SkProps) {
  return (
    <span
      className="skeleton"
      style={{ width, height, borderRadius: radius, display: "block", ...style }}
    />
  );
}

/** Skeleton para una CVCard del dashboard */
export function CVCardSkeleton() {
  return (
    <div style={{
      background: "var(--paper)", border: "1px solid var(--border)",
      borderRadius: 8, padding: 20, marginBottom: 10,
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
        <Sk width={32} height={32} radius="50%" />
        <div style={{ flex: 1 }}>
          <Sk width="40%" height={14} style={{ marginBottom: 8 }} />
          <Sk width="60%" height={11} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
        <Sk width={88} height={30} radius={6} />
        <Sk width={80} height={30} radius={6} />
        <Sk width={72} height={30} radius={6} />
        <Sk width={72} height={30} radius={6} />
      </div>
    </div>
  );
}

/** Skeleton para una CVCard del perfil (formato tarjeta) */
export function CVCardPerfilSkeleton() {
  return (
    <div style={{
      background: "var(--paper)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "18px 20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Sk width={80} height={20} radius={4} />
        <Sk width={48} height={12} radius={4} />
      </div>
      <Sk width="70%" height={17} style={{ marginBottom: 8 }} />
      <Sk width="50%" height={12} style={{ marginBottom: 14 }} />
      <div style={{ height: 1, background: "var(--border)", marginBottom: 12 }} />
      <div style={{ display: "flex", gap: 7 }}>
        <Sk height={30} radius={6} style={{ flex: 1 }} />
        <Sk height={30} radius={6} style={{ flex: 1 }} />
        <Sk height={30} radius={6} style={{ flex: 1 }} />
        <Sk height={30} radius={6} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

/** Skeleton para la página del CV público */
export function CVPageSkeleton() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 72px" }}>
      {/* Action bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, padding: "12px 20px", background: "var(--paper)", borderRadius: 8, border: "1px solid var(--border)" }}>
        <Sk width={130} height={32} radius={5} />
        <Sk width={110} height={32} radius={5} />
        <Sk width={80} height={32} radius={5} />
      </div>
      {/* CV content */}
      <div style={{ background: "var(--paper)", borderRadius: 8, border: "1px solid var(--border)", padding: "40px 44px" }}>
        <Sk width="55%" height={36} style={{ marginBottom: 10 }} />
        <Sk width="35%" height={14} style={{ marginBottom: 8 }} />
        <Sk width="50%" height={11} style={{ marginBottom: 24 }} />
        <div style={{ height: 2, background: "var(--border)", marginBottom: 22 }} />
        {[80, 60, 75, 65, 50, 70].map((w, i) => (
          <Sk key={i} width={`${w}%`} height={11} style={{ marginBottom: 10 }} />
        ))}
        <div style={{ height: 1, background: "var(--border)", margin: "20px 0" }} />
        {[90, 55, 70, 45].map((w, i) => (
          <Sk key={i} width={`${w}%`} height={11} style={{ marginBottom: 10 }} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton para el editor split-pane */
export function EditorSkeleton() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ height: 56, background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "0 64px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sk width={80} height={22} radius={4} />
          <Sk width={16} height={16} radius={4} />
          <Sk width={180} height={14} radius={4} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Sk width={130} height={32} radius={6} />
          <Sk width={110} height={32} radius={6} />
        </div>
      </div>
      {/* Sub-header */}
      <div style={{ height: 34, background: "var(--paper)", borderBottom: "1px solid var(--border)", flexShrink: 0 }} />
      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: "45%", background: "var(--paper)", borderRight: "1px solid var(--border)", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <Sk key={i} width={`${55 + Math.sin(i) * 30}%`} height={11} />
          ))}
        </div>
        <div style={{ flex: 1, background: "var(--cream)", padding: "24px 32px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, padding: "40px 44px", display: "flex", flexDirection: "column", gap: 10 }}>
            <Sk width="50%" height={32} />
            <Sk width="30%" height={14} style={{ marginBottom: 16 }} />
            {[85, 60, 72, 65, 50, 78, 55, 68].map((w, i) => (
              <Sk key={i} width={`${w}%`} height={11} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
