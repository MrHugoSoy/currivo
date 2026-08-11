import type { Metadata } from "next";
import { headers } from "next/headers";
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

export default async function PreciosPage() {
  const hdrs = await headers();
  const country = hdrs.get("x-vercel-ip-country") ?? "MX";
  const currency = country === "US" ? "USD" : country === "CA" ? "CAD" : "MXN";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 68 }}>
        <Pricing currency={currency} />
      </main>
      <Footer />
    </>
  );
}
