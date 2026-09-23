import type { FaqItem } from "@/types";

export const homeFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: { id: "Apa itu Terrava?", en: "What is Terrava?" },
    answer: {
      id: "Terrava adalah platform Smart Livestock Ecosystem berbasis AI dan IoT yang membantu peternak memantau kesehatan ternak, mendeteksi risiko lebih awal, dan mengelola peternakan secara lebih efisien.",
      en: "Terrava is an AI- and IoT-powered Smart Livestock Ecosystem that helps farmers monitor herd health, detect risks earlier, and run their farms more efficiently.",
    },
  },
  {
    id: "faq-2",
    question: { id: "Bagaimana smart ear tag bekerja?", en: "How does the smart ear tag work?" },
    answer: {
      id: "Smart ear tag dipasang pada telinga ternak dan dilengkapi sensor fisiologis serta GPS. Data yang terekam dikirim melalui jaringan LoRa ke cloud untuk dianalisis oleh AI.",
      en: "The smart ear tag is fitted to the animal's ear and carries physiological sensors alongside GPS. The data it records travels over a LoRa network to the cloud, where AI analyses it.",
    },
  },
  {
    id: "faq-3",
    question: {
      id: "Apakah Terrava dapat digunakan tanpa internet stabil?",
      en: "Can Terrava be used without a stable internet connection?",
    },
    answer: {
      id: "Ya. Perangkat menggunakan konektivitas LoRa jarak jauh dan menyimpan data secara lokal sebelum dikirim secara terjadwal, sehingga tetap dapat berfungsi di area dengan koneksi internet terbatas.",
      en: "Yes. The device uses long-range LoRa connectivity and stores data locally before sending it on a schedule, so it keeps working in areas with limited internet coverage.",
    },
  },
  {
    id: "faq-4",
    question: { id: "Jenis ternak apa yang didukung?", en: "Which types of livestock are supported?" },
    answer: {
      id: "Pada tahap MVP, Terrava berfokus pada monitoring sapi. Pengembangan untuk jenis ternak lain direncanakan pada tahap berikutnya.",
      en: "At the MVP stage, Terrava focuses on cattle monitoring. Support for other livestock types is planned for later phases.",
    },
  },
  {
    id: "faq-5",
    question: { id: "Apakah Terrava menggantikan dokter hewan?", en: "Does Terrava replace a veterinarian?" },
    answer: {
      id: "Tidak. Terrava membantu proses pengambilan keputusan melalui data dan insight, namun tidak menggantikan diagnosis profesional dari dokter hewan.",
      en: "No. Terrava supports decision-making with data and insight, but it does not replace a professional veterinary diagnosis.",
    },
  },
  {
    id: "faq-6",
    question: {
      id: "Apakah platform dapat digunakan oleh koperasi?",
      en: "Can cooperatives use the platform?",
    },
    answer: {
      id: "Ya. Terrava dirancang dengan arsitektur modular yang mendukung penggunaan oleh peternak individu, koperasi, hingga peternakan skala industri.",
      en: "Yes. Terrava is built on a modular architecture that serves individual farmers, cooperatives, and industrial-scale operations alike.",
    },
  },
  {
    id: "faq-7",
    question: { id: "Bagaimana keamanan datanya?", en: "How is the data secured?" },
    answer: {
      id: "Data ternak dan peternak disimpan pada infrastruktur cloud dengan praktik keamanan standar industri, termasuk enkripsi data dan kontrol akses berbasis peran.",
      en: "Livestock and farmer data is held on cloud infrastructure using industry-standard security practices, including data encryption and role-based access control.",
    },
  },
];

export const contactFaqs: FaqItem[] = [
  {
    id: "contact-faq-1",
    question: { id: "Bagaimana cara mengajukan demo Terrava?", en: "How do I request a Terrava demo?" },
    answer: {
      id: "Isi formulir kontak dengan memilih jenis pengajuan Request Demo, tim kami akan menghubungi Anda untuk menjadwalkan sesi demo.",
      en: "Fill in the contact form and select Request Demo as the inquiry type. Our team will get in touch to schedule a session.",
    },
  },
  {
    id: "contact-faq-2",
    question: { id: "Apa saja tahapan pilot project?", en: "What are the stages of a pilot project?" },
    answer: {
      id: "Pilot project dimulai dari asesmen kebutuhan peternakan, pemasangan perangkat, pendampingan penggunaan dashboard, hingga evaluasi hasil.",
      en: "A pilot starts with a farm needs assessment, then device installation, hands-on dashboard onboarding, and finally a results evaluation.",
    },
  },
  {
    id: "contact-faq-3",
    question: { id: "Bagaimana skema harga Terrava?", en: "How is Terrava priced?" },
    answer: {
      id: "Skema harga disesuaikan dengan skala peternakan dan kebutuhan perangkat. Tim kami akan memberikan penawaran setelah sesi konsultasi awal.",
      en: "Pricing is tailored to farm size and device requirements. Our team provides a quote after an initial consultation.",
    },
  },
  {
    id: "contact-faq-4",
    question: {
      id: "Apakah perangkat sudah tersedia untuk umum?",
      en: "Is the device generally available yet?",
    },
    answer: {
      id: "Perangkat saat ini tersedia untuk program pilot terbatas. Ketersediaan umum akan mengikuti hasil evaluasi pilot project.",
      en: "The device is currently available through a limited pilot programme. General availability will follow the pilot evaluation.",
    },
  },
  {
    id: "contact-faq-5",
    question: {
      id: "Bagaimana cara menjajaki kemitraan dengan Terrava?",
      en: "How can I explore a partnership with Terrava?",
    },
    answer: {
      id: "Pilih jenis pengajuan Partnership pada formulir kontak, dan sertakan informasi organisasi Anda untuk ditindaklanjuti oleh tim kemitraan kami.",
      en: "Select Partnership as the inquiry type on the contact form and include your organisation details so our partnerships team can follow up.",
    },
  },
];
