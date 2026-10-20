import type { TestimonialItem } from "@/types";

export const testimonials: TestimonialItem[] = [
  {
    id: "testimonial-1",
    quote: {
      id: "Dengan peringatan dini, kami tidak harus menunggu hingga gejala terlihat parah sebelum mengambil tindakan.",
      en: "With early warnings, we no longer have to wait until symptoms turn severe before we act.",
    },
    name: "Pak Slamet Riyadi",
    role: { id: "Peternak Sapi Perah", en: "Dairy Cattle Farmer" },
    location: "Boyolali, Jawa Tengah",
    image: "Images/avatar/male.jpg",
  },
  {
    id: "testimonial-2",
    quote: {
      id: "Dashboard Terrava membantu kami memantau puluhan ekor sapi tanpa harus keliling kandang setiap jam.",
      en: "The Terrava dashboard lets us monitor dozens of cattle without walking the barns every hour.",
    },
    name: "Ibu Ratna Kusuma",
    role: { id: "Ketua Koperasi Ternak", en: "Livestock Cooperative Chair" },
    location: "Pasuruan, Jawa Timur",
    image: "Images/avatar/female.jpg",
  },
  {
    id: "testimonial-3",
    quote: {
      id: "Riwayat kesehatan yang tercatat rapi sangat membantu tim dokter hewan kami dalam menentukan tindakan lanjutan.",
      en: "Cleanly recorded health histories make it far easier for our veterinary team to decide on follow-up care.",
    },
    name: "drh. Andi Wirawan",
    role: { id: "Dokter Hewan Pendamping", en: "Supervising Veterinarian" },
    location: "Malang, Jawa Timur",
    image: "Images/avatar/male.jpg",
  },
];
