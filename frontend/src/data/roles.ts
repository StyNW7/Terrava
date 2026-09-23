import { Users, Building2, Stethoscope, Handshake, Landmark } from "lucide-react";
import type { UserRole, PersonaItem } from "@/types";
import { images } from "@/data/images";

export const userRoles: UserRole[] = [
  {
    id: "farmer",
    icon: Users,
    title: "Farmer",
    description: {
      id: "Memantau kesehatan ternak harian dan menindaklanjuti alert yang diterima.",
      en: "Monitors daily herd health and follows up on the alerts that come in.",
    },
  },
  {
    id: "farm-manager",
    icon: Building2,
    title: "Farm Manager",
    description: {
      id: "Mengelola operasional peternakan, tim kerja, dan performa herd secara keseluruhan.",
      en: "Runs farm operations, work teams, and overall herd performance.",
    },
  },
  {
    id: "veterinarian",
    icon: Stethoscope,
    title: "Veterinarian",
    description: {
      id: "Meninjau riwayat kesehatan dan memberikan rekomendasi penanganan medis.",
      en: "Reviews health histories and advises on medical treatment.",
    },
  },
  {
    id: "cooperative-admin",
    icon: Handshake,
    title: "Cooperative Administrator",
    description: {
      id: "Mengelola data anggota koperasi dan memantau performa peternakan mitra.",
      en: "Manages cooperative member data and tracks partner farm performance.",
    },
  },
  {
    id: "government-viewer",
    icon: Landmark,
    title: "Government or Institutional Viewer",
    description: {
      id: "Memantau data agregat untuk kebutuhan kebijakan dan pengawasan kesehatan hewan.",
      en: "Reviews aggregate data for policy-making and animal health oversight.",
    },
  },
];

export const targetPersonas: PersonaItem[] = [
  {
    id: "smallholder",
    icon: Users,
    title: "Smallholder Farmers",
    description: {
      id: "Peternak individu dengan skala kecil yang ingin memantau ternak dengan lebih mudah.",
      en: "Independent small-scale farmers who want an easier way to keep watch over their herd.",
    },
    image: "Images/peternak-indo.jpg",
  },
  {
    id: "cooperative",
    icon: Handshake,
    title: "Livestock Cooperatives",
    description: {
      id: "Koperasi yang mengelola data kesehatan ternak dari banyak anggota peternak.",
      en: "Cooperatives managing livestock health data across many member farms.",
    },
    image: images.personaCooperative,
  },
  {
    id: "commercial",
    icon: Building2,
    title: "Commercial Farms",
    description: {
      id: "Peternakan skala industri yang membutuhkan manajemen herd berskala besar.",
      en: "Industrial-scale operations that need large-herd management.",
    },
    image: images.personaCommercial,
  },
  {
    id: "government",
    icon: Landmark,
    title: "Government and Veterinary Institutions",
    description: {
      id: "Lembaga yang membutuhkan data agregat untuk pengawasan kesehatan hewan nasional.",
      en: "Institutions that need aggregate data for national animal health surveillance.",
    },
    image: images.personaGovernment,
  },
];
