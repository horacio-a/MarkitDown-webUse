"use client";

import { useCallback, useId, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { ALLOWED_EXTENSIONS, validateFile } from "@/lib/validation";

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFileSelected, disabled }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      setError(null);
      if (!files || files.length === 0) return;
      const file = files[0];
      const result = validateFile(file);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        tabIndex={disabled ? -1 : 0}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onKeyDown={onKeyDown}
        className={[
          "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950",
          disabled
            ? "cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-60 dark:border-neutral-800 dark:bg-neutral-900"
            : isDragOver
              ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
              : "border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/60",
        ].join(" ")}
      >
        <UploadCloud
          className={`h-10 w-10 ${
            isDragOver
              ? "text-blue-600 dark:text-blue-400"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
          aria-hidden
        />
        <div>
          <p className="text-sm font-medium sm:text-base">
            Arrastrá un archivo acá, o{" "}
            <span className="text-blue-600 underline underline-offset-2 dark:text-blue-400">
              elegí uno
            </span>
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {ALLOWED_EXTENSIONS.join(", ")} · hasta 50 MB
          </p>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {error && (
        <p
          role="alert"
          className="mt-3 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
