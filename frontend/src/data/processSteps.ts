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
    description: {
      id: "Daftarkan diri Anda sebagai peternak, manajer, atau administrator koperasi.",
      en: "Register as a farmer, a farm manager, or a cooperative administrator.",
    },
    image: images.farmerSmartphone,
  },
  {
    id: "register-farm",
    number: 2,
    icon: Building2,
    title: "Register the Farm",
    description: {
      id: "Tambahkan informasi peternakan seperti lokasi, kandang, dan jumlah ternak.",
      en: "Add your farm details: location, barns, and herd size.",
    },
    image: images.modernBarn,
  },
  {
    id: "add-livestock",
    number: 3,
    icon: ClipboardList,
    title: "Add Livestock Profiles",
    description: {
      id: "Buat profil digital untuk setiap ekor ternak beserta data dasarnya.",
      en: "Create a digital profile for every animal, along with its baseline data.",
    },
    image: images.cattleHerd,
  },
  {
    id: "pair-tags",
    number: 4,
    icon: Radio,
    title: "Pair Smart Ear Tags",
    description: {
      id: "Hubungkan smart ear tag ke masing-masing ternak melalui aplikasi.",
      en: "Pair a smart ear tag with each animal from the app.",
    },
    image: "Images/close-up-ear-tag.png",
  },
  {
    id: "collect-data",
    number: 5,
    icon: Activity,
    title: "Collect Real-Time Data",
    description: {
      id: "Sensor mengumpulkan data fisiologis, aktivitas, dan lokasi secara berkelanjutan.",
      en: "Sensors collect physiological, activity, and location data continuously.",
    },
    image: images.sensorTech,
  },
  {
    id: "analyze-ai",
    number: 6,
    icon: BrainCircuit,
    title: "Analyze with AI",
    description: {
      id: "AI menganalisis data untuk mendeteksi pola dan potensi anomali kesehatan.",
      en: "AI analyses the data to surface patterns and potential health anomalies.",
    },
    image: images.dataDashboard,
  },
  {
    id: "receive-alerts",
    number: 7,
    icon: BellRing,
    title: "Receive Alerts and Take Action",
    description: {
      id: "Peternak menerima notifikasi dan rekomendasi tindakan yang perlu diambil.",
      en: "Farmers receive notifications along with the actions they should take next.",
    },
    image: images.farmerSmartphone,
  },
];
