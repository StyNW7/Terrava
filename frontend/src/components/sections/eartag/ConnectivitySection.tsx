import { Radio, BatteryLow, Map, Antenna, Home } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

const reasons = [
  { icon: Map, label: "Long-range communication" },
  { icon: BatteryLow, label: "Lower energy consumption" },
  { icon: Antenna, label: "Suitable for wide farms" },
  { icon: Radio, label: "Gateway-based connectivity" },
  { icon: Home, label: "Better for rural environments" },
];

export default function ConnectivitySection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Connectivity"
          title="Mengapa Terrava menggunakan LoRa"
          description="LoRa dipilih karena cocok untuk kondisi peternakan yang luas dan minim infrastruktur jaringan."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map((reason) => (
            <div
              key={reason.label}
              className="flex flex-col items-center rounded-2xl border border-terrava-border bg-white p-6 text-center shadow-card"
            >
              <reason.icon className="mb-3 h-6 w-6 text-terrava-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-terrava-text">{reason.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
