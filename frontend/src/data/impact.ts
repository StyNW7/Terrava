import { HeartPulse, TrendingUp, Wheat, Leaf } from "lucide-react";
import type { ImpactPillar } from "@/types";

export const impactPillars: ImpactPillar[] = [
  {
    id: "animal-health",
    icon: HeartPulse,
    title: "Animal Health",
    description: "Deteksi dini risiko kesehatan untuk kesejahteraan ternak yang lebih terjaga.",
  },
  {
    id: "farmer-productivity",
    icon: TrendingUp,
    title: "Farmer Productivity",
    description: "Efisiensi monitoring yang membebaskan waktu peternak untuk hal yang lebih strategis.",
  },
  {
    id: "food-security",
    icon: Wheat,
    title: "Food Security",
    description: "Mendukung ketahanan pangan melalui peternakan yang lebih sehat dan produktif.",
  },
  {
    id: "sustainable-farming",
    icon: Leaf,
    title: "Sustainable Farming",
    description: "Mendorong praktik peternakan yang lebih efisien dan ramah lingkungan.",
  },
];
