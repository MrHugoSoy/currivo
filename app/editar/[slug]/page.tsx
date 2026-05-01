import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TextEditor from "./TextEditor";

type PageProps = { params: Promise<{ slug: string }> };

export default async function EditarPage({ params }: PageProps) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("cvs")
    .select("nombre, puesto, cv_text, template, mercado")
    .eq("slug", slug)
    .single();

  if (!data || error) notFound();

  return (
    <TextEditor
      slug={slug}
      nombre={data.nombre}
      puesto={data.puesto}
      initialText={data.cv_text}
      templateId={(data.template as string) ?? "clasico"}
      mercado={data.mercado}
    />
  );
}
