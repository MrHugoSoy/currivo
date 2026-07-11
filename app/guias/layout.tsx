import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Guías de CV | resumika",
    template: "%s | resumika",
  },
  description: "Guías prácticas para crear tu CV profesional para México, Canadá y EE.UU. Formato, contenido, errores comunes y estrategias para conseguir entrevistas.",
  alternates: { canonical: "https://resumika.com/guias" },
  openGraph: {
    siteName: "resumika",
    locale: "es_MX",
    type: "website",
  },
};

export default function GuiasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
