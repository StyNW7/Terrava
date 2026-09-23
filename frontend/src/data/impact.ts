import { HeartPulse, TrendingUp, Wheat, Leaf } from "lucide-react";
import type { ImpactPillar } from "@/types";

export const impactPillars: ImpactPillar[] = [
  {
    id: "animal-health",
    icon: HeartPulse,
    title: "Animal Health",
    description: {
      id: "Deteksi dini risiko kesehatan untuk kesejahteraan ternak yang lebih terjaga.",
      en: "Early detection of health risks for consistently better animal welfare.",
    },
  },
  {
    id: "farmer-productivity",
    icon: TrendingUp,
    title: "Farmer Productivity",
    description: {
      id: "Efisiensi monitoring yang membebaskan waktu peternak untuk hal yang lebih strategis.",
      en: "Efficient monitoring that frees up farmer time for more strategic work.",
    },
  },
  {
    id: "food-security",
    icon: Wheat,
    title: "Food Security",
    description: {
      id: "Mendukung ketahanan pangan melalui peternakan yang lebih sehat dan produktif.",
      en: "Supporting food security through healthier, more productive farms.",
    },
  },
  {
    id: "sustainable-farming",
    icon: Leaf,
    title: "Sustainable Farming",
    description: {
      id: "Mendorong praktik peternakan yang lebih efisien dan ramah lingkungan.",
      en: "Encouraging farming practices that are more efficient and kinder to the environment.",
    },
  },
];
