"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface ReviewModalProps {
  userId: string;
  nombre: string;
  puesto: string;
  mercado: string;
  onClose: () => void;
}

export default function ReviewModal({ userId, nombre, puesto, mercado, onClose }: ReviewModalProps) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!stars || !text.trim()) return;
    setLoading(true);
    try {
      await supabase.from("reviews").insert({
        user_id: userId,
        nombre,
        puesto,
        mercado,
        stars,
        text: text.trim(),
        approved: false,
      });
      setDone(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: "var(--cream)", borderRadius: 12, padding: "32px 28px",
        maxWidth: 420, width: "100%", position: "relative",
        boxShadow: "0 24px 64px rgba(0,0,0,.3)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", fontSize: 18,
          color: "var(--muted)", cursor: "pointer", lineHeight: 1,
        }}>×</button>

        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24,
              fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
              ¡Gracias por tu reseña!
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>
              Tu experiencia ayuda a más profesionales a encontrar resumika.
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⭐</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22,
              fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
              ¿Cómo te fue con resumika?
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
              Tu opinión ayuda a otros profesionales a confiar en el producto.
            </p>

            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s}
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    fontSize: 28, background: "none", border: "none",
                    cursor: "pointer", padding: 2, lineHeight: 1,
                    color: s <= (hovered || stars) ? "#f59e0b" : "var(--border)",
                    transition: "color .1s",
                  }}>
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Cuéntanos brevemente tu experiencia..."
              style={{
                width: "100%", border: "1px solid var(--border)",
                borderRadius: 8, padding: "10px 12px",
                fontFamily: "inherit", fontSize: 13,
                color: "var(--ink)", background: "var(--paper)",
                resize: "none", outline: "none",
                boxSizing: "border-box", marginBottom: 6,
              }}
            />
            <div style={{ fontSize: 10, color: "var(--hint)", textAlign: "right", marginBottom: 16 }}>
              {text.length}/280
            </div>

            <button
              onClick={handleSubmit}
              disabled={!stars || !text.trim() || loading}
              style={{
                width: "100%",
                background: !stars || !text.trim() ? "var(--border)" : "var(--green)",
                color: "#fff", border: "none", borderRadius: 8,
                padding: "12px", fontSize: 13, fontWeight: 500,
                fontFamily: "inherit",
                cursor: !stars || !text.trim() ? "not-allowed" : "pointer",
                transition: "background .2s",
              }}>
              {loading ? "Enviando..." : "Publicar reseña →"}
            </button>

            <button onClick={onClose} style={{
              width: "100%", background: "none", border: "none",
              color: "var(--hint)", fontSize: 12, marginTop: 10,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Ahora no
            </button>
          </>
        )}
      </div>
    </div>
  );
}
