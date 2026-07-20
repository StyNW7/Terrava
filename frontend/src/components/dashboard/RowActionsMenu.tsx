import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export interface RowAction {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export default function RowActionsMenu({ actions }: { actions: RowAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label="Buka menu aksi"
        className="rounded-lg p-1.5 text-terrava-muted hover:bg-terrava-bg hover:text-terrava-text"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-terrava-border bg-white p-1.5 shadow-soft">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                action.onClick();
                setOpen(false);
              }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                action.danger ? "text-terrava-error hover:bg-terrava-error/10" : "text-terrava-text hover:bg-terrava-bg"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
