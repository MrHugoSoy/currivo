import Navbar from "@/components/Navbar";
import Generator from "@/components/Generator";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Crear CV · currivo",
  description: "Genera tu currículum profesional con IA en menos de 3 minutos.",
};

type Props = { searchParams: Promise<{ edit?: string }> };

export default async function CrearPage({ searchParams }: Props) {
  const { edit } = await searchParams;

  let initialData: Record<string, unknown> | undefined;

  if (edit) {
    const { data } = await supabase
      .from("cvs")
      .select("form_data")
      .eq("slug", edit)
      .single();
    if (data?.form_data) {
      initialData = data.form_data as Record<string, unknown>;
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 62 }}>
        <Generator initialData={initialData} editSlug={edit} />
      </main>
      <Footer />
    </>
  );
}
