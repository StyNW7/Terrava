import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus, CheckCircle2, LoaderCircle, Trash2, FileClock } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import ErrorState from "@/components/dashboard/ErrorState";
import { livestockSchema, type LivestockFormValues } from "@/schemas/livestockSchema";
import { images } from "@/data/images";
import type { HealthStatus, Livestock } from "@/types/dashboard";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";
import { resizeImageToDataUrl } from "@/utils/image";

const DRAFT_KEY = "terrava-livestock-draft";

const fieldClass =
  "w-full rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

const scoreForStatus: Record<string, number> = { healthy: 90, attention: 70, critical: 45 };

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-terrava-text">
        {label} {required && <span className="text-terrava-error">*</span>}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-terrava-error">{error}</p> : hint ? <p className="mt-1.5 text-xs text-terrava-muted">{hint}</p> : null}
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-6 shadow-card">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terrava-primary text-xs font-bold text-white">{number}</span>
        <h2 className="text-base font-semibold text-terrava-text">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

const monthsSince = (date: string) => {
  const birth = new Date(date);
  if (Number.isNaN(birth.getTime())) return 0;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth());
};

const today = () => new Date().toISOString().slice(0, 10);

export default function AddLivestockPage() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { t, tt } = useLanguage();
  const store = useDataStore();
  const editing = editId ? store.getLivestockById(editId) : undefined;
  const isEdit = Boolean(editId);
  const [photo, setPhoto] = useState<string | null>(editing?.photo ?? null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const restoredRef = useRef(false);

  useEffect(() => {
    document.title = isEdit ? "Edit Livestock | Terrava" : "Add Livestock | Terrava";
  }, [isEdit]);

  // Suggest the next free identifiers so the form is quick to complete.
  const suggestions = useMemo(() => {
    const next = Math.max(0, ...store.livestock.map((a) => Number(a.id.replace(/\D/g, "")) || 0)) + 1;
    return { id: `LVS-${String(next).padStart(3, "0")}`, earTag: `EAR-${1000 + next - 1}` };
  }, [store.livestock]);

  const defaults: Partial<LivestockFormValues> = editing
    ? {
        name: editing.name,
        animalType: editing.type,
        breed: editing.breed,
        gender: editing.gender,
        dateOfBirth: editing.dateOfBirth,
        estimatedAge: "",
        internalId: editing.id,
        earTagId: editing.earTagId,
        weightKg: editing.weightKg,
        bodyConditionScore: editing.bodyConditionScore,
        farmId: editing.farmId,
        barnId: editing.barnId,
        herdGroup: editing.herdGroup,
        arrivalDate: editing.arrivalDate,
        acquisitionSource: editing.acquisitionSource,
        initialHealthStatus: editing.healthStatus === "inactive" ? "attention" : editing.healthStatus,
        vaccinationStatus: editing.vaccinationStatus,
        notes: editing.notes.id,
        assignDevice: Boolean(editing.deviceId),
        deviceId: editing.deviceId ?? "",
      }
    : {
        gender: "Female",
        bodyConditionScore: 3,
        assignDevice: false,
        internalId: suggestions.id,
        earTagId: suggestions.earTag,
        arrivalDate: today(),
      };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<LivestockFormValues>({
    resolver: zodResolver(livestockSchema),
    defaultValues: defaults,
  });

  // Offer to restore an unfinished draft (new animals only).
  useEffect(() => {
    if (isEdit || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as { values: LivestockFormValues; photo: string | null };
      reset({ ...defaults, ...draft.values });
      setPhoto(draft.photo);
      setDraftRestored(true);
    } catch {
      // Ignore a corrupt draft.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const selectedFarmId = watch("farmId");
  const assignDevice = watch("assignDevice");
  const values = watch();
  const barnsForFarm = selectedFarmId ? store.getBarnsByFarm(selectedFarmId) : [];

  // Ear tags that are free (or already on this animal).
  const availableDevices = store.devices.filter(
    (device) => device.type === "ear-tag" && (!device.assignedLivestockId || device.assignedLivestockId === editing?.id)
  );

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error(t("addLivestock.photoTooLarge"));
      return;
    }
    try {
      setPhoto(await resizeImageToDataUrl(file));
    } catch {
      toast.error(t("addLivestock.photoInvalid"));
    }
  };

  const onSubmit = async (form: LivestockFormValues) => {
    const id = form.internalId.trim().toUpperCase();
    const earTag = form.earTagId.trim().toUpperCase();
    if (!/^[A-Z0-9-]+$/.test(id)) {
      setError("internalId", { message: "validation.livestock.idFormat" });
      return;
    }
    const others = store.livestock.filter((animal) => animal.id !== editing?.id);
    if (!isEdit && others.some((animal) => animal.id.toUpperCase() === id)) {
      setError("internalId", { message: "validation.livestock.idTaken" });
      return;
    }
    if (others.some((animal) => animal.earTagId.toUpperCase() === earTag)) {
      setError("earTagId", { message: "validation.livestock.earTagTaken" });
      return;
    }
    if (form.assignDevice && !form.deviceId) {
      setError("deviceId", { message: "validation.livestock.device" });
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const healthStatus = form.initialHealthStatus as HealthStatus;
    const barnMates = store.livestock.filter((animal) => animal.barnId === form.barnId && animal.id !== editing?.id);
    const location = barnMates.length
      ? {
          lat: barnMates.reduce((sum, a) => sum + a.location.lat, 0) / barnMates.length + (Math.random() - 0.5) * 0.01,
          lng: barnMates.reduce((sum, a) => sum + a.location.lng, 0) / barnMates.length + (Math.random() - 0.5) * 0.01,
        }
      : { lat: -6.9 - Math.random() * 0.3, lng: 107.6 + Math.random() * 0.3 };
    const notes = form.notes?.trim() ?? "";

    if (editing) {
      store.updateLivestock([editing.id], {
        name: form.name.trim(),
        type: form.animalType,
        breed: form.breed,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        ageMonths: monthsSince(form.dateOfBirth),
        earTagId: earTag,
        weightKg: Number(form.weightKg),
        bodyConditionScore: Number(form.bodyConditionScore),
        farmId: form.farmId,
        barnId: form.barnId,
        herdGroup: form.herdGroup,
        arrivalDate: form.arrivalDate,
        acquisitionSource: form.acquisitionSource,
        healthStatus,
        healthScore: healthStatus === editing.healthStatus ? editing.healthScore : scoreForStatus[healthStatus] ?? editing.healthScore,
        vaccinationStatus: form.vaccinationStatus as Livestock["vaccinationStatus"],
        notes: { id: notes, en: notes },
        photo: photo ?? editing.photo,
        ...(editing.barnId !== form.barnId ? { location } : {}),
      });
      const nextDevice = form.assignDevice ? form.deviceId || null : null;
      if (nextDevice !== editing.deviceId) store.assignDevice(editing.id, nextDevice);
      toast.success(t("addLivestock.updated", { name: form.name }));
      navigate(`/dashboard/livestock/${editing.id}`);
      return;
    }

    const animal: Livestock = {
      id,
      code: `TRV-${id.replace(/\D/g, "").padStart(3, "0") || "NEW"}`,
      name: form.name.trim(),
      earTagId: earTag,
      photo: photo ?? images.cattleHerd,
      type: form.animalType,
      breed: form.breed,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      ageMonths: monthsSince(form.dateOfBirth),
      weightKg: Number(form.weightKg),
      bodyConditionScore: Number(form.bodyConditionScore),
      farmId: form.farmId,
      barnId: form.barnId,
      herdGroup: form.herdGroup,
      healthStatus,
      healthScore: scoreForStatus[healthStatus] ?? 80,
      temperature: healthStatus === "critical" ? 39.6 : 38.4,
      heartRate: healthStatus === "critical" ? 96 : 72,
      activityLevel: healthStatus === "healthy" ? 70 : 35,
      oxygenLevel: 97,
      deviceId: null,
      deviceStatus: "unassigned",
      batteryLevel: 0,
      lastUpdate: "Just now",
      location,
      vaccinationStatus: form.vaccinationStatus as Livestock["vaccinationStatus"],
      arrivalDate: form.arrivalDate,
      acquisitionSource: form.acquisitionSource,
      notes: { id: notes, en: notes },
    };
    store.addLivestock(animal);
    if (form.assignDevice && form.deviceId) store.assignDevice(animal.id, form.deviceId);
    localStorage.removeItem(DRAFT_KEY);
    toast.success(t("addLivestock.created"));
    setSavedId(animal.id);
    setTimeout(() => navigate(`/dashboard/livestock/${animal.id}`), 1200);
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ values: getValues(), photo }));
      toast.success(t("addLivestock.draftSaved"));
    } catch {
      toast.error(t("addLivestock.draftFailed"));
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    reset(defaults);
    setPhoto(null);
    setDraftRestored(false);
  };

  if (isEdit && !editing) {
    return <ErrorState title={t("livestock.notFound")} onRetry={() => navigate("/dashboard/livestock")} />;
  }

  if (savedId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-terrava-border bg-white p-14 text-center">
        <CheckCircle2 className="mb-4 h-14 w-14 text-terrava-primary" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-terrava-text">{t("addLivestock.created")}</h2>
        <p className="mt-1.5 text-sm text-terrava-muted">{t("addLivestock.redirecting")}</p>
      </div>
    );
  }

  const farmName = store.getFarmById(values.farmId ?? "")?.name;
  const barnName = store.getBarnById(values.barnId ?? "")?.name;
  const reviewRows = [
    [t("addLivestock.field.nameOrCode"), values.name],
    [t("addLivestock.field.internalId"), values.internalId],
    [t("addLivestock.field.animalType"), values.animalType ? tt("livestockType", values.animalType) : ""],
    [t("livestock.column.breed"), values.breed],
    [t("livestock.column.farmBarn"), [farmName, barnName].filter(Boolean).join(" · ")],
    [t("addLivestock.field.initialHealth"), values.initialHealthStatus ? t("status." + values.initialHealthStatus) : ""],
    [t("addLivestock.section.device"), values.assignDevice && values.deviceId ? values.deviceId : t("status.unassigned")],
  ];

  const errorText = (message?: string) => (message ? t(message) : undefined);

  return (
    <div>
      <PageHeader
        title={isEdit ? t("addLivestock.editTitle", { name: editing?.name ?? "" }) : t("nav.item.addLivestock")}
        subtitle={isEdit ? t("addLivestock.editSubtitle") : t("addLivestock.subtitle")}
      />

      {draftRestored && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-terrava-info/30 bg-terrava-info/10 px-4 py-3 text-sm text-terrava-text">
          <FileClock className="h-4 w-4 text-terrava-info" aria-hidden="true" />
          <span className="flex-1">{t("addLivestock.draftRestored")}</span>
          <button type="button" onClick={discardDraft} className="inline-flex items-center gap-1.5 text-xs font-semibold text-terrava-error hover:underline">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {t("addLivestock.discardDraft")}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Section number={1} title={t("addLivestock.section.basic")}>
          <Field label={t("addLivestock.field.nameOrCode")} required error={errorText(errors.name?.message)}>
            <input className={fieldClass} placeholder={t("addLivestock.placeholder.name")} {...register("name")} />
          </Field>
          <Field label={t("addLivestock.field.animalType")} required error={errorText(errors.animalType?.message)}>
            <select className={fieldClass} {...register("animalType")}>
              <option value="">{t("addLivestock.placeholder.selectType")}</option>
              <option value="Dairy Cattle">{tt("livestockType", "Dairy Cattle")}</option>
              <option value="Beef Cattle">{tt("livestockType", "Beef Cattle")}</option>
            </select>
          </Field>
          <Field label={t("livestock.column.breed")} required error={errorText(errors.breed?.message)}>
            <select className={fieldClass} {...register("breed")}>
              <option value="">{t("addLivestock.placeholder.selectBreed")}</option>
              <option>Friesian Holstein</option>
              <option>Limousin</option>
              <option>Simmental</option>
              <option>Brahman</option>
              <option>Ongole</option>
            </select>
          </Field>
          <Field label={t("livestock.column.gender")} required error={errorText(errors.gender?.message)}>
            <select className={fieldClass} {...register("gender")}>
              <option value="Female">{tt("gender", "Female")}</option>
              <option value="Male">{tt("gender", "Male")}</option>
            </select>
          </Field>
          <Field
            label={t("addLivestock.field.dateOfBirth")}
            required
            error={errorText(errors.dateOfBirth?.message)}
            hint={values.dateOfBirth ? t("livestock.months", { count: monthsSince(values.dateOfBirth) }) : undefined}
          >
            <input type="date" max={today()} className={fieldClass} {...register("dateOfBirth")} />
          </Field>
          <Field label={t("addLivestock.field.estimatedAge")}>
            <input className={fieldClass} placeholder={t("addLivestock.placeholder.age")} {...register("estimatedAge")} />
          </Field>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-terrava-text">{t("addLivestock.field.photo")}</label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-terrava-border bg-terrava-bg">
                {photo ? <img src={photo} alt={t("addLivestock.photoPreview")} className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-terrava-muted" aria-hidden="true" />}
              </div>
              <label className="cursor-pointer rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg">
                {photo ? t("addLivestock.changePhoto") : t("addLivestock.uploadPhoto")}
                <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
              </label>
              {photo && (
                <button type="button" onClick={() => setPhoto(null)} className="text-sm font-medium text-terrava-error hover:underline">
                  {t("addLivestock.removePhoto")}
                </button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-terrava-muted">{t("addLivestock.photoHint")}</p>
          </div>
        </Section>

        <Section number={2} title={t("addLivestock.section.identification")}>
          <Field label={t("addLivestock.field.internalId")} required error={errorText(errors.internalId?.message)} hint={isEdit ? t("addLivestock.idLocked") : undefined}>
            <input className={fieldClass} placeholder={suggestions.id} readOnly={isEdit} aria-readonly={isEdit} {...register("internalId")} />
          </Field>
          <Field label={t("addLivestock.field.earTagId")} required error={errorText(errors.earTagId?.message)}>
            <input className={fieldClass} placeholder={suggestions.earTag} {...register("earTagId")} />
          </Field>
          <Field label="RFID">
            <input className={fieldClass} {...register("rfid")} />
          </Field>
          <Field label={t("addLivestock.field.registrationNumber")}>
            <input className={fieldClass} {...register("registrationNumber")} />
          </Field>
        </Section>

        <Section number={3} title={t("addLivestock.section.physical")}>
          <Field label={t("addLivestock.field.weight")} required error={errorText(errors.weightKg?.message)}>
            <input type="number" min={1} max={1500} className={fieldClass} {...register("weightKg")} />
          </Field>
          <Field label={t("addLivestock.field.bodyCondition")} required error={errors.bodyConditionScore ? t("validation.livestock.bodyCondition") : undefined}>
            <input type="number" min={1} max={5} className={fieldClass} {...register("bodyConditionScore")} />
          </Field>
          <Field label={t("addLivestock.field.markings")}>
            <input className={fieldClass} {...register("markings")} />
          </Field>
        </Section>

        <Section number={4} title={t("livestock.farmAssignment")}>
          <Field label={t("filter.farm")} required error={errorText(errors.farmId?.message)}>
            <select
              className={fieldClass}
              {...register("farmId", {
                onChange: () => setValue("barnId", ""),
              })}
            >
              <option value="">{t("addLivestock.placeholder.selectFarm")}</option>
              {store.farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("farms.barn")} required error={errorText(errors.barnId?.message)}>
            <select className={fieldClass} disabled={!selectedFarmId} {...register("barnId")}>
              <option value="">{t("addLivestock.placeholder.selectBarn")}</option>
              {barnsForFarm.map((barn) => (
                <option key={barn.id} value={barn.id}>
                  {barn.name} ({barn.occupancy}/{barn.capacity})
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("livestock.herdGroup")} required error={errorText(errors.herdGroup?.message)}>
            <select className={fieldClass} {...register("herdGroup")}>
              <option value="">{t("addLivestock.placeholder.selectHerd")}</option>
              <option>Herd 1</option>
              <option>Herd 2</option>
              <option>Herd 3</option>
            </select>
          </Field>
          <Field label={t("livestock.arrivalDate")} required error={errorText(errors.arrivalDate?.message)}>
            <input type="date" max={today()} className={fieldClass} {...register("arrivalDate")} />
          </Field>
          <Field label={t("addLivestock.field.acquisitionSource")} required error={errorText(errors.acquisitionSource?.message)}>
            <select className={fieldClass} {...register("acquisitionSource")}>
              <option value="">{t("addLivestock.placeholder.selectSource")}</option>
              <option value="Internal breeding">{tt("acquisition", "Internal breeding")}</option>
              <option value="Partner purchase">{tt("acquisition", "Partner purchase")}</option>
              <option value="Cooperative program">{tt("acquisition", "Cooperative program")}</option>
              <option value="Inter-farm transfer">{tt("acquisition", "Inter-farm transfer")}</option>
            </select>
          </Field>
        </Section>

        <Section number={5} title={t("addLivestock.section.health")}>
          <Field label={t("addLivestock.field.initialHealth")} required error={errorText(errors.initialHealthStatus?.message)}>
            <select className={fieldClass} {...register("initialHealthStatus")}>
              <option value="">{t("addLivestock.placeholder.selectStatus")}</option>
              <option value="healthy">{t("status.healthy")}</option>
              <option value="attention">{t("status.attention")}</option>
              <option value="critical">{t("status.critical")}</option>
            </select>
          </Field>
          <Field label={t("addLivestock.field.vaccinationStatus")} required error={errorText(errors.vaccinationStatus?.message)}>
            <select className={fieldClass} {...register("vaccinationStatus")}>
              <option value="">{t("addLivestock.placeholder.selectStatus")}</option>
              <option value="up-to-date">{t("status.up-to-date")}</option>
              <option value="due">{t("status.due")}</option>
              <option value="overdue">{t("status.overdue")}</option>
            </select>
          </Field>
          <Field label={t("addLivestock.field.lastExamination")}>
            <input type="date" max={today()} className={fieldClass} {...register("lastExaminationDate")} />
          </Field>
          <Field label={t("addLivestock.field.knownConditions")}>
            <input className={fieldClass} {...register("knownConditions")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t("alerts.notes")}>
              <textarea rows={3} maxLength={1000} className={fieldClass} {...register("notes")} />
            </Field>
          </div>
        </Section>

        <Section number={6} title={t("addLivestock.section.device")}>
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-terrava-text">
              <input type="checkbox" className="h-4 w-4 accent-[rgb(var(--t-primary))]" {...register("assignDevice")} />
              {t("addLivestock.assignNow")}
            </label>
          </div>
          {assignDevice && (
            <Field
              label={t("devices.deviceId")}
              required
              error={errorText(errors.deviceId?.message)}
              hint={availableDevices.length === 0 ? t("addLivestock.noFreeDevices") : t("addLivestock.freeDevices", { count: availableDevices.length })}
            >
              <select className={fieldClass} disabled={availableDevices.length === 0} {...register("deviceId")}>
                <option value="">{t("addLivestock.selectDevice")}</option>
                {availableDevices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.id} · {device.name} · {t("devices.battery")} {device.battery}%
                  </option>
                ))}
              </select>
            </Field>
          )}
        </Section>

        <div className="rounded-2xl border border-terrava-border bg-white p-6 shadow-card">
          <h2 className="mb-1 text-base font-semibold text-terrava-text">{t("addLivestock.review")}</h2>
          <p className="mb-4 text-sm text-terrava-muted">{t("addLivestock.reviewDescription")}</p>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {reviewRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 border-b border-terrava-border-muted py-1.5 text-sm">
                <dt className="text-terrava-muted">{label}</dt>
                <dd className={value ? "text-right font-medium text-terrava-text" : "text-right text-terrava-muted/60"}>{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-terrava-border bg-white/95 p-4 backdrop-blur">
          <button
            type="button"
            onClick={() => navigate(isEdit && editing ? `/dashboard/livestock/${editing.id}` : "/dashboard/livestock")}
            className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg"
          >
            {t("common.cancel")}
          </button>
          {!isEdit && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={!isDirty && !photo}
              className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg disabled:opacity-50"
            >
              {t("addLivestock.saveDraft")}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover disabled:opacity-70"
          >
            {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isEdit ? t("addLivestock.saveChanges") : t("addLivestock.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
