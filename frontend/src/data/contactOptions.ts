import {
  MonitorPlay,
  FlaskConical,
  Handshake,
  Microscope,
  Wrench,
  MessageCircleQuestion,
} from "lucide-react";
import type { ContactOption } from "@/types";

export const contactOptions: ContactOption[] = [
  {
    id: "request-demo",
    icon: MonitorPlay,
    title: "Request Demo",
    description: {
      id: "Lihat langsung bagaimana dashboard dan smart ear tag Terrava bekerja.",
      en: "See exactly how the Terrava dashboard and smart ear tag work together.",
    },
  },
  {
    id: "pilot-project",
    icon: FlaskConical,
    title: "Pilot Project",
    description: {
      id: "Ajukan program uji coba Terrava pada peternakan atau koperasi Anda.",
      en: "Apply to run a Terrava trial on your farm or within your cooperative.",
    },
  },
  {
    id: "partnership",
    icon: Handshake,
    title: "Partnership",
    description: {
      id: "Jajaki kemitraan teknologi, distribusi, atau pendanaan bersama Terrava.",
      en: "Explore a technology, distribution, or funding partnership with Terrava.",
    },
  },
  {
    id: "research",
    icon: Microscope,
    title: "Research Collaboration",
    description: {
      id: "Kolaborasi riset akademik terkait AI, IoT, dan kesehatan ternak.",
      en: "Academic research collaboration across AI, IoT, and livestock health.",
    },
  },
  {
    id: "technical",
    icon: Wrench,
    title: "Technical Inquiry",
    description: {
      id: "Pertanyaan teknis seputar perangkat, integrasi, dan infrastruktur data.",
      en: "Technical questions about devices, integrations, and data infrastructure.",
    },
  },
  {
    id: "general",
    icon: MessageCircleQuestion,
    title: "General Inquiry",
    description: {
      id: "Pertanyaan umum lainnya seputar Terrava dan layanannya.",
      en: "Any other general question about Terrava and its services.",
    },
  },
];
