import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones · currivo.mx",
  description: "Términos y condiciones de uso del servicio currivo.mx — generador de CVs con inteligencia artificial.",
};

const UPDATED = "27 de abril de 2026";

export default function TerminosPage() {
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
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 600, color: "#f8f5ef", letterSpacing: "-1px", marginBottom: 10 }}>Términos y Condiciones</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>Última actualización: {UPDATED}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "56px 48px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

          <Section title="1. Aceptación de los términos">
            <P>Al acceder o utilizar currivo.mx ("el Servicio"), usted acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.</P>
            <P>Estos términos se rigen por las leyes de los Estados Unidos Mexicanos y cualquier controversia será resuelta ante los tribunales competentes de la Ciudad de México.</P>
          </Section>

          <Section title="2. Descripción del servicio">
            <P>currivo.mx es una plataforma en línea que utiliza inteligencia artificial para generar currículums vitae profesionales. El Servicio permite a los usuarios:</P>
            <ul style={ulStyle}>
              <li>Ingresar información personal y profesional en un formulario.</li>
              <li>Seleccionar el mercado laboral de destino (México, USA, Canadá).</li>
              <li>Recibir un currículum generado automáticamente por un modelo de lenguaje.</li>
              <li>Compartir el CV generado mediante un enlace público único.</li>
            </ul>
          </Section>

          <Section title="3. Uso del servicio y cuentas">
            <P>El primer CV generado es gratuito. Para acceder a generaciones adicionales, funciones premium y almacenamiento persistente de CVs, es necesario crear una cuenta y, en su caso, contratar un plan de pago.</P>
            <P>Usted es responsable de mantener la confidencialidad de las credenciales de su cuenta y de todas las actividades realizadas desde la misma. Notifíquenos inmediatamente si detecta acceso no autorizado a su cuenta escribiendo a <strong>privacidad@currivo.mx</strong>.</P>
          </Section>

          <Section title="4. Contenido generado por IA">
            <P>Los currículums son generados por un modelo de inteligencia artificial (Anthropic Claude). currivo.mx no garantiza que el contenido generado sea preciso, completo, libre de errores o adecuado para una vacante específica.</P>
            <P><strong>Es responsabilidad exclusiva del usuario</strong> revisar, corregir y validar el contenido antes de enviarlo a un reclutador o empleador. currivo.mx no se hace responsable de decisiones de contratación tomadas con base en los CVs generados.</P>
          </Section>

          <Section title="5. Uso aceptable">
            <P>Usted se compromete a no utilizar el Servicio para:</P>
            <ul style={ulStyle}>
              <li>Proporcionar información falsa, engañosa o fraudulenta.</li>
              <li>Generar contenido de terceros sin su consentimiento.</li>
              <li>Realizar ingeniería inversa, scraping automatizado o ataques al Servicio.</li>
              <li>Compartir contenido que viole derechos de propiedad intelectual o que sea ilegal.</li>
            </ul>
            <P>currivo.mx se reserva el derecho de suspender o cancelar cuentas que incumplan estas condiciones, sin previo aviso y sin responsabilidad.</P>
          </Section>

          <Section title="6. Propiedad intelectual">
            <P>El diseño, código, marca y contenido editorial de currivo.mx son propiedad de sus desarrolladores y están protegidos por las leyes de propiedad intelectual aplicables en México.</P>
            <P>El contenido del CV generado a partir de los datos que usted proporcione le pertenece a usted. Al usar el Servicio, nos otorga una licencia limitada, no exclusiva y gratuita para almacenar y procesar dicho contenido con el único fin de prestarle el Servicio.</P>
          </Section>

          <Section title="7. Pagos y reembolsos">
            <P>Los planes de pago se cobran de forma adelantada al inicio de cada período de facturación. currivo.mx no ofrece reembolsos por períodos parciales, salvo cuando la ley mexicana aplicable lo exija expresamente.</P>
            <P>Nos reservamos el derecho de modificar los precios con un aviso previo mínimo de 15 días naturales enviado al correo electrónico registrado en su cuenta.</P>
          </Section>

          <Section title="8. Limitación de responsabilidad">
            <P>En la máxima medida permitida por la ley, currivo.mx no será responsable de daños indirectos, incidentales, especiales, consecuentes o punitivos, incluida la pérdida de datos, oportunidades de empleo u otros perjuicios derivados del uso o la imposibilidad de uso del Servicio.</P>
          </Section>

          <Section title="9. Modificaciones a los términos">
            <P>Podemos actualizar estos Términos en cualquier momento. Cuando lo hagamos, revisaremos la fecha de "Última actualización" al inicio de este documento y, si los cambios son materiales, le notificaremos por correo electrónico o mediante un aviso en el Servicio.</P>
            <P>El uso continuado del Servicio después de la publicación de cambios constituye su aceptación de los nuevos términos.</P>
          </Section>

          <Section title="10. Contacto">
            <P>Si tiene preguntas sobre estos Términos, puede contactarnos en: <strong>hola@currivo.mx</strong></P>
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

function LegalFooter() {
  return (
    <div style={{ borderTop: "1px solid var(--border)", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 740, margin: "0 auto" }}>
      <span style={{ fontSize: 11, color: "var(--hint)" }}>© 2026 currivo · México</span>
      <div style={{ display: "flex", gap: 20 }}>
        <a href="/terminos" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", fontWeight: 500 }}>Términos</a>
        <a href="/privacidad" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Privacidad</a>
      </div>
    </div>
  );
}
