export const FAQS = [
  { q: "¿resumika realmente utiliza IA para redactar mi CV?", a: "Sí. Describes tu experiencia y el modelo de IA redacta descripciones profesionales a partir de esa información — no usamos plantillas de texto genéricas." },
  { q: "¿Mi CV está optimizado para sistemas ATS?", a: "El formato y la estructura están pensados para ser legibles por sistemas de seguimiento de candidatos (ATS): títulos estándar, texto real (no imágenes) y keywords relevantes a tu industria." },
  { q: "¿Puedo adaptar mi CV a una vacante específica?", a: "Sí. Pega la descripción del puesto y la IA ajusta tu CV para reflejar las palabras clave y prioridades de esa vacante en particular." },
  { q: "¿Funciona para México, Estados Unidos y Canadá?", a: "Sí, los tres mercados están soportados con el formato y las prácticas habituales de cada país. Puedes cambiar de mercado en cualquier momento." },
  { q: "¿Puedo generar mi CV en inglés o francés?", a: "Sí. Para USA y Canadá puedes elegir generar el CV en inglés, y para Canadá también está disponible en francés." },
  { q: "¿Puedo editar el CV después de generarlo?", a: "Sí, puedes editar el texto generado y volver a descargarlo en PDF las veces que necesites." },
  { q: "¿Mis datos están seguros?", a: "No vendemos tu información ni la usamos para publicidad. Puedes eliminar tu cuenta y tus datos cuando quieras. Más detalles en nuestra política de privacidad." },
  { q: "¿Puedo cancelar mi suscripción cuando quiera?", a: "Sí, puedes gestionar o cancelar tu suscripción Pro en cualquier momento desde tu perfil, sin llamadas ni procesos complicados." },
  { q: "¿Qué pasa si la IA comete un error en mi CV?", a: "Siempre puedes editar el texto manualmente antes de descargarlo. Te recomendamos revisar cualquier CV generado con IA antes de enviarlo." },
];

export const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(f => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
