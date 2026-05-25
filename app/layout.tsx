import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "resumika — CV profesional con IA",
    template: "%s | resumika",
  },
  description: "Genera tu currículum profesional con IA en menos de 3 minutos. Para México, USA y Canadá.",
  keywords: ["curriculum vitae", "CV profesional", "resume IA", "currículum México", "resume Canada", "carta de presentación"],
  metadataBase: new URL("https://resumika.com"),
  openGraph: {
    title: "resumika — CV profesional con IA",
    description: "Genera tu CV profesional con IA en menos de 3 minutos.",
    url: "https://resumika.com",
    siteName: "resumika",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "resumika — CV profesional con IA",
    description: "Genera tu CV profesional con IA en menos de 3 minutos.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
