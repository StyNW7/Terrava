import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import SearchInput from "@/components/dashboard/SearchInput";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";
import type { Device } from "@/types/dashboard";
import { cn } from "@/lib/utils";

/** Pair an ear tag with an animal that does not wear one yet. */
export default function AssignToLivestockModal({ device, onClose }: { device: Device | null; onClose: () => void }) {
  const { t } = useLanguage();
  const { activeLivestock, assignDevice, getBarnById } = useDataStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSearch("");
    setSelected(null);
  }, [device?.id]);

  const candidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activeLivestock
      .filter((animal) => !animal.deviceId && (device ? animal.farmId === device.farmId : true))
      .filter((animal) => !query || animal.name.toLowerCase().includes(query) || animal.code.toLowerCase().includes(query));
  }, [activeLivestock, device, search]);

  if (!device) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title={t("devices.assignTitle", { name: device.name })}
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
              assignDevice(selected, device.id);
              toast.success(t("devices.toast.assigned"));
              onClose();
            }}
            className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover disabled:opacity-50"
          >
            {t("devices.action.assign")}
          </button>
        </>
      }
    >
      <SearchInput value={search} onChange={setSearch} placeholder={t("map.searchPlaceholder")} className="mb-3" />
      {candidates.length === 0 ? (
        <p className="rounded-xl bg-terrava-bg px-4 py-6 text-center text-sm text-terrava-muted">{t("devices.noCandidates")}</p>
      ) : (
        <ul className="max-h-72 space-y-1.5 overflow-y-auto" role="radiogroup" aria-label={t("nav.item.livestock")}>
          {candidates.map((animal) => (
            <li key={animal.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected === animal.id}
                onClick={() => setSelected(animal.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
                  selected === animal.id ? "border-terrava-primary bg-terrava-light" : "border-terrava-border hover:bg-terrava-bg"
                )}
              >
                <img src={animal.photo} alt="" className="h-8 w-8 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-terrava-text">{animal.name}</span>
                  <span className="block text-xs text-terrava-muted">
                    {animal.code} · {getBarnById(animal.barnId)?.name}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
