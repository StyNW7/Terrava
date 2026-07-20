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
      name: "Pak Slamet Riyadi",
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
