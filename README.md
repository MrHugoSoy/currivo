# currivo — Generador de CV con IA

Generador de CVs profesionales con Claude AI. Hecho para México y Latinoamérica.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Claude API** (Anthropic) — generación de texto

## Configuración local

```bash
# 1. Instala dependencias
npm install

# 2. Crea tu archivo de variables de entorno
cp .env.example .env.local

# 3. Agrega tu API key de Anthropic
# Obtenla en: https://console.anthropic.com/
# Edita .env.local y pon tu key real en ANTHROPIC_API_KEY

# 4. Corre el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

1. Sube el repo a GitHub
2. Importa el proyecto en [vercel.com](https://vercel.com)
3. En Vercel → Settings → Environment Variables, agrega:
   - `ANTHROPIC_API_KEY` = tu key real

## Estructura

```
app/
  page.tsx              — Página principal
  layout.tsx            — Layout global
  globals.css           — Estilos globales + variables CSS
  api/
    generate/
      route.ts          — API Route: genera CV con Claude
components/
  Navbar.tsx
  Hero.tsx
  StatsBand.tsx
  HowItWorks.tsx
  Generator.tsx         — Formulario + llamada a Claude
  CVPreview.tsx         — Vista previa del CV
  Pricing.tsx
  Footer.tsx
```

## Obtener tu API Key

1. Ve a [console.anthropic.com](https://console.anthropic.com/)
2. Crea una cuenta o inicia sesión
3. En el menú lateral: **API Keys** → **Create Key**
4. Copia la key y pégala en `.env.local`

> ⚠️ Nunca subas tu `.env.local` al repositorio. Ya está en `.gitignore`.
