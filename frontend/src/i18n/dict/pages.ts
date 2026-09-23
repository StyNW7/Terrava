import type { Dictionary } from "@/i18n/types";

/** About, Solutions, Smart Ear Tag, How It Works, Impact, Contact, 404. */
export const pages: Dictionary = {
  // --- Shared CTA labels ---------------------------------------------------
  "cta.requestDemo": { id: "Request Demo", en: "Request Demo" },
  "cta.contactTeam": { id: "Hubungi Tim Kami", en: "Contact Our Team" },
  "cta.seeHowItWorks": { id: "Lihat Cara Kerja", en: "See How It Works" },
  "cta.viewSolutions": { id: "Lihat Solusi", en: "View Solutions" },
  "cta.exploreSolutions": { id: "Jelajahi Solusi", en: "Explore Solutions" },
  "cta.learnAboutUs": { id: "Kenali Kami", en: "Learn About Us" },

  // --- Home FAQ + CTA ------------------------------------------------------
  "home.faq.title": { id: "Pertanyaan seputar Terrava", en: "Questions about Terrava" },
  "home.faq.description": {
    id: "Jawaban singkat untuk pertanyaan yang paling sering diajukan peternak dan mitra.",
    en: "Short answers to the questions farmers and partners ask us most.",
  },
  "home.cta.title": {
    id: "Bangun peternakan yang lebih sehat dan produktif bersama Terrava.",
    en: "Build a healthier, more productive farm with Terrava.",
  },
  "home.cta.description": {
    id: "Mulai dengan demo singkat atau hubungi tim kami untuk mendiskusikan kebutuhan peternakan Anda.",
    en: "Start with a short demo, or talk to our team about what your farm needs.",
  },

  // --- About ---------------------------------------------------------------
  "about.hero.badge": { id: "About Terrava", en: "About Terrava" },
  "about.hero.title": {
    id: "Teknologi yang tumbuh dari kebutuhan nyata peternak.",
    en: "Technology grown from what farmers actually need.",
  },
  "about.hero.description": {
    id: "Terrava dibangun untuk menghubungkan kesehatan ternak, data, dan pengambilan keputusan dalam satu ekosistem yang modular dan mudah digunakan.",
    en: "Terrava connects livestock health, data, and decision-making in one modular ecosystem that is genuinely easy to use.",
  },
  "about.hero.imageAlt": {
    id: "Tim Terrava bersama teknologi peternakan",
    en: "The Terrava team with its livestock technology",
  },
  "about.vision.badge": { id: "Vision", en: "Vision" },
  "about.vision.title": {
    id: "Menjadi fondasi digital bagi peternakan yang sehat, produktif, dan berkelanjutan.",
    en: "To be the digital foundation for healthy, productive, and sustainable livestock farming.",
  },
  "about.values.badge": { id: "Our Values", en: "Our Values" },
  "about.values.title": {
    id: "Prinsip yang memandu setiap keputusan kami",
    en: "The principles behind every decision we make",
  },
  "about.recognition.badge": { id: "Recognition", en: "Recognition" },
  "about.recognition.title": {
    id: "Pencapaian dan langkah kolaborasi kami",
    en: "Our milestones and collaborations",
  },
  "about.team.badge": { id: "Our Team", en: "Our Team" },
  "about.team.title": { id: "Tim di balik Terrava", en: "The team behind Terrava" },
  "about.story.badge": { id: "Our Story", en: "Our Story" },
  "about.story.title": {
    id: "Perjalanan menuju smart livestock ecosystem",
    en: "The road to a smart livestock ecosystem",
  },
  "about.story.description": {
    id: "Terrava lahir dari serangkaian iterasi produk yang terus mendekatkan teknologi dengan kebutuhan nyata peternak Indonesia.",
    en: "Terrava emerged from a series of product iterations, each one bringing the technology closer to what Indonesian farmers actually need.",
  },
  "about.sdgDescription": {
    id: "Terrava berkontribusi pada tujuan pembangunan berkelanjutan melalui inovasi teknologi peternakan.",
    en: "Terrava contributes to the Sustainable Development Goals through livestock technology innovation.",
  },
  "about.cta.title": { id: "Kenali Terrava lebih dekat", en: "Get to know Terrava better" },
  "about.cta.description": {
    id: "Lihat bagaimana teknologi kami bekerja langsung di lapangan.",
    en: "See how our technology works out in the field.",
  },
  "about.cta.primary": { id: "Lihat Terrava Beraksi", en: "Meet Terrava in Action" },

  // --- Solutions -----------------------------------------------------------
  "solutions.hero.badge": { id: "Solutions", en: "Solutions" },
  "solutions.hero.title": {
    id: "Satu ekosistem untuk kesehatan, produktivitas, dan operasional peternakan.",
    en: "One ecosystem for herd health, productivity, and farm operations.",
  },
  "solutions.ai.badge": { id: "AI Intelligence", en: "AI Intelligence" },
  "solutions.ai.title": { id: "Bagaimana AI Terrava bekerja", en: "How Terrava AI works" },
  "solutions.ai.description": {
    id: "Model AI Terrava belajar dari data historis setiap ternak untuk memberikan insight yang relevan dan dapat ditindaklanjuti.",
    en: "Terrava's AI models learn from each animal's history to deliver insight that is relevant and ready to act on.",
  },
  "solutions.ai.step.collect": { id: "Kumpulkan Data", en: "Collect Data" },
  "solutions.ai.step.baseline": { id: "Bangun Baseline", en: "Build Baseline" },
  "solutions.ai.step.detect": { id: "Deteksi Anomali", en: "Detect Anomalies" },
  "solutions.ai.step.analyze": { id: "Analisis Pola", en: "Analyze Patterns" },
  "solutions.ai.step.recommend": { id: "Hasilkan Rekomendasi", en: "Generate Recommendations" },
  "solutions.ai.step.support": { id: "Dukung Keputusan", en: "Support Human Decision" },
  "solutions.ai.disclaimer": {
    id: "AI Terrava membantu proses pengambilan keputusan dan tidak menggantikan diagnosis profesional dokter hewan.",
    en: "Terrava AI supports decision-making; it does not replace a professional veterinary diagnosis.",
  },
  "solutions.ecosystem.badge": { id: "Platform Ecosystem", en: "Platform Ecosystem" },
  "solutions.ecosystem.title": {
    id: "Satu alur data yang menghubungkan seluruh ekosistem",
    en: "A single data flow that connects the whole ecosystem",
  },
  "solutions.ecosystem.node.livestock": { id: "Ternak", en: "Livestock" },
  "solutions.ecosystem.node.earTag": { id: "Smart Ear Tag", en: "Smart Ear Tag" },
  "solutions.ecosystem.node.gateway": { id: "Gateway", en: "Gateway" },
  "solutions.ecosystem.node.cloud": { id: "Cloud", en: "Cloud" },
  "solutions.ecosystem.node.aiEngine": { id: "AI Engine", en: "AI Engine" },
  "solutions.ecosystem.node.dashboard": { id: "Dashboard", en: "Dashboard" },
  "solutions.ecosystem.node.people": { id: "Peternak, Manajer, Dokter Hewan", en: "Farmer, Manager, Vet" },
  "solutions.comparison.badge": { id: "Comparison", en: "Comparison" },
  "solutions.comparison.title": {
    id: "Traditional Monitoring vs Terrava",
    en: "Traditional Monitoring vs Terrava",
  },
  "solutions.comparison.aspect": { id: "Aspek", en: "Aspect" },
  "solutions.comparison.traditional": { id: "Traditional Monitoring", en: "Traditional Monitoring" },
  "solutions.comparison.monitoring.aspect": { id: "Monitoring", en: "Monitoring" },
  "solutions.comparison.monitoring.traditional": { id: "Manual, berkala", en: "Manual and periodic" },
  "solutions.comparison.monitoring.terrava": { id: "Real-time, berkelanjutan", en: "Real-time and continuous" },
  "solutions.comparison.detection.aspect": { id: "Deteksi", en: "Detection" },
  "solutions.comparison.detection.traditional": {
    id: "Bergantung pada observasi visual",
    en: "Dependent on visual observation",
  },
  "solutions.comparison.detection.terrava": {
    id: "Dibantu deteksi anomali berbasis AI",
    en: "Assisted by AI-based anomaly detection",
  },
  "solutions.comparison.history.aspect": { id: "Riwayat Data", en: "Data History" },
  "solutions.comparison.history.traditional": { id: "Sering tidak konsisten", en: "Frequently inconsistent" },
  "solutions.comparison.history.terrava": {
    id: "Tersimpan otomatis dan terpusat",
    en: "Stored automatically and centrally",
  },
  "solutions.comparison.accessibility.aspect": { id: "Aksesibilitas", en: "Accessibility" },
  "solutions.comparison.accessibility.traditional": {
    id: "Terbatas di lokasi kandang",
    en: "Limited to the barn itself",
  },
  "solutions.comparison.accessibility.terrava": {
    id: "Dapat diakses dari web dan mobile",
    en: "Available on web and mobile",
  },
  "solutions.comparison.alert.aspect": { id: "Alert", en: "Alerts" },
  "solutions.comparison.alert.traditional": {
    id: "Tidak ada notifikasi otomatis",
    en: "No automatic notifications",
  },
  "solutions.comparison.alert.terrava": {
    id: "Notifikasi real-time dan terkategori",
    en: "Real-time, categorised notifications",
  },
  "solutions.comparison.scalability.aspect": { id: "Skalabilitas", en: "Scalability" },
  "solutions.comparison.scalability.traditional": {
    id: "Sulit untuk banyak ternak",
    en: "Hard to scale across a large herd",
  },
  "solutions.comparison.scalability.terrava": {
    id: "Mendukung multi-kandang dan multi-farm",
    en: "Supports multiple barns and multiple farms",
  },
  "solutions.comparison.decision.aspect": { id: "Dukungan Keputusan", en: "Decision Support" },
  "solutions.comparison.decision.traditional": { id: "Berdasarkan perkiraan", en: "Based on guesswork" },
  "solutions.comparison.decision.terrava": {
    id: "Didukung insight dan rekomendasi data",
    en: "Backed by insight and data-driven recommendations",
  },
  "solutions.cta.title": { id: "Find the Right Solution for Your Farm", en: "Find the Right Solution for Your Farm" },
  "solutions.cta.description": {
    id: "Konsultasikan kebutuhan peternakan Anda dengan tim Terrava.",
    en: "Talk through what your farm needs with the Terrava team.",
  },

  // --- Smart Ear Tag -------------------------------------------------------
  "eartag.hero.title": {
    id: "Teknologi ringan yang menjaga setiap detak, gerakan, dan lokasi ternak.",
    en: "Lightweight technology that tracks every heartbeat, movement, and location.",
  },
  "eartag.overview.title": { id: "Product Overview", en: "Product Overview" },
  "eartag.overview.description": {
    id: "Smart ear tag Terrava dirancang sebagai perangkat hemat energi untuk mengumpulkan data fisiologis, aktivitas, dan lokasi ternak secara berkelanjutan, tanpa mengganggu aktivitas hariannya.",
    en: "The Terrava smart ear tag is a low-power device that continuously gathers physiological, activity, and location data without interrupting the animal's daily routine.",
  },
  "eartag.sensors.badge": { id: "Key Sensors", en: "Key Sensors" },
  "eartag.sensors.title": {
    id: "Komponen sensor di dalam smart ear tag",
    en: "The sensors inside the smart ear tag",
  },
  "eartag.sensors.description": {
    id: "Setiap sensor bekerja bersama untuk memberikan gambaran menyeluruh terhadap kondisi ternak.",
    en: "Each sensor works with the others to build a complete picture of the animal's condition.",
  },
  "eartag.anatomy.badge": { id: "Product Anatomy", en: "Product Anatomy" },
  "eartag.anatomy.title": { id: "Anatomi interaktif smart ear tag", en: "Interactive smart ear tag anatomy" },
  "eartag.anatomy.description": {
    id: "Klik setiap titik untuk melihat penjelasan komponen perangkat.",
    en: "Select any marker to read about that component.",
  },
  "eartag.anatomy.imageAlt": {
    id: "Anatomi smart ear tag Terrava",
    en: "Anatomy of the Terrava smart ear tag",
  },
  "eartag.dataFlow.badge": { id: "Data Flow", en: "Data Flow" },
  "eartag.dataFlow.title": {
    id: "Bagaimana data mengalir dari perangkat ke dashboard",
    en: "How data travels from the device to the dashboard",
  },
  "eartag.dataFlow.step.sensorReading": { id: "Pembacaan Sensor", en: "Sensor Reading" },
  "eartag.dataFlow.step.localStorage": { id: "Penyimpanan Lokal", en: "Local Storage" },
  "eartag.dataFlow.step.scheduledTransmission": { id: "Transmisi Terjadwal", en: "Scheduled Transmission" },
  "eartag.dataFlow.step.loraGateway": { id: "LoRa Gateway", en: "LoRa Gateway" },
  "eartag.dataFlow.step.cloud": { id: "Cloud", en: "Cloud" },
  "eartag.dataFlow.step.aiAnalysis": { id: "Analisis AI", en: "AI Analysis" },
  "eartag.dataFlow.step.farmerDashboard": { id: "Dashboard Peternak", en: "Farmer Dashboard" },
  "eartag.energy.badge": { id: "Energy Efficiency", en: "Energy Efficiency" },
  "eartag.energy.title": { id: "Dirancang untuk daya tahan jangka panjang", en: "Built to last in the field" },
  "eartag.energy.description": {
    id: "Kombinasi mode hemat daya dan pengisian tambahan mendukung target masa pakai baterai yang panjang.",
    en: "Low-power modes combined with supplementary charging support a long target battery life.",
  },
  "eartag.energy.point.deepSleep": { id: "Mode deep sleep", en: "Deep sleep mode" },
  "eartag.energy.point.periodicSensing": { id: "Pembacaan berkala", en: "Periodic sensing" },
  "eartag.energy.point.dailyTransmission": { id: "Transmisi harian", en: "Daily transmission" },
  "eartag.energy.point.solarCharging": { id: "Pengisian bantuan surya", en: "Solar-assisted charging" },
  "eartag.energy.chartTitle": { id: "Konsumsi Daya per Mode", en: "Power Draw by Mode" },
  "eartag.energy.chartDescription": {
    id: "Ilustrasi contoh konsumsi arus pada tiap mode operasi (mA)",
    en: "Illustrative current draw for each operating mode (mA)",
  },
  "eartag.connectivity.badge": { id: "Connectivity", en: "Connectivity" },
  "eartag.connectivity.title": { id: "Mengapa Terrava menggunakan LoRa", en: "Why Terrava uses LoRa" },
  "eartag.connectivity.description": {
    id: "LoRa dipilih karena cocok untuk kondisi peternakan yang luas dan minim infrastruktur jaringan.",
    en: "LoRa suits large farms where network infrastructure is thin on the ground.",
  },
  "eartag.connectivity.reason.longRange": { id: "Komunikasi jarak jauh", en: "Long-range communication" },
  "eartag.connectivity.reason.lowEnergy": { id: "Konsumsi energi lebih rendah", en: "Lower energy consumption" },
  "eartag.connectivity.reason.wideFarms": { id: "Cocok untuk area luas", en: "Suitable for wide farms" },
  "eartag.connectivity.reason.gateway": { id: "Konektivitas berbasis gateway", en: "Gateway-based connectivity" },
  "eartag.connectivity.reason.rural": { id: "Lebih baik di area pedesaan", en: "Better for rural environments" },
  "eartag.comfort.badge": { id: "Animal Comfort and Safety", en: "Animal Comfort and Safety" },
  "eartag.comfort.title": {
    id: "Dirancang dengan kenyamanan ternak sebagai prioritas",
    en: "Designed with animal comfort as the priority",
  },
  "eartag.comfort.imageAlt": { id: "Sapi dalam kandang modern", en: "Cattle in a modern barn" },
  "eartag.comfort.point.compact": { id: "Desain ringkas", en: "Compact design" },
  "eartag.comfort.point.lightweight": { id: "Konstruksi ringan", en: "Lightweight construction" },
  "eartag.comfort.point.positioning": { id: "Penempatan di jaringan telinga", en: "Positioning around ear tissue" },
  "eartag.comfort.point.nonIntrusive": { id: "Konsep monitoring non-intrusif", en: "Non-intrusive monitoring concept" },
  "eartag.comfort.point.durable": { id: "Casing tahan kondisi lapangan", en: "Durable field-ready casing" },
  "eartag.comfort.point.validation": {
    id: "Masih memerlukan validasi lanjutan dari dokter hewan dan uji lapangan",
    en: "Further veterinary and field validation required",
  },
  "eartag.specs.badge": { id: "Specifications", en: "Specifications" },
  "eartag.specs.title": { id: "Spesifikasi teknis smart ear tag", en: "Smart ear tag technical specifications" },
  "eartag.cta.title": { id: "Bring Smart Monitoring to Your Livestock", en: "Bring Smart Monitoring to Your Livestock" },
  "eartag.cta.description": {
    id: "Diskusikan kebutuhan perangkat untuk peternakan Anda bersama tim Terrava.",
    en: "Discuss your farm's device requirements with the Terrava team.",
  },

  // --- How It Works --------------------------------------------------------
  "howitworks.hero.title": {
    id: "Dari pemasangan perangkat hingga keputusan—semuanya dalam satu alur cerdas.",
    en: "From fitting the device to making the call — all in one intelligent flow.",
  },
  "howitworks.steps.badge": { id: "Step by Step", en: "Step by Step" },
  "howitworks.steps.title": {
    id: "Dari pendaftaran hingga tindakan nyata",
    en: "From sign-up to real action",
  },
  "howitworks.steps.description": {
    id: "Tujuh langkah utama yang membawa peternak dari pendaftaran akun hingga pengambilan keputusan berbasis data.",
    en: "Seven steps that take a farmer from creating an account to making data-driven decisions.",
  },
  "howitworks.technical.badge": { id: "Technical Workflow", en: "Technical Workflow" },
  "howitworks.technical.title": {
    id: "Arsitektur teknis di balik Terrava",
    en: "The technical architecture behind Terrava",
  },
  "howitworks.journeyScenario.badge": { id: "Farmer Journey", en: "Farmer Journey" },
  "howitworks.journeyScenario.title": {
    id: "Contoh skenario penggunaan sehari-hari",
    en: "A day-to-day usage scenario",
  },
  "howitworks.journeyScenario.description": {
    id: "Ilustrasi bagaimana Terrava membantu peternak merespons perubahan kondisi ternak.",
    en: "An illustration of how Terrava helps farmers respond when an animal's condition changes.",
  },
  "howitworks.journeyScenario.step1": {
    id: "Sapi mengalami peningkatan suhu dan penurunan aktivitas",
    en: "A cow's temperature rises while its activity falls",
  },
  "howitworks.journeyScenario.step2": {
    id: "Sensor mengirimkan data ke cloud melalui gateway",
    en: "Sensors send the data to the cloud through the gateway",
  },
  "howitworks.journeyScenario.step3": {
    id: "AI mendeteksi pola abnormal dibandingkan baseline",
    en: "AI detects a pattern that deviates from the baseline",
  },
  "howitworks.journeyScenario.step4": {
    id: "Peternak menerima alert melalui dashboard dan notifikasi",
    en: "The farmer receives an alert on the dashboard and by notification",
  },
  "howitworks.journeyScenario.step5": {
    id: "Terrava memberikan rekomendasi tindakan awal",
    en: "Terrava recommends an initial course of action",
  },
  "howitworks.journeyScenario.step6": {
    id: "Peternak mencatat tindak lanjut yang dilakukan",
    en: "The farmer records the follow-up that was carried out",
  },
  "howitworks.journeyScenario.step7": {
    id: "Data tersimpan sebagai riwayat kesehatan ternak",
    en: "The data is stored as part of the animal's health history",
  },
  "howitworks.roles.badge": { id: "User Roles", en: "User Roles" },
  "howitworks.roles.title": {
    id: "Peran pengguna dalam ekosistem Terrava",
    en: "User roles across the Terrava ecosystem",
  },
  "howitworks.access.badge": { id: "Platform Access", en: "Platform Access" },
  "howitworks.access.title": {
    id: "Dapat diakses di mana saja Anda bekerja",
    en: "Available wherever you work",
  },
  "howitworks.access.description": {
    id: "Dashboard Terrava dirancang responsif untuk digunakan pada berbagai perangkat.",
    en: "The Terrava dashboard is responsive by design and works across devices.",
  },
  "howitworks.access.channel.desktop": { id: "Desktop", en: "Desktop" },
  "howitworks.access.channel.tablet": { id: "Tablet", en: "Tablet" },
  "howitworks.access.channel.mobile": { id: "Mobile", en: "Mobile" },
  "howitworks.access.channel.notifications": { id: "Kanal Notifikasi", en: "Notification Channels" },
  "howitworks.cta.title": { id: "See Terrava in Action", en: "See Terrava in Action" },
  "howitworks.cta.description": {
    id: "Jadwalkan sesi demo untuk melihat alur kerja Terrava secara langsung.",
    en: "Book a demo session and see the Terrava workflow first hand.",
  },

  // --- Impact --------------------------------------------------------------
  "impact.hero.badge": { id: "Impact and Sustainability", en: "Impact and Sustainability" },
  "impact.hero.title": {
    id: "Lebih dari teknologi—Terrava membangun peternakan yang lebih tangguh.",
    en: "More than technology — Terrava builds more resilient farms.",
  },
  "impact.pillars.badge": { id: "Impact Pillars", en: "Impact Pillars" },
  "impact.pillars.title": { id: "Empat pilar dampak Terrava", en: "The four pillars of Terrava's impact" },
  "impact.social.badge": { id: "Social Impact", en: "Social Impact" },
  "impact.social.title": {
    id: "Dampak sosial bagi komunitas peternak",
    en: "Social impact for farming communities",
  },
  "impact.social.point.empower": { id: "Memberdayakan peternak lokal", en: "Empowering local farmers" },
  "impact.social.point.literacy": { id: "Meningkatkan literasi digital", en: "Raising digital literacy" },
  "impact.social.point.access": { id: "Memperluas akses terhadap teknologi", en: "Widening access to technology" },
  "impact.social.point.welfare": { id: "Mendukung animal welfare", en: "Supporting animal welfare" },
  "impact.social.point.response": {
    id: "Mempercepat respons terhadap risiko kesehatan",
    en: "Speeding up the response to health risks",
  },
  "impact.economic.badge": { id: "Economic Impact", en: "Economic Impact" },
  "impact.economic.title": { id: "Dampak ekonomi bagi peternakan", en: "Economic impact for the farm" },
  "impact.economic.point.losses": {
    id: "Mengurangi potensi kerugian akibat keterlambatan",
    en: "Reducing losses caused by delay",
  },
  "impact.economic.point.efficiency": {
    id: "Meningkatkan efisiensi monitoring",
    en: "Improving monitoring efficiency",
  },
  "impact.economic.point.manualWork": {
    id: "Mengurangi pekerjaan manual berulang",
    en: "Cutting repetitive manual work",
  },
  "impact.economic.point.productivity": {
    id: "Mendukung produktivitas ternak",
    en: "Supporting livestock productivity",
  },
  "impact.economic.point.decisions": {
    id: "Membantu keputusan berbasis data",
    en: "Enabling data-driven decisions",
  },
  "impact.environmental.badge": { id: "Environmental Impact", en: "Environmental Impact" },
  "impact.environmental.title": { id: "Dampak terhadap lingkungan", en: "Environmental impact" },
  "impact.environmental.point.resources": {
    id: "Efisiensi penggunaan sumber daya",
    en: "More efficient use of resources",
  },
  "impact.environmental.point.management": {
    id: "Pengelolaan ternak yang lebih tepat",
    en: "More precise herd management",
  },
  "impact.environmental.point.monitoring": {
    id: "Dukungan terhadap monitoring kondisi lingkungan",
    en: "Support for environmental condition monitoring",
  },
  "impact.environmental.point.emissions": {
    id: "Potensi pengelolaan limbah dan emisi pada pengembangan berikutnya",
    en: "Potential waste and emissions management in future releases",
  },
  "impact.environmental.point.lowPower": {
    id: "Penggunaan perangkat hemat energi",
    en: "Low-power device design",
  },
  "impact.charts.badge": { id: "Illustrative Projection", en: "Illustrative Projection" },
  "impact.charts.title": {
    id: "Gambaran dampak dalam skenario prototype",
    en: "Projected impact in a prototype scenario",
  },
  "impact.charts.description": {
    id: "Visualisasi berikut merupakan proyeksi ilustratif berdasarkan skenario prototype dan belum merupakan hasil tervalidasi di lapangan.",
    en: "These charts are illustrative projections based on a prototype scenario and are not yet field-validated results.",
  },
  "impact.charts.responseTime": { id: "Monitoring Response Time", en: "Monitoring Response Time" },
  "impact.charts.responseTimeDesc": {
    id: "Skenario prototype: monitoring manual vs terbantu",
    en: "Prototype scenario: manual vs assisted monitoring",
  },
  "impact.charts.comparison": { id: "Manual vs Assisted Monitoring", en: "Manual vs Assisted Monitoring" },
  "impact.charts.comparisonDesc": {
    id: "Target dampak perbandingan efisiensi monitoring",
    en: "Target impact on monitoring efficiency",
  },
  "impact.charts.alertCategory": { id: "Alert Category Distribution", en: "Alert Category Distribution" },
  "impact.charts.alertCategoryDesc": {
    id: "Proyeksi ilustratif kategori alert ternak",
    en: "Illustrative projection of livestock alert categories",
  },
  "impact.charts.uptime": { id: "Device Uptime", en: "Device Uptime" },
  "impact.charts.uptimeDesc": {
    id: "Target kapabilitas uptime perangkat mingguan",
    en: "Target weekly device uptime capability",
  },
  "impact.charts.healthStatus": { id: "Health Status Distribution", en: "Health Status Distribution" },
  "impact.charts.healthStatusDesc": {
    id: "Skenario prototype distribusi status kesehatan ternak",
    en: "Prototype scenario for livestock health status distribution",
  },
  "impact.vision.badge": { id: "Long-Term Vision", en: "Long-Term Vision" },
  "impact.vision.title": { id: "Ke arah mana Terrava berkembang", en: "Where Terrava is heading" },
  "impact.vision.description": {
    id: "Peta jalan pengembangan Terrava menuju platform intelijen peternakan yang lebih luas.",
    en: "Our roadmap toward a broader livestock intelligence platform.",
  },
  "impact.vision.point.nationalPlatform": {
    id: "Platform intelijen peternakan nasional",
    en: "National livestock intelligence platform",
  },
  "impact.vision.point.traceability": { id: "Ketertelusuran", en: "Traceability" },
  "impact.vision.point.predictiveHealth": { id: "Kesehatan prediktif", en: "Predictive health" },
  "impact.vision.point.reproduction": { id: "Analitik reproduksi", en: "Reproduction analytics" },
  "impact.vision.point.feedOptimization": { id: "Optimalisasi pakan", en: "Feed optimization" },
  "impact.vision.point.carbon": {
    id: "Monitoring karbon dan keberlanjutan",
    en: "Carbon and sustainability monitoring",
  },
  "impact.vision.point.integration": {
    id: "Integrasi pemerintah dan koperasi",
    en: "Government and cooperative integration",
  },
  "impact.sdgDescription": {
    id: "Kontribusi Terrava terhadap tujuan pembangunan berkelanjutan global.",
    en: "How Terrava contributes to the global Sustainable Development Goals.",
  },
  "impact.cta.title": { id: "Partner with Terrava", en: "Partner with Terrava" },
  "impact.cta.description": {
    id: "Mari berkolaborasi untuk membangun peternakan yang lebih sehat dan berkelanjutan.",
    en: "Let's work together on healthier, more sustainable livestock farming.",
  },

  // --- Contact -------------------------------------------------------------
  "contact.hero.badge": { id: "Contact Terrava", en: "Contact Terrava" },
  "contact.hero.title": {
    id: "Mari bangun masa depan peternakan bersama.",
    en: "Let's build the future of livestock farming together.",
  },
  "contact.hero.description": {
    id: "Hubungi tim Terrava untuk demo, pilot project, kemitraan teknologi, kolaborasi riset, atau implementasi pada peternakan dan koperasi.",
    en: "Get in touch about a demo, a pilot project, a technology partnership, research collaboration, or a rollout across your farm or cooperative.",
  },
  "contact.faq.title": {
    id: "Pertanyaan seputar demo dan kemitraan",
    en: "Questions about demos and partnerships",
  },
  "contact.info.title": { id: "Informasi Kontak", en: "Contact Information" },
  "contact.info.imageAlt": {
    id: "Lokasi kantor dan kawasan peternakan mitra Terrava",
    en: "Terrava's office location and partner farming area",
  },
  "contact.info.label.email": { id: "Email", en: "Email" },
  "contact.info.label.phone": { id: "Telepon", en: "Phone" },
  "contact.info.label.office": { id: "Lokasi Kantor", en: "Office Location" },
  "contact.info.label.hours": { id: "Jam Operasional", en: "Business Hours" },
  "contact.info.hoursValue": {
    id: "Senin - Jumat, 09.00 - 17.00 WIB",
    en: "Monday - Friday, 09:00 - 17:00 WIB",
  },

  // --- Contact form --------------------------------------------------------
  "contact.form.fullName": { id: "Nama Lengkap", en: "Full Name" },
  "contact.form.email": { id: "Email", en: "Email" },
  "contact.form.phone": { id: "Nomor Telepon", en: "Phone Number" },
  "contact.form.organization": { id: "Organisasi", en: "Organization" },
  "contact.form.role": { id: "Peran", en: "Role" },
  "contact.form.rolePlaceholder": {
    id: "Peternak, Manajer, Dokter Hewan, dll.",
    en: "Farmer, Manager, Veterinarian, etc.",
  },
  "contact.form.inquiryType": { id: "Jenis Pengajuan", en: "Inquiry Type" },
  "contact.form.inquiryPlaceholder": { id: "Pilih jenis pengajuan", en: "Select an inquiry type" },
  "contact.form.farmLocation": { id: "Lokasi Peternakan", en: "Farm Location" },
  "contact.form.livestockCount": { id: "Jumlah Ternak", en: "Number of Livestock" },
  "contact.form.message": { id: "Pesan", en: "Message" },
  "contact.form.preferredContact": { id: "Metode Kontak Pilihan", en: "Preferred Contact Method" },
  "contact.form.method.email": { id: "Email", en: "Email" },
  "contact.form.method.phone": { id: "Telepon", en: "Phone" },
  "contact.form.method.whatsapp": { id: "WhatsApp", en: "WhatsApp" },
  "contact.form.consent": {
    id: "Saya menyetujui Terrava menghubungi saya terkait pengajuan ini.",
    en: "I agree that Terrava may contact me about this inquiry.",
  },
  "contact.form.submit": { id: "Kirim Pesan", en: "Send Message" },
  "contact.form.sending": { id: "Mengirim...", en: "Sending..." },
  "contact.form.successTitle": { id: "Terima kasih.", en: "Thank you." },
  "contact.form.successDescription": {
    id: "Tim Terrava akan menghubungi Anda melalui kontak yang diberikan.",
    en: "The Terrava team will reach out using the contact details you provided.",
  },
  "contact.form.sendAnother": { id: "Kirim pesan lain", en: "Send another message" },
  "contact.form.error.fullName": { id: "Nama lengkap wajib diisi.", en: "Full name is required." },
  "contact.form.error.emailRequired": { id: "Email wajib diisi.", en: "Email is required." },
  "contact.form.error.emailInvalid": { id: "Format email tidak valid.", en: "That email format is not valid." },
  "contact.form.error.phone": { id: "Nomor telepon wajib diisi.", en: "Phone number is required." },
  "contact.form.error.inquiryType": { id: "Pilih jenis pengajuan.", en: "Please choose an inquiry type." },
  "contact.form.error.message": { id: "Pesan tidak boleh kosong.", en: "Message cannot be empty." },
  "contact.form.error.consent": {
    id: "Persetujuan diperlukan untuk melanjutkan.",
    en: "Your consent is required to continue.",
  },

  // --- Inquiry type labels (canonical values) ------------------------------
  "contactOption.request-demo": { id: "Request Demo", en: "Request Demo" },
  "contactOption.pilot-project": { id: "Pilot Project", en: "Pilot Project" },
  "contactOption.partnership": { id: "Kemitraan", en: "Partnership" },
  "contactOption.research-collaboration": { id: "Kolaborasi Riset", en: "Research Collaboration" },
  "contactOption.technical-inquiry": { id: "Pertanyaan Teknis", en: "Technical Inquiry" },
  "contactOption.general-inquiry": { id: "Pertanyaan Umum", en: "General Inquiry" },

  // --- PWA -----------------------------------------------------------------
  "pwa.offlineReady": {
    id: "Terrava siap digunakan secara offline.",
    en: "Terrava is ready to use offline.",
  },
  "pwa.offlineNotice": {
    id: "Anda sedang offline. Data yang ditampilkan berasal dari cache terakhir.",
    en: "You are offline. The data shown comes from the last cached version.",
  },
  "pwa.updateTitle": { id: "Versi baru Terrava tersedia", en: "A new version of Terrava is available" },
  "pwa.updateDescription": {
    id: "Muat ulang untuk mendapatkan pembaruan terbaru.",
    en: "Reload to pick up the latest update.",
  },
  "pwa.updateNow": { id: "Perbarui sekarang", en: "Update now" },
  "pwa.later": { id: "Nanti", en: "Later" },
  "pwa.installTitle": { id: "Pasang Terrava di perangkat Anda", en: "Install Terrava on your device" },
  "pwa.installDescription": {
    id: "Akses dashboard lebih cepat dari layar utama, tampil layar penuh tanpa browser, dan tetap bisa dibuka saat offline.",
    en: "Open the dashboard faster from your home screen, run it full screen without the browser, and keep access while offline.",
  },
  "pwa.install": { id: "Pasang aplikasi", en: "Install app" },
  "pwa.maybeLater": { id: "Lain kali", en: "Maybe later" },
  "pwa.installed": {
    id: "Terrava berhasil dipasang di perangkat Anda.",
    en: "Terrava has been installed on your device.",
  },
  "pwa.appInstalled": { id: "Aplikasi terpasang", en: "App installed" },

  // --- 404 -----------------------------------------------------------------
  "notFound.title": { id: "Halaman tidak ditemukan", en: "Page not found" },
  "notFound.description": {
    id: "Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia. Kembali ke beranda atau hubungi tim kami untuk bantuan lebih lanjut.",
    en: "The page you are looking for may have moved or is no longer available. Head back home, or contact our team for help.",
  },
  "notFound.contactSupport": { id: "Hubungi Support", en: "Contact Support" },
};
