import ClasicoPDF from "./clasico/PDF";
import ModernoPDF from "./moderno/PDF";
import MinimalistaPDF from "./minimalista/PDF";
import OscuroPDF from "./oscuro/PDF";

import ClasicoPreview from "./clasico/Preview";
import ModernoPreview from "./moderno/Preview";
import MinimalistaPreview from "./minimalista/Preview";
import OscuroPreview from "./oscuro/Preview";

import type { TemplateId } from "./types";
import type { CVData } from "./types";

type PDFComponent = (props: { data: CVData }) => React.ReactElement;
type PreviewComponent = (props: { data: CVData }) => React.ReactElement;

export const PDF_TEMPLATES: Record<TemplateId, PDFComponent> = {
  clasico: ClasicoPDF,
  moderno: ModernoPDF,
  minimalista: MinimalistaPDF,
  oscuro: OscuroPDF,
};

export const PREVIEW_TEMPLATES: Record<TemplateId, PreviewComponent> = {
  clasico: ClasicoPreview,
  moderno: ModernoPreview,
  minimalista: MinimalistaPreview,
  oscuro: OscuroPreview,
};

export { TEMPLATES } from "./types";
export type { CVData, TemplateId };
