import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import CardRadioGroup from "@/components/auth/CardRadioGroup";
import { registerStep2Schema, type RegisterStep2Values } from "@/schemas/authSchemas";
import {
  accountRoleOptions,
  farmTypeOptions,
  livestockCountOptions,
  primaryLivestockOptions,
} from "@/data/auth";

interface RegisterStepTwoProps {
  defaultValues: RegisterStep2Values;
  onNext: (values: RegisterStep2Values) => void;
  onBack: () => void;
}

export default function RegisterStepTwo({ defaultValues, onNext, onBack }: RegisterStepTwoProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterStep2Values>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-5">
      <h2 className="text-lg font-semibold text-terrava-text">Informasi Peternakan</h2>

      <AuthInput
        id="farmName"
        label="Farm or Organization Name"
        placeholder="Nama peternakan atau organisasi"
        error={errors.farmName?.message}
        {...register("farmName")}
      />

      <div>
        <span className="mb-1.5 block text-sm font-medium text-terrava-text">Account Role</span>
        <Controller
          name="accountRole"
          control={control}
          render={({ field }) => (
            <CardRadioGroup
              name="Account Role"
              options={accountRoleOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.accountRole?.message}
            />
          )}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-terrava-text">Farm Type</span>
        <Controller
          name="farmType"
          control={control}
          render={({ field }) => (
            <CardRadioGroup
              name="Farm Type"
              options={farmTypeOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.farmType?.message}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <AuthInput
          id="city"
          label="City or Regency"
          icon={MapPin}
          placeholder="Kota atau kabupaten"
          error={errors.city?.message}
          {...register("city")}
        />
        <AuthInput
          id="province"
          label="Province"
          icon={MapPin}
          placeholder="Provinsi"
          error={errors.province?.message}
          {...register("province")}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="livestockCount" className="mb-1.5 block text-sm font-medium text-terrava-text">
            Number of Livestock
          </label>
          <select
            id="livestockCount"
            aria-invalid={!!errors.livestockCount}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-terrava-text focus:outline-none focus:ring-2 focus:ring-terrava-primary/25 ${
              errors.livestockCount ? "border-terrava-error" : "border-terrava-border focus:border-terrava-primary"
            }`}
            {...register("livestockCount")}
          >
            <option value="">Pilih jumlah</option>
            {livestockCountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.livestockCount && (
            <p role="alert" className="mt-1.5 text-xs text-terrava-error">
              {errors.livestockCount.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="primaryLivestock" className="mb-1.5 block text-sm font-medium text-terrava-text">
            Primary Livestock
          </label>
          <select
            id="primaryLivestock"
            aria-invalid={!!errors.primaryLivestock}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-terrava-text focus:outline-none focus:ring-2 focus:ring-terrava-primary/25 ${
              errors.primaryLivestock ? "border-terrava-error" : "border-terrava-border focus:border-terrava-primary"
            }`}
            {...register("primaryLivestock")}
          >
            <option value="">Pilih jenis ternak</option>
            {primaryLivestockOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.primaryLivestock && (
            <p role="alert" className="mt-1.5 text-xs text-terrava-error">
              {errors.primaryLivestock.message}
            </p>
          )}
        </div>
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
          className="inline-flex w-full items-center justify-center rounded-xl bg-terrava-primary px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-terrava-hover"
        >
          Lanjutkan
        </button>
      </div>
    </form>
  );
}
