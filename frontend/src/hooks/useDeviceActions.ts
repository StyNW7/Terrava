import { useCallback } from "react";
import toast from "react-hot-toast";
import { useDataStore } from "@/hooks/useDataStore";
import { useLanguage } from "@/hooks/useLanguage";
import type { Device, DeviceEvent } from "@/types/dashboard";

const event = (type: DeviceEvent["type"], message: DeviceEvent["message"]): DeviceEvent => ({
  id: `EVT-${Date.now()}-${Math.round(Math.random() * 1000)}`,
  type,
  message,
  at: new Date().toISOString(),
});

/** Device operations shared by the device list and detail pages. */
export function useDeviceActions() {
  const { mutateDevice, assignDevice } = useDataStore();
  const { t } = useLanguage();

  const restart = useCallback(
    (device: Device) => {
      const toastId = toast.loading(t("devices.toast.restarting", { name: device.name }));
      setTimeout(() => {
        // A restart cannot revive a flat battery.
        const recovered = device.battery >= 5;
        mutateDevice(device.id, (current) => ({
          status: recovered ? (current.battery < 20 ? "low-battery" : "online") : "offline",
          lastSync: recovered ? "Just now" : current.lastSync,
          signal: recovered ? Math.max(current.signal, 55) : current.signal,
          events: [
            recovered
              ? event("connected", { id: "Perangkat dimulai ulang dan terhubung kembali.", en: "Device restarted and reconnected." })
              : event("offline", { id: "Restart gagal: baterai terlalu lemah.", en: "Restart failed: battery too low." }),
            ...(current.events ?? []),
          ],
        }));
        if (recovered) toast.success(t("devices.toast.restartedName", { name: device.name }), { id: toastId });
        else toast.error(t("devices.toast.restartFailed", { name: device.name }), { id: toastId });
      }, 1600);
    },
    [mutateDevice, t]
  );

  const toggleMaintenance = useCallback(
    (device: Device) => {
      const entering = device.status !== "maintenance";
      mutateDevice(device.id, (current) => ({
        status: entering ? "maintenance" : current.battery < 20 ? "low-battery" : "online",
        events: [
          entering
            ? event("warning", { id: "Perangkat ditandai untuk perawatan.", en: "Device marked for maintenance." })
            : event("connected", { id: "Perangkat kembali beroperasi.", en: "Device returned to service." }),
          ...(current.events ?? []),
        ],
      }));
      toast.success(entering ? t("devices.toast.maintenance") : t("devices.toast.backInService", { name: device.name }));
    },
    [mutateDevice, t]
  );

  const logDiagnostics = useCallback(
    (device: Device, passed: boolean) =>
      mutateDevice(device.id, (current) => ({
        events: [
          passed
            ? event("data-sent", { id: "Diagnostik selesai: semua pemeriksaan lolos.", en: "Diagnostics finished: all checks passed." })
            : event("warning", { id: "Diagnostik selesai dengan peringatan.", en: "Diagnostics finished with warnings." }),
          ...(current.events ?? []),
        ],
      })),
    [mutateDevice]
  );

  const markServiced = useCallback(
    (device: Device, note: string, by: string) => {
      mutateDevice(device.id, (current) => ({
        status: current.status === "maintenance" ? "online" : current.status,
        maintenanceLog: [{ id: `MNT-${Date.now()}`, note: note || "-", by, at: new Date().toISOString() }, ...(current.maintenanceLog ?? [])],
        events: [event("firmware-updated", { id: "Perawatan perangkat dicatat.", en: "Device service recorded." }), ...(current.events ?? [])],
      }));
      toast.success(t("devices.toast.serviced"));
    },
    [mutateDevice, t]
  );

  const unassign = useCallback(
    (device: Device) => {
      if (!device.assignedLivestockId) return;
      assignDevice(device.assignedLivestockId, null);
      toast.success(t("devices.toast.unassigned"));
    },
    [assignDevice, t]
  );

  return { restart, toggleMaintenance, logDiagnostics, markServiced, unassign };
}
