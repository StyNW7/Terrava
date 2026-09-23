import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
}

export default function Modal({ open, onClose, title, children, footer, widthClassName = "max-w-lg" }: ModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-terrava-dark/50" onClick={onClose} aria-hidden="true" />
      <div className={`relative w-full ${widthClassName} max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-soft animate-fade-in-up`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-terrava-text">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label={t("common.close")} className="rounded-lg p-1.5 text-terrava-muted hover:bg-terrava-bg">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2.5">{footer}</div>}
      </div>
    </div>
  );
}
