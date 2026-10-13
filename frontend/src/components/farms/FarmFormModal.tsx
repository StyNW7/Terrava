import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";
import { images } from "@/data/images";
import type { Barn, Farm } from "@/types/dashboard";
import { resizeImageToDataUrl } from "@/utils/image";
import { cn } from "@/lib/utils";

const regions = ["Jawa Barat", "Jawa Tengah", "Jawa Timur", "DI Yogyakarta", "Bali", "Nusa Tenggara Barat", "Sumatera Utara", "Sulawesi Selatan"];

const fieldClass =
  "h-10 w-full rounded-xl border border-terrava-border bg-white px-3 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none";

interface FarmFormModalProps {
  open: boolean;
  /** Present when editing; absent when creating a new farm. */
  farm?: Farm;
  onClose: () => void;
  onSaved?: (farm: Farm) => void;
}

export default function FarmFormModal({ open, farm, onClose, onSaved }: FarmFormModalProps) {
  const { t } = useLanguage();
  const { farms, staff, addFarm, updateFarm } = useDataStore();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState(regions[0]);
  const [manager, setManager] = useState("");
  const [status, setStatus] = useState<Farm["status"]>("active");
  const [barnCount, setBarnCount] = useState(2);
  const [barnCapacity, setBarnCapacity] = useState(10);
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const managers = staff.filter((member) => member.status === "active");

  useEffect(() => {
    if (!open) return;
    setName(farm?.name ?? "");
    setLocation(farm?.location ?? "");
    setRegion(farm?.region ?? regions[0]);
    setManager(farm?.manager ?? managers[0]?.name ?? "");
    setStatus(farm?.status ?? "active");
    setBarnCount(2);
    setBarnCapacity(10);
    setPhoto(farm?.image ?? null);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, farm]);

  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setPhoto(await resizeImageToDataUrl(file, 960, 0.8));
    } catch {
      toast.error(t("addLivestock.photoInvalid"));
    }
  };

  const save = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 3) next.name = t("farms.form.nameRequired");
    else if (farms.some((item) => item.id !== farm?.id && item.name.toLowerCase() === name.trim().toLowerCase())) next.name = t("farms.form.nameTaken");
    if (location.trim().length < 3) next.location = t("farms.form.locationRequired");
    if (!farm && (barnCount < 1 || barnCount > 20)) next.barns = t("farms.form.barnRange");
    if (!farm && (barnCapacity < 1 || barnCapacity > 200)) next.capacity = t("farms.form.capacityRange");
    setErrors(next);
    if (Object.keys(next).length) return;

    if (farm) {
      updateFarm(farm.id, { name: name.trim(), location: location.trim(), region, manager, status, image: photo ?? farm.image });
      toast.success(t("farms.toast.updated", { name: name.trim() }));
      onSaved?.({ ...farm, name: name.trim() });
      onClose();
      return;
    }

    const id = `farm-${Date.now().toString(36)}`;
    const prefix = name.trim().split(" ")[0];
    const newBarns: Barn[] = Array.from({ length: barnCount }, (_, index) => ({
      id: `${id}-barn-${index + 1}`,
      name: `Barn ${String.fromCharCode(65 + index)} - ${prefix}`,
      farmId: id,
      capacity: barnCapacity,
      occupancy: 0,
      healthScore: 0,
      temperature: 27,
      humidity: 65,
      alertCount: 0,
      manager,
    }));
    const created: Farm = {
      id,
      name: name.trim(),
      location: location.trim(),
      region,
      manager,
      image: photo ?? images.modernBarn,
      status,
      livestockCount: 0,
      barnCount,
      healthScore: 0,
      deviceCoverage: 0,
      activeAlerts: 0,
      staffCount: 1,
      capacity: barnCount * barnCapacity,
    };
    addFarm(created, newBarns);
    toast.success(t("farms.toast.created", { name: created.name }));
    onSaved?.(created);
    onClose();
  };

  const error = (key: string) => errors[key] && <span className="mt-1 block text-xs text-terrava-error">{errors[key]}</span>;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={farm ? t("farms.form.editTitle") : t("farms.addFarm")}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("common.cancel")}
          </button>
          <button type="button" onClick={save} className="rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover">
            {farm ? t("addLivestock.saveChanges") : t("farms.addFarm")}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("farms.form.name")}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Sukamaju Cattle Farm" className={cn(fieldClass, errors.name && "border-terrava-error")} />
          {error("name")}
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("rpt.col.location")}</span>
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Garut, Jawa Barat" className={cn(fieldClass, errors.location && "border-terrava-error")} />
            {error("location")}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("filter.region")}</span>
            <select value={region} onChange={(event) => setRegion(event.target.value)} className={fieldClass}>
              {regions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("farms.manager")}</span>
            <select value={manager} onChange={(event) => setManager(event.target.value)} className={fieldClass}>
              {managers.map((member) => (
                <option key={member.id}>{member.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("livestock.column.status")}</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as Farm["status"])} className={fieldClass}>
              <option value="active">{t("status.active")}</option>
              <option value="inactive">{t("status.inactive")}</option>
            </select>
          </label>
          {!farm && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("farms.form.barnCount")}</span>
                <input type="number" min={1} max={20} value={barnCount} onChange={(event) => setBarnCount(Number(event.target.value))} className={cn(fieldClass, errors.barns && "border-terrava-error")} />
                {error("barns")}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("farms.form.capacityPerBarn")}</span>
                <input type="number" min={1} max={200} value={barnCapacity} onChange={(event) => setBarnCapacity(Number(event.target.value))} className={cn(fieldClass, errors.capacity && "border-terrava-error")} />
                {error("capacity")}
              </label>
            </>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("farms.form.photo")}</span>
          <div className="flex items-center gap-3">
            <div className="grid h-16 w-24 place-items-center overflow-hidden rounded-xl border border-dashed border-terrava-border bg-terrava-bg">
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-terrava-muted" aria-hidden="true" />}
            </div>
            <label className="cursor-pointer rounded-xl border border-terrava-border px-3.5 py-2 text-sm font-medium text-terrava-text hover:bg-terrava-bg">
              {photo ? t("addLivestock.changePhoto") : t("addLivestock.uploadPhoto")}
              <input type="file" accept="image/*" className="sr-only" onChange={handlePhoto} />
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
