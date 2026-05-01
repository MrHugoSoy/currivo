import ClasicoPreview from "./clasico/Preview";
import ModernoPreview from "./moderno/Preview";
import MinimalistaPreview from "./minimalista/Preview";
import OscuroPreview from "./oscuro/Preview";
import type { TemplateId, CVData } from "./types";

type PreviewComponent = (props: { data: CVData }) => React.ReactElement;

export const PREVIEW_TEMPLATES: Record<TemplateId, PreviewComponent> = {
  clasico: ClasicoPreview,
  moderno: ModernoPreview,
  minimalista: MinimalistaPreview,
  oscuro: OscuroPreview,
};
