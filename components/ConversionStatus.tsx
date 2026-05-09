"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { formatBytes } from "@/lib/validation";

export type Status = "idle" | "uploading" | "success" | "error";

interface ConversionStatusProps {
  status: Exclude<Status, "idle">;
  fileName: string;
  fileSize?: number;
  errorMessage?: string;
  downloadUrl?: string;
  downloadName?: string;
  onCancel?: () => void;
  onReset: () => void;
}

export function ConversionStatus({
  status,
  fileName,
  fileSize,
  errorMessage,
  downloadUrl,
  downloadName,
  onCancel,
  onReset,
}: ConversionStatusProps) {
  if (status === "uploading") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-10 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <div>
          <p className="text-sm font-medium">Convirtiendo…</p>
          <p
            className="mt-1 max-w-full truncate text-xs text-neutral-500 dark:text-neutral-400"
            title={fileName}
          >
            {fileName}
            {typeof fileSize === "number" && ` · ${formatBytes(fileSize)}`}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
        )}
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-green-200 bg-green-50 px-6 py-10 text-center dark:border-green-900/50 dark:bg-green-950/30">
        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        <div>
          <p className="text-sm font-medium">¡Listo!</p>
          <p
            className="mt-1 max-w-full truncate text-xs text-neutral-600 dark:text-neutral-400"
            title={downloadName ?? fileName}
          >
            {downloadName ?? fileName}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {downloadUrl && downloadName && (
            <a
              href={downloadUrl}
              download={downloadName}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
            >
              <Download className="h-4 w-4" />
              Descargar {downloadName}
            </a>
          )}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            <RefreshCw className="h-4 w-4" />
            Convertir otro
          </button>
        </div>
      </div>
    );
  }

  // error
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
      <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
      <div>
        <p className="text-sm font-medium text-red-800 dark:text-red-300">
          No se pudo convertir el archivo
        </p>
        <p className="mt-1 text-xs text-red-700 dark:text-red-400">
          {errorMessage ?? "Ocurrió un error inesperado."}
        </p>
        <p
          className="mt-2 max-w-full truncate text-xs text-neutral-500 dark:text-neutral-400"
          title={fileName}
        >
          {fileName}
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
      >
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  );
}
