"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CVCard, type CVCardData } from "./CVCard";
import { CVCardSkeleton } from "@/components/Skeleton";

const ADMIN_EMAILS = ["hugoivanrf@gmail.com"];

type GiftCode = { id: string; code: string; is_used: boolean; used_at: string | null; created_at: string };

export default function Dashboard() {
  const [cvs, setCvs] = useState<CVCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
  const [giftLoading, setGiftLoading] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
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
      setUserId(session.user.id);
      loadGiftCodes(session.user.id);

      const { data, error } = await supabase
        .from("cvs")
        .select("id, slug, nombre, puesto, mercado, template, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) setCvs(data as CVCardData[]);
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
    if (res.ok) { const d = await res.json(); setGiftCodes(prev => [...(d.codes ?? []), ...prev]); }
    setGiftLoading(false);
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code); setTimeout(() => setCopied(null), 2000);
  }

  function handleDelete(id: string) {
    setCvs((prev) => prev.filter((cv) => cv.id !== id));
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

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: 4 }}>
              Mis CVs
            </h1>
            {!loading && (
              <p style={{ fontSize: 12, color: "var(--hint)" }}>
                {cvs.length === 0
                  ? "No tienes CVs guardados todavía"
                  : `Tienes ${cvs.length} CV${cvs.length === 1 ? "" : "s"} guardado${cvs.length === 1 ? "" : "s"}`}
              </p>
            )}
          </div>

          <a
            href="/crear"
            style={{ fontSize: 13, background: "var(--green-mid)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            + Generar nuevo CV
          </a>
        </div>

        {/* Gift codes */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: 16 }}>
            Códigos de regalo
          </h2>

          {/* Generator */}
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

          {/* Codes list */}
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
        {loading ? (
          <div>
            {[1, 2, 3, 4].map(i => <CVCardSkeleton key={i} />)}
          </div>
        ) : cvs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Genera tu primer CV con IA</p>
            <a href="/crear" style={{ fontSize: 13, background: "var(--green-mid)", color: "#fff", borderRadius: 6, padding: "10px 20px", textDecoration: "none", fontWeight: 500 }}>
              + Generar CV
            </a>
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
  );
}
