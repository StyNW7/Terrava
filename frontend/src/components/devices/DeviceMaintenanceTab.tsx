import { useState } from "react";
import toast from "react-hot-toast";
import { Wrench } from "lucide-react";
import type { Device } from "@/types/dashboard";
import Timeline from "@/components/dashboard/Timeline";
import DetailInfoRow from "@/components/dashboard/DetailInfoRow";

export default function DeviceMaintenanceTab({ device }: { device: Device }) {
  const [notes, setNotes] = useState("");

  const history = [
    { id: "1", label: "Pemeriksaan berkala perangkat", timestamp: "2 bulan lalu", icon: Wrench },
    { id: "2", label: "Penggantian baterai", timestamp: "5 bulan lalu", icon: Wrench },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-terrava-border bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-terrava-text">Maintenance History</h3>
        <Timeline items={history} />
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <DetailInfoRow label="Next Inspection" value="30 hari lagi" />
          <DetailInfoRow label="Device" value={device.name} />
        </div>

        <div className="rounded-2xl border border-terrava-border bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-terrava-text">Notes</h3>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Tulis catatan maintenance..."
            className="w-full rounded-xl border border-terrava-border px-3.5 py-2.5 text-sm focus:border-terrava-primary focus:outline-none"
          />
          <button
            onClick={() => {
              toast.success("Perangkat berhasil ditandai sebagai sudah diservis.");
              setNotes("");
            }}
            className="mt-3 rounded-xl bg-terrava-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-terrava-hover"
          >
            Mark as Serviced
          </button>
        </div>
      </div>
    </div>
  );
}
