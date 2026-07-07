"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CVCard, type CVCardData } from "./CVCard";
import { CVCardSkeleton } from "@/components/Skeleton";

const ADMIN_EMAILS = ["hugoivanrf@gmail.com"];

type GiftCode = { id: string; code: string; is_used: boolean; used_at: string | null; created_at: string };

type Stats = {
  totalCvs: number;
  uniqueUsers: number;
  proUsers: number;
  giftUsers: number;
  byTemplate: Record<string, number>;
  byMarket: Record<string, number>;
  giftTotal: number;
  giftUsed: number;
};

const TEMPLATE_LABELS: Record<string, string> = {
  clasico: "Clásico",
  oscuro: "Oscuro",
  minimalista: "Minimalista",
  moderno: "Moderno",
};

const MARKET_LABELS: Record<string, string> = {
  mx: "México",
  ca: "Canadá",
  us: "EE.UU.",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
      <div style={{ fontSize: 11, color: "var(--hint)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ data, labels }: { data: Record<string, number>; labels: Record<string, string> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return <p style={{ fontSize: 12, color: "var(--hint)" }}>Sin datos</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", width: 90, flexShrink: 0 }}>{labels[key] ?? key}</div>
            <div style={{ flex: 1, background: "var(--warm)", borderRadius: 4, overflow: "hidden", height: 8 }}>
              <div style={{ width: `${(count / total) * 100}%`, height: "100%", background: "var(--green-mid)", borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600, width: 28, textAlign: "right" }}>{count}</div>
          </div>
        ))}
    </div>
  );
}

export default function Dashboard() {
  const [cvs, setCvs] = useState<CVCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
  const [giftLoading, setGiftLoading] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email ?? "";

      if (!ADMIN_EMAILS.includes(email)) {
        router.replace("/");
        return;
      }

      setAuthed(true);
      const uid = session!.user.id;
      setUserId(uid);
      loadGiftCodes(uid);

      const { data: cvsData, error } = await supabase
        .from("cvs")
        .select("id, slug, nombre, puesto, mercado, template, created_at, user_id")
        .order("created_at", { ascending: false });

      if (!error && cvsData) {
        setCvs(cvsData as CVCardData[]);

        const uniqueUsers = new Set(cvsData.map((c: { user_id: string }) => c.user_id)).size;
        const byTemplate: Record<string, number> = {};
        const byMarket: Record<string, number> = {};
        for (const cv of cvsData) {
          const t = (cv as { template: string }).template ?? "unknown";
          const m = (cv as { mercado: string }).mercado ?? "unknown";
          byTemplate[t] = (byTemplate[t] ?? 0) + 1;
          byMarket[m] = (byMarket[m] ?? 0) + 1;
        }

        const { count: proCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_pro", true)
          .neq("pro_plan", "gift");

        const { count: giftCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_pro", true)
          .eq("pro_plan", "gift");

        const { count: giftTotal } = await supabase
          .from("gift_codes")
          .select("*", { count: "exact", head: true });

        const { count: giftUsed } = await supabase
          .from("gift_codes")
          .select("*", { count: "exact", head: true })
          .eq("is_used", true);

        setStats({
          totalCvs: cvsData.length,
          uniqueUsers,
          proUsers: proCount ?? 0,
          giftUsers: giftCount ?? 0,
          byTemplate,
          byMarket,
          giftTotal: giftTotal ?? 0,
          giftUsed: giftUsed ?? 0,
        });
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function loadGiftCodes(uid: string) {
    const res = await fetch(`/api/gift/generate?userId=${uid}`);
    if (res.ok) { const d = await res.json(); setGiftCodes(d.codes ?? []); }
  }

  async function handleGenerate() {
    if (!userId) return;
    setGiftLoading(true);
    const res = await fetch("/api/gift/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, count: genCount }),
    });
    if (res.ok) {
      const d = await res.json();
      setGiftCodes(prev => [...(d.codes ?? []), ...prev]);
      setStats(prev => prev ? { ...prev, giftTotal: prev.giftTotal + (d.codes?.length ?? 0) } : prev);
    }
    setGiftLoading(false);
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code); setTimeout(() => setCopied(null), 2000);
  }

  function handleDelete(id: string) {
    setCvs((prev) => prev.filter((cv) => cv.id !== id));
    setStats(prev => prev ? { ...prev, totalCvs: prev.totalCvs - 1 } : prev);
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--green-mid)", animation: "spin .65s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* Nav */}
      <header style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "0 64px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px", textDecoration: "none" }}>
          resumika
        </a>
        <span style={{ fontSize: 11, color: "var(--hint)" }}>Dashboard</span>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 64px 80px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 12, color: "var(--hint)" }}>Estadísticas generales del sistema</p>
        </div>

        {/* Stats grid */}
        {stats ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
              <StatCard label="CVs totales" value={stats.totalCvs} />
              <StatCard label="Usuarios únicos" value={stats.uniqueUsers} />
              <StatCard label="Usuarios Pro" value={stats.proUsers} sub="planes activos" />
              <StatCard label="Usuarios Gift" value={stats.giftUsers} sub="código de regalo" />
              <StatCard label="Códigos regalo" value={`${stats.giftUsed} / ${stats.giftTotal}`} sub="usados / total" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 40 }}>
              <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 11, color: "var(--hint)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>CVs por plantilla</div>
                <MiniBar data={stats.byTemplate} labels={TEMPLATE_LABELS} />
              </div>
              <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 11, color: "var(--hint)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>CVs por mercado</div>
                <MiniBar data={stats.byMarket} labels={MARKET_LABELS} />
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 40 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px", height: 80, opacity: 0.5 }} />
            ))}
          </div>
        )}

        {/* Gift codes */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: 16 }}>
            Códigos de regalo
          </h2>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Generar</span>
            <input type="number" min={1} max={50} value={genCount} onChange={e => setGenCount(Number(e.target.value))}
              style={{ width: 60, background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", fontSize: 13, color: "var(--ink)", fontFamily: "inherit", outline: "none" }} />
            <span style={{ fontSize: 13, color: "var(--muted)" }}>código{genCount !== 1 ? "s" : ""}</span>
            <button onClick={handleGenerate} disabled={giftLoading}
              style={{ background: "var(--green-mid)", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: giftLoading ? "default" : "pointer", opacity: giftLoading ? 0.6 : 1 }}>
              {giftLoading ? "Generando..." : "Generar"}
            </button>
          </div>

          {giftCodes.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--hint)" }}>No hay códigos generados todavía.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 8 }}>
              {giftCodes.map(gc => (
                <div key={gc.id} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, opacity: gc.is_used ? 0.5 : 1 }}>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 600, color: gc.is_used ? "var(--hint)" : "var(--ink)", letterSpacing: "1px" }}>{gc.code}</div>
                    <div style={{ fontSize: 10, color: "var(--hint)", marginTop: 3 }}>
                      {gc.is_used
                        ? `Canjeado ${gc.used_at ? new Date(gc.used_at).toLocaleDateString("es-MX") : ""}`
                        : `Creado ${new Date(gc.created_at).toLocaleDateString("es-MX")}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: gc.is_used ? "var(--warm)" : "var(--green-bg)", color: gc.is_used ? "var(--muted)" : "var(--green)", border: `1px solid ${gc.is_used ? "var(--border)" : "rgba(45,90,61,.2)"}` }}>
                      {gc.is_used ? "Usado" : "Disponible"}
                    </span>
                    {!gc.is_used && (
                      <button onClick={() => handleCopyCode(gc.code)}
                        style={{ background: "none", border: "1px solid var(--border)", borderRadius: 5, padding: "4px 10px", fontSize: 11, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>
                        {copied === gc.code ? "✓" : "Copiar"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CV list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px" }}>
              Todos los CVs
            </h2>
            <a
              href="/crear"
              style={{ fontSize: 13, background: "var(--green-mid)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              + Generar nuevo CV
            </a>
          </div>

          {loading ? (
            <div>
              {[1, 2, 3, 4].map(i => <CVCardSkeleton key={i} />)}
            </div>
          ) : cvs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>No hay CVs en el sistema todavía</p>
            </div>
          ) : (
            <div>
              {cvs.map((cv) => (
                <CVCard key={cv.id} cv={cv} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
