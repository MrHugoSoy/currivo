import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Currivo — Crea tu CV con IA",
  description: "Genera un CV profesional en 3 minutos con Inteligencia Artificial. Diseñado para México y Latinoamérica.",
  keywords: ["CV", "currículum", "IA", "México", "trabajo", "empleo"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
