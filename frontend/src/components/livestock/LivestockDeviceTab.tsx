import { Link } from "react-router-dom";
import type { Livestock } from "@/types/dashboard";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import DeviceStatusBadge from "@/components/dashboard/DeviceStatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { Cpu } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";

export default function LivestockDeviceTab({ animal }: { animal: Livestock }) {
  const { getDeviceById } = useDataStore();
  const { lang, t, tRel } = useLanguage();
  const device = animal.deviceId ? getDeviceById(animal.deviceId) : undefined;

  if (!device) {
    return <EmptyState icon={Cpu} title={t("livestock.noDeviceTitle")} description={t("livestock.noDeviceDescription")} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-terrava-text">{device.name}</h3>
          <DeviceStatusBadge status={device.status} />
        </div>
        <DetailInfoRow label={t("devices.battery")} value={`${device.battery}%`} />
        <DetailInfoRow label={t("devices.signal")} value={`${device.signal}%`} />
        <DetailInfoRow label={t("devices.firmware")} value={device.firmware} />
        <DetailInfoRow label={t("devices.lastSync")} value={tRel(device.lastSync)} />
        <DetailInfoRow
          label={t("devices.dataPackets")}
          value={device.dataPackets.toLocaleString(lang === "id" ? "id-ID" : "en-GB")}
        />
        <Link to={`/dashboard/devices/${device.id}`} className="mt-3 inline-block text-sm font-semibold text-terrava-primary">
          {t("devices.viewDetail")}
        </Link>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("devices.sensorStatus")}</h3>
        <DetailInfoRow label={t("devices.sensor.temperature")} value={t("home.hero.normal")} />
        <DetailInfoRow label={t("devices.sensor.heartRate")} value={t("home.hero.normal")} />
        <DetailInfoRow label={t("devices.sensor.accelerometer")} value={t("home.hero.normal")} />
        <DetailInfoRow label="GPS" value={t("status.active")} />
      </div>
    </div>
  );
}
