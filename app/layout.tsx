import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}` }} />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8458170443836025" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <ThemeToggle />
        {/* Google tag (gtag.js) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-HRXV37QMZ6" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HRXV37QMZ6');
          `}
        </Script>
      </body>
    </html>
  );
}
