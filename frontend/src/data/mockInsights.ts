import type { AIInsight } from "@/types/dashboard";
import { createSeededRandom, randomInt } from "@/utils/seededRandom";
import { livestock } from "@/data/mockLivestock";

const random = createSeededRandom(6006);

const insightSeeds: Omit<AIInsight, "id" | "generatedAt" | "reviewed" | "affectedLivestock" | "confidence">[] = [
  {
    priority: "high",
    category: "behavior",
    title: "Penurunan aktivitas di Barn B",
    summary: "Lima ternak di Barn B menunjukkan penurunan aktivitas rata-rata 16% selama dua hari terakhir.",
    recommendation: "Jadwalkan inspeksi lapangan dan pantau pola aktivitas selama 24 jam ke depan.",
  },
  {
    priority: "high",
    category: "health",
    title: "Anomali suhu berulang",
    summary: "Tiga ternak menunjukkan pola kenaikan suhu tubuh berulang pada jam malam selama seminggu terakhir.",
    recommendation: "Rekomendasikan pemeriksaan dokter hewan untuk kelompok ternak terkait.",
  },
  {
    priority: "medium",
    category: "devices",
    title: "Perangkat baterai rendah meningkat",
    summary: "Jumlah smart ear tag dengan baterai di bawah 20 persen meningkat 40% dibanding minggu lalu.",
    recommendation: "Jadwalkan penggantian atau pengisian daya perangkat secara proaktif.",
  },
  {
    priority: "high",
    category: "environment",
    title: "Risiko heat stress besok",
    summary: "Prediksi cuaca menunjukkan suhu lingkungan berpotensi melewati ambang nyaman pada siang hari besok.",
    recommendation: "Siapkan ventilasi tambahan dan pastikan akses air minum memadai.",
  },
  {
    priority: "medium",
    category: "productivity",
    title: "Skor kesehatan kelompok menurun",
    summary: "Rata-rata skor kesehatan Herd 2 menurun 6 poin dalam 10 hari terakhir dibandingkan baseline.",
    recommendation: "Tinjau kualitas pakan dan kondisi lingkungan kandang terkait.",
  },
  {
    priority: "medium",
    category: "health",
    title: "Follow-up vaksinasi tertunda",
    summary: "Beberapa ternak melewati jadwal follow-up vaksinasi lebih dari 14 hari.",
    recommendation: "Jadwalkan ulang sesi vaksinasi lanjutan bersama dokter hewan.",
  },
  {
    priority: "low",
    category: "behavior",
    title: "Pola makan tidak biasa",
    summary: "Terdeteksi perubahan pola waktu makan pada beberapa ternak di Barn A.",
    recommendation: "Pantau kembali dalam 48 jam sebelum mengambil tindakan lanjutan.",
  },
  {
    priority: "medium",
    category: "devices",
    title: "Sinyal gateway melemah",
    summary: "Kekuatan sinyal pada satu gateway menurun secara konsisten dalam tiga hari terakhir.",
    recommendation: "Jadwalkan pemeriksaan teknis pada lokasi gateway terkait.",
  },
  {
    priority: "low",
    category: "productivity",
    title: "Potensi peningkatan bobot",
    summary: "Tren bobot pada kelompok ternak tertentu menunjukkan pertumbuhan lebih cepat dari rata-rata.",
    recommendation: "Evaluasi kembali komposisi pakan untuk mempertahankan tren positif.",
  },
  {
    priority: "high",
    category: "health",
    title: "Indikasi dehidrasi ringan",
    summary: "Kombinasi suhu tinggi dan penurunan aktivitas mengindikasikan potensi dehidrasi pada beberapa ternak.",
    recommendation: "Pastikan akses air minum dan pantau kondisi selama 6 jam ke depan.",
  },
];

export const aiInsights: AIInsight[] = insightSeeds.map((seed, index) => ({
  ...seed,
  id: `INS-${String(index + 1).padStart(3, "0")}`,
  affectedLivestock: Array.from({ length: randomInt(random, 2, 5) }).map(
    () => livestock[randomInt(random, 0, livestock.length - 1)].id
  ),
  confidence: randomInt(random, 72, 95),
  generatedAt: `${randomInt(random, 1, 48)} jam lalu`,
  reviewed: index % 3 === 0,
}));

export function getInsightById(id: string): AIInsight | undefined {
  return aiInsights.find((insight) => insight.id === id);
}
