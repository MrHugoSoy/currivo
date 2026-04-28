import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad · currivo.mx",
  description: "Conoce cómo currivo.mx recopila, usa y protege tus datos personales conforme a la legislación mexicana.",
};

const UPDATED = "27 de abril de 2026";

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* Top bar */}
      <header style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "0 48px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", textDecoration: "none", letterSpacing: "-0.3px" }}>
          curr<span style={{ color: "var(--green)" }}>ivo</span>
        </a>
        <a href="/" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>← Volver al inicio</a>
      </header>

      {/* Hero */}
      <div style={{ background: "var(--ink)", padding: "48px 48px 40px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.3)", marginBottom: 14 }}>Legal</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 600, color: "#f8f5ef", letterSpacing: "-1px", marginBottom: 10 }}>Política de Privacidad</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Última actualización: {UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "56px 48px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

          <Section title="1. Responsable del tratamiento">
            <P>currivo.mx ("nosotros", "el Responsable") trata sus datos personales de acuerdo con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> y su Reglamento.</P>
            <P>Para cualquier asunto relacionado con el tratamiento de sus datos, puede contactarnos en: <strong>privacidad@currivo.mx</strong></P>
          </Section>

          <Section title="2. Datos personales que recopilamos">
            <P>Recopilamos únicamente los datos necesarios para prestar el Servicio:</P>
            <Table rows={[
              ["Datos de contacto", "Nombre completo, correo electrónico, ciudad"],
              ["Datos profesionales", "Puesto deseado, último puesto, empresa, descripción de actividades, idiomas"],
              ["Datos opcionales (MX)", "Edad, estado civil, fotografía"],
              ["Datos de cuenta", "Correo electrónico y contraseña (cifrada) al registrarse"],
              ["Datos técnicos", "Dirección IP, tipo de navegador, país de acceso"],
              ["CV generado", "Texto completo del CV producido por la IA"],
            ]} />
            <P>La fotografía, edad y estado civil solo se solicitan para el formato de CV mexicano y su uso es estrictamente opcional. No almacenamos la fotografía en nuestros servidores; se procesa únicamente en su navegador (client-side) y, si elige incluirla, se envía codificada junto con los demás datos del formulario.</P>
          </Section>

          <Section title="3. Finalidades del tratamiento">
            <P>Utilizamos sus datos para:</P>
            <ul style={ulStyle}>
              <li><strong>Finalidades primarias:</strong> generar su CV mediante IA, almacenarlo y permitirle compartirlo mediante un enlace único.</li>
              <li><strong>Gestión de cuenta:</strong> autenticación, recuperación de contraseña y comunicaciones transaccionales.</li>
              <li><strong>Mejora del servicio:</strong> análisis agregado y anónimo del uso del Servicio (sin identificarle individualmente).</li>
              <li><strong>Cumplimiento legal:</strong> cuando sea requerido por autoridades competentes.</li>
            </ul>
            <P>No utilizamos sus datos para publicidad de terceros ni los vendemos bajo ninguna circunstancia.</P>
          </Section>

          <Section title="4. Transferencia de datos a terceros">
            <P>Para operar el Servicio trabajamos con los siguientes subprocesadores que pueden tener acceso a sus datos:</P>
            <Table rows={[
              ["Anthropic (Claude API)", "Procesamiento de texto para generar el CV", "Estados Unidos"],
              ["Supabase", "Almacenamiento de datos y autenticación", "Estados Unidos"],
            ]} headers={["Proveedor", "Finalidad", "País"]} />
            <P>Ambos proveedores cuentan con políticas de privacidad robustas y mecanismos de transferencia internacional conformes con estándares reconocidos. Anthropic no almacena las solicitudes de API de forma permanente; Supabase almacena los datos en servidores protegidos con cifrado en reposo y en tránsito.</P>
          </Section>

          <Section title="5. Derechos ARCO">
            <P>Conforme a la LFPDPPP, usted tiene derecho a <strong>Acceder, Rectificar, Cancelar u Oponerse</strong> al tratamiento de sus datos personales (derechos ARCO).</P>
            <P>Para ejercerlos, envíe una solicitud a <strong>privacidad@currivo.mx</strong> con:</P>
            <ul style={ulStyle}>
              <li>Nombre completo y correo electrónico registrado.</li>
              <li>Descripción clara del derecho que desea ejercer.</li>
              <li>Copia de documento que acredite su identidad.</li>
            </ul>
            <P>Responderemos en un plazo máximo de <strong>20 días hábiles</strong> a partir de la recepción de su solicitud.</P>
          </Section>

          <Section title="6. Retención de datos">
            <P>Conservamos sus datos durante el tiempo que mantenga una cuenta activa o sea necesario para prestar el Servicio. Puede solicitar la eliminación de su cuenta y datos en cualquier momento a través de <strong>privacidad@currivo.mx</strong>.</P>
            <P>Los CVs públicos compartidos mediante un enlace pueden tener un período de retención adicional de hasta 90 días tras la solicitud de eliminación, por razones de caché y copias de seguridad.</P>
          </Section>

          <Section title="7. Seguridad">
            <P>Implementamos medidas técnicas y organizativas para proteger sus datos, incluyendo:</P>
            <ul style={ulStyle}>
              <li>Comunicaciones cifradas mediante TLS/HTTPS.</li>
              <li>Contraseñas almacenadas con hash seguro (gestionado por Supabase Auth).</li>
              <li>Acceso a datos de producción restringido al equipo técnico esencial.</li>
              <li>Revisiones periódicas de seguridad.</li>
            </ul>
          </Section>

          <Section title="8. Cookies y tecnologías similares">
            <P>currivo.mx utiliza cookies estrictamente necesarias para la autenticación de sesión. No utilizamos cookies de rastreo publicitario ni de terceros con fines comerciales.</P>
            <P>Puede configurar su navegador para rechazar cookies; sin embargo, esto puede afectar algunas funcionalidades del Servicio, como mantener la sesión iniciada.</P>
          </Section>

          <Section title="9. Cambios a esta política">
            <P>Podemos actualizar esta Política en cualquier momento. Notificaremos los cambios materiales por correo electrónico o mediante un aviso visible en el Servicio antes de que entren en vigor. La fecha de "Última actualización" al inicio del documento siempre refleja la versión vigente.</P>
          </Section>

          <Section title="10. Contacto y autoridad">
            <P>Para cualquier consulta sobre privacidad: <strong>privacidad@currivo.mx</strong></P>
            <P>Si considera que su derecho a la protección de datos ha sido vulnerado, puede presentar una queja ante el <strong>Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI)</strong> en <a href="https://www.inai.org.mx" target="_blank" rel="noreferrer" style={{ color: "var(--green)" }}>www.inai.org.mx</a>.</P>
          </Section>

        </div>
      </div>

      <LegalFooter />
    </div>
  );
}

// ── Shared primitives ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.3px", marginBottom: 14 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, color: "var(--body)", lineHeight: 1.78 }}>{children}</p>;
}

const ulStyle: React.CSSProperties = {
  paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6,
  fontSize: 14, color: "var(--body)", lineHeight: 1.7,
};

function Table({ rows, headers }: { rows: string[][]; headers?: string[] }) {
  const th: React.CSSProperties = { textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted)", padding: "8px 14px", background: "var(--warm)", letterSpacing: "0.3px" };
  const td: React.CSSProperties = { fontSize: 13, color: "var(--body)", padding: "10px 14px", verticalAlign: "top", lineHeight: 1.6 };
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {headers && (
          <thead>
            <tr>{headers.map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderTop: i > 0 || headers ? "1px solid var(--border)" : undefined }}>
              {row.map((cell, j) => (
                <td key={j} style={{ ...td, fontWeight: j === 0 ? 500 : 400, color: j === 0 ? "var(--ink)" : "var(--body)" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LegalFooter() {
  return (
    <div style={{ borderTop: "1px solid var(--border)", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 740, margin: "0 auto" }}>
      <span style={{ fontSize: 11, color: "var(--hint)" }}>© 2026 currivo · México</span>
      <div style={{ display: "flex", gap: 20 }}>
        <a href="/terminos" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Términos</a>
        <a href="/privacidad" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", fontWeight: 500 }}>Privacidad</a>
      </div>
    </div>
  );
}
