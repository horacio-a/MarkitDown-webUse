"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { ConversionList, type ConversionItem } from "./ConversionStatus";
import { ConversionError, convertFiles } from "@/lib/api";

export function Converter() {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const urlsRef = useRef<string[]>([]);

  const revokeAllUrls = useCallback(() => {
    for (const url of urlsRef.current) {
      URL.revokeObjectURL(url);
    }
    urlsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      revokeAllUrls();
    };
  }, [revokeAllUrls]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    revokeAllUrls();
    setItems([]);
    setBatchError(null);
    setIsUploading(false);
  }, [revokeAllUrls]);

  const handleFilesSelected = useCallback(async (selected: File[]) => {
    if (selected.length === 0) return;

    revokeAllUrls();
    setBatchError(null);

    const initial: ConversionItem[] = selected.map((f, idx) => ({
      id: `${Date.now()}-${idx}-${f.name}`,
      fileName: f.name,
      fileSize: f.size,
      status: "uploading",
    }));
    setItems(initial);
    setIsUploading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const results = await convertFiles(selected, controller.signal);
      const newUrls: string[] = [];
      const next: ConversionItem[] = initial.map((item, idx) => {
        const r = results[idx];
        if (!r) {
          return { ...item, status: "error", errorMessage: "Sin resultado." };
        }
        if (r.status === "ok" && r.result) {
          const url = URL.createObjectURL(r.result.blob);
          newUrls.push(url);
          return {
            ...item,
            status: "success",
            downloadUrl: url,
            downloadName: r.result.filename,
          };
        }
        return {
          ...item,
          status: "error",
          errorMessage: r.error ?? "Error desconocido.",
        };
      });
      urlsRef.current = newUrls;
      setItems(next);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setItems([]);
        return;
      }
      const message =
        err instanceof ConversionError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Ocurrió un error inesperado.";
      setBatchError(message);
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          status: "error",
          errorMessage: message,
        }))
      );
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setIsUploading(false);
    }
  }, [revokeAllUrls]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  if (items.length === 0) {
    return <FileDropzone onFilesSelected={handleFilesSelected} />;
  }

  return (
    <ConversionList
      items={items}
      isUploading={isUploading}
      batchError={batchError ?? undefined}
      onCancel={isUploading ? handleCancel : undefined}
      onReset={reset}
    />
  );
}
