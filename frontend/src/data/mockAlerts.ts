import type { Alert, AlertCategory, AlertSeverity } from "@/types/dashboard";
import type { Localized } from "@/i18n/types";
import { createSeededRandom, pick, randomInt, randomFloat } from "@/utils/seededRandom";
import { livestock } from "@/data/mockLivestock";

const random = createSeededRandom(4004);

interface AlertTemplate {
  category: AlertCategory;
  title: Localized;
  description: Localized;
  cause: Localized;
  /** Canonical English actions, localized at render with `tt("action", ...)`. */
  recommendations: string[];
}

const alertTemplates: AlertTemplate[] = [
  {
    category: "health",
    title: { id: "Suhu tubuh meningkat signifikan", en: "Body temperature rising sharply" },
    description: {
      id: "Suhu tubuh tercatat di atas ambang normal selama lebih dari 3 jam berturut-turut.",
      en: "Body temperature has stayed above the normal threshold for more than three consecutive hours.",
    },
    cause: {
      id: "Kemungkinan indikasi awal infeksi atau demam ringan.",
      en: "Possibly an early indication of infection or a mild fever.",
    },
    recommendations: ["Inspect livestock", "Check hydration", "Contact veterinarian"],
  },
  {
    category: "behavior",
    title: { id: "Penurunan aktivitas drastis", en: "Sharp drop in activity" },
    description: {
      id: "Tingkat aktivitas menurun lebih dari 30% dibandingkan baseline 7 hari terakhir.",
      en: "Activity level has fallen more than 30% below the seven-day baseline.",
    },
    cause: {
      id: "Kemungkinan tanda awal ketidaknyamanan atau kelelahan.",
      en: "Possibly an early sign of discomfort or fatigue.",
    },
    recommendations: ["Monitor for next 6 hours", "Inspect livestock", "Move to observation barn"],
  },
  {
    category: "location",
    title: { id: "Ternak keluar dari geofence", en: "Animal left the geofence" },
    description: {
      id: "Lokasi ternak terdeteksi berada di luar batas area yang ditentukan.",
      en: "The animal has been detected outside its designated boundary.",
    },
    cause: {
      id: "Kemungkinan pagar rusak atau ternak lepas dari kandang.",
      en: "A damaged fence or an animal that has escaped the barn.",
    },
    recommendations: ["Inspect livestock", "Contact veterinarian", "Create task"],
  },
  {
    category: "device",
    title: { id: "Baterai perangkat rendah", en: "Low device battery" },
    description: {
      id: "Baterai smart ear tag berada di bawah 20 persen kapasitas.",
      en: "The smart ear tag battery has dropped below 20 percent capacity.",
    },
    cause: {
      id: "Perangkat mendekati akhir siklus daya sebelum pengisian ulang.",
      en: "The device is nearing the end of its power cycle before a recharge.",
    },
    recommendations: ["Check hydration", "Create task"],
  },
  {
    category: "environmental",
    title: { id: "Suhu kandang di luar batas nyaman", en: "Barn temperature outside comfort range" },
    description: {
      id: "Suhu lingkungan kandang tercatat lebih tinggi dari ambang batas yang ditentukan.",
      en: "Ambient barn temperature has been recorded above the configured threshold.",
    },
    cause: {
      id: "Potensi risiko heat stress pada ternak di kandang tersebut.",
      en: "A potential heat stress risk for the livestock in that barn.",
    },
    recommendations: ["Monitor for next 6 hours", "Move to observation barn"],
  },
  {
    category: "weather",
    title: { id: "Prediksi gelombang panas besok", en: "Heat wave forecast for tomorrow" },
    description: {
      id: "Model cuaca menunjukkan potensi gelombang panas dalam 24 jam ke depan.",
      en: "Weather models indicate a possible heat wave within the next 24 hours.",
    },
    cause: {
      id: "Kondisi atmosfer regional menunjukkan tren suhu ekstrem.",
      en: "Regional atmospheric conditions point to an extreme temperature trend.",
    },
    recommendations: ["Monitor for next 6 hours", "Create task"],
  },
  {
    category: "health",
    title: { id: "Detak jantung tidak stabil", en: "Unstable heart rate" },
    description: {
      id: "Pola detak jantung menunjukkan fluktuasi tidak biasa dibandingkan riwayat data.",
      en: "Heart rate patterns show unusual fluctuation compared with historical data.",
    },
    cause: {
      id: "Kemungkinan stres akut atau gangguan ringan pada sistem kardiovaskular.",
      en: "Possibly acute stress or a mild cardiovascular disturbance.",
    },
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
    detectedAt: `${randomInt(random, 1, 96)} hours ago`,
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
