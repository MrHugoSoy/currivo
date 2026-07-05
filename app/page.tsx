import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "resumika — Generador de CV con Inteligencia Artificial",
  description: "Crea tu currículum profesional con IA en 3 minutos. Plantillas para México, USA y Canadá. Descarga en PDF, ATS-friendly. Gratis.",
  keywords: [
    "generador de curriculum vitae", "hacer cv con inteligencia artificial", "currículum vitae profesional",
    "resume builder AI", "cv para canada", "resume para estados unidos", "cv mexico gratis",
    "curriculum vitae gratis", "hacer curriculum online", "cv IA", "resume AI canada",
    "carta de presentacion ia", "crear cv rapido", "plantilla cv profesional",
  ],
  alternates: { canonical: "https://resumika.com" },
  openGraph: {
    title: "resumika — Generador de CV con IA | México · USA · Canadá",
    description: "Crea tu currículum profesional con IA en 3 minutos. Plantillas ATS-friendly para México, USA y Canadá.",
    url: "https://resumika.com",
    siteName: "resumika",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "resumika — Generador de CV con IA",
    description: "Crea tu currículum profesional con IA en 3 minutos. Gratis para México, USA y Canadá.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://resumika.com/#website",
      "url": "https://resumika.com",
      "name": "resumika",
      "description": "Generador de CV con Inteligencia Artificial para México, USA y Canadá",
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "https://resumika.com/crear" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://resumika.com/#app",
      "name": "resumika",
      "url": "https://resumika.com",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "MXN",
        "description": "Genera tu primer CV gratis",
      },
      "description": "Generador de currículum vitae con inteligencia artificial. Crea CVs profesionales para México, USA y Canadá en menos de 3 minutos.",
    },
    {
      "@type": "Organization",
      "@id": "https://resumika.com/#org",
      "name": "resumika",
      "url": "https://resumika.com",
      "logo": "https://resumika.com/logo.png",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
