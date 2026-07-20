import type { Device } from "@/types/dashboard";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";
import { getFarmById } from "@/data/mockFarms";
import { getLivestockById } from "@/data/mockLivestock";

export default function DeviceOverviewTab({ device }: { device: Device }) {
  const animal = device.assignedLivestockId ? getLivestockById(device.assignedLivestockId) : undefined;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">Device Metadata</h3>
        <DetailInfoRow label="Device ID" value={device.id} />
        <DetailInfoRow label="Type" value={<span className="capitalize">{device.type.replace("-", " ")}</span>} />
        <DetailInfoRow label="Farm" value={getFarmById(device.farmId)?.name} />
        <DetailInfoRow label="Firmware" value={device.firmware} />
        <DetailInfoRow label="Data Packets" value={device.dataPackets.toLocaleString("id-ID")} />
      </div>

      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">Assignment and Power</h3>
        <DetailInfoRow label="Assigned Livestock" value={animal ? `${animal.name} (${animal.code})` : "-"} />
        <DetailInfoRow label="Connectivity" value={`${device.signal}% signal`} />
        <DetailInfoRow label="Battery" value={`${device.battery}%`} />
        <DetailInfoRow label="Uptime" value={`${device.uptime}%`} />
        <DetailInfoRow label="Last Sync" value={device.lastSync} />
      </div>
    </div>
  );
}
