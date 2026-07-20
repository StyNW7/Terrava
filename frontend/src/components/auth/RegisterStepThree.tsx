import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, UserRound, Mail, Building2, Users } from "lucide-react";
import CardRadioGroup from "@/components/auth/CardRadioGroup";
import { registerStep3Schema, type RegisterStep3Values } from "@/schemas/authSchemas";
import { notificationMethodOptions } from "@/data/auth";
import type { RegisterStep1Values, RegisterStep2Values } from "@/schemas/authSchemas";

interface RegisterStepThreeProps {
  defaultValues: RegisterStep3Values;
  accountData: RegisterStep1Values;
  farmData: RegisterStep2Values;
  isSubmitting: boolean;
  onSubmit: (values: RegisterStep3Values) => void;
  onBack: () => void;
}

const summaryFields = (accountData: RegisterStep1Values, farmData: RegisterStep2Values) => [
  { icon: UserRound, label: "Nama Pengguna", value: accountData.fullName },
  { icon: Mail, label: "Email", value: accountData.email },
  { icon: Building2, label: "Farm Name", value: farmData.farmName },
  { icon: Users, label: "Role", value: farmData.accountRole },
  { icon: Building2, label: "Livestock Scale", value: farmData.livestockCount },
];

export default function RegisterStepThree({
  defaultValues,
  accountData,
  farmData,
  isSubmitting,
  onSubmit,
  onBack,
}: RegisterStepThreeProps) {
  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm<RegisterStep3Values>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <h2 className="text-lg font-semibold text-terrava-text">Selesaikan Pendaftaran</h2>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-terrava-text">Preferred Notification Method</span>
        <Controller
          name="notificationMethod"
          control={control}
          render={({ field }) => (
            <CardRadioGroup
              name="Preferred Notification Method"
              options={notificationMethodOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.notificationMethod?.message}
            />
          )}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-terrava-text">
        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-terrava-primary" {...register("productUpdates")} />
        Saya ingin menerima informasi produk dan pembaruan fitur Terrava.
      </label>

      <div className="rounded-2xl border border-terrava-border bg-terrava-bg p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-terrava-muted">Ringkasan Pendaftaran</h3>
        <ul className="space-y-2.5">
          {summaryFields(accountData, farmData).map((field) => (
            <li key={field.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-terrava-muted">
                <field.icon className="h-4 w-4" aria-hidden="true" />
                {field.label}
              </span>
              <span className="font-medium text-terrava-text">{field.value || "-"}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-terrava-text">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-terrava-primary" {...register("agreeTerms")} />
          Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi Terrava.
        </label>
        {errors.agreeTerms && (
          <p role="alert" className="mt-1.5 text-xs text-terrava-error">
            {errors.agreeTerms.message}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-full items-center justify-center rounded-xl border border-terrava-border bg-white px-6 py-3.5 text-sm font-semibold text-terrava-text transition-colors hover:border-terrava-primary/40"
        >
          Kembali
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terrava-primary px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-terrava-hover disabled:pointer-events-none disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Memproses...
            </>
          ) : (
            "Buat Akun"
          )}
        </button>
      </div>
    </form>
  );
}
