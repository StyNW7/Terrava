import type { Farm } from "@/types/dashboard";
import DeviceStatusBadge from "@/components/dashboard/DeviceStatusBadge";
import { useLanguage } from "@/hooks/useLanguage";
import { useDataStore } from "@/hooks/useDataStore";

export default function FarmDevicesTab({ farm }: { farm: Farm }) {
  const { devices } = useDataStore();
  const { t } = useLanguage();
  const farmDevices = devices.filter((device) => device.farmId === farm.id);
  const gateways = farmDevices.filter((d) => d.type === "gateway");
  const earTags = farmDevices.filter((d) => d.type === "ear-tag");
  const sensors = farmDevices.filter((d) => d.type === "environmental-sensor");

  const groups = [
    { key: "gateway", label: t("deviceType.gateway"), items: gateways },
    { key: "ear-tag", label: t("devices.tab.ear-tag"), items: earTags },
    { key: "environmental-sensor", label: t("devices.tab.environmental-sensor"), items: sensors },
  ];

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.key} className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-terrava-text">{group.label}</h3>
          {group.items.length === 0 ? (
            <p className="text-sm text-terrava-muted">{t("farms.noDevicesInCategory")}</p>
          ) : (
            <ul className="space-y-2">
              {group.items.map((device) => (
                <li key={device.id} className="flex items-center justify-between rounded-xl bg-terrava-bg px-3.5 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-terrava-text">{device.name}</p>
                    <p className="text-xs text-terrava-muted">
                      {t("devices.signal")} {device.signal}% &middot; {t("devices.uptime")} {device.uptime}%
                    </p>
                  </div>
                  <DeviceStatusBadge status={device.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
