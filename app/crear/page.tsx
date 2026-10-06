import Navbar from "@/components/Navbar";
import Generator from "@/components/Generator";
import EditCVLoader from "@/components/EditCVLoader";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear CV · resumika",
  description: "Genera tu currículum profesional con IA en menos de 3 minutos.",
};

type Props = { searchParams: Promise<{ edit?: string }> };

export default async function CrearPage({ searchParams }: Props) {
  const { edit } = await searchParams;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 68 }}>
        {edit ? <EditCVLoader slug={edit} /> : <Generator />}
      </main>
      <Footer />
    </>
  );
}
