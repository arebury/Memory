import { useEffect, useState } from "react";
import { Download, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Modal } from "./ui/modal";
import { cn } from "./ui/utils";
import { FOCUS_RING } from "./ui/focus";

import doc01 from "../../../docs/01-logica-de-conteo.md?raw";
import doc02 from "../../../docs/02-referencia-ui.md?raw";

/**
 * DocumentationModal · viewer for the markdown docs in /docs/
 *
 * Renders the .md content with react-markdown + GFM (tables, task lists)
 * styled to match the SC design system. Includes a "Descargar PDF"
 * button that uses window.print() with a print-friendly stylesheet
 * (defined in globals.css under @media print) so the printed output
 * shows only the doc content, no modal chrome.
 *
 * Adding a new doc:
 *   1. Drop the markdown in /docs/.
 *   2. Add a `?raw` import above and a new entry to DOC_REGISTRY.
 *   3. Add a corresponding link in the popover that triggers the modal.
 */

type DocSlug = "01-logica-de-conteo" | "02-referencia-ui";

interface DocEntry {
  title: string;
  subtitle: string;
  content: string;
}

const DOC_REGISTRY: Record<DocSlug, DocEntry> = {
  "01-logica-de-conteo": {
    title: "Lógica de conteo y reglas de negocio",
    subtitle: "Qué inputs necesita cada componente, qué deriva, qué dispatcha",
    content: doc01,
  },
  "02-referencia-ui": {
    title: "Referencia de UI · estructura, interacción y tokens",
    subtitle: "Anatomía, copy, animaciones, a11y y QA por componente",
    content: doc02,
  },
};

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: DocSlug | null;
}

export function DocumentationModal({
  isOpen,
  onClose,
  slug,
}: DocumentationModalProps) {
  const [printing, setPrinting] = useState(false);
  const doc = slug ? DOC_REGISTRY[slug] : null;

  /* When the user clicks "Descargar PDF", we add a body class so the
     print stylesheet kicks in and isolates the doc content. The
     onafterprint listener clears the class. We also handle the case
     where the user cancels the print dialog (afterprint still fires). */
  useEffect(() => {
    if (!printing) return;
    document.body.classList.add("printing-doc");
    const cleanup = () => {
      document.body.classList.remove("printing-doc");
      setPrinting(false);
    };
    window.addEventListener("afterprint", cleanup);
    // Defer print() to next tick so the class lands before the dialog opens.
    const timer = setTimeout(() => window.print(), 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", cleanup);
      document.body.classList.remove("printing-doc");
    };
  }, [printing]);

  if (!doc) return null;

  // Strip the YAML frontmatter from rendering — we surface its
  // content (title/subtitle/author) in the modal header instead.
  const body = doc.content.replace(/^---[\s\S]*?---\n+/, "");

  return (
    <Modal open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Modal.Content width={880}>
        <Modal.Header
          icon={<BookOpen className="size-full" strokeWidth={1.75} />}
          title={doc.title}
          subtitle={doc.subtitle}
        />

        <Modal.Body className="!p-0">
          <article
            className={cn(
              "doc-print-target modal-scrollbar overflow-y-auto px-[var(--sc-space-600)] py-[var(--sc-space-500)]",
              "max-h-[68vh]",
            )}
          >
            {/* Author signature — discreto, una línea bajo el título */}
            <p className="mb-[var(--sc-space-500)] text-sc-xs text-sc-muted">
              Memory · Smart Contact · Por Rafael Areses
            </p>

            <div className="doc-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </div>
          </article>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Cancel>Cerrar</Modal.Cancel>
          <button
            type="button"
            onClick={() => setPrinting(true)}
            className={cn(
              "inline-flex items-center gap-[var(--sc-space-200)] rounded-sc-md bg-sc-primary px-4 py-2 shadow-sc-sm",
              "text-sc-sm font-medium text-sc-on-primary transition-all",
              "hover:bg-sc-primary-hover active:scale-[0.98]",
              FOCUS_RING,
            )}
          >
            <Download size={14} />
            Descargar PDF
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

export type { DocSlug };
export { DOC_REGISTRY };
