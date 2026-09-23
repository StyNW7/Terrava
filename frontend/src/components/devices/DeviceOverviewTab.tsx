import type { Device } from "@/types/dashboard";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import { getFarmById } from "@/data/mockFarms";
import { getLivestockById } from "@/data/mockLivestock";
import { useLanguage } from "@/hooks/useLanguage";

export default function DeviceOverviewTab({ device }: { device: Device }) {
  const { lang, t, tRel } = useLanguage();
  const animal = device.assignedLivestockId ? getLivestockById(device.assignedLivestockId) : undefined;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("devices.metadata")}</h3>
        <DetailInfoRow label={t("devices.deviceId")} value={device.id} />
        <DetailInfoRow label={t("livestock.column.type")} value={t("deviceType." + device.type)} />
        <DetailInfoRow label={t("filter.farm")} value={getFarmById(device.farmId)?.name} />
        <DetailInfoRow label={t("devices.firmware")} value={device.firmware} />
        <DetailInfoRow
          label={t("devices.dataPackets")}
          value={device.dataPackets.toLocaleString(lang === "id" ? "id-ID" : "en-GB")}
        />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">{t("devices.assignmentPower")}</h3>
        <DetailInfoRow label={t("devices.column.assigned")} value={animal ? `${animal.name} (${animal.code})` : "-"} />
        <DetailInfoRow label={t("devices.connectivity")} value={`${device.signal}% ${t("devices.signal").toLowerCase()}`} />
        <DetailInfoRow label={t("devices.battery")} value={`${device.battery}%`} />
        <DetailInfoRow label={t("devices.uptime")} value={`${device.uptime}%`} />
        <DetailInfoRow label={t("devices.lastSync")} value={tRel(device.lastSync)} />
      </div>
    </div>
  );
}
