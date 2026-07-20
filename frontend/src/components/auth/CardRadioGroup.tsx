interface CardRadioGroupProps {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  columns?: string;
}

export default function CardRadioGroup({
  name,
  options,
  value,
  onChange,
  error,
  columns = "grid-cols-2 sm:grid-cols-3",
}: CardRadioGroupProps) {
  return (
    <div>
      <div className={`grid gap-2.5 ${columns}`} role="radiogroup" aria-label={name}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors duration-150 ${
                isSelected
                  ? "border-terrava-primary bg-terrava-light text-terrava-primary"
                  : "border-terrava-border bg-white text-terrava-text hover:border-terrava-primary/40"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-terrava-error">
          {error}
        </p>
      )}
    </div>
  );
}
