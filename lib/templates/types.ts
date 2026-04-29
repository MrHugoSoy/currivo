export interface CVData {
  nombre: string;
  puesto: string;
  ciudad?: string;
  email?: string;
  telefono?: string;
  linkedin?: string;
  mercado: "mx" | "us" | "ca";
  cv_text: string;
  form_data?: {
    tono?: string;
    industria?: string;
    edad?: string;
    estadoCivil?: string;
    idiomas?: string;
    voluntariado?: string;
  };
}

export type TemplateId = "clasico" | "moderno" | "minimalista" | "oscuro";

export interface TemplateConfig {
  id: TemplateId;
  nombre: string;
  descripcion: string;
  libre: boolean;
  colores: {
    primario: string;
    acento: string;
    fondo: string;
    texto: string;
  };
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "clasico",
    nombre: "Clásico",
    descripcion: "Elegante y formal",
    libre: true,
    colores: { primario: "#1a1814", acento: "#2a5236", fondo: "#fffefc", texto: "#4a443c" },
  },
  {
    id: "moderno",
    nombre: "Moderno",
    descripcion: "Limpio con acento de color",
    libre: true,
    colores: { primario: "#2a5236", acento: "#4a9060", fondo: "#fffefc", texto: "#1a1814" },
  },
  {
    id: "minimalista",
    nombre: "Minimalista",
    descripcion: "Solo tipografía, sin distracciones",
    libre: false,
    colores: { primario: "#1a1814", acento: "#b0a89e", fondo: "#f7f4ee", texto: "#4a443c" },
  },
  {
    id: "oscuro",
    nombre: "Oscuro",
    descripcion: "Fondo negro, estilo premium",
    libre: false,
    colores: { primario: "#fffefc", acento: "#4a9060", fondo: "#1a1814", texto: "#ede8dc" },
  },
];
