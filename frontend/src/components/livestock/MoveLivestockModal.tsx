import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";

const fieldClass =
  "h-10 w-full rounded-xl border border-terrava-border bg-white px-3 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none";

/** Move one or more animals to another farm, barn and/or herd group. */
export default function MoveLivestockModal({ ids, onClose, onDone }: { ids: string[] | null; onClose: () => void; onDone?: () => void }) {
  const { t } = useLanguage();
  const { farms, getBarnsByFarm, getLivestockById, updateLivestock, barns } = useDataStore();
  const first = ids?.length ? getLivestockById(ids[0]) : undefined;
  const [farmId, setFarmId] = useState("");
  const [barnId, setBarnId] = useState("");
  const [herdGroup, setHerdGroup] = useState("");

  useEffect(() => {
    if (!ids) return;
    setFarmId(first?.farmId ?? farms[0]?.id ?? "");
    setBarnId(first?.barnId ?? "");
    setHerdGroup(first?.herdGroup ?? "Herd 1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  if (!ids) return null;
  const options = getBarnsByFarm(farmId);
  const barn = barns.find((item) => item.id === barnId);
  const free = barn ? barn.capacity - barn.occupancy : 0;

  const save = () => {
    if (!barnId) return;
    updateLivestock(ids, { farmId, barnId, herdGroup });
    toast.success(ids.length > 1 ? t("livestock.toast.movedMany", { count: ids.length, barn: barn?.name ?? "" }) : t("livestock.toast.movedOne", { name: first?.name ?? "", barn: barn?.name ?? "" }));
    onDone?.();
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={ids.length > 1 ? t("livestock.moveTitleMany", { count: ids.length }) : t("livestock.moveTitle", { name: first?.name ?? "" })}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("common.cancel")}
          </button>
          <button type="button" onClick={save} disabled={!barnId} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover disabled:opacity-50">
            {t("livestock.action.moveBarn")}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("filter.farm")}</span>
          <select
            value={farmId}
            onChange={(event) => {
              setFarmId(event.target.value);
              setBarnId("");
            }}
            className={fieldClass}
          >
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("farms.barn")}</span>
          <select value={barnId} onChange={(event) => setBarnId(event.target.value)} className={fieldClass}>
            <option value="">{t("addLivestock.placeholder.selectBarn")}</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} ({option.occupancy}/{option.capacity})
              </option>
            ))}
          </select>
          {barn && free < ids.length && <span className="mt-1 block text-xs text-terrava-warning">{t("livestock.barnNearlyFull", { free: Math.max(0, free) })}</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("livestock.herdGroup")}</span>
          <select value={herdGroup} onChange={(event) => setHerdGroup(event.target.value)} className={fieldClass}>
            <option>Herd 1</option>
            <option>Herd 2</option>
            <option>Herd 3</option>
          </select>
        </label>
      </div>
    </Modal>
  );
}
