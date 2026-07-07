"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const TESTIMONIALS = [
  { name: "Laura Hernández", role: "Project Manager", location: "Toronto, Canadá", market: "ca", text: "Conseguí entrevistas en 3 empresas de Toronto en 2 semanas. El CV destacó mi experiencia internacional como un activo, no como una desventaja.", initials: "LH", bg: "#d4e8da", color: "#2d5a3d" },
  { name: "Miguel Torres", role: "Product Manager", location: "Austin, Texas", market: "us", text: "Mi CV pasó el ATS de Amazon en el primer intento. Nunca supe cómo escribir bullets con impacto cuantificable hasta que vi lo que generó resumika.", initials: "MT", bg: "#dde8f4", color: "#2d4a7a" },
  { name: "Valentina Ríos", role: "Diseñadora UX", location: "Ciudad de México", market: "mx", text: "En menos de 5 minutos tenía un CV que nunca hubiera podido redactar sola. Me llamaron a entrevista al día siguiente de enviarlo.", initials: "VR", bg: "#f0e8d4", color: "#7a4a2d" },
  { name: "Andrés Villanueva", role: "Ingeniero Civil", location: "Vancouver, Canadá", market: "ca", text: "En México nadie pedía CV así, pero para aplicar en Canadá era exactamente lo que necesitaba. resumika conoce el mercado local mejor que yo.", initials: "AV", bg: "#e8d4e8", color: "#5a2d7a" },
  { name: "Daniela Moreno", role: "Analista Financiera", location: "Monterrey, México", market: "mx", text: "Lo que más me sorprendió fue el tono. Sonaba exactamente como yo quería sonar: profesional pero con personalidad. Lo recomiendo a todos.", initials: "DM", bg: "#f4ddd8", color: "#7a2d2d" },
  { name: "Rodrigo Salinas", role: "Desarrollador Full Stack", location: "Miami, Florida", market: "us", text: "Llevaba meses aplicando sin respuesta. Cambié mi resume con resumika y en 10 días tenía dos ofertas. La diferencia fue brutal.", initials: "RS", bg: "#d8f0e8", color: "#2d7a5a" },
  { name: "Karla Jiménez", role: "Enfermera Especialista", location: "Guadalajara, México", market: "mx", text: "Siempre me bloqueaba al redactar mi CV. Con resumika llené el formulario y en minutos tenía algo que de verdad representaba mi experiencia.", initials: "KJ", bg: "#fde8d4", color: "#7a3d1d" },
  { name: "Felipe Castillo", role: "Contador Senior", location: "Calgary, Canadá", market: "ca", text: "Mis credenciales mexicanas no eran reconocidas fácilmente. El CV que generó resumika las presentó de una forma que los reclutadores canadienses entendieron de inmediato.", initials: "FC", bg: "#d4dff4", color: "#2d3d7a" },
];

const VISIBLE = 3;

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [reviews, setReviews] = useState(TESTIMONIALS);
  const dragStart = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = reviews.length;

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*")
      .eq("approved", true)
      .gte("stars", 4)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data && data.length >= 3) {
          setReviews(data.map(r => ({
            name: r.nombre,
            role: r.puesto ?? "",
            location: r.mercado === "mx" ? "México" : r.mercado === "us" ? "USA" : "Canadá",
            market: r.mercado,
            text: r.text,
            initials: r.nombre.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
            bg: r.mercado === "mx" ? "#edf4ef" : r.mercado === "us" ? "#dde8f4" : "#fef8ec",
            color: r.mercado === "mx" ? "#2d5a3d" : r.mercado === "us" ? "#2d4a7a" : "#5a3000",
          })));
        }
      });
  }, []);

  const next = () => setIndex(i => (i + 1) % total);
  const prev = () => setIndex(i => (i - 1 + total) % total);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % total), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total]);

  const handleMouseDown = (e: React.MouseEvent) => { setDragging(true); dragStart.current = e.clientX; };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging) return;
    setDragging(false);
    const delta = dragStart.current - e.clientX;
    if (delta > 40) { next(); resetTimer(); }
    else if (delta < -40) { prev(); resetTimer(); }
  };
  const handleTouchStart = (e: React.TouchEvent) => { dragStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = dragStart.current - e.changedTouches[0].clientX;
    if (delta > 40) { next(); resetTimer(); }
    else if (delta < -40) { prev(); resetTimer(); }
  };

  const getVisible = () => Array.from({ length: VISIBLE }, (_, i) => reviews[(index + i) % total]);

  return (
    <section style={{ background: "var(--surface-dark)", padding: "80px 0 88px", overflow: "hidden" }}>
      <style>{`
        .testimonials-inner { max-width: 1320px; margin: 0 auto; padding: 0 64px; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; cursor: grab; user-select: none; }
        .testimonials-grid:active { cursor: grabbing; }
        .t-side { opacity: 0.7; }
        @media (max-width: 900px) {
          .testimonials-inner { padding: 0 24px; }
          .testimonials-grid { grid-template-columns: 1fr; }
          .t-side { display: none !important; }
        }
        @media (max-width: 480px) {
          .testimonials-inner { padding: 0 16px; }
        }
      `}</style>
      <div className="testimonials-inner">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.3)", marginBottom: 12 }}>
              Testimonios
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 3.5vw, 46px)", fontWeight: 600, color: "#f8f5ef", letterSpacing: "-1px", lineHeight: 1.1 }}>
              Historias que<br />
              <em style={{ fontStyle: "italic", color: "var(--green-mid)" }}>hablan por sí solas</em>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ fn: prev, icon: "←" }, { fn: next, icon: "→" }].map(({ fn, icon }) => (
              <button key={icon} onClick={() => { fn(); resetTimer(); }}
                style={{ width: 44, height: 44, borderRadius: "50%", background: "none", border: "1px solid rgba(255,255,255,.18)", color: "rgba(255,255,255,.7)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.7)"; }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div
          className="testimonials-grid"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {getVisible().map((t, i) => (
            <div
              key={`${t.name}-${index}-${i}`}
              className={i !== 1 ? "t-side" : ""}
              style={{ background: i === 1 ? "var(--green)" : "rgba(255,255,255,.05)", border: `1px solid ${i === 1 ? "transparent" : "rgba(255,255,255,.09)"}`, borderRadius: 12, padding: "28px 26px", display: "flex", flexDirection: "column", gap: 20, transition: "opacity .3s" }}
            >
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} style={{ fontSize: 12, color: i === 1 ? "rgba(255,255,255,.9)" : "var(--green-mid)" }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.75, color: i === 1 ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.65)", flexGrow: 1 }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4, borderTop: `1px solid ${i === 1 ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.08)"}` }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.bg, color: t.color, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {t.initials}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: i === 1 ? "#fff" : "rgba(255,255,255,.85)", lineHeight: 1.3 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: i === 1 ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.4)", marginTop: 2 }}>{t.role} · {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 36 }}>
          {reviews.map((_, i) => (
            <button key={i} onClick={() => { setIndex(i); resetTimer(); }}
              style={{ width: i === index ? 20 : 6, height: 6, borderRadius: 3, border: "none", background: i === index ? "var(--green-mid)" : "rgba(255,255,255,.2)", cursor: "pointer", transition: "all .25s", padding: 0 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
