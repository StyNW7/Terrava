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
import { useLanguage } from "@/hooks/useLanguage";

interface RegisterStepTwoProps {
  defaultValues: RegisterStep2Values;
  onNext: (values: RegisterStep2Values) => void;
  onBack: () => void;
}

export default function RegisterStepTwo({ defaultValues, onNext, onBack }: RegisterStepTwoProps) {
  const { t, tr } = useLanguage();
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
      <h2 className="text-lg font-semibold text-terrava-text">{t("auth.register.farmInfo")}</h2>

      <AuthInput
        id="farmName"
        label={t("auth.field.farmName")}
        placeholder={t("auth.placeholder.farmName")}
        error={errors.farmName?.message && t(errors.farmName.message)}
        {...register("farmName")}
      />

      <div>
        <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("auth.field.accountRole")}</span>
        <Controller
          name="accountRole"
          control={control}
          render={({ field }) => (
            <CardRadioGroup
              name={t("auth.field.accountRole")}
              options={accountRoleOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.accountRole?.message && t(errors.accountRole.message)}
            />
          )}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("auth.field.farmType")}</span>
        <Controller
          name="farmType"
          control={control}
          render={({ field }) => (
            <CardRadioGroup
              name={t("auth.field.farmType")}
              options={farmTypeOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.farmType?.message && t(errors.farmType.message)}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <AuthInput
          id="city"
          label={t("auth.field.city")}
          icon={MapPin}
          placeholder={t("auth.placeholder.city")}
          error={errors.city?.message && t(errors.city.message)}
          {...register("city")}
        />
        <AuthInput
          id="province"
          label={t("auth.field.province")}
          icon={MapPin}
          placeholder={t("auth.placeholder.province")}
          error={errors.province?.message && t(errors.province.message)}
          {...register("province")}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="livestockCount" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("auth.field.livestockCount")}
          </label>
          <select
            id="livestockCount"
            aria-invalid={!!errors.livestockCount}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-terrava-text focus:outline-none focus:ring-2 focus:ring-terrava-primary/25 ${
              errors.livestockCount ? "border-terrava-error" : "border-terrava-border focus:border-terrava-primary"
            }`}
            {...register("livestockCount")}
          >
            <option value="">{t("auth.placeholder.selectCount")}</option>
            {livestockCountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {tr(option.label)}
              </option>
            ))}
          </select>
          {errors.livestockCount && (
            <p role="alert" className="mt-1.5 text-xs text-terrava-error">
              {t(errors.livestockCount.message ?? "")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="primaryLivestock" className="mb-1.5 block text-sm font-medium text-terrava-text">
            {t("auth.field.primaryLivestock")}
          </label>
          <select
            id="primaryLivestock"
            aria-invalid={!!errors.primaryLivestock}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-terrava-text focus:outline-none focus:ring-2 focus:ring-terrava-primary/25 ${
              errors.primaryLivestock ? "border-terrava-error" : "border-terrava-border focus:border-terrava-primary"
            }`}
            {...register("primaryLivestock")}
          >
            <option value="">{t("auth.placeholder.selectLivestock")}</option>
            {primaryLivestockOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {tr(option.label)}
              </option>
            ))}
          </select>
          {errors.primaryLivestock && (
            <p role="alert" className="mt-1.5 text-xs text-terrava-error">
              {t(errors.primaryLivestock.message ?? "")}
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
          {t("common.back")}
        </button>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-xl bg-terrava-primary px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-terrava-hover"
        >
          {t("auth.continue")}
        </button>
      </div>
    </form>
  );
}
