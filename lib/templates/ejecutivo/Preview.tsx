import { parseCVText, extractHeader, CVItem } from "../parser";
import type { CVData } from "../types";

const C = {
  header:   "#1e3a5f",
  acento:   "#2b6cb0",
  fondo:    "#ffffff",
  texto:    "#2d3748",
  hint:     "#718096",
  border:   "#e2e8f0",
  accentBg: "#ebf4ff",
};

export default function EjecutivoPreview({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr      = extractHeader(data.cv_text);
  const name     = hdr.name    || data.nombre;
  const subtitle = hdr.subtitle || (data.mercado === "mx" ? data.puesto : "");
  const contacts = hdr.contacts.length
    ? hdr.contacts
    : [data.ciudad, data.email].filter(Boolean) as string[];
  const main     = sections.filter(s => s.title !== "" && s.title.toLowerCase() !== name.toLowerCase());
  const isMx     = data.mercado === "mx";

  return (
    <div style={{ width: 680, background: C.fondo, fontFamily: "'DM Sans','Nunito Sans',sans-serif", color: C.texto, fontSize: 12, lineHeight: 1.5, boxSizing: "border-box" }}>

      {/* ── HEADER BAND ── */}
      <div style={{ background: C.header, padding: "32px 44px 28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 600, color: "#ffffff", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 6 }}>
            {name}
          </div>
          {subtitle && (
            <div style={{ fontSize: 13, color: "#93c5fd", fontWeight: 500, marginBottom: 12 }}>{subtitle}</div>
          )}
          {contacts.length > 0 && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.6)", display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {isMx && (data.photoUrl ? (
          <img src={data.photoUrl} alt={name} style={{ width: 80, height: 80, borderRadius: 6, objectFit: "cover", border: "2px solid rgba(255,255,255,.25)", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: 6, border: "1.5px dashed rgba(255,255,255,.25)", background: "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(255,255,255,.3)", textAlign: "center", lineHeight: 1.3, flexShrink: 0 }}>
            Foto
          </div>
        ))}
      </div>

      {/* Accent stripe */}
      <div style={{ height: 4, background: C.acento }} />

      {/* ── BODY ── */}
      <div style={{ padding: "28px 44px 40px" }}>
        {main.map((section, idx) => (
          <div key={idx} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 3, height: 14, background: C.acento, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: C.header, fontWeight: 700 }}>
                {section.title}
              </div>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            {section.items.map((item, i) => (
              <EjItem key={i} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function EjItem({ item }: { item: CVItem }) {
  if (item.type === "job") {
    return (
      <div style={{ marginBottom: 12, paddingLeft: 13, borderLeft: `2px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.header }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint, whiteSpace: "nowrap", flexShrink: 0 }}>{item.date}</div>}
        </div>
        {(item.subtitle || item.location) && (
          <div style={{ fontSize: 11, color: C.acento, marginTop: 2, fontWeight: 500 }}>
            {[item.subtitle, item.location].filter(Boolean).join(" · ")}
          </div>
        )}
        {item.bullets && item.bullets.length > 0 && (
          <div style={{ marginTop: 5 }}>
            {item.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "2px 0", alignItems: "flex-start" }}>
                <span style={{ color: C.acento, fontSize: 10, marginTop: 1, flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 11, color: C.texto, lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.type === "education") {
    return (
      <div style={{ marginBottom: 10, paddingLeft: 13, borderLeft: `2px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.header }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint, flexShrink: 0 }}>{item.date}</div>}
        </div>
        {item.subtitle && <div style={{ fontSize: 11, color: C.hint, marginTop: 2 }}>{item.subtitle}</div>}
      </div>
    );
  }

  if (item.type === "skills") {
    const tags = (item.content ?? "").split(/[|,]/).map(t => t.trim()).filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
        {tags.map((tag, i) => (
          <span key={i} style={{ fontSize: 10, padding: "3px 10px", background: C.accentBg, color: C.acento, borderRadius: 3, fontWeight: 500, border: `1px solid ${C.acento}30` }}>
            {tag}
          </span>
        ))}
      </div>
    );
  }

  if (item.type === "bullet") {
    return (
      <div style={{ display: "flex", gap: 8, padding: "2px 0", alignItems: "flex-start" }}>
        <span style={{ color: C.acento, fontSize: 10, marginTop: 1, flexShrink: 0 }}>▸</span>
        <span style={{ fontSize: 11, color: C.texto, lineHeight: 1.5 }}>{item.content}</span>
      </div>
    );
  }

  const content = item.content ?? "";
  const parts = content.split(/[|,]/).map(t => t.trim()).filter(Boolean);
  if ((content.includes(" | ") || content.split(",").length > 2) && parts.every(p => p.length <= 35)) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
        {parts.map((tag, i) => (
          <span key={i} style={{ fontSize: 10, padding: "3px 10px", background: C.accentBg, color: C.acento, borderRadius: 3, fontWeight: 500, border: `1px solid ${C.acento}30` }}>
            {tag}
          </span>
        ))}
      </div>
    );
  }

  return <div style={{ fontSize: 11, color: C.texto, lineHeight: 1.65, marginBottom: 4 }}>{content}</div>;
}
