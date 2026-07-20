import type { Farm } from "@/types/dashboard";
import DeviceStatusBadge from "@/components/dashboard/DeviceStatusBadge";
import { devices } from "@/data/mockDevices";

export default function FarmDevicesTab({ farm }: { farm: Farm }) {
  const farmDevices = devices.filter((device) => device.farmId === farm.id);
  const gateways = farmDevices.filter((d) => d.type === "gateway");
  const earTags = farmDevices.filter((d) => d.type === "ear-tag");
  const sensors = farmDevices.filter((d) => d.type === "environmental-sensor");

  const groups = [
    { label: "Gateway", items: gateways },
    { label: "Ear Tags", items: earTags },
    { label: "Environmental Sensors", items: sensors },
  ];

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label} className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-terrava-text">{group.label}</h3>
          {group.items.length === 0 ? (
            <p className="text-sm text-terrava-muted">Tidak ada perangkat pada kategori ini.</p>
          ) : (
            <ul className="space-y-2">
              {group.items.map((device) => (
                <li key={device.id} className="flex items-center justify-between rounded-xl bg-terrava-bg px-3.5 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-terrava-text">{device.name}</p>
                    <p className="text-xs text-terrava-muted">Signal {device.signal}% &middot; Uptime {device.uptime}%</p>
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
