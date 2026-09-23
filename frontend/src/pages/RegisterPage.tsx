import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AuthLayout from "@/components/auth/AuthLayout";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/data/demoAccounts";
import { accountRoleOptions } from "@/data/auth";
import RegisterStepIndicator from "@/components/auth/RegisterStepIndicator";
import RegisterStepOne from "@/components/auth/RegisterStepOne";
import RegisterStepTwo from "@/components/auth/RegisterStepTwo";
import RegisterStepThree from "@/components/auth/RegisterStepThree";
import type {
  RegisterStep1Values,
  RegisterStep2Values,
  RegisterStep3Values,
} from "@/schemas/authSchemas";
import { useLanguage } from "@/hooks/useLanguage";

const step1Defaults: RegisterStep1Values = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const step2Defaults: RegisterStep2Values = {
  farmName: "",
  accountRole: "",
  farmType: "",
  city: "",
  province: "",
  livestockCount: "",
  primaryLivestock: "",
};

const step3Defaults: RegisterStep3Values = {
  notificationMethod: "",
  productUpdates: false,
  agreeTerms: false,
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { loginAs } = useAuth();
  const { t, tr } = useLanguage();

  useEffect(() => {
    document.title = "Create Account | Terrava";
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [accountData, setAccountData] = useState(step1Defaults);
  const [farmData, setFarmData] = useState(step2Defaults);
  const [preferencesData, setPreferencesData] = useState(step3Defaults);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const markCompleted = (step: number) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  };

  const handleStep1Next = (values: RegisterStep1Values) => {
    setAccountData(values);
    markCompleted(1);
    setCurrentStep(2);
  };

  const handleStep2Next = (values: RegisterStep2Values) => {
    setFarmData(values);
    markCompleted(2);
    setCurrentStep(3);
  };

  const handleStep3Submit = async (values: RegisterStep3Values) => {
    setPreferencesData(values);
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    markCompleted(3);
    setIsSuccess(true);

    const roleOption = accountRoleOptions.find((option) => option.value === farmData.accountRole);
    const roleLabel = roleOption ? tr(roleOption.label) : t("auth.defaultRole");

    // Start the session and move to onboarding in the same tick so the guest-only
    // guard on this page does not redirect to the dashboard first.
    setTimeout(() => {
      loginAs(
        {
          id: `usr-${Date.now()}`,
          email: accountData.email.trim().toLowerCase(),
          name: accountData.fullName.trim(),
          role: roleLabel,
          farmName: farmData.farmName.trim(),
          initials: getInitials(accountData.fullName),
        },
        true
      );
      toast.success(t("auth.register.created"));
      navigate("/onboarding", { replace: true });
    }, 1600);
  };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step)) setCurrentStep(step);
  };

  if (isSuccess) {
    return (
      <AuthLayout
        panelVariant="register"
        title={t("auth.register.title")}
        subtitle={t("auth.register.subtitle")}
        showBackButton={false}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-10 text-center shadow-card"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-terrava-light"
          >
            <CheckCircle2 className="h-9 w-9 text-terrava-primary" aria-hidden="true" />
          </motion.div>
          <h2 className="mb-2 text-xl font-semibold text-terrava-text">{t("auth.register.created")}</h2>
          <p className="text-sm text-terrava-muted">
            {t("auth.register.redirecting", { name: accountData.fullName.split(" ")[0] })}
          </p>
          <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-terrava-soft">
            <motion.div
              className="h-full rounded-full bg-terrava-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      panelVariant="register"
      eyebrow={t("auth.register.eyebrow")}
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
      footerText={t("auth.register.footerText")}
      footerLinkText={t("auth.register.footerLink")}
      footerLinkPath="/login"
      maxWidthClassName="max-w-lg"
    >
      <RegisterStepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {currentStep === 1 && <RegisterStepOne defaultValues={accountData} onNext={handleStep1Next} />}

      {currentStep === 2 && (
        <RegisterStepTwo defaultValues={farmData} onNext={handleStep2Next} onBack={() => setCurrentStep(1)} />
      )}

      {currentStep === 3 && (
        <RegisterStepThree
          defaultValues={preferencesData}
          accountData={accountData}
          farmData={farmData}
          isSubmitting={isSubmitting}
          onSubmit={handleStep3Submit}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </AuthLayout>
  );
}
