import { CVPageSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Header bar */}
      <header style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "0 64px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px" }}>
          currivo
        </span>
      </header>
      <CVPageSkeleton />
    </div>
  );
}
