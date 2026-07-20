import {
  Users,
  ShieldCheck,
  Sprout,
  BrainCircuit,
  TrendingUp,
  Handshake,
} from "lucide-react";
import type { ValueItem } from "@/types";

export const companyValues: ValueItem[] = [
  {
    id: "farmer-first",
    icon: Users,
    title: "Farmer First",
    description: "Setiap keputusan produk berangkat dari kebutuhan nyata peternak.",
  },
  {
    id: "preventive-care",
    icon: ShieldCheck,
    title: "Preventive Care",
    description: "Mengutamakan deteksi dini dibandingkan penanganan setelah terlambat.",
  },
  {
    id: "responsible-innovation",
    icon: BrainCircuit,
    title: "Responsible Innovation",
    description: "Mengembangkan teknologi AI dan IoT secara bertanggung jawab dan transparan.",
  },
  {
    id: "data-with-purpose",
    icon: TrendingUp,
    title: "Data with Purpose",
    description: "Data dikumpulkan dan digunakan untuk manfaat nyata bagi peternak.",
  },
  {
    id: "sustainable-growth",
    icon: Sprout,
    title: "Sustainable Growth",
    description: "Mendorong pertumbuhan peternakan yang selaras dengan kelestarian lingkungan.",
  },
  {
    id: "collaboration",
    icon: Handshake,
    title: "Collaboration",
    description: "Bekerja sama dengan peternak, koperasi, akademisi, dan pemerintah.",
  },
];

export const missionCards: ValueItem[] = [
  {
    id: "democratize",
    icon: Users,
    title: "Democratize Livestock Technology",
    description: "Membuka akses teknologi peternakan pintar untuk semua skala peternak.",
  },
  {
    id: "preventive",
    icon: ShieldCheck,
    title: "Enable Preventive Animal Care",
    description: "Mendukung deteksi dini agar penanganan ternak lebih cepat dan tepat.",
  },
  {
    id: "data-driven",
    icon: BrainCircuit,
    title: "Empower Data-Driven Farming",
    description: "Membantu peternak mengambil keputusan berbasis data yang akurat.",
  },
  {
    id: "sustainable-food",
    icon: Sprout,
    title: "Support Sustainable Food Systems",
    description: "Berkontribusi pada sistem pangan yang lebih tangguh dan berkelanjutan.",
  },
];
