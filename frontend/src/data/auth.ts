import {
  ShieldCheck,
  Activity,
  BrainCircuit,
  Radio,
  BellRing,
  BarChart3,
  Cloud,
  LockKeyhole,
} from "lucide-react";
import type { AuthBenefit, AuthPanelCopy, LocalizedOption } from "@/types/auth";
import type { LocalizedList } from "@/i18n/types";

export const rotatingMessages: LocalizedList = {
  id: [
    "Deteksi risiko kesehatan lebih awal",
    "Pantau setiap ternak secara real-time",
    "Ubah data sensor menjadi tindakan",
    "Kelola peternakan dari mana saja",
    "Bangun peternakan yang lebih produktif",
  ],
  en: [
    "Detect health risks earlier",
    "Monitor every animal in real time",
    "Turn sensor data into action",
    "Manage your farm from anywhere",
    "Build a more productive operation",
  ],
};

export const loginBenefits: AuthBenefit[] = [
  {
    id: "secure-access",
    icon: ShieldCheck,
    title: "Secure Access",
    description: {
      id: "Perlindungan akses dan data peternakan.",
      en: "Protection for your farm access and data.",
    },
  },
  {
    id: "real-time",
    icon: Activity,
    title: "Real-Time Monitoring",
    description: {
      id: "Pantau kondisi ternak secara langsung.",
      en: "Watch herd condition as it happens.",
    },
  },
  {
    id: "ai-insights",
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    description: {
      id: "Dapatkan rekomendasi berbasis data.",
      en: "Get recommendations grounded in data.",
    },
  },
];

export const registerBenefits: AuthBenefit[] = [
  {
    id: "connect-devices",
    icon: Radio,
    title: "Connect Smart Devices",
    description: {
      id: "Hubungkan smart ear tag dan gateway.",
      en: "Connect your smart ear tags and gateways.",
    },
  },
  {
    id: "early-alerts",
    icon: BellRing,
    title: "Receive Early Alerts",
    description: {
      id: "Dapatkan peringatan sebelum kondisi memburuk.",
      en: "Get warned before a condition worsens.",
    },
  },
  {
    id: "track-performance",
    icon: BarChart3,
    title: "Track Farm Performance",
    description: {
      id: "Pantau kesehatan dan produktivitas peternakan.",
      en: "Track farm health and productivity over time.",
    },
  },
];

export const accountRoleOptions: LocalizedOption[] = [
  { value: "peternak", label: { id: "Peternak", en: "Farmer" } },
  { value: "farm-manager", label: { id: "Farm Manager", en: "Farm Manager" } },
  { value: "dokter-hewan", label: { id: "Dokter Hewan", en: "Veterinarian" } },
  { value: "pengurus-koperasi", label: { id: "Pengurus Koperasi", en: "Cooperative Officer" } },
  { value: "administrator", label: { id: "Administrator", en: "Administrator" } },
  { value: "lainnya", label: { id: "Lainnya", en: "Other" } },
];

export const farmTypeOptions: LocalizedOption[] = [
  { value: "mandiri", label: { id: "Peternakan Mandiri", en: "Independent Farm" } },
  { value: "koperasi", label: { id: "Koperasi", en: "Cooperative" } },
  { value: "komersial", label: { id: "Peternakan Komersial", en: "Commercial Farm" } },
  { value: "pemerintah", label: { id: "Institusi Pemerintah", en: "Government Institution" } },
  { value: "riset", label: { id: "Lembaga Riset", en: "Research Institution" } },
  { value: "lainnya", label: { id: "Lainnya", en: "Other" } },
];

export const livestockCountOptions: LocalizedOption[] = [
  { value: "1-10", label: { id: "1 - 10", en: "1 - 10" } },
  { value: "11-50", label: { id: "11 - 50", en: "11 - 50" } },
  { value: "51-100", label: { id: "51 - 100", en: "51 - 100" } },
  { value: "101-500", label: { id: "101 - 500", en: "101 - 500" } },
  { value: "500+", label: { id: "Lebih dari 500", en: "More than 500" } },
];

export const primaryLivestockOptions: LocalizedOption[] = [
  { value: "sapi-perah", label: { id: "Sapi Perah", en: "Dairy Cattle" } },
  { value: "sapi-potong", label: { id: "Sapi Potong", en: "Beef Cattle" } },
  { value: "kambing", label: { id: "Kambing", en: "Goats" } },
  { value: "domba", label: { id: "Domba", en: "Sheep" } },
  { value: "unggas", label: { id: "Unggas", en: "Poultry" } },
  { value: "lainnya", label: { id: "Lainnya", en: "Other" } },
];

export const notificationMethodOptions: LocalizedOption[] = [
  { value: "in-app", label: { id: "In-App Notification", en: "In-App Notification" } },
  { value: "email", label: { id: "Email", en: "Email" } },
  { value: "whatsapp", label: { id: "WhatsApp", en: "WhatsApp" } },
  { value: "critical-only", label: { id: "Critical Alerts Only", en: "Critical Alerts Only" } },
];

export const trustRowItems = [
  { icon: Cloud, label: { id: "Secure cloud infrastructure", en: "Secure cloud infrastructure" } },
  { icon: LockKeyhole, label: { id: "Role-based access", en: "Role-based access" } },
  { icon: ShieldCheck, label: { id: "Privacy-first data management", en: "Privacy-first data management" } },
];

export const authPanelCopy: Record<"login" | "register" | "forgot" | "reset", AuthPanelCopy> = {
  login: {
    heading: {
      id: "Selamat Datang Kembali di Peternakan yang Lebih Cerdas",
      en: "Welcome Back to a Smarter Farm",
    },
    description: {
      id: "Pantau kesehatan ternak, tinjau peringatan berbasis AI, dan kelola aktivitas peternakan Anda dalam satu platform.",
      en: "Monitor herd health, review AI-driven alerts, and manage every farm activity from a single platform.",
    },
    benefits: loginBenefits,
    testimonial: {
      quote: {
        id: "Dengan peringatan dini, kami tidak harus menunggu hingga gejala terlihat parah sebelum mengambil tindakan.",
        en: "With early warnings, we no longer have to wait until symptoms turn severe before we act.",
      },
      name: "Pak Stanley Wijaya",
      role: { id: "Peternak Sapi Perah, Boyolali", en: "Dairy Cattle Farmer, Boyolali" },
    },
  },
  register: {
    heading: {
      id: "Mulai Transformasi Digital Peternakan Anda",
      en: "Begin Your Farm's Digital Transformation",
    },
    description: {
      id: "Hubungkan ternak, perangkat, dan tim Anda untuk menciptakan operasional yang lebih sehat, produktif, dan berbasis data.",
      en: "Connect your livestock, devices, and team to build an operation that is healthier, more productive, and data-driven.",
    },
    benefits: registerBenefits,
    testimonial: {
      quote: {
        id: "Dashboard Terrava membantu kami memantau puluhan ekor sapi tanpa harus keliling kandang setiap jam.",
        en: "The Terrava dashboard lets us monitor dozens of cattle without walking the barns every hour.",
      },
      name: "Ibu Ratna Kusuma",
      role: { id: "Ketua Koperasi Ternak, Pasuruan", en: "Livestock Cooperative Chair, Pasuruan" },
    },
  },
  forgot: {
    heading: {
      id: "Recover Your Access, Keep Your Farm Connected",
      en: "Recover Your Access, Keep Your Farm Connected",
    },
    description: {
      id: "Kami akan membantu Anda kembali mengakses workspace Terrava dengan aman dalam beberapa langkah singkat.",
      en: "We will help you get back into your Terrava workspace securely, in just a few short steps.",
    },
    benefits: loginBenefits,
  },
  reset: {
    heading: {
      id: "Amankan Kembali Workspace Terrava Anda",
      en: "Secure Your Terrava Workspace Again",
    },
    description: {
      id: "Buat password baru yang kuat untuk melindungi data ternak dan peternakan Anda.",
      en: "Create a strong new password to protect your livestock and farm data.",
    },
    benefits: loginBenefits,
  },
};
