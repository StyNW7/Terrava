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
    description: "Lihat langsung bagaimana dashboard dan smart ear tag Terrava bekerja.",
  },
  {
    id: "pilot-project",
    icon: FlaskConical,
    title: "Pilot Project",
    description: "Ajukan program uji coba Terrava pada peternakan atau koperasi Anda.",
  },
  {
    id: "partnership",
    icon: Handshake,
    title: "Partnership",
    description: "Jajaki kemitraan teknologi, distribusi, atau pendanaan bersama Terrava.",
  },
  {
    id: "research",
    icon: Microscope,
    title: "Research Collaboration",
    description: "Kolaborasi riset akademik terkait AI, IoT, dan kesehatan ternak.",
  },
  {
    id: "technical",
    icon: Wrench,
    title: "Technical Inquiry",
    description: "Pertanyaan teknis seputar perangkat, integrasi, dan infrastruktur data.",
  },
  {
    id: "general",
    icon: MessageCircleQuestion,
    title: "General Inquiry",
    description: "Pertanyaan umum lainnya seputar Terrava dan layanannya.",
  },
];
