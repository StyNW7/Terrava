import { Check, Circle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface PasswordStrengthProps {
  password: string;
}

const checklist = [
  { id: "length", test: (value: string) => value.length >= 8 },
  { id: "uppercase", test: (value: string) => /[A-Z]/.test(value) },
  { id: "lowercase", test: (value: string) => /[a-z]/.test(value) },
  { id: "number", test: (value: string) => /[0-9]/.test(value) },
  { id: "symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

function getStrength(password: string) {
  const passed = checklist.filter((rule) => rule.test(password)).length;

  if (!password) return { level: 0, key: "veryWeak", color: "bg-terrava-border" };
  if (passed <= 2) return { level: 1, key: "weak", color: "bg-terrava-error" };
  if (passed === 3) return { level: 2, key: "medium", color: "bg-terrava-warning" };
  if (passed === 4) return { level: 3, key: "strong", color: "bg-terrava-primary" };
  return { level: 4, key: "strong", color: "bg-terrava-primary" };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useLanguage();
  const strength = getStrength(password);

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              segment < strength.level ? strength.color : "bg-terrava-border"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs font-medium text-terrava-muted">
        {t("auth.passwordStrength")}{" "}
        <span className="font-semibold text-terrava-text">{t("auth.strength." + strength.key)}</span>
      </p>

      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {checklist.map((rule) => {
          const passed = rule.test(password);
          return (
            <li key={rule.id} className="flex items-center gap-1.5 text-xs">
              {passed ? (
                <Check className="h-3.5 w-3.5 text-terrava-primary" aria-hidden="true" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-terrava-border" aria-hidden="true" />
              )}
              <span className={passed ? "text-terrava-text" : "text-terrava-muted"}>{t("auth.rule." + rule.id)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
