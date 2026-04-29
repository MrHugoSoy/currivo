import { parseCVText, extractHeader, extractSkills, CVItem } from "../parser";
import type { CVData } from "../types";

const C = {
  primario: "#1a1814",
  acento: "#2a5236",
  fondo: "#fffefc",
  texto: "#4a443c",
  hint: "#8a8278",
  border: "#ddd7c8",
  greenBg: "#edf4ef",
  greenMid: "#4a9060",
};

export default function ClasicoPreview({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr = extractHeader(data.cv_text);
  const name = hdr.name || data.nombre;
  const subtitle = hdr.subtitle || data.puesto;
  const contacts = hdr.contacts.length
    ? hdr.contacts
    : [data.ciudad, data.email].filter(Boolean) as string[];
  const main = sections.filter((s) => s.title !== "");

  return (
    <div style={{ width: 680, background: C.fondo, fontFamily: "'DM Sans','Nunito Sans',sans-serif", color: C.texto, fontSize: 12, lineHeight: 1.5, padding: "40px 44px", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 600, color: C.primario, letterSpacing: "-1px", lineHeight: 1.1 }}>
          {name}
        </div>
        {subtitle && (
          <div style={{ fontSize: 14, color: C.acento, marginTop: 5, fontWeight: 500 }}>{subtitle}</div>
        )}
        {contacts.length > 0 && (
          <div style={{ fontSize: 11, color: C.hint, marginTop: 7 }}>
            {contacts.join(" · ")}
          </div>
        )}
      </div>

      <div style={{ height: 2, background: C.primario, marginBottom: 22 }} />

      {main.map((section, idx) => (
        <div key={idx} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 8, letterSpacing: 2.5, textTransform: "uppercase", color: C.hint, fontWeight: 600, marginBottom: 10 }}>
            {section.title}
            <span style={{ flex: 1, height: 1, background: C.border, display: "block" }} />
          </div>
          {section.items.map((item, i) => (
            <Item key={i} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Item({ item }: { item: CVItem }) {
  if (item.type === "education") {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.primario }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint, flexShrink: 0 }}>{item.date}</div>}
        </div>
        {item.subtitle && <div style={{ fontSize: 11, color: C.hint, marginTop: 2 }}>{item.subtitle}</div>}
      </div>
    );
  }
  if (item.type === "skills") {
    const tags = (item.content ?? "").split(" | ").map((t) => t.trim()).filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
        {tags.map((tag, i) => (
          <span key={i} style={{ fontSize: 10, padding: "3px 9px", background: C.greenBg, color: C.acento, borderRadius: 3, fontWeight: 500, border: "1px solid rgba(42,82,54,.15)" }}>
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
          <div style={{ fontSize: 13, fontWeight: 600, color: C.primario }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint, whiteSpace: "nowrap", flexShrink: 0 }}>{item.date}</div>}
        </div>
        {(item.subtitle || item.location) && (
          <div style={{ fontSize: 11, color: C.hint, marginTop: 2 }}>
            {[item.subtitle, item.location].filter(Boolean).join(" · ")}
          </div>
        )}
        {item.content && (
          <div style={{ fontSize: 11, color: C.texto, marginTop: 4, lineHeight: 1.65 }}>{item.content}</div>
        )}
        {item.bullets && item.bullets.length > 0 && (
          <div style={{ marginTop: 5 }}>
            {item.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "2px 0", alignItems: "flex-start" }}>
                <span style={{ color: C.greenMid, fontSize: 9, marginTop: 2, flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 11, color: C.texto, lineHeight: 1.5 }}>{b}</span>
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
        <span style={{ color: C.greenMid, fontSize: 9, marginTop: 2, flexShrink: 0 }}>▸</span>
        <span style={{ fontSize: 11, color: C.texto, lineHeight: 1.5 }}>{item.content}</span>
      </div>
    );
  }

  const content = item.content ?? "";
  if (content.includes(" | ") || content.split(",").length > 2) {
    const tags = content.split(/[|,]/).map((t) => t.trim()).filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
        {tags.map((tag, i) => (
          <span key={i} style={{ fontSize: 10, padding: "3px 9px", background: C.greenBg, color: C.acento, borderRadius: 3, fontWeight: 500, border: "1px solid rgba(42,82,54,.15)" }}>
            {tag}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div style={{ fontSize: 11, color: C.texto, lineHeight: 1.65, marginBottom: 4 }}>{content}</div>
  );
}
