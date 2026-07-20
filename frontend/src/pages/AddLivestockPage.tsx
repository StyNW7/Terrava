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
    toast.success("Livestock berhasil ditambahkan.");
    setTimeout(() => navigate(`/dashboard/livestock/${livestock[0].id}`), 1200);
  };

  const handleSaveDraft = () => {
    toast.success("Draft berhasil disimpan.");
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-terrava-border bg-white p-14 text-center">
        <CheckCircle2 className="mb-4 h-14 w-14 text-terrava-primary" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-terrava-text">Livestock berhasil ditambahkan</h2>
        <p className="mt-1.5 text-sm text-terrava-muted">Mengarahkan Anda ke halaman detail ternak...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Add Livestock" subtitle="Lengkapi informasi ternak baru untuk memulai pemantauan." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Section number={1} title="Basic Information">
          <Field label="Livestock Name or Code" required error={errors.name?.message}>
            <input className={fieldClass} placeholder="Contoh: Bella" {...register("name")} />
          </Field>
          <Field label="Animal Type" required error={errors.animalType?.message}>
            <select className={fieldClass} {...register("animalType")}>
              <option value="">Pilih jenis</option>
              <option value="Sapi Perah">Sapi Perah</option>
              <option value="Sapi Potong">Sapi Potong</option>
            </select>
          </Field>
          <Field label="Breed" required error={errors.breed?.message}>
            <select className={fieldClass} {...register("breed")}>
              <option value="">Pilih ras</option>
              <option>Friesian Holstein</option>
              <option>Limousin</option>
              <option>Simmental</option>
              <option>Brahman</option>
              <option>Ongole</option>
            </select>
          </Field>
          <Field label="Gender" required error={errors.gender?.message}>
            <select className={fieldClass} {...register("gender")}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </Field>
          <Field label="Date of Birth" required error={errors.dateOfBirth?.message}>
            <input type="date" className={fieldClass} {...register("dateOfBirth")} />
          </Field>
          <Field label="Estimated Age">
            <input className={fieldClass} placeholder="Contoh: 18 bulan" {...register("estimatedAge")} />
          </Field>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-terrava-text">Photo Upload</label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-dashed border-terrava-border bg-terrava-bg">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-terrava-muted" aria-hidden="true" />
                )}
              </div>
              <label className="cursor-pointer rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-medium text-terrava-text hover:bg-terrava-bg">
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
          </div>
        </Section>

        <Section number={2} title="Identification">
          <Field label="Internal Livestock ID" required error={errors.internalId?.message}>
            <input className={fieldClass} placeholder="LVS-041" {...register("internalId")} />
          </Field>
          <Field label="Ear Tag ID" required error={errors.earTagId?.message}>
            <input className={fieldClass} placeholder="EAR-1041" {...register("earTagId")} />
          </Field>
          <Field label="RFID">
            <input className={fieldClass} {...register("rfid")} />
          </Field>
          <Field label="Registration Number">
            <input className={fieldClass} {...register("registrationNumber")} />
          </Field>
        </Section>

        <Section number={3} title="Physical Information">
          <Field label="Weight (kg)" required error={errors.weightKg?.message}>
            <input type="number" className={fieldClass} {...register("weightKg")} />
          </Field>
          <Field label="Body Condition Score (1-5)" required error={errors.bodyConditionScore?.message}>
            <input type="number" min={1} max={5} className={fieldClass} {...register("bodyConditionScore")} />
          </Field>
          <Field label="Color or Markings">
            <input className={fieldClass} {...register("markings")} />
          </Field>
        </Section>

        <Section number={4} title="Farm Assignment">
          <Field label="Farm" required error={errors.farmId?.message}>
            <select className={fieldClass} {...register("farmId")}>
              <option value="">Pilih farm</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Barn" required error={errors.barnId?.message}>
            <select className={fieldClass} disabled={!selectedFarmId} {...register("barnId")}>
              <option value="">Pilih barn</option>
              {barnsForFarm.map((barn) => (
                <option key={barn.id} value={barn.id}>
                  {barn.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Herd Group" required error={errors.herdGroup?.message}>
            <select className={fieldClass} {...register("herdGroup")}>
              <option value="">Pilih herd group</option>
              <option>Herd 1</option>
              <option>Herd 2</option>
              <option>Herd 3</option>
            </select>
          </Field>
          <Field label="Arrival Date" required error={errors.arrivalDate?.message}>
            <input type="date" className={fieldClass} {...register("arrivalDate")} />
          </Field>
          <Field label="Acquisition Source" required error={errors.acquisitionSource?.message}>
            <select className={fieldClass} {...register("acquisitionSource")}>
              <option value="">Pilih sumber</option>
              <option>Breeding internal</option>
              <option>Pembelian mitra</option>
              <option>Program koperasi</option>
              <option>Transfer antar farm</option>
            </select>
          </Field>
        </Section>

        <Section number={5} title="Health Information">
          <Field label="Initial Health Status" required error={errors.initialHealthStatus?.message}>
            <select className={fieldClass} {...register("initialHealthStatus")}>
              <option value="">Pilih status</option>
              <option value="healthy">Healthy</option>
              <option value="attention">Needs Attention</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Vaccination Status" required error={errors.vaccinationStatus?.message}>
            <select className={fieldClass} {...register("vaccinationStatus")}>
              <option value="">Pilih status</option>
              <option value="up-to-date">Up to Date</option>
              <option value="due">Due</option>
              <option value="overdue">Overdue</option>
            </select>
          </Field>
          <Field label="Last Examination Date">
            <input type="date" className={fieldClass} {...register("lastExaminationDate")} />
          </Field>
          <Field label="Known Conditions">
            <input className={fieldClass} {...register("knownConditions")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea rows={3} className={fieldClass} {...register("notes")} />
            </Field>
          </div>
        </Section>

        <Section number={6} title="Device Assignment">
          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-terrava-text">
              <input type="checkbox" className="h-4 w-4 accent-terrava-primary" {...register("assignDevice")} />
              Assign smart ear tag sekarang
            </label>
          </div>
          {assignDevice && (
            <Field label="Device ID">
              <input className={fieldClass} placeholder="DEV-021" {...register("deviceId")} />
            </Field>
          )}
        </Section>

        <div className="rounded-2xl border border-terrava-border bg-white p-6">
          <h2 className="mb-3 text-base font-semibold text-terrava-text">Review</h2>
          <p className="text-sm text-terrava-muted">
            Periksa kembali seluruh informasi sebelum menyimpan. Anda dapat mengedit data ternak kapan pun setelah disimpan.
          </p>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-terrava-border bg-white/95 p-4 backdrop-blur">
          <button type="button" onClick={() => navigate("/dashboard/livestock")} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            Cancel
          </button>
          <button type="button" onClick={handleSaveDraft} className="rounded-xl border border-terrava-border px-4 py-2.5 text-sm font-semibold text-terrava-text hover:bg-terrava-bg">
            Save Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-terrava-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover disabled:opacity-70"
          >
            {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Submit Livestock
          </button>
        </div>
      </form>
    </div>
  );
}
