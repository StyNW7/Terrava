import {
  UserPlus,
  Building2,
  ClipboardList,
  Radio,
  Activity,
  BrainCircuit,
  BellRing,
} from "lucide-react";
import type { ProcessStep } from "@/types";
import { images } from "@/data/images";

export const journeySteps: ProcessStep[] = [
  {
    id: "create-account",
    number: 1,
    icon: UserPlus,
    title: "Create an Account",
    description: "Daftarkan diri Anda sebagai peternak, manajer, atau administrator koperasi.",
    image: images.farmerSmartphone,
  },
  {
    id: "register-farm",
    number: 2,
    icon: Building2,
    title: "Register the Farm",
    description: "Tambahkan informasi peternakan seperti lokasi, kandang, dan jumlah ternak.",
    image: images.modernBarn,
  },
  {
    id: "add-livestock",
    number: 3,
    icon: ClipboardList,
    title: "Add Livestock Profiles",
    description: "Buat profil digital untuk setiap ekor ternak beserta data dasarnya.",
    image: images.cattleHerd,
  },
  {
    id: "pair-tags",
    number: 4,
    icon: Radio,
    title: "Pair Smart Ear Tags",
    description: "Hubungkan smart ear tag ke masing-masing ternak melalui aplikasi.",
    image: "Images/close-up-ear-tag.png",
  },
  {
    id: "collect-data",
    number: 5,
    icon: Activity,
    title: "Collect Real-Time Data",
    description: "Sensor mengumpulkan data fisiologis, aktivitas, dan lokasi secara berkelanjutan.",
    image: images.sensorTech,
  },
  {
    id: "analyze-ai",
    number: 6,
    icon: BrainCircuit,
    title: "Analyze with AI",
    description: "AI menganalisis data untuk mendeteksi pola dan potensi anomali kesehatan.",
    image: images.dataDashboard,
  },
  {
    id: "receive-alerts",
    number: 7,
    icon: BellRing,
    title: "Receive Alerts and Take Action",
    description: "Peternak menerima notifikasi dan rekomendasi tindakan yang perlu diambil.",
    image: images.farmerSmartphone,
  },
];
