import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface AssignStaffModalProps {
  open: boolean;
  title: string;
  description?: string;
  /** Pre-selected member name. */
  current?: string | null;
  onClose: () => void;
  onAssign: (name: string) => void;
}

/** Pick an active team member; used for alerts (single and bulk) and tasks. */
export default function AssignStaffModal({ open, title, description, current, onClose, onAssign }: AssignStaffModalProps) {
  const { t, tt } = useLanguage();
  const { staff, getFarmById } = useDataStore();
  const members = staff.filter((member) => member.status === "active");
  const [selected, setSelected] = useState<string | null>(current ?? null);

  useEffect(() => {
    if (open) setSelected(current ?? null);
  }, [open, current]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              onAssign(selected);
              onClose();
            }}
            className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover disabled:opacity-50"
          >
            {t("alerts.action.assign")}
          </button>
        </>
      }
    >
      {description && <p className="mb-4 text-sm text-terrava-muted">{description}</p>}
      <ul className="max-h-80 space-y-1.5 overflow-y-auto" role="radiogroup" aria-label={title}>
        {members.map((member) => {
          const active = selected === member.name;
          return (
            <li key={member.id}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(member.name)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  active ? "border-terrava-primary bg-terrava-light" : "border-terrava-border hover:bg-terrava-bg"
                )}
              >
                <img src={member.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-terrava-text">{member.name}</span>
                  <span className="block truncate text-xs text-terrava-muted">
                    {tt("role", member.role)} · {getFarmById(member.farmId)?.name}
                  </span>
                </span>
                {active && <Check className="h-4 w-4 shrink-0 text-terrava-primary" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
