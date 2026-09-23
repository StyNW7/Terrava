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
    problem: {
      id: "Gejala penyakit pada ternak sering tidak terlihat sampai kondisinya sudah parah.",
      en: "Signs of illness in livestock often go unnoticed until the condition has already become severe.",
    },
    solution: {
      id: "Smart ear tag Terrava merekam suhu tubuh, detak jantung, dan aktivitas ternak secara berkelanjutan sehingga perubahan kecil dapat langsung terpantau.",
      en: "The Terrava smart ear tag continuously records body temperature, heart rate, and activity, so even the smallest changes are picked up right away.",
    },
    capabilities: {
      id: [
        "Pemantauan suhu tubuh real-time",
        "Deteksi detak jantung dan pola aktivitas",
        "Riwayat data tersimpan otomatis",
      ],
      en: [
        "Real-time body temperature monitoring",
        "Heart rate and activity pattern detection",
        "Automatically archived data history",
      ],
    },
    benefit: {
      id: "Deteksi risiko kesehatan lebih awal sebelum gejala terlihat jelas.",
      en: "Detect health risks earlier, before symptoms become visible.",
    },
    image: "Images/mockup/mockup-2.png",
  },
  {
    id: "anomaly-detection",
    icon: BrainCircuit,
    title: "AI Anomaly Detection",
    problem: {
      id: "Peternak sulit membedakan variasi normal dan tanda awal penyakit hanya dari observasi manual.",
      en: "Manual observation alone makes it hard for farmers to tell normal variation apart from the earliest signs of disease.",
    },
    solution: {
      id: "AI Terrava membangun baseline perilaku setiap ternak dan mendeteksi anomali dari pola data historis secara otomatis.",
      en: "Terrava AI builds a behavioural baseline for every animal and automatically flags anomalies against its historical data patterns.",
    },
    capabilities: {
      id: [
        "Baseline personalisasi per ekor ternak",
        "Deteksi pola abnormal secara otomatis",
        "Skor kesehatan yang mudah dipahami",
      ],
      en: [
        "A personalised baseline for every animal",
        "Automatic detection of abnormal patterns",
        "Health scores that are easy to interpret",
      ],
    },
    benefit: {
      id: "Keputusan yang lebih akurat dengan dukungan analisis berbasis data.",
      en: "More accurate decisions, supported by data-driven analysis.",
    },
    image: images.sensorTech,
  },
  {
    id: "smart-alert",
    icon: BellRing,
    title: "Smart Alert System",
    problem: {
      id: "Respons yang lambat terhadap tanda-tanda risiko kesehatan meningkatkan potensi kerugian.",
      en: "A slow response to early health warnings drives potential losses higher.",
    },
    solution: {
      id: "Sistem notifikasi cerdas mengirimkan peringatan dan rekomendasi tindakan langsung ke perangkat peternak.",
      en: "An intelligent notification system delivers alerts and recommended actions straight to the farmer device.",
    },
    capabilities: {
      id: [
        "Notifikasi real-time ke web dan mobile",
        "Kategori alert berdasarkan tingkat urgensi",
        "Rekomendasi tindakan awal otomatis",
      ],
      en: [
        "Real-time notifications on web and mobile",
        "Alerts categorised by urgency level",
        "Automatic first-response recommendations",
      ],
    },
    benefit: {
      id: "Tindakan pencegahan dapat diambil lebih cepat dan tepat sasaran.",
      en: "Preventive action can be taken faster and aimed where it matters most.",
    },
    image: images.farmerSmartphone,
  },
  {
    id: "livestock-profile",
    icon: Database,
    title: "Livestock Profile and Records",
    problem: {
      id: "Data kesehatan ternak sering dicatat secara manual dan tidak konsisten antar peternak.",
      en: "Livestock health data is often recorded by hand and stays inconsistent from one farm to the next.",
    },
    solution: {
      id: "Setiap ternak memiliki profil digital lengkap dengan riwayat kesehatan, catatan tindakan, dan status perangkat.",
      en: "Every animal has a complete digital profile covering its health history, treatment notes, and device status.",
    },
    capabilities: {
      id: [
        "Profil digital per ekor ternak",
        "Riwayat kesehatan terpusat",
        "Catatan tindak lanjut veteriner",
      ],
      en: [
        "A digital profile for every animal",
        "Centralised health history",
        "Veterinary follow-up records",
      ],
    },
    benefit: {
      id: "Data yang konsisten dan mudah diakses oleh seluruh tim peternakan.",
      en: "Consistent data that the entire farm team can access easily.",
    },
    image: images.modernBarn,
  },
  {
    id: "farm-management",
    icon: Building2,
    title: "Farm and Herd Management",
    problem: {
      id: "Mengelola banyak ternak dan kandang secara manual memakan waktu dan rawan human error.",
      en: "Managing many animals and barns manually is time-consuming and prone to human error.",
    },
    solution: {
      id: "Dashboard manajemen peternakan memungkinkan pengelompokan kandang, herd, dan tim kerja dalam satu tampilan terpusat.",
      en: "The farm management dashboard organises barns, herds, and work teams in a single centralised view.",
    },
    capabilities: {
      id: [
        "Manajemen multi-kandang dan multi-herd",
        "Penugasan tim dan peran pengguna",
        "Ringkasan operasional harian",
      ],
      en: [
        "Multi-barn and multi-herd management",
        "Team assignment and user roles",
        "A daily operational summary",
      ],
    },
    benefit: {
      id: "Operasional peternakan menjadi lebih terstruktur dan efisien.",
      en: "Farm operations become more structured and more efficient.",
    },
    image: images.cattleHerd,
  },
  {
    id: "environmental-monitoring",
    icon: Cloud,
    title: "Environmental Monitoring",
    problem: {
      id: "Kondisi lingkungan kandang yang tidak terpantau dapat memicu stres dan risiko kesehatan ternak.",
      en: "Unmonitored barn conditions can trigger stress and raise health risks across the herd.",
    },
    solution: {
      id: "Sensor lingkungan memantau suhu dan kelembapan kandang secara berkelanjutan dan terhubung dengan dashboard.",
      en: "Environmental sensors track barn temperature and humidity continuously and feed directly into the dashboard.",
    },
    capabilities: {
      id: [
        "Pemantauan suhu dan kelembapan kandang",
        "Peringatan kondisi lingkungan ekstrem",
        "Riwayat data lingkungan historis",
      ],
      en: [
        "Barn temperature and humidity monitoring",
        "Alerts for extreme environmental conditions",
        "Historical environmental records",
      ],
    },
    benefit: {
      id: "Lingkungan kandang yang lebih terjaga untuk kenyamanan ternak.",
      en: "Better-maintained barn conditions and more comfortable livestock.",
    },
    image: images.farmLandscape,
  },
  {
    id: "location-tracking",
    icon: MapPinned,
    title: "Location and Geofence Tracking",
    problem: {
      id: "Ternak yang lepas atau keluar dari area yang ditentukan sulit terlacak secara manual.",
      en: "Animals that stray beyond their designated area are difficult to locate manually.",
    },
    solution: {
      id: "GPS pada smart ear tag memungkinkan pelacakan lokasi ternak secara real-time dengan pengaturan geofence.",
      en: "GPS in the smart ear tag enables real-time location tracking with configurable geofences.",
    },
    capabilities: {
      id: [
        "Pelacakan lokasi real-time",
        "Pengaturan batas area atau geofence",
        "Notifikasi saat ternak keluar area",
      ],
      en: [
        "Real-time location tracking",
        "Configurable area boundaries or geofences",
        "Alerts when an animal leaves its zone",
      ],
    },
    benefit: {
      id: "Pengawasan pergerakan ternak menjadi lebih aman dan terkendali.",
      en: "Herd movement stays safer and fully under control.",
    },
    image: images.farmLandscape,
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics and Decision Support",
    problem: {
      id: "Peternak dan manajer kesulitan mengambil keputusan strategis tanpa insight yang terstruktur.",
      en: "Without structured insight, farmers and managers struggle to make strategic decisions.",
    },
    solution: {
      id: "Dashboard analitik menyajikan tren kesehatan, produktivitas, dan status operasional dalam visualisasi yang mudah dipahami.",
      en: "The analytics dashboard presents health, productivity, and operational trends in visuals anyone can read.",
    },
    capabilities: {
      id: [
        "Visualisasi tren kesehatan ternak",
        "Ringkasan performa peternakan",
        "Laporan yang dapat diekspor",
      ],
      en: [
        "Livestock health trend visualisation",
        "Farm performance summaries",
        "Exportable reports",
      ],
    },
    benefit: {
      id: "Keputusan berbasis data yang lebih cepat dan terukur.",
      en: "Faster, more measurable decisions grounded in data.",
    },
    image: "Images/mockup/mockup-1.png",
  },
];
