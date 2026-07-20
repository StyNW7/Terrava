import type { FaqItem } from "@/types";

export const homeFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "Apa itu Terrava?",
    answer:
      "Terrava adalah platform Smart Livestock Ecosystem berbasis AI dan IoT yang membantu peternak memantau kesehatan ternak, mendeteksi risiko lebih awal, dan mengelola peternakan secara lebih efisien.",
  },
  {
    id: "faq-2",
    question: "Bagaimana smart ear tag bekerja?",
    answer:
      "Smart ear tag dipasang pada telinga ternak dan dilengkapi sensor fisiologis serta GPS. Data yang terekam dikirim melalui jaringan LoRa ke cloud untuk dianalisis oleh AI.",
  },
  {
    id: "faq-3",
    question: "Apakah Terrava dapat digunakan tanpa internet stabil?",
    answer:
      "Ya. Perangkat menggunakan konektivitas LoRa jarak jauh dan menyimpan data secara lokal sebelum dikirim secara terjadwal, sehingga tetap dapat berfungsi di area dengan koneksi internet terbatas.",
  },
  {
    id: "faq-4",
    question: "Jenis ternak apa yang didukung?",
    answer:
      "Pada tahap MVP, Terrava berfokus pada monitoring sapi. Pengembangan untuk jenis ternak lain direncanakan pada tahap berikutnya.",
  },
  {
    id: "faq-5",
    question: "Apakah Terrava menggantikan dokter hewan?",
    answer:
      "Tidak. Terrava membantu proses pengambilan keputusan melalui data dan insight, namun tidak menggantikan diagnosis profesional dari dokter hewan.",
  },
  {
    id: "faq-6",
    question: "Apakah platform dapat digunakan oleh koperasi?",
    answer:
      "Ya. Terrava dirancang dengan arsitektur modular yang mendukung penggunaan oleh peternak individu, koperasi, hingga peternakan skala industri.",
  },
  {
    id: "faq-7",
    question: "Bagaimana keamanan datanya?",
    answer:
      "Data ternak dan peternak disimpan pada infrastruktur cloud dengan praktik keamanan standar industri, termasuk enkripsi data dan kontrol akses berbasis peran.",
  },
];

export const contactFaqs: FaqItem[] = [
  {
    id: "contact-faq-1",
    question: "Bagaimana cara mengajukan demo Terrava?",
    answer:
      "Isi formulir kontak dengan memilih jenis pengajuan Request Demo, tim kami akan menghubungi Anda untuk menjadwalkan sesi demo.",
  },
  {
    id: "contact-faq-2",
    question: "Apa saja tahapan pilot project?",
    answer:
      "Pilot project dimulai dari asesmen kebutuhan peternakan, pemasangan perangkat, pendampingan penggunaan dashboard, hingga evaluasi hasil.",
  },
  {
    id: "contact-faq-3",
    question: "Bagaimana skema harga Terrava?",
    answer:
      "Skema harga disesuaikan dengan skala peternakan dan kebutuhan perangkat. Tim kami akan memberikan penawaran setelah sesi konsultasi awal.",
  },
  {
    id: "contact-faq-4",
    question: "Apakah perangkat sudah tersedia untuk umum?",
    answer:
      "Perangkat saat ini tersedia untuk program pilot terbatas. Ketersediaan umum akan mengikuti hasil evaluasi pilot project.",
  },
  {
    id: "contact-faq-5",
    question: "Bagaimana cara menjajaki kemitraan dengan Terrava?",
    answer:
      "Pilih jenis pengajuan Partnership pada formulir kontak, dan sertakan informasi organisasi Anda untuk ditindaklanjuti oleh tim kemitraan kami.",
  },
];
