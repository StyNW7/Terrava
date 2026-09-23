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
    description: {
      id: "Memantau suhu tubuh, detak jantung, dan aktivitas ternak secara berkelanjutan melalui smart ear tag.",
      en: "Continuously track body temperature, heart rate, and activity through the smart ear tag.",
    },
    href: "/solutions",
  },
  {
    id: "anomaly-detection",
    icon: BrainCircuit,
    title: "AI Anomaly Detection",
    description: {
      id: "Model AI mempelajari pola normal setiap ternak untuk mendeteksi penyimpangan sejak dini.",
      en: "AI models learn each animal's normal pattern so deviations surface at the earliest stage.",
    },
    href: "/solutions",
  },
  {
    id: "smart-alerts",
    icon: BellRing,
    title: "Smart Alerts and Recommendations",
    description: {
      id: "Notifikasi otomatis dan rekomendasi tindakan awal dikirim langsung ke peternak saat risiko terdeteksi.",
      en: "Automatic notifications and first-response recommendations reach the farmer the moment a risk is detected.",
    },
    href: "/how-it-works",
  },
  {
    id: "location-tracking",
    icon: MapPin,
    title: "Livestock Location Tracking",
    description: {
      id: "Pantau posisi ternak secara real-time dan atur batas area dengan geofence yang fleksibel.",
      en: "Follow livestock positions in real time and set flexible geofence boundaries.",
    },
    href: "/smart-ear-tag",
  },
  {
    id: "health-records",
    icon: Database,
    title: "Historical Health Records",
    description: {
      id: "Riwayat kesehatan setiap ternak tersimpan rapi dan mudah diakses kapan pun dibutuhkan.",
      en: "Every animal's health history is stored neatly and available whenever it is needed.",
    },
    href: "/solutions",
  },
  {
    id: "environmental-intelligence",
    icon: Cloud,
    title: "Environmental Intelligence",
    description: {
      id: "Data suhu, kelembapan, dan kondisi kandang membantu peternak menjaga lingkungan yang optimal.",
      en: "Temperature, humidity, and barn condition data help farmers maintain an optimal environment.",
    },
    href: "/impact",
  },
];
