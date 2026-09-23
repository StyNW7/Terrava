import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClassName?: string;
}

export default function Drawer({ open, onClose, title, children, widthClassName = "max-w-md" }: DrawerProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} role="dialog" aria-modal="true">
      <div
        className={`absolute inset-0 bg-terrava-dark/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-y-0 right-0 flex w-full ${widthClassName} flex-col bg-white shadow-soft transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-terrava-border px-5 py-4">
          <h2 className="text-base font-semibold text-terrava-text">{title}</h2>
          <button type="button" onClick={onClose} aria-label={t("common.close")} className="rounded-lg p-1.5 text-terrava-muted hover:bg-terrava-bg">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
