export const MAX_BYTES = 50 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".pptx",
  ".xlsx",
  ".html",
  ".htm",
  ".txt",
  ".csv",
] as const;

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx).toLowerCase();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function validateFile(file: File): ValidationResult {
  const ext = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return {
      ok: false,
      error: `Extensión no permitida. Usá: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: `El archivo supera el máximo de ${formatBytes(MAX_BYTES)} (pesa ${formatBytes(file.size)}).`,
    };
  }
  if (file.size === 0) {
    return { ok: false, error: "El archivo está vacío." };
  }
  return { ok: true };
}

export function toMarkdownFilename(originalName: string): string {
  const idx = originalName.lastIndexOf(".");
  const base = idx === -1 ? originalName : originalName.slice(0, idx);
  return `${base}.md`;
}
