import type { Metadata } from "next";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhoItsFor from "@/components/WhoItsFor";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import { FAQ_JSONLD } from "@/lib/faqData";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { FeaturedGuias } from "@/components/guias/FeaturedGuias";

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

export default async function Home() {
  const hdrs = await headers();
  const country = hdrs.get("x-vercel-ip-country") ?? "MX";
  const currency = country === "US" ? "USD" : country === "CA" ? "CAD" : "MXN";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <div style={{ height: 5, background: "linear-gradient(90deg, var(--green-mid), var(--green))" }} />
        <WhoItsFor />
        <Testimonials />
        <FeaturedGuias />
        <Pricing currency={currency} />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
