# MarkItDown — Frontend

Aplicación frontend en **Next.js 14** (App Router + TypeScript + Tailwind) para convertir archivos a Markdown usando un backend FastAPI con la librería [`microsoft/markitdown`](https://github.com/microsoft/markitdown).

Formatos soportados: `.pdf`, `.docx`, `.pptx`, `.xlsx`, `.html`, `.htm`, `.txt`, `.csv` (hasta 50 MB).

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local
# editá .env.local y poné la URL de tu backend
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Variables de entorno

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base del backend FastAPI (sin barra final). | `https://tu-usuario-app.hf.space` |

El backend debe exponer `POST /convert` que acepta `multipart/form-data` con un campo `file` y devuelve un archivo `.md` con `Content-Type: text/markdown`.

## Deploy en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftu-usuario%2Ftu-repo&env=NEXT_PUBLIC_API_URL&envDescription=URL%20base%20del%20backend%20FastAPI%20que%20expone%20%2Fconvert)

> Reemplazá `tu-usuario/tu-repo` en la URL del botón por el path de tu repositorio en GitHub.

### Pasos manuales

1. **Fork o cloná** este repositorio a tu cuenta de GitHub.
2. Entrá a [vercel.com/new](https://vercel.com/new) e **importá el repo**. Vercel autodetecta Next.js, no hace falta `vercel.json`.
3. En **Environment Variables** agregá:
   - `NEXT_PUBLIC_API_URL` = URL pública de tu backend (por ejemplo `https://tu-usuario-app.hf.space`).
4. Hacé clic en **Deploy**.
5. Vercel te asigna un dominio gratuito en `*.vercel.app` (podés agregar dominio propio después).

Cada push a la rama default redeploya automáticamente.

## Stack

- Next.js 14 (App Router, Server Components por default)
- TypeScript estricto
- Tailwind CSS 3 (dark mode automático con `prefers-color-scheme`)
- [`lucide-react`](https://lucide.dev) para íconos
- Sin librería de UI: componentes propios

## Estructura

```
app/
  layout.tsx        # Root layout + metadata
  page.tsx          # Página principal (Server Component)
  globals.css       # Tailwind + reset
components/
  Converter.tsx        # Orquestador (Client)
  FileDropzone.tsx     # Drag & drop + click fallback (Client)
  ConversionStatus.tsx # Estados uploading / success / error (Client)
lib/
  api.ts            # Cliente fetch tipado
  validation.ts     # Validación de archivos en cliente
```
