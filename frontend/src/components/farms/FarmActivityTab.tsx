import { HeartPulse, Radio, Building2, Users, BellRing } from "lucide-react";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

const activity = [
  { id: "1", icon: BellRing, title: "Alert baru terdeteksi pada salah satu ternak", timestamp: "1 jam lalu" },
  { id: "2", icon: HeartPulse, title: "Pemeriksaan kesehatan rutin selesai", timestamp: "5 jam lalu" },
  { id: "3", icon: Radio, title: "Perangkat baru berhasil dipasangkan", timestamp: "1 hari lalu" },
  { id: "4", icon: Building2, title: "Kandang baru ditambahkan ke farm", timestamp: "4 hari lalu" },
  { id: "5", icon: Users, title: "Anggota tim baru bergabung", timestamp: "1 minggu lalu" },
];

export default function FarmActivityTab() {
  return (
    <div className="rounded-2xl border border-terrava-border bg-white p-5">
      <ActivityFeed items={activity} />
    </div>
  );
}
