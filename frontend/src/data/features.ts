import {
  Activity,
  BrainCircuit,
  BellRing,
  MapPin,
  Database,
  Cloud,
} from "lucide-react";
import type { FeatureItem } from "@/types";

export const coreFeatures: FeatureItem[] = [
  {
    id: "health-monitoring",
    icon: Activity,
    title: "Real-Time Health Monitoring",
    description:
      "Memantau suhu tubuh, detak jantung, dan aktivitas ternak secara berkelanjutan melalui smart ear tag.",
    href: "/solutions",
  },
  {
    id: "anomaly-detection",
    icon: BrainCircuit,
    title: "AI Anomaly Detection",
    description:
      "Model AI mempelajari pola normal setiap ternak untuk mendeteksi penyimpangan sejak dini.",
    href: "/solutions",
  },
  {
    id: "smart-alerts",
    icon: BellRing,
    title: "Smart Alerts and Recommendations",
    description:
      "Notifikasi otomatis dan rekomendasi tindakan awal dikirim langsung ke peternak saat risiko terdeteksi.",
    href: "/how-it-works",
  },
  {
    id: "location-tracking",
    icon: MapPin,
    title: "Livestock Location Tracking",
    description:
      "Pantau posisi ternak secara real-time dan atur batas area dengan geofence yang fleksibel.",
    href: "/smart-ear-tag",
  },
  {
    id: "health-records",
    icon: Database,
    title: "Historical Health Records",
    description:
      "Riwayat kesehatan setiap ternak tersimpan rapi dan mudah diakses kapan pun dibutuhkan.",
    href: "/solutions",
  },
  {
    id: "environmental-intelligence",
    icon: Cloud,
    title: "Environmental Intelligence",
    description:
      "Data suhu, kelembapan, dan kondisi kandang membantu peternak menjaga lingkungan yang optimal.",
    href: "/impact",
  },
];
