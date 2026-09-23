import { Moon, Clock, Send, Sun } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";
import ChartCard from "@/components/charts/ChartCard";
import EnergyConsumptionChart from "@/components/charts/EnergyConsumptionChart";
import { useLanguage } from "@/hooks/useLanguage";

const energyPoints = [
  { icon: Moon, key: "deepSleep" },
  { icon: Clock, key: "periodicSensing" },
  { icon: Send, key: "dailyTransmission" },
  { icon: Sun, key: "solarCharging" },
];

export default function EnergySection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          badge={t("eartag.energy.badge")}
          title={t("eartag.energy.title")}
          description={t("eartag.energy.description")}
        />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div className="grid grid-cols-2 gap-4">
            {energyPoints.map((point) => (
              <div key={point.key} className="rounded-2xl border border-terrava-border bg-terrava-bg p-5">
                <point.icon className="mb-3 h-5 w-5 text-terrava-primary" aria-hidden="true" />
                <p className="text-sm font-medium text-terrava-text">{t("eartag.energy.point." + point.key)}</p>
              </div>
            ))}
          </div>

          <ChartCard
            title={t("eartag.energy.chartTitle")}
            description={t("eartag.energy.chartDescription")}
          >
            <EnergyConsumptionChart />
          </ChartCard>
        </div>
      </div>
    </section>
  );
}
