import type { Dictionary } from "@/i18n/types";

/** Home page sections plus the shared marketing blocks (FAQ, SDG, solutions). */
export const landing: Dictionary = {
  // --- Hero ----------------------------------------------------------------
  "home.hero.badge": {
    id: "AI-Powered Smart Livestock Ecosystem",
    en: "AI-Powered Smart Livestock Ecosystem",
  },
  "home.hero.titleLead": { id: "Rawat Lebih Awal.", en: "Care Earlier." },
  "home.hero.titleAccent": { id: "Kelola Lebih Cerdas.", en: "Manage Smarter." },
  "home.hero.titleTail": { id: "Tumbuh Lebih Berkelanjutan.", en: "Grow More Sustainably." },
  "home.hero.description": {
    id: "Terrava menghubungkan smart ear tag, IoT, cloud, dan artificial intelligence untuk membantu peternak memantau kesehatan ternak, mendeteksi risiko lebih awal, dan mengambil keputusan berbasis data.",
    en: "Terrava connects smart ear tags, IoT, the cloud, and artificial intelligence so farmers can monitor herd health, detect risks earlier, and make decisions grounded in data.",
  },
  "home.hero.primaryCta": { id: "Coba Dashboard Demo", en: "Try the Demo Dashboard" },
  "home.hero.secondaryCta": { id: "Lihat Cara Kerja", en: "See How It Works" },
  "home.hero.trust.monitoring": { id: "Real-time monitoring", en: "Real-time monitoring" },
  "home.hero.trust.anomaly": { id: "AI anomaly detection", en: "AI anomaly detection" },
  "home.hero.trust.connectivity": { id: "Long-range connectivity", en: "Long-range connectivity" },
  "home.hero.imageAlt": {
    id: "Peternakan modern dengan sapi yang dipantau menggunakan teknologi Terrava",
    en: "A modern farm with cattle monitored using Terrava technology",
  },
  "home.hero.tagsConnected": { id: "{count} ear tag terhubung", en: "{count} ear tags connected" },
  "home.hero.gatewayStatus": { id: "Gateway LoRa · sinyal kuat", en: "LoRa gateway · strong signal" },
  "home.hero.healthScore": { id: "Livestock Health Score", en: "Livestock Health Score" },
  "home.hero.temperature": { id: "Suhu", en: "Temperature" },
  "home.hero.normal": { id: "Normal", en: "Normal" },
  "home.hero.deviceConnected": { id: "Perangkat terhubung", en: "Device connected" },
  "home.hero.noCriticalAlerts": { id: "Tidak ada alert kritis", en: "No critical alerts" },

  // --- Problem -------------------------------------------------------------
  "home.problem.badge": { id: "Tantangan Peternak", en: "The Challenge" },
  "home.problem.description": {
    id: "Empat masalah yang paling sering membuat peternak kehilangan waktu, tenaga, dan pendapatan.",
    en: "Four problems that most often cost farmers their time, energy, and income.",
  },
  "home.problem.title": {
    id: "Peternakan tidak seharusnya bergantung pada keterlambatan dan perkiraan.",
    en: "Livestock farming should not have to rely on delay and guesswork.",
  },
  "home.problem.lateDetection.title": {
    id: "Gejala penyakit sering terlambat terdeteksi",
    en: "Disease symptoms are detected too late",
  },
  "home.problem.lateDetection.description": {
    id: "Perubahan kondisi ternak baru diketahui setelah gejala terlihat jelas secara fisik.",
    en: "Changes in an animal's condition are only noticed once symptoms are physically obvious.",
  },
  "home.problem.manualMonitoring.title": {
    id: "Monitoring manual memakan waktu dan tenaga",
    en: "Manual monitoring costs time and effort",
  },
  "home.problem.manualMonitoring.description": {
    id: "Pemeriksaan satu per satu ternak membutuhkan waktu yang panjang dan tenaga besar.",
    en: "Checking animals one by one takes hours and a great deal of labour.",
  },
  "home.problem.inconsistentRecords.title": {
    id: "Data kesehatan ternak tidak tercatat konsisten",
    en: "Health data is recorded inconsistently",
  },
  "home.problem.inconsistentRecords.description": {
    id: "Catatan kesehatan sering tersebar dan tidak terdokumentasi secara rapi.",
    en: "Health records are scattered and rarely documented in an organised way.",
  },
  "home.problem.slowResponse.title": {
    id: "Risiko kerugian meningkat karena respons yang lambat",
    en: "Slow response drives losses higher",
  },
  "home.problem.slowResponse.description": {
    id: "Keterlambatan penanganan berdampak pada produktivitas dan kerugian ekonomi peternak.",
    en: "Delayed treatment hits productivity and leaves farmers out of pocket.",
  },
  "home.problem.imageAlt": {
    id: "Peternak memeriksa kondisi sapi secara manual",
    en: "A farmer checking cattle condition by hand",
  },

  // --- Solution flow -------------------------------------------------------
  "home.flow.title": {
    id: "Dari data ternak menjadi tindakan yang lebih tepat.",
    en: "From livestock data to better-targeted action.",
  },
  "home.flow.badge": { id: "Cara Kerja", en: "How It Works" },
  "home.flow.description": {
    id: "Enam langkah otomatis yang mengubah sinyal dari setiap ternak menjadi keputusan yang bisa langsung diambil.",
    en: "Six automated steps that turn signals from every animal into decisions you can act on right away.",
  },
  "home.flow.step.earTag.title": { id: "Smart Ear Tag", en: "Smart Ear Tag" },
  "home.flow.step.earTag.desc": { id: "Merekam suhu, aktivitas, dan lokasi ternak.", en: "Records temperature, activity, and location." },
  "home.flow.step.gateway.title": { id: "LoRa Gateway", en: "LoRa Gateway" },
  "home.flow.step.gateway.desc": { id: "Mengirim data jarak jauh dengan hemat daya.", en: "Relays data over long range on little power." },
  "home.flow.step.cloud.title": { id: "Cloud", en: "Cloud" },
  "home.flow.step.cloud.desc": { id: "Menyimpan dan menyinkronkan data secara aman.", en: "Stores and syncs data securely." },
  "home.flow.step.ai.title": { id: "Analisis AI", en: "AI Analysis" },
  "home.flow.step.ai.desc": { id: "Mendeteksi anomali sebelum gejala terlihat.", en: "Flags anomalies before symptoms show." },
  "home.flow.step.dashboard.title": { id: "Dashboard & Alert", en: "Dashboard & Alerts" },
  "home.flow.step.dashboard.desc": { id: "Menyajikan kondisi ternak dan peringatan dini.", en: "Surfaces herd status and early warnings." },
  "home.flow.step.action.title": { id: "Tindakan Peternak", en: "Farmer Action" },
  "home.flow.step.action.desc": { id: "Peternak merespons cepat dengan rekomendasi jelas.", en: "Farmers respond fast with clear guidance." },

  // --- Core features -------------------------------------------------------
  "home.features.badge": { id: "Core Features", en: "Core Features" },
  "home.features.title": {
    id: "Semua yang dibutuhkan untuk peternakan yang lebih cerdas",
    en: "Everything a smarter farm needs",
  },
  "home.features.description": {
    id: "Enam pilar utama Terrava yang bekerja bersama untuk menjaga kesehatan dan produktivitas ternak Anda.",
    en: "Six core Terrava capabilities that work together to protect the health and productivity of your herd.",
  },

  // --- Ear tag highlight ---------------------------------------------------
  "home.earTag.imageAlt": {
    id: "Close-up smart ear tag pada sapi",
    en: "Close-up of a smart ear tag fitted to a cow",
  },
  "home.earTag.title": {
    id: "Teknologi ringan yang menjaga setiap detak, gerakan, dan lokasi ternak",
    en: "Lightweight technology that tracks every heartbeat, movement, and location",
  },
  "home.earTag.description": {
    id: "Smart ear tag Terrava dirancang hemat energi untuk mengumpulkan data fisiologis, aktivitas, dan lokasi ternak tanpa mengganggu kenyamanan hewan.",
    en: "The Terrava smart ear tag is engineered for low power draw, gathering physiological, activity, and location data without disturbing the animal.",
  },
  "home.earTag.cta": { id: "Discover Smart Ear Tag", en: "Discover Smart Ear Tag" },
  "home.earTag.highlight.lightweight": { id: "Desain ringan", en: "Lightweight design" },
  "home.earTag.highlight.sensors": { id: "Sensor fisiologis", en: "Physiological sensors" },
  "home.earTag.highlight.gps": { id: "GPS", en: "GPS" },
  "home.earTag.highlight.lowPower": { id: "Sistem hemat daya", en: "Low-power system" },
  "home.earTag.highlight.lora": { id: "Konektivitas LoRa", en: "LoRa connectivity" },
  "home.earTag.highlight.solar": { id: "Dukungan solar charging", en: "Solar charging support" },

  // --- Dashboard preview ---------------------------------------------------
  "home.preview.badge": { id: "Dashboard Preview", en: "Dashboard Preview" },
  "home.preview.title": {
    id: "Satu dashboard untuk seluruh kondisi peternakan Anda",
    en: "One dashboard for the whole state of your farm",
  },
  "home.preview.description": {
    id: "Pantau status kesehatan, tren, dan peringatan ternak secara real-time dalam satu tampilan yang jelas.",
    en: "Track health status, trends, and alerts in real time from a single, legible view.",
  },
  "home.preview.summary.totalLivestock": { id: "Total Ternak", en: "Total Livestock" },
  "home.preview.summary.healthyLivestock": { id: "Ternak Sehat", en: "Healthy Livestock" },
  "home.preview.summary.needsAttention": { id: "Perlu Perhatian", en: "Needs Attention" },
  "home.preview.summary.criticalAlerts": { id: "Alert Kritis", en: "Critical Alerts" },
  "home.preview.healthTrendTitle": { id: "Health Score Trend", en: "Health Score Trend" },
  "home.preview.healthTrendDescription": {
    id: "Rata-rata skor kesehatan ternak per bulan",
    en: "Average livestock health score by month",
  },
  "home.preview.healthDistributionTitle": { id: "Health Status Distribution", en: "Health Status Distribution" },
  "home.preview.healthDistributionDescription": {
    id: "Distribusi status kesehatan seluruh ternak",
    en: "Health status distribution across the herd",
  },
  "home.preview.recentAlerts": { id: "Alert Terbaru", en: "Recent Alerts" },
  "home.preview.environmentalConditions": { id: "Kondisi Lingkungan", en: "Environmental Conditions" },
  "home.preview.issue.temperatureRising": { id: "Suhu tubuh meningkat", en: "Body temperature rising" },
  "home.preview.issue.activityDrop": { id: "Aktivitas menurun drastis", en: "Sharp drop in activity" },
  "home.preview.issue.unstableHeartRate": { id: "Detak jantung tidak stabil", en: "Unstable heart rate" },
  "home.preview.reading.barnTemperature": { id: "Suhu Kandang", en: "Barn Temperature" },
  "home.preview.reading.humidity": { id: "Kelembapan", en: "Humidity" },
  "home.preview.reading.airQuality": { id: "Kualitas Udara", en: "Air Quality" },
  "home.preview.value.good": { id: "Baik", en: "Good" },

  // --- Impact stats --------------------------------------------------------
  "home.stats.badge": { id: "Prototype Capability", en: "Prototype Capability" },
  "home.stats.title": { id: "Dibangun untuk skala dan keandalan", en: "Built for scale and reliability" },
  "home.stats.description": {
    id: "Angka berikut menggambarkan target kapabilitas platform pada tahap pengembangan MVP.",
    en: "These figures describe the platform's target capabilities at the MVP development stage.",
  },

  // --- Target users --------------------------------------------------------
  "home.users.badge": { id: "Who Terrava Serves", en: "Who Terrava Serves" },
  "home.users.title": {
    id: "Dirancang untuk berbagai skala peternakan",
    en: "Designed for farms of every size",
  },
  "home.users.description": {
    id: "Dari peternak individu hingga lembaga pemerintah, Terrava dapat disesuaikan dengan kebutuhan Anda.",
    en: "From individual farmers to government institutions, Terrava adapts to what you need.",
  },

  // --- Testimonials --------------------------------------------------------
  "home.testimonials.badge": { id: "Pilot Stories", en: "Pilot Stories" },
  "home.testimonials.title": { id: "Cerita dari mitra peternak", en: "Stories from our farming partners" },
  "home.testimonials.description": {
    id: "Testimoni contoh dari program pilot dan diskusi awal bersama komunitas peternak.",
    en: "Illustrative testimonials from pilot programmes and early conversations with farming communities.",
  },

  // --- Trusted by ----------------------------------------------------------
  "home.trusted.title": { id: "Dipercaya dan didukung oleh", en: "Trusted and supported by" },
  "home.trusted.ariaLabel": { id: "Mitra dan pendukung", en: "Partners and supporters" },

  // --- Shared marketing blocks --------------------------------------------
  "faq.defaultTitle": { id: "Pertanyaan yang sering diajukan", en: "Frequently asked questions" },
  "sdg.defaultTitle": {
    id: "Kontribusi terhadap Sustainable Development Goals",
    en: "Contributing to the Sustainable Development Goals",
  },
  "solutions.problemLabel": { id: "Masalah:", en: "Problem:" },
  "solutions.solutionLabel": { id: "Solusi Terrava:", en: "The Terrava solution:" },
  "solutions.illustrationAlt": { id: "Ilustrasi solusi {title}", en: "Illustration of the {title} solution" },
  "common.learnMoreShort": { id: "Selengkapnya", en: "Learn more" },
};
