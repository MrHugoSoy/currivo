import Navbar from "@/components/Navbar";
import Generator from "@/components/Generator";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Crear CV · resumika",
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
      const fd = data.form_data as Record<string, unknown>;

      // Fix certificaciones: si viene como string legacy, conviértelo a array
      if (typeof fd.certificaciones === "string") {
        const raw = (fd.certificaciones as string).trim();
        if (raw) {
          fd.certificaciones = raw.split(",").map((n: string) => ({
            nombre: n.trim(), institucion: "", anio: "",
          }));
        } else {
          fd.certificaciones = [];
        }
      }
      // Si no existe, asegurar array vacío
      if (!Array.isArray(fd.certificaciones)) {
        fd.certificaciones = [];
      }

      // Fix languages: si viene como string, convertir a array
      if (typeof fd.languages === "string" && fd.languages) {
        fd.languages = (fd.languages as string).split(", ").map((entry: string) => {
          const match = entry.match(/^(.+?)\s*\((.+)\)$/);
          return match
            ? { language: match[1].trim(), level: match[2].trim() }
            : { language: entry.trim(), level: "Nativo" };
        });
      }

      // Fix arrays que pueden venir null
      if (!Array.isArray(fd.experiencias) || !fd.experiencias.length) {
        fd.experiencias = [{ puesto: "", empresa: "", periodo: "", descripcion: "" }];
      }
      if (!Array.isArray(fd.educacion) || !fd.educacion.length) {
        fd.educacion = [{ carrera: "", institucion: "", anio: "" }];
      }
      if (!Array.isArray(fd.redesSociales)) fd.redesSociales = [];
      if (!Array.isArray(fd.habilidades)) fd.habilidades = [];

      initialData = fd;
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
