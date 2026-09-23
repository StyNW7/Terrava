import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ImagePlus, CheckCircle2, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import { livestockSchema, type LivestockFormValues } from "@/schemas/livestockSchema";
import { farms, getBarnsByFarm } from "@/data/mockFarms";
import { livestock } from "@/data/mockLivestock";
import { useLanguage } from "@/hooks/useLanguage";

const fieldClass =
  "w-full rounded-xl border border-terrava-border bg-white px-3.5 py-2.5 text-sm text-terrava-text focus:border-terrava-primary focus:outline-none focus:ring-2 focus:ring-terrava-primary/20";

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-terrava-text">
        {label} {required && <span className="text-terrava-error">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-terrava-error">{error}</p>}
    </div>
  );
}

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terrava-primary text-xs font-bold text-white">{number}</span>
        <h2 className="text-base font-semibold text-terrava-text">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function AddLivestockPage() {
  const navigate = useNavigate();
  const { t, tt } = useLanguage();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = "Add Livestock | Terrava";
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LivestockFormValues>({
    resolver: zodResolver(livestockSchema),
    defaultValues: {
      gender: "Female",
      bodyConditionScore: 3,
      assignDevice: false,
    },
  });

  const selectedFarmId = watch("farmId");
  const assignDevice = watch("assignDevice");
  const barnsForFarm = selectedFarmId ? getBarnsByFarm(selectedFarmId) : [];

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSuccess(true);
    toast.success(t("addLivestock.created"));
    setTimeout(() => navigate(`/dashboard/livestock/${livestock[0].id}`), 1200);
  };

  const handleSaveDraft = () => {
    toast.success(t("addLivestock.draftSaved"));
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-terrava-border bg-white p-14 text-center">
        <CheckCircle2 className="mb-4 h-14 w-14 text-terrava-primary" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-terrava-text">{t("addLivestock.created")}</h2>
        <p className="mt-1.5 text-sm text-terrava-muted">{t("addLivestock.redirecting")}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("nav.item.addLivestock")} subtitle={t("addLivestock.subtitle")} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Section number={1} title={t("addLivestock.section.basic")}>
          <Field label={t("addLivestock.field.nameOrCode")} required error={errors.name?.message && t(errors.name.message)}>
            <input className={fieldClass} placeholder={t("addLivestock.placeholder.name")} {...register("name")} />
          </Field>
          <Field label={t("addLivestock.field.animalType")} required error={errors.animalType?.message && t(errors.animalType.message)}>
            <select className={fieldClass} {...register("animalType")}>
              <option value="">{t("addLivestock.placeholder.selectType")}</option>
              <option value="Dairy Cattle">{tt("livestockType", "Dairy Cattle")}</option>
              <option value="Beef Cattle">{tt("livestockType", "Beef Cattle")}</option>
            </select>
          </Field>
          <Field label={t("livestock.column.breed")} required error={errors.breed?.message && t(errors.breed.message)}>
            <select className={fieldClass} {...register("breed")}>
              <option value="">{t("addLivestock.placeholder.selectBreed")}</option>
              <option>Friesian Holstein</option>
              <option>Limousin</option>
              <option>Simmental</option>
              <option>Brahman</option>
              <option>Ongole</option>
            </select>
          </Field>
          <Field label={t("livestock.column.gender")} required error={errors.gender?.message && t(errors.gender.message)}>
            <select className={fieldClass} {...register("gender")}>
              <option value="Female">{tt("gender", "Female")}</option>
              <option value="Male">{tt("gender", "Male")}</option>
            </select>
          </Field>
          <Field label={t("addLivestock.field.dateOfBirth")} required error={errors.dateOfBirth?.message && t(errors.dateOfBirth.message)}>
            <input type="date" className={fieldClass} {...register("dateOfBirth")} />
          </Field>
          <Field label={t("addLivestock.field.estimatedAge")}>
            <input className={fieldClass} placeholder={t("addLivestock.placeholder.age")} {...register("estimatedAge")} />
          </Field>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-terrava-text">{t("addLivestock.field.photo")}</label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-terrava-border bg-terrava-bg">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-terrava-muted" aria-hidden="true" />
                )}
              </div>
              <label className="cursor-pointer rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg">
                {t("addLivestock.uploadPhoto")}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
          </div>
        </Section>

        <Section number={2} title={t("addLivestock.section.identification")}>
          <Field label={t("addLivestock.field.internalId")} required error={errors.internalId?.message && t(errors.internalId.message)}>
            <input className={fieldClass} placeholder="LVS-041" {...register("internalId")} />
          </Field>
          <Field label={t("addLivestock.field.earTagId")} required error={errors.earTagId?.message && t(errors.earTagId.message)}>
            <input className={fieldClass} placeholder="EAR-1041" {...register("earTagId")} />
          </Field>
          <Field label="RFID">
            <input className={fieldClass} {...register("rfid")} />
          </Field>
          <Field label={t("addLivestock.field.registrationNumber")}>
            <input className={fieldClass} {...register("registrationNumber")} />
          </Field>
        </Section>

        <Section number={3} title={t("addLivestock.section.physical")}>
          <Field label={t("addLivestock.field.weight")} required error={errors.weightKg?.message && t(errors.weightKg.message)}>
            <input type="number" className={fieldClass} {...register("weightKg")} />
          </Field>
          <Field
            label={t("addLivestock.field.bodyCondition")}
            required
            error={errors.bodyConditionScore?.message && t(errors.bodyConditionScore.message)}
          >
            <input type="number" min={1} max={5} className={fieldClass} {...register("bodyConditionScore")} />
          </Field>
          <Field label={t("addLivestock.field.markings")}>
            <input className={fieldClass} {...register("markings")} />
          </Field>
        </Section>

        <Section number={4} title={t("livestock.farmAssignment")}>
          <Field label={t("filter.farm")} required error={errors.farmId?.message && t(errors.farmId.message)}>
            <select className={fieldClass} {...register("farmId")}>
              <option value="">{t("addLivestock.placeholder.selectFarm")}</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("farms.barn")} required error={errors.barnId?.message && t(errors.barnId.message)}>
            <select className={fieldClass} disabled={!selectedFarmId} {...register("barnId")}>
              <option value="">{t("addLivestock.placeholder.selectBarn")}</option>
              {barnsForFarm.map((barn) => (
                <option key={barn.id} value={barn.id}>
                  {barn.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("livestock.herdGroup")} required error={errors.herdGroup?.message && t(errors.herdGroup.message)}>
            <select className={fieldClass} {...register("herdGroup")}>
              <option value="">{t("addLivestock.placeholder.selectHerd")}</option>
              <option>Herd 1</option>
              <option>Herd 2</option>
              <option>Herd 3</option>
            </select>
          </Field>
          <Field label={t("livestock.arrivalDate")} required error={errors.arrivalDate?.message && t(errors.arrivalDate.message)}>
            <input type="date" className={fieldClass} {...register("arrivalDate")} />
          </Field>
          <Field
            label={t("addLivestock.field.acquisitionSource")}
            required
            error={errors.acquisitionSource?.message && t(errors.acquisitionSource.message)}
          >
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
          <Field
            label={t("addLivestock.field.initialHealth")}
            required
            error={errors.initialHealthStatus?.message && t(errors.initialHealthStatus.message)}
          >
            <select className={fieldClass} {...register("initialHealthStatus")}>
              <option value="">{t("addLivestock.placeholder.selectStatus")}</option>
              <option value="healthy">{t("status.healthy")}</option>
              <option value="attention">{t("status.attention")}</option>
              <option value="critical">{t("status.critical")}</option>
            </select>
          </Field>
          <Field
            label={t("addLivestock.field.vaccinationStatus")}
            required
            error={errors.vaccinationStatus?.message && t(errors.vaccinationStatus.message)}
          >
            <select className={fieldClass} {...register("vaccinationStatus")}>
              <option value="">{t("addLivestock.placeholder.selectStatus")}</option>
              <option value="up-to-date">{t("status.up-to-date")}</option>
              <option value="due">{t("status.due")}</option>
              <option value="overdue">{t("status.overdue")}</option>
            </select>
          </Field>
          <Field label={t("addLivestock.field.lastExamination")}>
            <input type="date" className={fieldClass} {...register("lastExaminationDate")} />
          </Field>
          <Field label={t("addLivestock.field.knownConditions")}>
            <input className={fieldClass} {...register("knownConditions")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label={t("alerts.notes")}>
              <textarea rows={3} className={fieldClass} {...register("notes")} />
            </Field>
          </div>
        </Section>

        <Section number={6} title={t("addLivestock.section.device")}>
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-terrava-text">
              <input type="checkbox" className="h-4 w-4 accent-terrava-primary" {...register("assignDevice")} />
              {t("addLivestock.assignNow")}
            </label>
          </div>
          {assignDevice && (
            <Field label={t("devices.deviceId")}>
              <input className={fieldClass} placeholder="DEV-021" {...register("deviceId")} />
            </Field>
          )}
        </Section>

        <div className="rounded-2xl border border-terrava-border bg-white p-6">
          <h2 className="mb-3 text-base font-semibold text-terrava-text">{t("addLivestock.review")}</h2>
          <p className="text-sm text-terrava-muted">{t("addLivestock.reviewDescription")}</p>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-terrava-border bg-white/95 p-4 backdrop-blur">
          <button type="button" onClick={() => navigate("/dashboard/livestock")} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("common.cancel")}
          </button>
          <button type="button" onClick={handleSaveDraft} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            {t("addLivestock.saveDraft")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover disabled:opacity-70"
          >
            {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {t("addLivestock.submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
