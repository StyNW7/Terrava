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
    description: {
      id: "Setiap keputusan produk berangkat dari kebutuhan nyata peternak.",
      en: "Every product decision starts from a real need on the farm.",
    },
  },
  {
    id: "preventive-care",
    icon: ShieldCheck,
    title: "Preventive Care",
    description: {
      id: "Mengutamakan deteksi dini dibandingkan penanganan setelah terlambat.",
      en: "We prioritise early detection over treatment that arrives too late.",
    },
  },
  {
    id: "responsible-innovation",
    icon: BrainCircuit,
    title: "Responsible Innovation",
    description: {
      id: "Mengembangkan teknologi AI dan IoT secara bertanggung jawab dan transparan.",
      en: "We build AI and IoT technology responsibly and transparently.",
    },
  },
  {
    id: "data-with-purpose",
    icon: TrendingUp,
    title: "Data with Purpose",
    description: {
      id: "Data dikumpulkan dan digunakan untuk manfaat nyata bagi peternak.",
      en: "Data is collected and used to deliver tangible value to farmers.",
    },
  },
  {
    id: "sustainable-growth",
    icon: Sprout,
    title: "Sustainable Growth",
    description: {
      id: "Mendorong pertumbuhan peternakan yang selaras dengan kelestarian lingkungan.",
      en: "We drive farm growth that stays aligned with environmental stewardship.",
    },
  },
  {
    id: "collaboration",
    icon: Handshake,
    title: "Collaboration",
    description: {
      id: "Bekerja sama dengan peternak, koperasi, akademisi, dan pemerintah.",
      en: "We work alongside farmers, cooperatives, academics, and government.",
    },
  },
];

export const missionCards: ValueItem[] = [
  {
    id: "democratize",
    icon: Users,
    title: "Democratize Livestock Technology",
    description: {
      id: "Membuka akses teknologi peternakan pintar untuk semua skala peternak.",
      en: "Open access to smart livestock technology for farms of every size.",
    },
  },
  {
    id: "preventive",
    icon: ShieldCheck,
    title: "Enable Preventive Animal Care",
    description: {
      id: "Mendukung deteksi dini agar penanganan ternak lebih cepat dan tepat.",
      en: "Support early detection so livestock care is faster and better targeted.",
    },
  },
  {
    id: "data-driven",
    icon: BrainCircuit,
    title: "Empower Data-Driven Farming",
    description: {
      id: "Membantu peternak mengambil keputusan berbasis data yang akurat.",
      en: "Help farmers make decisions grounded in accurate data.",
    },
  },
  {
    id: "sustainable-food",
    icon: Sprout,
    title: "Support Sustainable Food Systems",
    description: {
      id: "Berkontribusi pada sistem pangan yang lebih tangguh dan berkelanjutan.",
      en: "Contribute to a more resilient and sustainable food system.",
    },
  },
];
