import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Nosotros | resumika",
  description: "resumika es una plataforma hecha en México para ayudar a profesionales a presentar su experiencia con el formato que cada mercado laboral espera.",
  alternates: { canonical: "https://resumika.com/nosotros" },
};

export default function NosotrosPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--cream)", paddingTop: 68 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px 96px" }}>
          <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--hint)", marginBottom: 16 }}>
            Nosotros
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-1px", lineHeight: 1.12, marginBottom: 24 }}>
            Un buen profesional no debería ser rechazado por el formato de su CV
          </h1>

          <p style={{ fontSize: 16, color: "var(--body)", lineHeight: 1.8, marginBottom: 20 }}>
            resumika nació de un problema muy concreto: la misma experiencia profesional se presenta de forma distinta según el país donde apliques. Un CV que funciona en México puede verse fuera de lugar en Estados Unidos, y uno pensado para Estados Unidos puede faltarle piezas clave que un reclutador canadiense sí espera.
          </p>
          <p style={{ fontSize: 16, color: "var(--body)", lineHeight: 1.8, marginBottom: 20 }}>
            La mayoría de generadores de CV tratan el formato como un detalle estético. Nosotros lo tratamos como lo que realmente es: la diferencia entre que tu experiencia se entienda o se pase por alto.
          </p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "var(--ink)", marginTop: 44, marginBottom: 14 }}>
            Qué hacemos
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--body)", lineHeight: 1.8, marginBottom: 20 }}>
            resumika usa inteligencia artificial para redactar y estructurar tu CV según las prácticas del mercado laboral de México, Estados Unidos o Canadá — y, si lo necesitas, lo adapta a una vacante específica para que resalten las palabras clave que importan.
          </p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "var(--ink)", marginTop: 44, marginBottom: 14 }}>
            Hecho en México, para profesionales sin fronteras
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--body)", lineHeight: 1.8, marginBottom: 20 }}>
            Somos una plataforma mexicana. Construimos resumika pensando primero en profesionales latinoamericanos que buscan competir en mercados laborales internacionales, sin perder de vista a quienes simplemente buscan su próximo trabajo en casa.
          </p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: "var(--ink)", marginTop: 44, marginBottom: 14 }}>
            Cómo tratamos tus datos
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--body)", lineHeight: 1.8, marginBottom: 12 }}>
            No vendemos tu información ni la usamos para publicidad. Puedes eliminar tu cuenta y tus datos cuando quieras. Los detalles completos están en nuestra{" "}
            <a href="/privacidad" style={{ color: "var(--green)", textDecoration: "underline" }}>política de privacidad</a>.
          </p>

          <div style={{ marginTop: 48, padding: "28px 26px", background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginBottom: 12 }}>
              ¿Tienes preguntas, feedback o una idea que crees que deberíamos construir?
            </p>
            <a href="mailto:info@resumika.com" style={{ display: "inline-block", background: "var(--green)", color: "#fff", textDecoration: "none", borderRadius: 6, padding: "10px 20px", fontSize: 13, fontWeight: 500 }}>
              Escríbenos →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
