import { CloudSun, Droplets, Wind, ThermometerSun } from "lucide-react";

const conditions = [
  { icon: ThermometerSun, label: "Suhu Lingkungan", value: "29°C" },
  { icon: Droplets, label: "Kelembapan", value: "64%" },
  { icon: Wind, label: "Kecepatan Angin", value: "12 km/h" },
  { icon: CloudSun, label: "Kondisi", value: "Berawan Sebagian" },
];

export default function OverviewWeatherPanel() {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-terrava-text">Weather and Environmental Summary</h3>
        <span className="rounded-full bg-terrava-light px-2.5 py-0.5 text-[11px] font-semibold text-terrava-primary">Prototype</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {conditions.map((condition) => (
          <div key={condition.label} className="rounded-xl bg-terrava-bg p-3.5">
            <condition.icon className="mb-2 h-5 w-5 text-terrava-primary" aria-hidden="true" />
            <p className="text-sm font-bold text-terrava-text">{condition.value}</p>
            <p className="text-xs text-terrava-muted">{condition.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
