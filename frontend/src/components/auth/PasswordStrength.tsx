import { Check, Circle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

const checklist = [
  { id: "length", label: "8+ characters", test: (value: string) => value.length >= 8 },
  { id: "uppercase", label: "Uppercase", test: (value: string) => /[A-Z]/.test(value) },
  { id: "lowercase", label: "Lowercase", test: (value: string) => /[a-z]/.test(value) },
  { id: "number", label: "Number", test: (value: string) => /[0-9]/.test(value) },
  { id: "symbol", label: "Symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

function getStrength(password: string) {
  const passed = checklist.filter((rule) => rule.test(password)).length;

  if (!password) return { level: 0, label: "Very Weak", color: "bg-terrava-border" };
  if (passed <= 2) return { level: 1, label: "Weak", color: "bg-terrava-error" };
  if (passed === 3 || passed === 4) return { level: passed === 3 ? 2 : 3, label: passed === 3 ? "Medium" : "Strong", color: passed === 3 ? "bg-terrava-warning" : "bg-terrava-primary" };
  return { level: 4, label: "Strong", color: "bg-terrava-primary" };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
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
        Password strength: <span className="font-semibold text-terrava-text">{strength.label}</span>
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
              <span className={passed ? "text-terrava-text" : "text-terrava-muted"}>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
