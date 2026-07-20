import { Link } from "react-router-dom";
import type { Livestock } from "@/types/dashboard";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import DeviceStatusBadge from "@/components/dashboard/DeviceStatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";
import { getDeviceById } from "@/data/mockDevices";
import { Cpu } from "lucide-react";

export default function LivestockDeviceTab({ animal }: { animal: Livestock }) {
  const device = animal.deviceId ? getDeviceById(animal.deviceId) : undefined;

  if (!device) {
    return <EmptyState icon={Cpu} title="Belum ada perangkat" description="Ternak ini belum memiliki smart ear tag yang ditugaskan." />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-terrava-text">{device.name}</h3>
          <DeviceStatusBadge status={device.status} />
        </div>
        <DetailInfoRow label="Battery" value={`${device.battery}%`} />
        <DetailInfoRow label="Signal" value={`${device.signal}%`} />
        <DetailInfoRow label="Firmware" value={device.firmware} />
        <DetailInfoRow label="Last Sync" value={device.lastSync} />
        <DetailInfoRow label="Data Packets" value={device.dataPackets.toLocaleString("id-ID")} />
        <Link to={`/dashboard/devices/${device.id}`} className="mt-3 inline-block text-sm font-semibold text-terrava-primary">
          View device detail
        </Link>
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">Sensor Status</h3>
        <DetailInfoRow label="Temperature Sensor" value="Normal" />
        <DetailInfoRow label="Heart Rate Sensor" value="Normal" />
        <DetailInfoRow label="Accelerometer" value="Normal" />
        <DetailInfoRow label="GPS" value="Active" />
      </div>
    </div>
  );
}
