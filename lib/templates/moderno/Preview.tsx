import { parseCVText, extractHeader, extractSkills, extractLanguages, skillLevel, CVItem } from "../parser";
import type { CVData } from "../types";

const C = {
  sidebar: "#2a5236",
  sidebarLight: "rgba(255,255,255,0.08)",
  sidebarText: "rgba(255,255,255,0.9)",
  sidebarMuted: "rgba(255,255,255,0.5)",
  greenLight: "#7dd4a0",
  greenMid: "#4a9060",
  fondo: "#fffefc",
  primario: "#1a1814",
  texto: "#4a443c",
  hint: "#8a8278",
  border: "#ddd7c8",
};

export default function ModernoPreview({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr = extractHeader(data.cv_text);
  const name = hdr.name || data.nombre;
  const subtitle = hdr.subtitle || data.puesto;
  const contacts = hdr.contacts.length
    ? hdr.contacts
    : [data.ciudad, data.email].filter(Boolean) as string[];

  const skills = extractSkills(sections);
  const langs = extractLanguages(sections);
  const mainSections = sections.filter(
    (s) => s.title !== "" && s.title.toLowerCase() !== name.toLowerCase() && !/skill|habilidad|idioma|language|langue/i.test(s.title)
  );

  return (
    <div style={{ width: 680, display: "flex", background: C.sidebar, fontFamily: "'DM Sans','Nunito Sans',sans-serif", fontSize: 12, lineHeight: 1.5, boxSizing: "border-box" }}>

      {/* Sidebar */}
      <div style={{ width: "30%", padding: "36px 22px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 6 }}>
          {name}
        </div>
        <div style={{ fontSize: 12, color: C.greenLight, marginBottom: 18, fontWeight: 500 }}>
          {subtitle}
        </div>

        {contacts.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: 10, color: C.sidebarMuted, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                <span>{i === 0 ? "📍" : i === 1 ? "✉" : "🔗"}</span>
                <span style={{ wordBreak: "break-all" }}>{c}</span>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: C.sidebarMuted, fontWeight: 600, marginBottom: 12 }}>
              Skills
            </div>
            {skills.slice(0, 8).map((skill) => {
              const level = skillLevel(skill);
              return (
                <div key={skill} style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 10, color: C.sidebarText, marginBottom: 3 }}>{skill}</div>
                  <div style={{ height: 3, background: "rgba(255,255,255,.15)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${level}%`, background: C.greenLight, borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {langs.length > 0 && (
          <div>
            <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: C.sidebarMuted, fontWeight: 600, marginBottom: 10 }}>
              Idiomas
            </div>
            {langs.map((l, i) => (
              <div key={i} style={{ fontSize: 10, color: C.sidebarText, marginBottom: 5 }}>{l}</div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: C.fondo, padding: "36px 28px", color: C.texto }}>
        {mainSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 10 }}>
              <div style={{ width: 3, height: 16, background: C.sidebar, borderRadius: 2, marginRight: 10, flexShrink: 0 }} />
              <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: C.primario, fontWeight: 600 }}>
                {section.title}
              </div>
            </div>
            {section.items.map((item, i) => (
              <ModernoItem key={i} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModernoItem({ item }: { item: CVItem }) {
  if (item.type === "education") {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.primario }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint }}>{item.date}</div>}
        </div>
        {item.subtitle && <div style={{ fontSize: 10, color: C.hint, marginTop: 2 }}>{item.subtitle}</div>}
      </div>
    );
  }
  if (item.type === "skills") {
    const tags = (item.content ?? "").split(" | ").map((t) => t.trim()).filter(Boolean);
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 4 }}>
        {tags.map((tag, i) => (
          <span key={i} style={{ fontSize: 10, color: C.texto, marginRight: 4 }}>{tag}</span>
        ))}
      </div>
    );
  }
  if (item.type === "job") {
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.primario }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint }}>{item.date}</div>}
        </div>
        {(item.subtitle || item.location) && (
          <div style={{ fontSize: 10, color: C.hint, marginTop: 2 }}>
            {[item.subtitle, item.location].filter(Boolean).join(" · ")}
          </div>
        )}
        {item.bullets && item.bullets.length > 0 && (
          <div style={{ marginTop: 5 }}>
            {item.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 7, padding: "2px 0", alignItems: "flex-start" }}>
                <span style={{ color: C.sidebar, fontSize: 10, marginTop: 1, flexShrink: 0 }}>·</span>
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
      <div style={{ display: "flex", gap: 7, padding: "2px 0", alignItems: "flex-start" }}>
        <span style={{ color: C.sidebar, fontSize: 10, marginTop: 1 }}>·</span>
        <span style={{ fontSize: 11, color: C.texto, lineHeight: 1.5 }}>{item.content}</span>
      </div>
    );
  }

  return (
    <div style={{ fontSize: 11, color: C.texto, lineHeight: 1.65, marginBottom: 4 }}>{item.content}</div>
  );
}
