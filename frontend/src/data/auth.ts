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
import type { AuthBenefit, AuthPanelCopy } from "@/types/auth";

export const rotatingMessages: string[] = [
  "Deteksi risiko kesehatan lebih awal",
  "Pantau setiap ternak secara real-time",
  "Ubah data sensor menjadi tindakan",
  "Kelola peternakan dari mana saja",
  "Bangun peternakan yang lebih produktif",
];

export const loginBenefits: AuthBenefit[] = [
  {
    id: "secure-access",
    icon: ShieldCheck,
    title: "Secure Access",
    description: "Perlindungan akses dan data peternakan.",
  },
  {
    id: "real-time",
    icon: Activity,
    title: "Real-Time Monitoring",
    description: "Pantau kondisi ternak secara langsung.",
  },
  {
    id: "ai-insights",
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    description: "Dapatkan rekomendasi berbasis data.",
  },
];

export const registerBenefits: AuthBenefit[] = [
  {
    id: "connect-devices",
    icon: Radio,
    title: "Connect Smart Devices",
    description: "Hubungkan smart ear tag dan gateway.",
  },
  {
    id: "early-alerts",
    icon: BellRing,
    title: "Receive Early Alerts",
    description: "Dapatkan peringatan sebelum kondisi memburuk.",
  },
  {
    id: "track-performance",
    icon: BarChart3,
    title: "Track Farm Performance",
    description: "Pantau kesehatan dan produktivitas peternakan.",
  },
];

export const accountRoleOptions = [
  { value: "peternak", label: "Peternak" },
  { value: "farm-manager", label: "Farm Manager" },
  { value: "dokter-hewan", label: "Dokter Hewan" },
  { value: "pengurus-koperasi", label: "Pengurus Koperasi" },
  { value: "administrator", label: "Administrator" },
  { value: "lainnya", label: "Lainnya" },
];

export const farmTypeOptions = [
  { value: "mandiri", label: "Peternakan Mandiri" },
  { value: "koperasi", label: "Koperasi" },
  { value: "komersial", label: "Peternakan Komersial" },
  { value: "pemerintah", label: "Institusi Pemerintah" },
  { value: "riset", label: "Lembaga Riset" },
  { value: "lainnya", label: "Lainnya" },
];

export const livestockCountOptions = [
  { value: "1-10", label: "1 - 10" },
  { value: "11-50", label: "11 - 50" },
  { value: "51-100", label: "51 - 100" },
  { value: "101-500", label: "101 - 500" },
  { value: "500+", label: "Lebih dari 500" },
];

export const primaryLivestockOptions = [
  { value: "sapi-perah", label: "Sapi Perah" },
  { value: "sapi-potong", label: "Sapi Potong" },
  { value: "kambing", label: "Kambing" },
  { value: "domba", label: "Domba" },
  { value: "unggas", label: "Unggas" },
  { value: "lainnya", label: "Lainnya" },
];

export const notificationMethodOptions = [
  { value: "in-app", label: "In-App Notification" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "critical-only", label: "Critical Alerts Only" },
];

export const trustRowItems = [
  { icon: Cloud, label: "Secure cloud infrastructure" },
  { icon: LockKeyhole, label: "Role-based access" },
  { icon: ShieldCheck, label: "Privacy-first data management" },
];

export const authPanelCopy: Record<"login" | "register" | "forgot" | "reset", AuthPanelCopy> = {
  login: {
    heading: "Selamat Datang Kembali di Peternakan yang Lebih Cerdas",
    description:
      "Pantau kesehatan ternak, tinjau peringatan berbasis AI, dan kelola aktivitas peternakan Anda dalam satu platform.",
    benefits: loginBenefits,
    testimonial: {
      quote:
        "Dengan peringatan dini, kami tidak harus menunggu hingga gejala terlihat parah sebelum mengambil tindakan.",
      name: "Pak Stanley Wijaya",
      role: "Peternak Sapi Perah, Boyolali",
    },
  },
  register: {
    heading: "Mulai Transformasi Digital Peternakan Anda",
    description:
      "Hubungkan ternak, perangkat, dan tim Anda untuk menciptakan operasional yang lebih sehat, produktif, dan berbasis data.",
    benefits: registerBenefits,
    testimonial: {
      quote:
        "Dashboard Terrava membantu kami memantau puluhan ekor sapi tanpa harus keliling kandang setiap jam.",
      name: "Ibu Ratna Kusuma",
      role: "Ketua Koperasi Ternak, Pasuruan",
    },
  },
  forgot: {
    heading: "Recover Your Access, Keep Your Farm Connected",
    description:
      "Kami akan membantu Anda kembali mengakses workspace Terrava dengan aman dalam beberapa langkah singkat.",
    benefits: loginBenefits,
  },
  reset: {
    heading: "Amankan Kembali Workspace Terrava Anda",
    description:
      "Buat password baru yang kuat untuk melindungi data ternak dan peternakan Anda.",
    benefits: loginBenefits,
  },
};
