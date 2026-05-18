import { toast } from "sonner@2.0.3";

export async function copyToClipboard(text: string, successMessage: string = "Copiado al portapapeles") {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } else {
      throw new Error("Clipboard API not available");
    }
  } catch (err) {
    console.error("Clipboard API failed, trying fallback...", err);
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Ensure it's not visible but part of the DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast.success(successMessage);
      } else {
        throw new Error("Fallback copy failed");
      }
    } catch (fallbackErr) {
      console.error("Copy failed completely", fallbackErr);
      toast.error("No se pudo copiar el texto. Por favor, cópialo manualmente.");
    }
  }
}
