import { TriangleAlert } from "lucide-react";
import Modal from "@/components/dashboard/Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "default";
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "default",
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      widthClassName="max-w-sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${
              tone === "danger" ? "bg-terrava-error hover:bg-terrava-error/90" : "bg-terrava-primary hover:bg-terrava-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${tone === "danger" ? "bg-terrava-error/10 text-terrava-error" : "bg-terrava-light text-terrava-primary"}`}>
          <TriangleAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="text-base font-semibold text-terrava-text">{title}</p>
        <p className="mt-1.5 text-sm text-terrava-muted">{description}</p>
      </div>
    </Modal>
  );
}
