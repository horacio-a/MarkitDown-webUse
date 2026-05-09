import { toMarkdownFilename } from "./validation";

export interface ConversionResult {
  blob: Blob;
  filename: string;
}

export interface PerFileResult {
  sourceName: string;
  status: "ok" | "error";
  result?: ConversionResult;
  error?: string;
}

interface BackendResultItem {
  filename: string;
  output_filename: string | null;
  status: "ok" | "error";
  markdown: string | null;
  error: string | null;
}

interface BackendResponse {
  results: BackendResultItem[];
}

export class ConversionError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ConversionError";
  }
}

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new ConversionError(
      "Falta configurar NEXT_PUBLIC_API_URL. Definila en las variables de entorno.",
    );
  }
  return url.replace(/\/+$/, "");
}

export async function convertFiles(
  files: File[],
  signal?: AbortSignal,
): Promise<PerFileResult[]> {
  if (files.length === 0) return [];

  const apiUrl = getApiUrl();
  const formData = new FormData();
  for (const f of files) {
    formData.append("files", f);
  }

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
      "No se pudo conectar con el servidor. Revisá tu conexión o el estado del backend.",
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
        detail || "Solicitud inválida.",
        400,
      );
    }
    if (response.status === 413) {
      throw new ConversionError(
        "Los archivos son demasiado grandes para el servidor.",
        413,
      );
    }
    if (response.status === 415) {
      throw new ConversionError(
        detail || "Tipo de archivo no soportado por el servidor.",
        415,
      );
    }
    if (response.status >= 500) {
      throw new ConversionError(
        "Error del servidor al convertir los archivos. Probá de nuevo en unos minutos.",
        response.status,
      );
    }
    throw new ConversionError(
      detail || `Falló la conversión (HTTP ${response.status}).`,
      response.status,
    );
  }

  let data: BackendResponse;
  try {
    data = (await response.json()) as BackendResponse;
  } catch {
    throw new ConversionError("Respuesta inválida del servidor.");
  }

  const byName = new Map<string, BackendResultItem>();
  for (const item of data.results ?? []) {
    byName.set(item.filename, item);
  }

  return files.map((f) => {
    const item = byName.get(f.name);
    if (!item) {
      return {
        sourceName: f.name,
        status: "error" as const,
        error: "El servidor no devolvió un resultado para este archivo.",
      };
    }
    if (item.status === "ok" && item.markdown != null) {
      const blob = new Blob([item.markdown], {
        type: "text/markdown;charset=utf-8",
      });
      return {
        sourceName: f.name,
        status: "ok" as const,
        result: {
          blob,
          filename: item.output_filename ?? toMarkdownFilename(f.name),
        },
      };
    }
    return {
      sourceName: f.name,
      status: "error" as const,
      error: item.error ?? "Error desconocido al convertir.",
    };
  });
}
