import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import RegisterStepIndicator from "@/components/auth/RegisterStepIndicator";
import RegisterStepOne from "@/components/auth/RegisterStepOne";
import RegisterStepTwo from "@/components/auth/RegisterStepTwo";
import RegisterStepThree from "@/components/auth/RegisterStepThree";
import type {
  RegisterStep1Values,
  RegisterStep2Values,
  RegisterStep3Values,
} from "@/schemas/authSchemas";

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

    setTimeout(() => navigate("/onboarding"), 1800);
  };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step)) setCurrentStep(step);
  };

  if (isSuccess) {
    return (
      <AuthLayout
        panelVariant="register"
        title="Buat Akun Terrava"
        subtitle="Isi informasi berikut untuk memulai."
        showBackButton={false}
      >
        <div className="flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-10 text-center animate-fade-in-up">
          <CheckCircle2 className="mb-4 h-14 w-14 text-terrava-primary" aria-hidden="true" />
          <h2 className="mb-2 text-xl font-semibold text-terrava-text">Akun Terrava berhasil dibuat.</h2>
          <p className="text-sm text-terrava-muted">Mengarahkan Anda ke proses onboarding...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      panelVariant="register"
      eyebrow="Get Started"
      title="Buat Akun Terrava"
      subtitle="Isi informasi berikut untuk memulai."
      footerText="Sudah memiliki akun?"
      footerLinkText="Masuk"
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
