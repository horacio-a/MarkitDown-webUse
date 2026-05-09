"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { ConversionStatus, type Status } from "./ConversionStatus";
import { ConversionError, convertFile } from "@/lib/api";

export function Converter() {
  const [status, setStatus] = useState<Status>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const downloadUrlRef = useRef<string | null>(null);

  useEffect(() => {
    downloadUrlRef.current = downloadUrl;
  }, [downloadUrl]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
    }
    setDownloadUrl(null);
    setDownloadName(null);
    setErrorMessage(null);
    setFile(null);
    setStatus("idle");
  }, []);

  const handleFileSelected = useCallback(async (selected: File) => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      setDownloadUrl(null);
    }
    setErrorMessage(null);
    setFile(selected);
    setStatus("uploading");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { blob, filename } = await convertFile(selected, controller.signal);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDownloadName(filename);
      setStatus("success");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        setFile(null);
        return;
      }
      const message =
        err instanceof ConversionError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Ocurrió un error inesperado.";
      setErrorMessage(message);
      setStatus("error");
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  if (status === "idle") {
    return <FileDropzone onFileSelected={handleFileSelected} />;
  }

  return (
    <ConversionStatus
      status={status}
      fileName={file?.name ?? ""}
      fileSize={file?.size}
      errorMessage={errorMessage ?? undefined}
      downloadUrl={downloadUrl ?? undefined}
      downloadName={downloadName ?? undefined}
      onCancel={status === "uploading" ? handleCancel : undefined}
      onReset={reset}
    />
  );
}
