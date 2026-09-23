import { Link } from "react-router-dom";
import DeviceStatusBadge from "@/components/dashboard/DeviceStatusBadge";
import { devices } from "@/data/mockDevices";
import { useLanguage } from "@/hooks/useLanguage";

export default function OverviewDeviceIssuesPanel() {
  const { t, tRel } = useLanguage();
  const issues = devices.filter((device) => device.status === "offline" || device.status === "low-battery" || device.status === "maintenance").slice(0, 5);

  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-terrava-text">{t("overview.deviceIssues")}</h3>
        <Link to="/dashboard/devices" className="text-xs font-semibold text-terrava-primary">
          {t("common.viewAll")}
        </Link>
      </div>
      <ul className="space-y-1">
        {issues.map((device) => (
          <li key={device.id}>
            <Link to={`/dashboard/devices/${device.id}`} className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 hover:bg-terrava-bg">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-terrava-text">{device.name}</p>
                <p className="truncate text-xs text-terrava-muted">
                  {t("devices.battery")} {device.battery}% &middot; {t("devices.sync")} {tRel(device.lastSync)}
                </p>
              </div>
              <DeviceStatusBadge status={device.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
