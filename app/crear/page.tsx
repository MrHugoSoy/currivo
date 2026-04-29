import Navbar from "@/components/Navbar";
import Generator from "@/components/Generator";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear CV · currivo",
  description: "Genera tu currículum profesional con IA en menos de 3 minutos.",
};

export default function CrearPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 62 }}>
        <Generator />
      </main>
      <Footer />
    </>
  );
}
