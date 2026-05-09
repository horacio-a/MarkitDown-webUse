import { Converter } from "@/components/Converter";

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-12 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          MarkItDown
        </h1>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
          Convertí PDF, DOCX, PPTX, XLSX, HTML, TXT o CSV a Markdown.
        </p>
      </header>

      <Converter />

      <footer className="mt-auto pt-12 text-center text-xs text-neutral-500 dark:text-neutral-500">
        Powered by{" "}
        <a
          href="https://github.com/microsoft/markitdown"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          microsoft/markitdown
        </a>
        <div>Implemented by Horacio Albornoz</div>
      </footer>
    </main>
  );
}
