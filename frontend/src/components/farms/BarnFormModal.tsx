import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";
import type { Farm } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 w-full rounded-xl border border-terrava-border bg-white px-3 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none";

export default function BarnFormModal({ farm, open, onClose }: { farm: Farm; open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const { staff, barns, addBarn } = useDataStore();
  const managers = staff.filter((member) => member.status === "active");
  const farmBarns = barns.filter((barn) => barn.farmId === farm.id);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [manager, setManager] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(`Barn ${String.fromCharCode(65 + farmBarns.length)} - ${farm.name.split(" ")[0]}`);
    setCapacity(10);
    setManager(farm.manager);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = () => {
    if (name.trim().length < 2) return setError(t("farms.form.barnNameRequired"));
    if (farmBarns.some((barn) => barn.name.toLowerCase() === name.trim().toLowerCase())) return setError(t("farms.form.barnNameTaken"));
    if (capacity < 1 || capacity > 200) return setError(t("farms.form.capacityRange"));
    addBarn({
      id: `${farm.id}-barn-${Date.now().toString(36)}`,
      name: name.trim(),
      farmId: farm.id,
      capacity,
      occupancy: 0,
      healthScore: 0,
      temperature: 27,
      humidity: 65,
      alertCount: 0,
      manager,
    });
    toast.success(t("farms.toast.barnCreated", { name: name.trim() }));
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("farms.addBarn")}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("common.cancel")}
          </button>
          <button type="button" onClick={save} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
            {t("farms.addBarn")}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("farms.form.barnName")}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className={cn(fieldClass, error && "border-terrava-error")} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("farms.capacity")}</span>
            <input type="number" min={1} max={200} value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} className={fieldClass} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("farms.manager")}</span>
            <select value={manager} onChange={(event) => setManager(event.target.value)} className={fieldClass}>
              {managers.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="text-xs text-terrava-error">{error}</p>}
      </div>
    </Modal>
  );
}
