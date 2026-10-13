import { useEffect, useState } from "react";
import { Check, Radio } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

/** Pair a free smart ear tag with an animal (or release the current one). */
export default function AssignDeviceModal({ livestockId, onClose }: { livestockId: string | null; onClose: () => void }) {
  const { t } = useLanguage();
  const { devices, getLivestockById, assignDevice } = useDataStore();
  const animal = livestockId ? getLivestockById(livestockId) : undefined;
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(animal?.deviceId ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livestockId]);

  if (!animal) return null;

  const options = devices.filter((device) => device.type === "ear-tag" && (!device.assignedLivestockId || device.assignedLivestockId === animal.id));

  const save = () => {
    assignDevice(animal.id, selected);
    toast.success(selected ? t("livestock.toast.devicePaired", { device: selected, name: animal.name }) : t("livestock.toast.deviceReleased", { name: animal.name }));
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t("livestock.assignDeviceTitle", { name: animal.name })}
      footer={
        <>
          {animal.deviceId && (
            <button type="button" onClick={() => setSelected(null)} className="mr-auto rounded-xl px-3 py-2.5 text-sm font-semibold text-terrava-error hover:bg-terrava-error/10">
              {t("livestock.releaseDevice")}
            </button>
          )}
          <button type="button" onClick={onClose} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={selected === animal.deviceId}
            className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover disabled:opacity-50"
          >
            {t("common.save")}
          </button>
        </>
      }
    >
      {options.length === 0 ? (
        <p className="rounded-xl bg-terrava-bg px-4 py-6 text-center text-sm text-terrava-muted">{t("addLivestock.noFreeDevices")}</p>
      ) : (
        <ul className="max-h-80 space-y-1.5 overflow-y-auto" role="radiogroup" aria-label={t("devices.deviceId")}>
          {options.map((device) => {
            const active = selected === device.id;
            return (
              <li key={device.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected(device.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    active ? "border-terrava-primary bg-terrava-light" : "border-terrava-border hover:bg-terrava-bg"
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-terrava-light text-terrava-primary">
                    <Radio className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-terrava-text">
                      {device.id} · {device.name}
                    </span>
                    <span className="block text-xs text-terrava-muted">
                      {t("status." + device.status)} · {t("devices.battery")} {device.battery}% · {t("rpt.col.signal")} {device.signal}%
                      {device.assignedLivestockId === animal.id && ` · ${t("livestock.currentDevice")}`}
                    </span>
                  </span>
                  {active && <Check className="h-4 w-4 text-terrava-primary" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {selected === null && animal.deviceId && <p className="mt-3 text-xs text-terrava-error">{t("livestock.releaseHint", { device: animal.deviceId })}</p>}
    </Modal>
  );
}
