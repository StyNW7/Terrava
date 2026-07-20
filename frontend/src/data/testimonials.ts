import type { TestimonialItem } from "@/types";
import { images } from "@/data/images";

export const testimonials: TestimonialItem[] = [
  {
    id: "testimonial-1",
    quote:
      "Dengan peringatan dini, kami tidak harus menunggu hingga gejala terlihat parah sebelum mengambil tindakan.",
    name: "Pak Slamet Riyadi",
    role: "Peternak Sapi Perah",
    location: "Boyolali, Jawa Tengah",
    image: images.farmerSmartphone,
  },
  {
    id: "testimonial-2",
    quote:
      "Dashboard Terrava membantu kami memantau puluhan ekor sapi tanpa harus keliling kandang setiap jam.",
    name: "Ibu Ratna Kusuma",
    role: "Ketua Koperasi Ternak",
    location: "Pasuruan, Jawa Timur",
    image: images.personaCooperative,
  },
  {
    id: "testimonial-3",
    quote:
      "Riwayat kesehatan yang tercatat rapi sangat membantu tim dokter hewan kami dalam menentukan tindakan lanjutan.",
    name: "drh. Andi Wirawan",
    role: "Dokter Hewan Pendamping",
    location: "Malang, Jawa Timur",
    image: images.vetChecking,
  },
];
