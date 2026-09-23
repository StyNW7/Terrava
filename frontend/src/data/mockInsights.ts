import type { AIInsight } from "@/types/dashboard";
import { createSeededRandom, randomInt } from "@/utils/seededRandom";
import { livestock } from "@/data/mockLivestock";

const random = createSeededRandom(6006);

const insightSeeds: Omit<AIInsight, "id" | "generatedAt" | "reviewed" | "affectedLivestock" | "confidence">[] = [
  {
    priority: "high",
    category: "behavior",
    title: { id: "Penurunan aktivitas di Barn B", en: "Activity decline in Barn B" },
    summary: {
      id: "Lima ternak di Barn B menunjukkan penurunan aktivitas rata-rata 16% selama dua hari terakhir.",
      en: "Five animals in Barn B have shown an average 16% drop in activity over the past two days.",
    },
    recommendation: {
      id: "Jadwalkan inspeksi lapangan dan pantau pola aktivitas selama 24 jam ke depan.",
      en: "Schedule a field inspection and watch activity patterns for the next 24 hours.",
    },
  },
  {
    priority: "high",
    category: "health",
    title: { id: "Anomali suhu berulang", en: "Recurring temperature anomaly" },
    summary: {
      id: "Tiga ternak menunjukkan pola kenaikan suhu tubuh berulang pada jam malam selama seminggu terakhir.",
      en: "Three animals have shown a recurring night-time temperature rise over the past week.",
    },
    recommendation: {
      id: "Rekomendasikan pemeriksaan dokter hewan untuk kelompok ternak terkait.",
      en: "Arrange a veterinary examination for the affected group.",
    },
  },
  {
    priority: "medium",
    category: "devices",
    title: { id: "Perangkat baterai rendah meningkat", en: "More devices running low on battery" },
    summary: {
      id: "Jumlah smart ear tag dengan baterai di bawah 20 persen meningkat 40% dibanding minggu lalu.",
      en: "The number of smart ear tags below 20 percent battery is up 40% on last week.",
    },
    recommendation: {
      id: "Jadwalkan penggantian atau pengisian daya perangkat secara proaktif.",
      en: "Proactively schedule device replacement or recharging.",
    },
  },
  {
    priority: "high",
    category: "environment",
    title: { id: "Risiko heat stress besok", en: "Heat stress risk tomorrow" },
    summary: {
      id: "Prediksi cuaca menunjukkan suhu lingkungan berpotensi melewati ambang nyaman pada siang hari besok.",
      en: "The forecast suggests ambient temperature may exceed the comfort threshold tomorrow afternoon.",
    },
    recommendation: {
      id: "Siapkan ventilasi tambahan dan pastikan akses air minum memadai.",
      en: "Prepare additional ventilation and make sure drinking water is readily available.",
    },
  },
  {
    priority: "medium",
    category: "productivity",
    title: { id: "Skor kesehatan kelompok menurun", en: "Group health score is falling" },
    summary: {
      id: "Rata-rata skor kesehatan Herd 2 menurun 6 poin dalam 10 hari terakhir dibandingkan baseline.",
      en: "The average health score for Herd 2 has dropped six points below baseline over the last 10 days.",
    },
    recommendation: {
      id: "Tinjau kualitas pakan dan kondisi lingkungan kandang terkait.",
      en: "Review feed quality and the environmental conditions in the relevant barn.",
    },
  },
  {
    priority: "medium",
    category: "health",
    title: { id: "Follow-up vaksinasi tertunda", en: "Vaccination follow-up overdue" },
    summary: {
      id: "Beberapa ternak melewati jadwal follow-up vaksinasi lebih dari 14 hari.",
      en: "Several animals are more than 14 days past their vaccination follow-up date.",
    },
    recommendation: {
      id: "Jadwalkan ulang sesi vaksinasi lanjutan bersama dokter hewan.",
      en: "Reschedule the follow-up vaccination session with the veterinarian.",
    },
  },
  {
    priority: "low",
    category: "behavior",
    title: { id: "Pola makan tidak biasa", en: "Unusual feeding pattern" },
    summary: {
      id: "Terdeteksi perubahan pola waktu makan pada beberapa ternak di Barn A.",
      en: "A shift in feeding times has been detected for several animals in Barn A.",
    },
    recommendation: {
      id: "Pantau kembali dalam 48 jam sebelum mengambil tindakan lanjutan.",
      en: "Re-check in 48 hours before taking further action.",
    },
  },
  {
    priority: "medium",
    category: "devices",
    title: { id: "Sinyal gateway melemah", en: "Gateway signal weakening" },
    summary: {
      id: "Kekuatan sinyal pada satu gateway menurun secara konsisten dalam tiga hari terakhir.",
      en: "Signal strength on one gateway has declined steadily over the past three days.",
    },
    recommendation: {
      id: "Jadwalkan pemeriksaan teknis pada lokasi gateway terkait.",
      en: "Schedule a technical inspection at that gateway location.",
    },
  },
  {
    priority: "low",
    category: "productivity",
    title: { id: "Potensi peningkatan bobot", en: "Weight gain opportunity" },
    summary: {
      id: "Tren bobot pada kelompok ternak tertentu menunjukkan pertumbuhan lebih cepat dari rata-rata.",
      en: "Weight trends in one group show faster-than-average growth.",
    },
    recommendation: {
      id: "Evaluasi kembali komposisi pakan untuk mempertahankan tren positif.",
      en: "Reassess the feed mix to sustain the positive trend.",
    },
  },
  {
    priority: "high",
    category: "health",
    title: { id: "Indikasi dehidrasi ringan", en: "Signs of mild dehydration" },
    summary: {
      id: "Kombinasi suhu tinggi dan penurunan aktivitas mengindikasikan potensi dehidrasi pada beberapa ternak.",
      en: "High temperature combined with reduced activity points to possible dehydration in several animals.",
    },
    recommendation: {
      id: "Pastikan akses air minum dan pantau kondisi selama 6 jam ke depan.",
      en: "Ensure drinking water is accessible and monitor the condition for the next six hours.",
    },
  },
];

export const aiInsights: AIInsight[] = insightSeeds.map((seed, index) => ({
  ...seed,
  id: `INS-${String(index + 1).padStart(3, "0")}`,
  affectedLivestock: Array.from({ length: randomInt(random, 2, 5) }).map(
    () => livestock[randomInt(random, 0, livestock.length - 1)].id
  ),
  confidence: randomInt(random, 72, 95),
  generatedAt: `${randomInt(random, 1, 48)} hours ago`,
  reviewed: index % 3 === 0,
}));

export function getInsightById(id: string): AIInsight | undefined {
  return aiInsights.find((insight) => insight.id === id);
}
