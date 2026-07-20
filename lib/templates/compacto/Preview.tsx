import { parseCVText, extractHeader, CVItem } from "../parser";
import type { CVData } from "../types";

const C = {
  acento:  "#16a34a",
  fondo:   "#ffffff",
  texto:   "#111827",
  hint:    "#6b7280",
  border:  "#e5e7eb",
  tagBg:   "#f0fdf4",
  tagTx:   "#15803d",
};

export default function CompactoPreview({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr      = extractHeader(data.cv_text);
  const name     = hdr.name    || data.nombre;
  const subtitle = hdr.subtitle || (data.mercado === "mx" ? data.puesto : "");
  const contacts = hdr.contacts.length
    ? hdr.contacts
    : [data.ciudad, data.email].filter(Boolean) as string[];
  const main     = sections.filter(s => s.title !== "" && s.title.toLowerCase() !== name.toLowerCase());

  return (
    <div style={{ width: 680, background: C.fondo, fontFamily: "'DM Sans','Nunito Sans',sans-serif", color: C.texto, fontSize: 12, lineHeight: 1.5, boxSizing: "border-box" }}>

      {/* ── TOP ACCENT BAR ── */}
      <div style={{ height: 4, background: C.acento }} />

      {/* ── HEADER ── */}
      <div style={{ padding: "28px 44px 20px" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: C.texto, letterSpacing: "-1.5px", lineHeight: 1.05, marginBottom: 4 }}>
          {name}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: C.hint, marginBottom: 10 }}>{subtitle}</div>
        )}
        {contacts.length > 0 && (
          <div style={{ fontSize: 10, color: C.hint, display: "flex", flexWrap: "wrap", gap: "0 0" }}>
            {contacts.map((c, i) => (
              <span key={i}>
                {i > 0 && <span style={{ margin: "0 8px", color: C.border }}>|</span>}
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Thin separator */}
      <div style={{ margin: "0 44px", height: 1.5, background: C.texto }} />

      {/* ── BODY ── */}
      <div style={{ padding: "20px 44px 40px" }}>
        {main.map((section, idx) => (
          <div key={idx} style={{ marginBottom: 18 }}>
            {/* Section header: small-caps with green underline */}
            <div style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: C.texto, fontWeight: 700, paddingBottom: 5, borderBottom: `2px solid ${C.acento}`, display: "inline-block" }}>
                {section.title}
              </div>
            </div>
            {section.items.map((item, i) => (
              <CpItem key={i} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CpItem({ item }: { item: CVItem }) {
  if (item.type === "job") {
    return (
      <div style={{ marginBottom: 11 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.texto }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint, whiteSpace: "nowrap", flexShrink: 0 }}>{item.date}</div>}
        </div>
        {(item.subtitle || item.location) && (
          <div style={{ fontSize: 11, color: C.hint, marginTop: 1 }}>
            {[item.subtitle, item.location].filter(Boolean).join(" · ")}
          </div>
        )}
        {item.bullets && item.bullets.length > 0 && (
          <div style={{ marginTop: 4 }}>
            {item.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "1px 0", alignItems: "flex-start" }}>
                <span style={{ color: C.acento, fontSize: 10, marginTop: 1, flexShrink: 0 }}>–</span>
                <span style={{ fontSize: 11, color: C.texto, lineHeight: 1.55 }}>{b}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.type === "education") {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.texto }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint, flexShrink: 0 }}>{item.date}</div>}
        </div>
        {item.subtitle && <div style={{ fontSize: 11, color: C.hint, marginTop: 1 }}>{item.subtitle}</div>}
      </div>
    );
  }

  if (item.type === "skills") {
    const tags = (item.content ?? "").split(/[|,]/).map(t => t.trim()).filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
        {tags.map((tag, i) => (
          <span key={i} style={{ fontSize: 10, padding: "3px 10px", background: C.tagBg, color: C.tagTx, borderRadius: 100, fontWeight: 500, border: `1px solid ${C.acento}25` }}>
            {tag}
          </span>
        ))}
      </div>
    );
  }

  if (item.type === "bullet") {
    return (
      <div style={{ display: "flex", gap: 8, padding: "1px 0", alignItems: "flex-start" }}>
        <span style={{ color: C.acento, fontSize: 10, marginTop: 1, flexShrink: 0 }}>–</span>
        <span style={{ fontSize: 11, color: C.texto, lineHeight: 1.55 }}>{item.content}</span>
      </div>
    );
  }

  const content = item.content ?? "";
  const parts = content.split(/[|,]/).map(t => t.trim()).filter(Boolean);
  if ((content.includes(" | ") || content.split(",").length > 2) && parts.every(p => p.length <= 35)) {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
        {parts.map((tag, i) => (
          <span key={i} style={{ fontSize: 10, padding: "3px 10px", background: C.tagBg, color: C.tagTx, borderRadius: 100, fontWeight: 500, border: `1px solid ${C.acento}25` }}>
            {tag}
          </span>
        ))}
      </div>
    );
  }

  return <div style={{ fontSize: 11, color: C.texto, lineHeight: 1.65, marginBottom: 4 }}>{content}</div>;
}
