import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Precios — resumika",
  description: "Planes de resumika: genera tu CV profesional con IA gratis o desbloquea CVs ilimitados. Sin suscripción, pago único.",
  alternates: { canonical: "https://resumika.com/precios" },
  openGraph: {
    title: "Precios — resumika",
    description: "Genera tu primer CV gratis. Plan Pro con CVs ilimitados por pago único.",
    url: "https://resumika.com/precios",
    siteName: "resumika",
  },
};

export default function PreciosPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 62 }}>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
