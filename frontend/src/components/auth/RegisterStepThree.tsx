import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, UserRound, Mail, Building2, Users } from "lucide-react";
import CardRadioGroup from "@/components/auth/CardRadioGroup";
import { registerStep3Schema, type RegisterStep3Values } from "@/schemas/authSchemas";
import { notificationMethodOptions } from "@/data/auth";
import type { RegisterStep1Values, RegisterStep2Values } from "@/schemas/authSchemas";
import { useLanguage } from "@/hooks/useLanguage";

interface RegisterStepThreeProps {
  defaultValues: RegisterStep3Values;
  accountData: RegisterStep1Values;
  farmData: RegisterStep2Values;
  isSubmitting: boolean;
  onSubmit: (values: RegisterStep3Values) => void;
  onBack: () => void;
}

const summaryFields = (accountData: RegisterStep1Values, farmData: RegisterStep2Values) => [
  { icon: UserRound, key: "userName", value: accountData.fullName },
  { icon: Mail, key: "email", value: accountData.email },
  { icon: Building2, key: "farmName", value: farmData.farmName },
  { icon: Users, key: "role", value: farmData.accountRole },
  { icon: Building2, key: "livestockScale", value: farmData.livestockCount },
];

export default function RegisterStepThree({
  defaultValues,
  accountData,
  farmData,
  isSubmitting,
  onSubmit,
  onBack,
}: RegisterStepThreeProps) {
  const { t } = useLanguage();
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
      <h2 className="text-lg font-semibold text-terrava-text">{t("auth.register.finish")}</h2>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-terrava-text">{t("auth.field.notificationMethod")}</span>
        <Controller
          name="notificationMethod"
          control={control}
          render={({ field }) => (
            <CardRadioGroup
              name={t("auth.field.notificationMethod")}
              options={notificationMethodOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.notificationMethod?.message && t(errors.notificationMethod.message)}
            />
          )}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-terrava-text">
        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-terrava-primary" {...register("productUpdates")} />
        {t("auth.register.productUpdates")}
      </label>

      <div className="rounded-2xl border border-terrava-border bg-terrava-bg p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-terrava-muted">{t("auth.register.summary")}</h3>
        <ul className="space-y-2.5">
          {summaryFields(accountData, farmData).map((field) => (
            <li key={field.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-terrava-muted">
                <field.icon className="h-4 w-4" aria-hidden="true" />
                {t("auth.summary." + field.key)}
              </span>
              <span className="font-medium text-terrava-text">{field.value || "-"}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-terrava-text">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-terrava-primary" {...register("agreeTerms")} />
          {t("auth.register.agreeTerms")}
        </label>
        {errors.agreeTerms && (
          <p role="alert" className="mt-1.5 text-xs text-terrava-error">
            {t(errors.agreeTerms.message ?? "")}
          </p>
        )}
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
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-terrava-primary px-6 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-terrava-hover disabled:pointer-events-none disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t("auth.processing")}
            </>
          ) : (
            t("auth.createAccount")
          )}
        </button>
      </div>
    </form>
  );
}
