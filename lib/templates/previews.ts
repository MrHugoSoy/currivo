import ClasicoPreview from "./clasico/Preview";
import ModernoPreview from "./moderno/Preview";
import MinimalistaPreview from "./minimalista/Preview";
import OscuroPreview from "./oscuro/Preview";
import EjecutivoPreview from "./ejecutivo/Preview";
import CompactoPreview from "./compacto/Preview";
import type { TemplateId, CVData } from "./types";

type PreviewComponent = (props: { data: CVData }) => React.ReactElement;

export const PREVIEW_TEMPLATES: Record<TemplateId, PreviewComponent> = {
  clasico:     ClasicoPreview,
  moderno:     ModernoPreview,
  ejecutivo:   EjecutivoPreview,
  compacto:    CompactoPreview,
  minimalista: MinimalistaPreview,
  oscuro:      OscuroPreview,
};
