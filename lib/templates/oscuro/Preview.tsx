import { parseCVText, extractHeader, CVItem } from "../parser";
import type { CVData } from "../types";

const C = {
  fondo: "#1a1814",
  texto: "#ede8dc",
  muted: "rgba(237,232,220,0.55)",
  hint: "rgba(237,232,220,0.35)",
  border: "rgba(237,232,220,0.12)",
  acento: "#4a9060",
  acentoLight: "#7dd4a0",
  tagBg: "rgba(74,144,96,0.15)",
  tagBorder: "rgba(74,144,96,0.4)",
};

export default function OscuroPreview({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr = extractHeader(data.cv_text);
  const name = hdr.name || data.nombre;
  const subtitle = hdr.subtitle || data.puesto;
  const contacts = hdr.contacts.length
    ? hdr.contacts
    : [data.ciudad, data.email].filter(Boolean) as string[];
  const main = sections.filter((s) => s.title !== "" && s.title.toLowerCase() !== name.toLowerCase());

  return (
    <div style={{ width: 680, background: C.fondo, fontFamily: "'DM Sans','Nunito Sans',sans-serif", color: C.texto, fontSize: 12, lineHeight: 1.5, padding: "40px 44px", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ marginBottom: 18, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 600, color: C.texto, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
            {name}
          </div>
          {subtitle && (
            <div style={{ fontSize: 14, color: C.acentoLight, marginTop: 5, fontWeight: 500 }}>{subtitle}</div>
          )}
          {contacts.length > 0 && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 7 }}>
              {contacts.join(" · ")}
            </div>
          )}
        </div>
        {data.mercado === "mx" && data.photoUrl && (
          <img src={data.photoUrl} alt={name} style={{ width: 80, height: 80, borderRadius: 6, objectFit: "cover", border: `2px solid ${C.border}`, flexShrink: 0, display: "block" }} />
        )}
        {data.mercado === "mx" && !data.photoUrl && (
          <div style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 6, border: `1.5px dashed ${C.border}`, background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.hint, textAlign: "center", lineHeight: 1.3 }}>
            <span>📷<br/>Foto</span>
          </div>
        )}
      </div>

      <div style={{ height: 1.5, background: C.acento, marginBottom: 22 }} />

      {main.map((section, idx) => (
        <div key={idx} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: C.acento, fontWeight: 600, marginBottom: 10 }}>
            {section.title}
            <span style={{ flex: 1, height: 1, background: C.border, display: "block" }} />
          </div>
          {section.items.map((item, i) => (
            <DarkItem key={i} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

function DarkItem({ item }: { item: CVItem }) {
  if (item.type === "education") {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.texto }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint, flexShrink: 0 }}>{item.date}</div>}
        </div>
        {item.subtitle && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{item.subtitle}</div>}
      </div>
    );
  }
  if (item.type === "skills") {
    const tags = (item.content ?? "").split(" | ").map((t) => t.trim()).filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
        {tags.map((tag, i) => (
          <span key={i} style={{ fontSize: 10, padding: "3px 9px", background: C.tagBg, color: C.acentoLight, border: `1px solid ${C.tagBorder}`, borderRadius: 3, fontWeight: 500 }}>
            {tag}
          </span>
        ))}
      </div>
    );
  }
  if (item.type === "job") {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.texto }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint, whiteSpace: "nowrap", flexShrink: 0 }}>{item.date}</div>}
        </div>
        {(item.subtitle || item.location) && (
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {[item.subtitle, item.location].filter(Boolean).join(" · ")}
          </div>
        )}
        {item.bullets && item.bullets.length > 0 && (
          <div style={{ marginTop: 5 }}>
            {item.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "2px 0", alignItems: "flex-start" }}>
                <span style={{ color: C.acentoLight, fontSize: 9, marginTop: 2, flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.type === "bullet") {
    return (
      <div style={{ display: "flex", gap: 8, padding: "2px 0", alignItems: "flex-start" }}>
        <span style={{ color: C.acentoLight, fontSize: 9, marginTop: 2, flexShrink: 0 }}>▸</span>
        <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{item.content}</span>
      </div>
    );
  }

  const content = item.content ?? "";
  const cparts = content.split(/[|,]/).map((t) => t.trim()).filter(Boolean);
  if ((content.includes(" | ") || content.split(",").length > 2) && cparts.every(p => p.length <= 35)) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
        {cparts.map((tag, i) => (
          <span key={i} style={{ fontSize: 10, padding: "3px 9px", background: C.tagBg, color: C.acentoLight, border: `1px solid ${C.tagBorder}`, borderRadius: 3, fontWeight: 500 }}>
            {tag}
          </span>
        ))}
      </div>
    );
  }

  return <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.65, marginBottom: 4 }}>{content}</div>;
}
