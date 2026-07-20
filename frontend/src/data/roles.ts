import { Users, Building2, Stethoscope, Handshake, Landmark } from "lucide-react";
import type { UserRole, PersonaItem } from "@/types";
import { images } from "@/data/images";

export const userRoles: UserRole[] = [
  {
    id: "farmer",
    icon: Users,
    title: "Farmer",
    description: "Memantau kesehatan ternak harian dan menindaklanjuti alert yang diterima.",
  },
  {
    id: "farm-manager",
    icon: Building2,
    title: "Farm Manager",
    description: "Mengelola operasional peternakan, tim kerja, dan performa herd secara keseluruhan.",
  },
  {
    id: "veterinarian",
    icon: Stethoscope,
    title: "Veterinarian",
    description: "Meninjau riwayat kesehatan dan memberikan rekomendasi penanganan medis.",
  },
  {
    id: "cooperative-admin",
    icon: Handshake,
    title: "Cooperative Administrator",
    description: "Mengelola data anggota koperasi dan memantau performa peternakan mitra.",
  },
  {
    id: "government-viewer",
    icon: Landmark,
    title: "Government or Institutional Viewer",
    description: "Memantau data agregat untuk kebutuhan kebijakan dan pengawasan kesehatan hewan.",
  },
];

export const targetPersonas: PersonaItem[] = [
  {
    id: "smallholder",
    icon: Users,
    title: "Smallholder Farmers",
    description: "Peternak individu dengan skala kecil yang ingin memantau ternak dengan lebih mudah.",
    image: "Images/peternak-indo.jpg",
  },
  {
    id: "cooperative",
    icon: Handshake,
    title: "Livestock Cooperatives",
    description: "Koperasi yang mengelola data kesehatan ternak dari banyak anggota peternak.",
    image: images.personaCooperative,
  },
  {
    id: "commercial",
    icon: Building2,
    title: "Commercial Farms",
    description: "Peternakan skala industri yang membutuhkan manajemen herd berskala besar.",
    image: images.personaCommercial,
  },
  {
    id: "government",
    icon: Landmark,
    title: "Government and Veterinary Institutions",
    description: "Lembaga yang membutuhkan data agregat untuk pengawasan kesehatan hewan nasional.",
    image: images.personaGovernment,
  },
];
