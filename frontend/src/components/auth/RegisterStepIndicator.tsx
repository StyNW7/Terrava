import { Check } from "lucide-react";

interface RegisterStepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, label: "Account" },
  { number: 2, label: "Farm" },
  { number: 3, label: "Finish" },
];

export default function RegisterStepIndicator({ currentStep, completedSteps, onStepClick }: RegisterStepIndicatorProps) {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-8">
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-terrava-border">
        <div
          className="h-full rounded-full bg-terrava-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          const isClickable = isCompleted && !!onStepClick;

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step.number)}
              className={`flex items-center gap-2 text-xs font-semibold ${
                isClickable ? "cursor-pointer" : "cursor-default"
              } ${isCurrent ? "text-terrava-primary" : isCompleted ? "text-terrava-text" : "text-terrava-muted"}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                  isCompleted
                    ? "border-terrava-primary bg-terrava-primary text-white"
                    : isCurrent
                    ? "border-terrava-primary text-terrava-primary"
                    : "border-terrava-border text-terrava-muted"
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step.number}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
