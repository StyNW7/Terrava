import type { RecognitionItem, TimelineEntry } from "@/types";

export const companyTimeline: TimelineEntry[] = [
  {
    id: "moorgan",
    year: { id: "Tahap 1", en: "Stage 1" },
    title: "Moorgan",
    description: {
      id: "Dimulai sebagai livestock monitoring system sederhana untuk memahami kebutuhan dasar pemantauan ternak.",
      en: "Began as a simple livestock monitoring system built to understand the fundamentals of herd monitoring.",
    },
  },
  {
    id: "ternakaja",
    year: { id: "Tahap 2", en: "Stage 2" },
    title: "TernakAja",
    description: {
      id: "Memperkuat pendekatan yang lebih dekat dengan peternak Indonesia melalui riset lapangan dan iterasi produk.",
      en: "Moved closer to Indonesian farmers through field research and rapid product iteration.",
    },
  },
  {
    id: "terrava",
    year: { id: "Tahap 3", en: "Stage 3" },
    title: "Terrava",
    description: {
      id: "Berkembang menjadi smart livestock ecosystem yang lebih luas, modular, dan scalable untuk berbagai skala peternakan.",
      en: "Grew into a broader smart livestock ecosystem: modular, scalable, and suited to farms of any size.",
    },
  },
];

export const recognitionTimeline: RecognitionItem[] = [
  {
    id: "recognition-1",
    year: "2024",
    title: {
      id: "Finalis Kompetisi Inovasi Agritech",
      en: "Agritech Innovation Competition Finalist",
    },
    description: {
      id: "Diakui sebagai salah satu solusi AIoT potensial untuk sektor peternakan nasional.",
      en: "Recognised as one of the most promising AIoT solutions for the national livestock sector.",
    },
  },
  {
    id: "recognition-2",
    year: "2025",
    title: {
      id: "Kolaborasi Riset dengan BINUS University",
      en: "Research Collaboration with BINUS University",
    },
    description: {
      id: "Pengembangan model AI dan validasi lapangan bersama tim akademik.",
      en: "AI model development and field validation carried out with an academic team.",
    },
  },
  {
    id: "recognition-3",
    year: "2025",
    title: {
      id: "Program Pilot Bersama Komunitas Peternak",
      en: "Pilot Programme with Farming Communities",
    },
    description: {
      id: "Uji coba awal smart ear tag pada kelompok peternak mitra.",
      en: "Initial smart ear tag trials with partner farmer groups.",
    },
  },
];
