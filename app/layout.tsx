import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarkItDown — Convertí archivos a Markdown",
  description:
    "Convertí PDF, DOCX, PPTX, XLSX, HTML, TXT y CSV a Markdown con la librería markitdown de Microsoft.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
