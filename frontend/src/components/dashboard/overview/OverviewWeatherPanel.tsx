import { CloudSun, Droplets, Wind, ThermometerSun } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const conditions = [
  { icon: ThermometerSun, key: "temperature", value: "29°C" },
  { icon: Droplets, key: "humidity", value: "64%" },
  { icon: Wind, key: "wind", value: "12 km/h" },
  { icon: CloudSun, key: "condition", valueKey: "partlyCloudy" },
];

export default function OverviewWeatherPanel() {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-terrava-text">{t("overview.weather")}</h3>
        <span className="rounded-full bg-terrava-light px-2.5 py-0.5 text-[11px] font-semibold text-terrava-primary">Prototype</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {conditions.map((condition) => (
          <div key={condition.key} className="rounded-xl bg-terrava-bg p-3.5">
            <condition.icon className="mb-2 h-5 w-5 text-terrava-primary" aria-hidden="true" />
            <p className="text-sm font-bold text-terrava-text">
              {condition.value ?? t("overview.weatherValue." + condition.valueKey)}
            </p>
            <p className="text-xs text-terrava-muted">{t("overview.weatherLabel." + condition.key)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
