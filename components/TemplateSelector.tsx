"use client";
import { TEMPLATES, type TemplateId } from "@/lib/templates/types";

interface Props {
  selected: TemplateId;
  onSelect: (id: TemplateId) => void;
  userIsPro?: boolean;
}

const LAYOUT_ICONS: Record<TemplateId, React.ReactNode> = {
  clasico: (
    <svg width="56" height="70" viewBox="0 0 56 70" fill="none">
      <rect width="56" height="70" rx="3" fill="#fffefc" />
      <rect x="6" y="8" width="24" height="5" rx="1" fill="#1a1814" opacity=".85" />
      <rect x="6" y="15" width="14" height="2" rx="1" fill="#2a5236" opacity=".7" />
      <rect x="6" y="19" width="44" height="1" rx=".5" fill="#1a1814" />
      <rect x="6" y="24" width="20" height="1.5" rx=".5" fill="#b0a89e" />
      <rect x="6" y="28" width="44" height="1" rx=".5" fill="#ddd7c8" />
      <rect x="6" y="31" width="44" height="1" rx=".5" fill="#ddd7c8" />
      <rect x="6" y="34" width="30" height="1" rx=".5" fill="#ddd7c8" />
      <rect x="6" y="40" width="20" height="1.5" rx=".5" fill="#b0a89e" />
      <rect x="6" y="44" width="44" height="1" rx=".5" fill="#ddd7c8" />
      <rect x="6" y="47" width="44" height="1" rx=".5" fill="#ddd7c8" />
      <rect x="6" y="53" width="20" height="1.5" rx=".5" fill="#b0a89e" />
      <rect x="6" y="57" width="10" height="4" rx="1" fill="#edf4ef" />
      <rect x="18" y="57" width="10" height="4" rx="1" fill="#edf4ef" />
      <rect x="30" y="57" width="10" height="4" rx="1" fill="#edf4ef" />
    </svg>
  ),
  moderno: (
    <svg width="56" height="70" viewBox="0 0 56 70" fill="none">
      <rect width="56" height="70" rx="3" fill="#fffefc" />
      <rect width="18" height="70" rx="3" fill="#2a5236" />
      <rect x="3" y="8" width="12" height="4" rx="1" fill="white" opacity=".9" />
      <rect x="3" y="14" width="10" height="2" rx="1" fill="#7dd4a0" opacity=".8" />
      <rect x="3" y="20" width="12" height="1.5" rx=".5" fill="white" opacity=".3" />
      <rect x="3" y="29" width="12" height="1.5" rx=".5" fill="white" opacity=".25" />
      <rect x="3" y="32" width="10" height="1" rx=".5" fill="white" opacity=".2" />
      <rect x="3" y="35" width="10" height="1" rx=".5" fill="white" opacity=".2" />
      <rect x="3" y="38" width="8" height="1" rx=".5" fill="white" opacity=".2" />
      <rect x="22" y="8" width="18" height="1.5" rx=".5" fill="#b0a89e" />
      <rect x="22" y="12" width="30" height="1" rx=".5" fill="#ddd7c8" />
      <rect x="22" y="15" width="30" height="1" rx=".5" fill="#ddd7c8" />
      <rect x="22" y="18" width="20" height="1" rx=".5" fill="#ddd7c8" />
      <rect x="22" y="24" width="18" height="1.5" rx=".5" fill="#b0a89e" />
      <rect x="22" y="28" width="30" height="1" rx=".5" fill="#ddd7c8" />
      <rect x="22" y="31" width="30" height="1" rx=".5" fill="#ddd7c8" />
    </svg>
  ),
  minimalista: (
    <svg width="56" height="70" viewBox="0 0 56 70" fill="none">
      <rect width="56" height="70" rx="3" fill="#f7f4ee" />
      <rect x="6" y="9" width="22" height="6" rx="1" fill="#1a1814" opacity=".7" />
      <rect x="6" y="17" width="14" height="1.5" rx=".5" fill="#8a8278" opacity=".6" />
      <rect x="6" y="26" width="44" height=".5" rx=".5" fill="#ddd7c8" />
      <rect x="6" y="30" width="44" height="1" rx=".5" fill="#ddd7c8" opacity=".7" />
      <rect x="6" y="33" width="44" height="1" rx=".5" fill="#ddd7c8" opacity=".5" />
      <rect x="6" y="36" width="30" height="1" rx=".5" fill="#ddd7c8" opacity=".5" />
      <rect x="6" y="43" width="44" height=".5" rx=".5" fill="#ddd7c8" />
      <rect x="6" y="47" width="44" height="1" rx=".5" fill="#ddd7c8" opacity=".7" />
      <rect x="6" y="50" width="44" height="1" rx=".5" fill="#ddd7c8" opacity=".5" />
      <rect x="6" y="57" width="44" height=".5" rx=".5" fill="#ddd7c8" />
      <rect x="6" y="61" width="30" height="1" rx=".5" fill="#ddd7c8" opacity=".6" />
    </svg>
  ),
  oscuro: (
    <svg width="56" height="70" viewBox="0 0 56 70" fill="none">
      <rect width="56" height="70" rx="3" fill="#1a1814" />
      <rect x="6" y="8" width="24" height="5" rx="1" fill="white" opacity=".85" />
      <rect x="6" y="15" width="14" height="2" rx="1" fill="#7dd4a0" opacity=".8" />
      <rect x="6" y="20" width="44" height="1" rx=".5" fill="#4a9060" opacity=".6" />
      <rect x="6" y="25" width="18" height="1.5" rx=".5" fill="#4a9060" opacity=".5" />
      <rect x="6" y="29" width="44" height="1" rx=".5" fill="white" opacity=".15" />
      <rect x="6" y="32" width="44" height="1" rx=".5" fill="white" opacity=".12" />
      <rect x="6" y="35" width="30" height="1" rx=".5" fill="white" opacity=".12" />
      <rect x="6" y="41" width="18" height="1.5" rx=".5" fill="#4a9060" opacity=".5" />
      <rect x="6" y="45" width="44" height="1" rx=".5" fill="white" opacity=".12" />
      <rect x="6" y="48" width="44" height="1" rx=".5" fill="white" opacity=".12" />
      <rect x="6" y="54" width="18" height="1.5" rx=".5" fill="#4a9060" opacity=".4" />
      <rect x="6" y="58" width="10" height="4" rx="1" fill="#243a2a" />
      <rect x="18" y="58" width="10" height="4" rx="1" fill="#243a2a" />
      <rect x="30" y="58" width="10" height="4" rx="1" fill="#243a2a" />
    </svg>
  ),
};

export default function TemplateSelector({ selected, onSelect, userIsPro = false }: Props) {
  return (
    <div>
      <label style={{ fontSize: 10, color: "rgba(255,255,255,.28)", display: "block", marginBottom: 10 }}>
        Plantilla
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {TEMPLATES.map((t) => {
          const locked = !t.libre && !userIsPro;
          const isSelected = selected === t.id;
          return (
            <div
              key={t.id}
              onClick={() => !locked && onSelect(t.id)}
              title={locked ? "Disponible en plan Pro" : t.descripcion}
              style={{
                position: "relative",
                border: `1px solid ${isSelected ? "rgba(74,144,96,.6)" : "rgba(255,255,255,.08)"}`,
                borderRadius: 7,
                padding: "10px 10px 8px",
                background: isSelected ? "rgba(42,82,54,.18)" : "rgba(255,255,255,.03)",
                cursor: locked ? "not-allowed" : "pointer",
                transition: "all .15s",
                opacity: locked ? 0.55 : 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              {LAYOUT_ICONS[t.id]}

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: isSelected ? 600 : 400, color: isSelected ? "#7dd4a0" : "rgba(255,255,255,.7)" }}>
                  {t.nombre}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", marginTop: 2 }}>
                  {t.descripcion}
                </div>
              </div>

              <div style={{
                fontSize: 8, fontWeight: 600, letterSpacing: "0.3px",
                padding: "2px 7px", borderRadius: 100,
                background: t.libre ? "rgba(42,82,54,.25)" : "rgba(255,200,0,.1)",
                color: t.libre ? "#7dd4a0" : "rgba(255,200,0,.75)",
                border: `1px solid ${t.libre ? "rgba(74,144,96,.3)" : "rgba(255,200,0,.2)"}`,
              }}>
                {t.libre ? "Gratis" : "Pro"}
              </div>

              {locked && (
                <div style={{ position: "absolute", inset: 0, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(28,26,22,.4)" }}>
                  <span style={{ fontSize: 14 }}>🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
