import { useState } from "react";
import toast from "react-hot-toast";
import { Wrench } from "lucide-react";
import type { Device } from "@/types/dashboard";
import Timeline from "@/components/dashboard/Timeline";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import { useLanguage } from "@/hooks/useLanguage";

export default function DeviceMaintenanceTab({ device }: { device: Device }) {
  const { t, tRel } = useLanguage();
  const [notes, setNotes] = useState("");

  const history = [
    { id: "1", label: t("devices.maintenance.periodicCheck"), timestamp: tRel("2 months ago"), icon: Wrench },
    { id: "2", label: t("devices.maintenance.batteryReplaced"), timestamp: tRel("5 months ago"), icon: Wrench },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("devices.maintenance.history")}</h3>
        <Timeline items={history} />
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <DetailInfoRow label={t("devices.maintenance.nextInspection")} value={t("devices.maintenance.inDays", { count: 30 })} />
          <DetailInfoRow label={t("devices.column.device")} value={device.name} />
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-terrava-text">{t("alerts.notes")}</h3>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder={t("devices.maintenance.notePlaceholder")}
            className="w-full rounded-xl border border-terrava-border px-3.5 py-2.5 text-sm focus:border-terrava-primary focus:outline-none"
          />
          <button
            onClick={() => {
              toast.success(t("devices.toast.serviced"));
              setNotes("");
            }}
            className="mt-3 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
          >
            {t("devices.maintenance.markServiced")}
          </button>
        </div>
      </div>
    </div>
  );
}
