"use client";

interface CVPreviewProps {
  market?: "mx" | "us" | "ca";
  photoUrl?: string;
}

export default function CVPreview({ market = "mx", photoUrl }: CVPreviewProps) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.08)" }}>
      {/* Title bar */}
      <div style={{ background: "var(--warm)", padding: "9px 13px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ fontSize: 9, color: "var(--hint)", marginLeft: 7, flex: 1 }}>
          {market === "mx" ? "currivo_cv_mexico.pdf" : market === "us" ? "maria_garcia_resume.pdf" : "maria_garcia_resume_canada.pdf"}
        </span>
        <span style={{ fontSize: 9, background: "var(--green-bg)", color: "var(--green)", borderRadius: 100, padding: "2px 8px", border: "1px solid rgba(42,82,54,.15)", fontWeight: 500 }}>
          {market === "mx" ? "🇲🇽 Formato México" : market === "us" ? "🇺🇸 US Resume" : "🇨🇦 Canadian Resume"}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "22px 20px" }}>
        {market === "mx" && <CVMexico photoUrl={photoUrl} />}
        {market === "us" && <CVUsa />}
        {market === "ca" && <CVCanada />}
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 14px", background: "var(--warm)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 8, color: "var(--hint)", letterSpacing: "0.5px" }}>
          {market === "mx" ? "Currículum Vitae · currivo.mx" : "Resume · currivo.mx"}
        </span>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-mid)" }} />
      </div>
    </div>
  );
}

// ── Shared primitives ──

function CvName({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, letterSpacing: "-0.5px", color: "var(--ink)" }}>{children}</div>;
}
function CvRole({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, color: "var(--green)", fontWeight: 500, marginTop: 2 }}>{children}</div>;
}
function CvContacts({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
      {items.map(i => <span key={i} style={{ fontSize: 8, color: "var(--hint)" }}>{i}</span>)}
    </div>
  );
}
function CvHr() {
  return <div style={{ height: 1.5, background: "var(--ink)", margin: "12px 0" }} />;
}
function CvH({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 7, letterSpacing: 2, textTransform: "uppercase", color: "var(--hint)", display: "flex", alignItems: "center", gap: 7, margin: "12px 0 7px", fontWeight: 600 }}>
      {children}
      <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
    </div>
  );
}
function CvJob({ title, meta, desc }: { title: string; meta: string; desc: string }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
      <div style={{ fontSize: 8, color: "var(--hint)", margin: "1px 0 3px" }}>{meta}</div>
      <div style={{ fontSize: 9, color: "var(--body)", lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}
function CvTags({ tags, color = "green" }: { tags: string[]; color?: "green" | "blue" | "amber" }) {
  const bg = color === "blue" ? "#e8f0fb" : color === "amber" ? "#fef3e2" : "var(--green-bg)";
  const fg = color === "blue" ? "#1a4a8a" : color === "amber" ? "#8a4a00" : "var(--green)";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 7 }}>
      {tags.map(t => (
        <span key={t} style={{ fontSize: 8, padding: "2px 7px", background: bg, color: fg, borderRadius: 3, fontWeight: 500 }}>{t}</span>
      ))}
    </div>
  );
}
function NoBadge() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 4, padding: "3px 8px", fontSize: 8, color: "#991b1b", fontWeight: 500, marginBottom: 10 }}>
      🚫 Sin foto · Sin edad · Sin estado civil
    </div>
  );
}

// ── MEXICO ──
function CVMexico({ photoUrl }: { photoUrl?: string }) {
  return (
    <>
      <CvName>María García López</CvName>
      <CvRole>Diseñadora Gráfica Senior</CvRole>
      <CvContacts items={["📍 León, Gto.", "✉ maria@correo.com", "☎ +52 477 123 4567"]} />
      <CvHr />

      {/* Personal data + photo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start", marginBottom: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: "var(--cream)", borderRadius: 5, padding: "8px 10px" }}>
          {[["Edad","28 años"],["Estado civil","Soltera"],["Nacionalidad","Mexicana"],["Disponibilidad","Inmediata"]].map(([l,v]) => (
            <div key={l}>
              <div style={{ fontSize: 8, color: "var(--hint)", marginBottom: 1 }}>{l}</div>
              <div style={{ fontSize: 9, color: "var(--ink)", fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
        {photoUrl
          ? <img src={photoUrl} alt="Foto" style={{ width: 52, height: 52, borderRadius: 6, objectFit: "cover", border: "1px solid rgba(42,82,54,.2)", flexShrink: 0 }} />
          : <div style={{ width: 52, height: 52, borderRadius: 6, background: "linear-gradient(135deg,#d4e8da,#a8d4b4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "1px solid rgba(42,82,54,.2)", flexShrink: 0 }}>👩</div>
        }
      </div>

      <CvH>Objetivo profesional</CvH>
      <p style={{ fontSize: 9, color: "var(--green)", lineHeight: 1.6, fontStyle: "italic" }}>
        Diseñadora gráfica con 5 años de experiencia busca integrarse a empresa innovadora donde pueda aportar su expertise en identidades de marca y estrategia visual digital.
      </p>

      <CvH>Experiencia laboral</CvH>
      <CvJob title="Diseñadora Gráfica Senior" meta="Agencia Creativa MX · 2020 – Presente" desc="+30 identidades corporativas. Reducción de 40% en tiempos con sistemas Figma." />
      <CvJob title="Diseñadora Freelance" meta="Independiente · 2018 – 2020" desc="15+ clientes en retail, restaurantes y servicios profesionales." />

      <CvH>Habilidades</CvH>
      <CvTags tags={["Photoshop","Figma","Illustrator","CorelDRAW","Branding","Inglés B2"]} />

      <CvH>Educación</CvH>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink)" }}>Lic. en Diseño Gráfico</div>
      <div style={{ fontSize: 8, color: "var(--hint)", marginTop: 2 }}>Universidad de Guanajuato · 2014 – 2018</div>
    </>
  );
}

// ── USA ──
function CVUsa() {
  return (
    <>
      <NoBadge />
      <CvName>María García López</CvName>
      <div style={{ fontSize: 11, color: "var(--body)", marginTop: 2 }}>Graphic Designer</div>
      <CvContacts items={["Austin, TX", "maria@email.com", "linkedin.com/in/mariagl"]} />
      <CvHr />

      <CvH>Professional Summary</CvH>
      <p style={{ fontSize: 9, color: "var(--body)", lineHeight: 1.6 }}>
        Results-driven Graphic Designer with 5+ years delivering high-impact brand identities. Proven track record of reducing delivery timelines by 40% through systematic design processes.
      </p>

      <CvH>Experience</CvH>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink)" }}>Senior Graphic Designer</div>
          <div style={{ fontSize: 8, color: "var(--hint)" }}>2020 – Present</div>
        </div>
        <div style={{ fontSize: 8, color: "var(--hint)", margin: "1px 0 4px" }}>Creative Agency MX · Austin, TX</div>
        {["Delivered 30+ corporate brand identities, achieving 95% client satisfaction","Reduced delivery time by 40% implementing Figma component systems","Led 3 rebranding campaigns, increasing client revenue by avg. 25%"].map(b => (
          <div key={b} style={{ fontSize: 9, color: "var(--body)", padding: "2px 0 2px 12px", position: "relative", lineHeight: 1.5 }}>
            <span style={{ position: "absolute", left: 0, color: "var(--green-mid)", fontSize: 8 }}>▸</span>{b}
          </div>
        ))}
      </div>

      <CvH>Skills</CvH>
      <CvTags tags={["Adobe Photoshop","Figma","Illustrator","Brand Strategy","ATS-Optimized"]} color="blue" />

      {/* ATS bar */}
      <div style={{ background: "#e8f4ec", borderRadius: 5, padding: "6px 10px", marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 8, color: "var(--green)", fontWeight: 500 }}>ATS Score</span>
        <div style={{ flex: 1, height: 4, background: "#c0d8c8", borderRadius: 2 }}>
          <div style={{ height: "100%", width: "87%", background: "var(--green-mid)", borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 8, color: "var(--green)", fontWeight: 600 }}>87%</span>
      </div>

      <CvH>Education</CvH>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink)" }}>B.A. Graphic Design · University of Guanajuato · 2018</div>
    </>
  );
}

// ── CANADA ──
function CVCanada() {
  return (
    <>
      <NoBadge />
      <CvName>María García López</CvName>
      <div style={{ fontSize: 11, color: "var(--body)", marginTop: 2 }}>Graphic Designer</div>
      <CvContacts items={["Toronto, ON", "maria@email.com", "linkedin.com/in/mariagl"]} />
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        {["🇬🇧 English — Fluent", "🇫🇷 French — Intermediate"].map(l => (
          <span key={l} style={{ fontSize: 8, background: "#e8f0fb", color: "#1a4a8a", borderRadius: 4, padding: "2px 7px", fontWeight: 500 }}>{l}</span>
        ))}
      </div>
      <CvHr />

      <CvH>Professional Profile</CvH>
      <p style={{ fontSize: 9, color: "var(--body)", lineHeight: 1.6 }}>
        Collaborative Graphic Designer with 5 years building brand identities. Known for strong communication skills and ability to lead cross-functional creative teams.
      </p>

      <CvH>Work Experience</CvH>
      <CvJob title="Senior Graphic Designer" meta="Creative Agency · Toronto, ON · 2020 – Present" desc="Delivered 30+ brand identities. Collaborated across 4 departments. Mentored 2 junior designers." />
      <CvJob title="Freelance Designer" meta="Self-employed · Remote · 2018 – 2020" desc="Served 15+ clients across retail and hospitality sectors." />

      <CvH>Volunteer Work</CvH>
      <div style={{ background: "#fef8ec", borderLeft: "2px solid #e8a020", padding: "6px 10px", borderRadius: "0 4px 4px 0" }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: "#7a5000" }}>🤝 Design Volunteer — Toronto Food Bank</div>
        <div style={{ fontSize: 8, color: "#8a6820", marginTop: 2, lineHeight: 1.5 }}>Designed fundraising materials and social media assets. 8 hrs/month. 2021 – Present.</div>
      </div>

      <CvH>Skills</CvH>
      <CvTags tags={["Adobe Suite","Figma","Brand Strategy","Team Leadership","Communication"]} color="amber" />

      <CvH>Education</CvH>
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink)" }}>B.A. Graphic Design · University of Guanajuato · 2018</div>
    </>
  );
}
