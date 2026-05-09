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

export type ItemStatus = "uploading" | "success" | "error";

export interface ConversionItem {
  id: string;
  fileName: string;
  fileSize?: number;
  status: ItemStatus;
  downloadUrl?: string;
  downloadName?: string;
  errorMessage?: string;
}

interface ConversionListProps {
  items: ConversionItem[];
  isUploading: boolean;
  batchError?: string;
  onCancel?: () => void;
  onReset: () => void;
}

function StatusIcon({ status }: { status: ItemStatus }) {
  if (status === "uploading") {
    return (
      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
    );
  }
  if (status === "success") {
    return (
      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
    );
  }
  return (
    <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
  );
}

function ItemRow({ item }: { item: ConversionItem }) {
  const borderClass =
    item.status === "success"
      ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20"
      : item.status === "error"
        ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
        : "border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900";

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${borderClass}`}
    >
      <StatusIcon status={item.status} />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium"
          title={item.fileName}
        >
          {item.fileName}
        </p>
        <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
          {item.status === "uploading" && "Convirtiendo…"}
          {item.status === "success" && (item.downloadName ?? "Listo")}
          {item.status === "error" &&
            (item.errorMessage ?? "Error desconocido.")}
          {typeof item.fileSize === "number" &&
            item.status === "uploading" &&
            ` · ${formatBytes(item.fileSize)}`}
        </p>
      </div>
      {item.status === "success" && item.downloadUrl && item.downloadName && (
        <a
          href={item.downloadUrl}
          download={item.downloadName}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950"
        >
          <Download className="h-3.5 w-3.5" />
          Descargar
        </a>
      )}
    </li>
  );
}

export function ConversionList({
  items,
  isUploading,
  batchError,
  onCancel,
  onReset,
}: ConversionListProps) {
  const successCount = items.filter((i) => i.status === "success").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {isUploading
            ? `Convirtiendo ${items.length} archivo${items.length === 1 ? "" : "s"}…`
            : `${successCount} listo${successCount === 1 ? "" : "s"}${
                errorCount > 0 ? ` · ${errorCount} con error` : ""
              }`}
        </p>
        <div className="flex items-center gap-2">
          {isUploading && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              <RefreshCw className="h-4 w-4" />
              Convertir otros
            </button>
          )}
        </div>
      </div>

      {batchError && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          {batchError}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
