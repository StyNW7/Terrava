import type { Alert, AlertCategory, AlertSeverity } from "@/types/dashboard";
import { createSeededRandom, pick, randomInt, randomFloat } from "@/utils/seededRandom";
import { livestock } from "@/data/mockLivestock";

const random = createSeededRandom(4004);

const alertTemplates: { category: AlertCategory; title: string; description: string; cause: string; recommendations: string[] }[] = [
  {
    category: "health",
    title: "Suhu tubuh meningkat signifikan",
    description: "Suhu tubuh tercatat di atas ambang normal selama lebih dari 3 jam berturut-turut.",
    cause: "Kemungkinan indikasi awal infeksi atau demam ringan.",
    recommendations: ["Inspect livestock", "Check hydration", "Contact veterinarian"],
  },
  {
    category: "behavior",
    title: "Penurunan aktivitas drastis",
    description: "Tingkat aktivitas menurun lebih dari 30% dibandingkan baseline 7 hari terakhir.",
    cause: "Kemungkinan tanda awal ketidaknyamanan atau kelelahan.",
    recommendations: ["Monitor for next 6 hours", "Inspect livestock", "Move to observation barn"],
  },
  {
    category: "location",
    title: "Ternak keluar dari geofence",
    description: "Lokasi ternak terdeteksi berada di luar batas area yang ditentukan.",
    cause: "Kemungkinan pagar rusak atau ternak lepas dari kandang.",
    recommendations: ["Inspect livestock", "Contact veterinarian", "Create task"],
  },
  {
    category: "device",
    title: "Baterai perangkat rendah",
    description: "Baterai smart ear tag berada di bawah 20 persen kapasitas.",
    cause: "Perangkat mendekati akhir siklus daya sebelum pengisian ulang.",
    recommendations: ["Check hydration", "Create task"],
  },
  {
    category: "environmental",
    title: "Suhu kandang di luar batas nyaman",
    description: "Suhu lingkungan kandang tercatat lebih tinggi dari ambang batas yang ditentukan.",
    cause: "Potensi risiko heat stress pada ternak di kandang tersebut.",
    recommendations: ["Monitor for next 6 hours", "Move to observation barn"],
  },
  {
    category: "weather",
    title: "Prediksi gelombang panas besok",
    description: "Model cuaca menunjukkan potensi gelombang panas dalam 24 jam ke depan.",
    cause: "Kondisi atmosfer regional menunjukkan tren suhu ekstrem.",
    recommendations: ["Monitor for next 6 hours", "Create task"],
  },
  {
    category: "health",
    title: "Detak jantung tidak stabil",
    description: "Pola detak jantung menunjukkan fluktuasi tidak biasa dibandingkan riwayat data.",
    cause: "Kemungkinan stres akut atau gangguan ringan pada sistem kardiovaskular.",
    recommendations: ["Inspect livestock", "Contact veterinarian", "Monitor for next 6 hours"],
  },
];

const severityPool: AlertSeverity[] = ["info", "warning", "warning", "high", "high", "critical"];
const assignees = ["Budi Santoso", "Reza Aditama", "Andi Wirawan", null, null];

export const alerts: Alert[] = Array.from({ length: 18 }).map((_, index) => {
  const template = pick(random, alertTemplates);
  const animal = pick(random, livestock);
  const severity = pick(random, severityPool);
  const status = pick(random, ["active", "active", "acknowledged", "resolved"] as const);

  return {
    id: `ALT-${String(index + 1).padStart(3, "0")}`,
    title: template.title,
    severity,
    category: template.category,
    status,
    livestockId: animal.id,
    farmId: animal.farmId,
    barnId: animal.barnId,
    detectedAt: `${randomInt(random, 1, 96)} jam lalu`,
    assignedTo: status === "active" ? pick(random, assignees) : pick(random, assignees.slice(0, 3)),
    description: template.description,
    aiConfidence: randomInt(random, 68, 96),
    aiCause: template.cause,
    recommendations: template.recommendations,
    dataAtDetection: {
      temperature: randomFloat(random, 37.9, 40.2),
      heartRate: randomInt(random, 62, 118),
      activity: randomInt(random, 8, 92),
      oxygen: randomInt(random, 90, 99),
    },
  };
});

export function getAlertById(id: string): Alert | undefined {
  return alerts.find((alert) => alert.id === id);
}
