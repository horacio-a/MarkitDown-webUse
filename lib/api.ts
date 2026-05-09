import { toMarkdownFilename } from "./validation";

export interface ConversionResult {
  blob: Blob;
  filename: string;
}

export class ConversionError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ConversionError";
  }
}

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new ConversionError(
      "Falta configurar NEXT_PUBLIC_API_URL. Definila en las variables de entorno."
    );
  }
  return url.replace(/\/+$/, "");
}

export async function convertFile(
  file: File,
  signal?: AbortSignal
): Promise<ConversionResult> {
  const apiUrl = getApiUrl();
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${apiUrl}/convert`, {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    throw new ConversionError(
      "No se pudo conectar con el servidor. Revisá tu conexión o el estado del backend."
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      const text = await response.text();
      detail = text.slice(0, 200);
    } catch {
      // ignore
    }

    if (response.status === 400) {
      throw new ConversionError(
        detail || "Archivo no válido para conversión.",
        400
      );
    }
    if (response.status === 413) {
      throw new ConversionError(
        "El archivo es demasiado grande para el servidor.",
        413
      );
    }
    if (response.status === 415) {
      throw new ConversionError(
        detail || "Tipo de archivo no soportado por el servidor.",
        415
      );
    }
    if (response.status >= 500) {
      throw new ConversionError(
        "Error del servidor al convertir el archivo. Probá de nuevo en unos minutos.",
        response.status
      );
    }
    throw new ConversionError(
      detail || `Falló la conversión (HTTP ${response.status}).`,
      response.status
    );
  }

  const blob = await response.blob();
  return {
    blob,
    filename: toMarkdownFilename(file.name),
  };
}
