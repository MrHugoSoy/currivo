import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "resumika — Generador de CV con IA",
    template: "%s | resumika",
  },
  description: "Genera tu currículum profesional con IA en menos de 3 minutos. Para México, USA y Canadá.",
  keywords: ["curriculum vitae", "CV profesional", "resume IA", "currículum México", "resume Canada", "carta de presentación", "generador de cv gratis"],
  metadataBase: new URL("https://resumika.com"),
  alternates: { canonical: "https://resumika.com" },
  openGraph: {
    title: "resumika — Generador de CV con IA",
    description: "Genera tu CV profesional con IA en menos de 3 minutos. Gratis para México, USA y Canadá.",
    url: "https://resumika.com",
    siteName: "resumika",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "resumika — Generador de CV con IA",
    description: "Genera tu CV profesional con IA en menos de 3 minutos. Gratis para México, USA y Canadá.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
