"use client";
import { useState, useEffect, useRef } from "react";

const TESTIMONIALS = [
  {
    name: "Mariana González",
    role: "Diseñadora UX",
    location: "Ciudad de México",
    market: "mx",
    text: "En menos de 5 minutos tenía un CV que nunca hubiera podido redactar sola. Me llamaron a entrevista al día siguiente de enviarlo.",
    initials: "MG",
    bg: "#d4e8da",
    color: "#2d5a3d",
  },
  {
    name: "Jorge Ramírez",
    role: "Ingeniero de Software",
    location: "Toronto, Canadá",
    market: "ca",
    text: "Llegué a Canadá sin saber cómo estructurar mi CV para el mercado local. currivo entendió exactamente lo que los reclutadores canadienses buscan.",
    initials: "JR",
    bg: "#dde8f4",
    color: "#2d4a7a",
  },
  {
    name: "Andrea López",
    role: "Gerente de Marketing",
    location: "Monterrey, México",
    market: "mx",
    text: "Lo que más me sorprendió fue el tono. Sonaba exactamente como yo quería sonar: profesional pero con personalidad. Lo recomiendo a todos.",
    initials: "AL",
    bg: "#f0e8d4",
    color: "#7a4a2d",
  },
  {
    name: "Carlos Peña",
    role: "Contador Público",
    location: "Miami, Estados Unidos",
    market: "us",
    text: "Necesitaba un resume en inglés para aplicar en EE.UU. y el resultado fue impresionante. Conseguí trabajo en 3 semanas.",
    initials: "CP",
    bg: "#e8d4e8",
    color: "#5a2d7a",
  },
  {
    name: "Sofía Herrera",
    role: "Enfermera",
    location: "Guadalajara, México",
    market: "mx",
    text: "Nunca me gustó redactar mi CV, siempre me bloqueaba. Con currivo solo llené el formulario y listo. Fue liberador.",
    initials: "SH",
    bg: "#f4ddd8",
    color: "#7a2d2d",
  },
  {
    name: "Tomás Vargas",
    role: "Arquitecto",
    location: "Vancouver, Canadá",
    market: "ca",
    text: "El CV que generó destacó mi experiencia internacional como un activo, no como una desventaja. Ese cambio de perspectiva lo cambió todo.",
    initials: "TV",
    bg: "#d8f0e8",
    color: "#2d7a5a",
  },
];

const VISIBLE = 3;

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = TESTIMONIALS.length;

  const next = () => setIndex(i => (i + 1) % total);
  const prev = () => setIndex(i => (i - 1 + total) % total);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  };

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging) return;
    setDragging(false);
    const delta = dragStart.current - e.clientX;
    if (delta > 40) { next(); resetTimer(); }
    else if (delta < -40) { prev(); resetTimer(); }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = dragStart.current - e.changedTouches[0].clientX;
    if (delta > 40) { next(); resetTimer(); }
    else if (delta < -40) { prev(); resetTimer(); }
  };

  const getVisible = () =>
    Array.from({ length: VISIBLE }, (_, i) => TESTIMONIALS[(index + i) % total]);

  return (
    <section style={{ background: "var(--ink)", padding: "80px 0 88px", overflow: "hidden" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 64px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.3)", marginBottom: 12 }}>
              Testimonios
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 3.5vw, 46px)", fontWeight: 600, color: "#f8f5ef", letterSpacing: "-1px", lineHeight: 1.1 }}>
              Historias que<br />
              <em style={{ fontStyle: "italic", color: "var(--green-mid)" }}>hablan por sí solas</em>
            </h2>
          </div>

          {/* Arrows */}
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
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, cursor: dragging ? "grabbing" : "grab", userSelect: "none" }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {getVisible().map((t, i) => (
            <div key={`${t.name}-${index}-${i}`}
              style={{ background: i === 1 ? "var(--green)" : "rgba(255,255,255,.05)", border: `1px solid ${i === 1 ? "transparent" : "rgba(255,255,255,.09)"}`, borderRadius: 12, padding: "28px 26px", display: "flex", flexDirection: "column", gap: 20, transition: "opacity .3s", opacity: i === 0 || i === 2 ? 0.7 : 1 }}
            >
              {/* Stars */}
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} style={{ fontSize: 12, color: i === 1 ? "rgba(255,255,255,.9)" : "var(--green-mid)" }}>★</span>
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontSize: 14, lineHeight: 1.75, color: i === 1 ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.65)", flexGrow: 1 }}>
                "{t.text}"
              </p>

              {/* Author */}
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
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => { setIndex(i); resetTimer(); }}
              style={{ width: i === index ? 20 : 6, height: 6, borderRadius: 3, border: "none", background: i === index ? "var(--green-mid)" : "rgba(255,255,255,.2)", cursor: "pointer", transition: "all .25s", padding: 0 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
