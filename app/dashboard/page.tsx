"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CVCard, type CVCardData } from "./CVCard";

const ADMIN_EMAILS = ["hugoivanrf@gmail.com"];

export default function Dashboard() {
  const [cvs, setCvs] = useState<CVCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
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

      const { data, error } = await supabase
        .from("cvs")
        .select("id, slug, nombre, puesto, mercado, template, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) setCvs(data as CVCardData[]);
      setLoading(false);
    }
    load();
  }, [router]);

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
      <header style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "0 32px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px", textDecoration: "none" }}>
          currivo
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
            href="/#generador"
            style={{ fontSize: 13, background: "var(--green-mid)", color: "#fff", border: "none", borderRadius: 6, padding: "10px 20px", textDecoration: "none", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            + Generar nuevo CV
          </a>
        </div>

        {/* CV list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, height: 100, opacity: 0.5 }} />
            ))}
          </div>
        ) : cvs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Genera tu primer CV con IA</p>
            <a href="/#generador" style={{ fontSize: 13, background: "var(--green-mid)", color: "#fff", borderRadius: 6, padding: "10px 20px", textDecoration: "none", fontWeight: 500 }}>
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
