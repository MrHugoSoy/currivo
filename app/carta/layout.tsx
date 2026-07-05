import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carta de Presentación con IA — resumika",
  description: "Genera una carta de presentación profesional con IA en minutos. Adaptada a tu CV, tu industria y el puesto al que aplicas.",
  alternates: { canonical: "https://resumika.com/carta" },
  openGraph: {
    title: "Carta de Presentación con IA — resumika",
    description: "Genera una carta de presentación profesional con IA en minutos.",
    url: "https://resumika.com/carta",
    siteName: "resumika",
  },
};

export default function CartaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
