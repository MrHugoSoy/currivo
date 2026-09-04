import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserId } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const userId = await getVerifiedUserId(req, supabaseAdmin);
  if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { nombre, puesto, mercado, stars, text } = await req.json();
  if (!stars || stars < 1 || stars > 5) return NextResponse.json({ error: "Calificación inválida." }, { status: 400 });
  if (!text || !String(text).trim()) return NextResponse.json({ error: "Falta el texto de la reseña." }, { status: 400 });

  const { error } = await supabaseAdmin.from("reviews").insert({
    user_id: userId,
    nombre: nombre ?? "",
    puesto: puesto ?? "",
    mercado: mercado ?? "",
    stars,
    text: String(text).trim().slice(0, 280),
    approved: false,
  });

  if (error) return NextResponse.json({ error: "No se pudo guardar la reseña." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
