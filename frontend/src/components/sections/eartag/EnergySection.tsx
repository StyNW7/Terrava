import { Moon, Clock, Send, Sun } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ChartCard from "@/components/charts/ChartCard";
import EnergyConsumptionChart from "@/components/charts/EnergyConsumptionChart";

const energyPoints = [
  { icon: Moon, label: "Deep sleep mode" },
  { icon: Clock, label: "Periodic sensing" },
  { icon: Send, label: "Daily transmission" },
  { icon: Sun, label: "Solar-assisted charging" },
];

export default function EnergySection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge="Energy Efficiency"
          title="Dirancang untuk daya tahan jangka panjang"
          description="Kombinasi mode hemat daya dan pengisian tambahan mendukung target masa pakai baterai yang panjang."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div className="grid grid-cols-2 gap-4">
            {energyPoints.map((point) => (
              <div key={point.label} className="rounded-2xl border border-terrava-border bg-terrava-bg p-5">
                <point.icon className="mb-3 h-5 w-5 text-terrava-primary" aria-hidden="true" />
                <p className="text-sm font-medium text-terrava-text">{point.label}</p>
              </div>
            ))}
          </div>

          <ChartCard
            title="Konsumsi Daya per Mode"
            description="Ilustrasi contoh konsumsi arus pada tiap mode operasi (mA)"
          >
            <EnergyConsumptionChart />
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
