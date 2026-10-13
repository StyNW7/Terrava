import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";
import type { FarmTask } from "@/context/data-store-context";
import { cn } from "@/lib/utils";

export interface TaskDraft {
  title: string;
  farmId: string;
  assignee?: string | null;
  source?: FarmTask["source"];
}

const fieldClass =
  "h-10 w-full rounded-xl border border-terrava-border bg-white px-3 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none";

const inDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

/** Turn an alert or insight into a follow-up task that shows up in the overview task list. */
export default function CreateTaskModal({ draft, onClose }: { draft: TaskDraft | null; onClose: () => void }) {
  const { t } = useLanguage();
  const { staff, farms, addTask } = useDataStore();
  const members = staff.filter((member) => member.status === "active");
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [farmId, setFarmId] = useState("");
  const [dueDate, setDueDate] = useState(inDays(1));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!draft) return;
    setTitle(draft.title);
    setAssignee(draft.assignee ?? members[0]?.name ?? "");
    setFarmId(draft.farmId);
    setDueDate(inDays(1));
    setTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  if (!draft) return null;

  const titleError = touched && title.trim().length < 3;

  const save = () => {
    setTouched(true);
    if (title.trim().length < 3) return;
    addTask({
      id: `TSK-${Date.now()}`,
      title: title.trim(),
      kind: "follow-up",
      farmId,
      assignee,
      dueDate,
      done: false,
      source: draft.source,
      createdAt: new Date().toISOString(),
    });
    toast.success(t("tasks.created", { name: assignee }));
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t("insights.createTask")}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("common.cancel")}
          </button>
          <button type="button" onClick={save} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
            {t("tasks.save")}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("tasks.title")}</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={titleError}
            className={cn(fieldClass, titleError && "border-terrava-error")}
          />
          {titleError && <span className="mt-1 block text-xs text-terrava-error">{t("tasks.titleRequired")}</span>}
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("tasks.assignee")}</span>
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className={fieldClass}>
              {members.map((member) => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("tasks.dueDate")}</span>
            <input type="date" value={dueDate} min={inDays(0)} onChange={(event) => setDueDate(event.target.value || inDays(1))} className={fieldClass} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("filter.farm")}</span>
          <select value={farmId} onChange={(event) => setFarmId(event.target.value)} className={fieldClass}>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  );
}
