import { BellRing, Cpu, MapPinned, Stethoscope, UserRound } from "lucide-react";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

const activity = [
  { id: "1", icon: BellRing, title: "Alert baru terdeteksi pada Sora (TRV-005)", timestamp: "12 menit lalu" },
  { id: "2", icon: Stethoscope, title: "Pemeriksaan kesehatan selesai untuk Bella", timestamp: "45 menit lalu", actor: "drh. Andi Wirawan" },
  { id: "3", icon: Cpu, title: "Perangkat DEV-014 kembali online", timestamp: "1 jam lalu" },
  { id: "4", icon: MapPinned, title: "Bima keluar dari batas geofence Barn A", timestamp: "2 jam lalu" },
  { id: "5", icon: UserRound, title: "Reza Aditama menyelesaikan 3 tugas", timestamp: "3 jam lalu" },
];

export default function OverviewActivityPanel() {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-terrava-text">Recent Activity</h3>
      <ActivityFeed items={activity} />
    </div>
  );
}
