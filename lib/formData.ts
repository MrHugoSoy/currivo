// Brings a stored CV's form_data into the shape the Generator form expects.
// Older CVs saved certificaciones/languages as strings and may have null arrays.
export function normalizeFormData(raw: unknown): Record<string, unknown> {
  const fd = { ...(raw as Record<string, unknown>) };

  if (typeof fd.certificaciones === "string") {
    const text = fd.certificaciones.trim();
    fd.certificaciones = text
      ? text.split(",").map(n => ({ nombre: n.trim(), institucion: "", anio: "" }))
      : [];
  }
  if (!Array.isArray(fd.certificaciones)) fd.certificaciones = [];

  if (typeof fd.languages === "string" && fd.languages) {
    fd.languages = fd.languages.split(", ").map(entry => {
      const match = entry.match(/^(.+?)\s*\((.+)\)$/);
      return match
        ? { language: match[1].trim(), level: match[2].trim() }
        : { language: entry.trim(), level: "Nativo" };
    });
  }

  if (!Array.isArray(fd.experiencias) || !fd.experiencias.length) {
    fd.experiencias = [{ puesto: "", empresa: "", periodo: "", descripcion: "" }];
  }
  if (!Array.isArray(fd.educacion) || !fd.educacion.length) {
    fd.educacion = [{ carrera: "", institucion: "", anio: "" }];
  }
  if (!Array.isArray(fd.redesSociales)) fd.redesSociales = [];
  if (!Array.isArray(fd.habilidades)) fd.habilidades = [];

  return fd;
}
