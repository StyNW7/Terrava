import {
  HeartPulse,
  BrainCircuit,
  BellRing,
  Database,
  Building2,
  Cloud,
  MapPinned,
  BarChart3,
} from "lucide-react";
import type { SolutionItem } from "@/types";
import { images } from "@/data/images";

export const solutions: SolutionItem[] = [
  {
    id: "health-monitoring",
    icon: HeartPulse,
    title: "Livestock Health Monitoring",
    problem:
      "Gejala penyakit pada ternak sering tidak terlihat sampai kondisinya sudah parah.",
    solution:
      "Smart ear tag Terrava merekam suhu tubuh, detak jantung, dan aktivitas ternak secara berkelanjutan sehingga perubahan kecil dapat langsung terpantau.",
    capabilities: [
      "Pemantauan suhu tubuh real-time",
      "Deteksi detak jantung dan pola aktivitas",
      "Riwayat data tersimpan otomatis",
    ],
    benefit: "Deteksi risiko kesehatan lebih awal sebelum gejala terlihat jelas.",
    image: images.dataDashboard,
  },
  {
    id: "anomaly-detection",
    icon: BrainCircuit,
    title: "AI Anomaly Detection",
    problem:
      "Peternak sulit membedakan variasi normal dan tanda awal penyakit hanya dari observasi manual.",
    solution:
      "AI Terrava membangun baseline perilaku setiap ternak dan mendeteksi anomali dari pola data historis secara otomatis.",
    capabilities: [
      "Baseline personalisasi per ekor ternak",
      "Deteksi pola abnormal secara otomatis",
      "Skor kesehatan yang mudah dipahami",
    ],
    benefit: "Keputusan yang lebih akurat dengan dukungan analisis berbasis data.",
    image: images.sensorTech,
  },
  {
    id: "smart-alert",
    icon: BellRing,
    title: "Smart Alert System",
    problem:
      "Respons yang lambat terhadap tanda-tanda risiko kesehatan meningkatkan potensi kerugian.",
    solution:
      "Sistem notifikasi cerdas mengirimkan peringatan dan rekomendasi tindakan langsung ke perangkat peternak.",
    capabilities: [
      "Notifikasi real-time ke web dan mobile",
      "Kategori alert berdasarkan tingkat urgensi",
      "Rekomendasi tindakan awal otomatis",
    ],
    benefit: "Tindakan pencegahan dapat diambil lebih cepat dan tepat sasaran.",
    image: images.farmerSmartphone,
  },
  {
    id: "livestock-profile",
    icon: Database,
    title: "Livestock Profile and Records",
    problem:
      "Data kesehatan ternak sering dicatat secara manual dan tidak konsisten antar peternak.",
    solution:
      "Setiap ternak memiliki profil digital lengkap dengan riwayat kesehatan, catatan tindakan, dan status perangkat.",
    capabilities: [
      "Profil digital per ekor ternak",
      "Riwayat kesehatan terpusat",
      "Catatan tindak lanjut veteriner",
    ],
    benefit: "Data yang konsisten dan mudah diakses oleh seluruh tim peternakan.",
    image: images.modernBarn,
  },
  {
    id: "farm-management",
    icon: Building2,
    title: "Farm and Herd Management",
    problem:
      "Mengelola banyak ternak dan kandang secara manual memakan waktu dan rawan human error.",
    solution:
      "Dashboard manajemen peternakan memungkinkan pengelompokan kandang, herd, dan tim kerja dalam satu tampilan terpusat.",
    capabilities: [
      "Manajemen multi-kandang dan multi-herd",
      "Penugasan tim dan peran pengguna",
      "Ringkasan operasional harian",
    ],
    benefit: "Operasional peternakan menjadi lebih terstruktur dan efisien.",
    image: images.cattleHerd,
  },
  {
    id: "environmental-monitoring",
    icon: Cloud,
    title: "Environmental Monitoring",
    problem:
      "Kondisi lingkungan kandang yang tidak terpantau dapat memicu stres dan risiko kesehatan ternak.",
    solution:
      "Sensor lingkungan memantau suhu dan kelembapan kandang secara berkelanjutan dan terhubung dengan dashboard.",
    capabilities: [
      "Pemantauan suhu dan kelembapan kandang",
      "Peringatan kondisi lingkungan ekstrem",
      "Riwayat data lingkungan historis",
    ],
    benefit: "Lingkungan kandang yang lebih terjaga untuk kenyamanan ternak.",
    image: images.farmLandscape,
  },
  {
    id: "location-tracking",
    icon: MapPinned,
    title: "Location and Geofence Tracking",
    problem:
      "Ternak yang lepas atau keluar dari area yang ditentukan sulit terlacak secara manual.",
    solution:
      "GPS pada smart ear tag memungkinkan pelacakan lokasi ternak secara real-time dengan pengaturan geofence.",
    capabilities: [
      "Pelacakan lokasi real-time",
      "Pengaturan batas area atau geofence",
      "Notifikasi saat ternak keluar area",
    ],
    benefit: "Pengawasan pergerakan ternak menjadi lebih aman dan terkendali.",
    image: images.farmLandscape,
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics and Decision Support",
    problem:
      "Peternak dan manajer kesulitan mengambil keputusan strategis tanpa insight yang terstruktur.",
    solution:
      "Dashboard analitik menyajikan tren kesehatan, produktivitas, dan status operasional dalam visualisasi yang mudah dipahami.",
    capabilities: [
      "Visualisasi tren kesehatan ternak",
      "Ringkasan performa peternakan",
      "Laporan yang dapat diekspor",
    ],
    benefit: "Keputusan berbasis data yang lebih cepat dan terukur.",
    image: images.dataDashboard,
  },
];
