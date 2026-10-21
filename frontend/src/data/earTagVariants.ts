import type { Localized } from "@/i18n/types";

/**
 * The two Terrava smart ear tag enclosures, as specified in
 * `iot/ear-tag-specifications/`. Both carry the same electronics kit and
 * firmware; geometry values are in millimetres in the CAD frame (Y up, the
 * ear-facing rear face at z = 0, the logo face towards +z).
 */
export type EarTagVariantId = "shield" | "classic";

export interface EarTagColourway {
  id: string;
  label: Localized;
  /** Swatch colours shown on the chip: [shell, accent]. */
  swatch: [string, string];
  /** Part node name -> sRGB hex. */
  parts: Record<string, number>;
}

export interface EarTagRender {
  src: string;
  caption: Localized;
}

export interface EarTagVariant {
  id: EarTagVariantId;
  code: string;
  name: string;
  model: string;
  tagline: Localized;
  form: Localized;
  bestFor: Localized;
  envelope: [number, number, number];
  weightGrams: number;
  batteryMah: number;
  battery: string;
  /** Standard solar cell, optional solar edition, or none. */
  solar: "standard" | "optional";
  /** Harvest from the solar cell in open pasture, mAh per day (min, max). */
  solarHarvestMah: [number, number];
  /** Field-profile runtime without sun, in days. */
  runtimeDays: number;
  /** Centre of the pin bore. */
  pin: [number, number, number];
  /** Where the studio camera orbits around. */
  focus: [number, number, number];
  /** Node names that make up the visible front shell. */
  frontShell: string[];
  /** Node name of the rear (ear-side) shell. */
  rearShell: string;
  /** Per-part offset along +z when fully exploded. */
  explode: Record<string, number>;
  /** USB plug pulls down and back instead of forwards: [dy, dz]. */
  usbExplode: [number, number];
  /** Exploded offsets for the M2 screws and brass inserts. */
  screwExplode: number;
  insertExplode: number;
  /** How freely the tag swings on its pin: a dangle tag swings, a flat shield is clamped. */
  swingLimit: number;
  colourways: EarTagColourway[];
  heroImage: string;
  renders: EarTagRender[];
  drawings: EarTagRender[];
}

const sheets = (prefix: string): EarTagRender[] => [
  {
    src: `/Images/ear-tag/${prefix}-sheet-1.webp`,
    caption: { id: "Lembar 1 · General arrangement & dimensi", en: "Sheet 1 · General arrangement & dimensions" },
  },
  {
    src: `/Images/ear-tag/${prefix}-sheet-2.webp`,
    caption: { id: "Lembar 2 · Tata letak internal & BOM", en: "Sheet 2 · Internal layout & BOM" },
  },
  {
    src: `/Images/ear-tag/${prefix}-sheet-3.webp`,
    caption: { id: "Lembar 3 · Penempatan & instalasi", en: "Sheet 3 · Placement & installation" },
  },
];

export const earTagVariants: Record<EarTagVariantId, EarTagVariant> = {
  shield: {
    id: "shield",
    code: "TV-ET1",
    name: "Shield",
    model: "/models/ear-tag/tv-et1-shield.glb",
    tagline: {
      id: "Desain ringkas 2026 yang menjepit rata di telinga, dengan baterai terbesar.",
      en: "The compact 2026 design that clamps flat on the ear, with the biggest battery.",
    },
    form: { id: "Shield datar, dijepit rata di telinga", en: "Flat shield, clamped flat on the ear" },
    bestFor: {
      id: "Profil terendah, baterai terlama, kontak sensor paling stabil",
      en: "Lowest profile, longest battery life, most stable sensor contact",
    },
    envelope: [46, 68, 14],
    weightGrams: 48,
    batteryMah: 500,
    battery: "LiPo 602535 ≈ 500 mAh",
    solar: "optional",
    solarHarvestMah: [5, 10],
    runtimeDays: 45,
    pin: [0, 55.4, 0],
    focus: [0, 34, 7],
    frontShell: ["cover", "logo_inlay", "pin_cap"],
    rearShell: "base",
    explode: { base: -26, ppg_window: -38, gasket: 15, lock_ring: 26, cover: 44, logo_inlay: 62, pin_cap: 72 },
    usbExplode: [-22, 0],
    screwExplode: -52,
    insertExplode: 22,
    swingLimit: 0.12,
    colourways: [
      {
        id: "signature",
        label: { id: "Signature", en: "Signature" },
        swatch: ["#eeece6", "#0b6b3e"],
        parts: { cover: 0xeeece6, base: 0x0b6b3e, logo_inlay: 0x0b6b3e, pin_cap: 0x0b6b3e, usb_plug: 0xeeece6 },
      },
      {
        id: "field",
        label: { id: "Field", en: "Field" },
        swatch: ["#f2c230", "#2c3133"],
        parts: { cover: 0xf2c230, base: 0x2c3133, logo_inlay: 0x2c3133, pin_cap: 0x2c3133, usb_plug: 0x2c3133 },
      },
      {
        id: "stealth",
        label: { id: "Stealth", en: "Stealth" },
        swatch: ["#2c3133", "#3fb27a"],
        parts: { cover: 0x2c3133, base: 0x2c3133, logo_inlay: 0x3fb27a, pin_cap: 0x3fb27a, usb_plug: 0x2c3133 },
      },
    ],
    heroImage: "/Images/ear-tag/shield-hero-front.webp",
    renders: [
      { src: "/Images/ear-tag/shield-hero-front.webp", caption: { id: "Depan: inlay logo, tutup pin rata, lampu status", en: "Front: logo inlay, flush pin cap, status light" } },
      { src: "/Images/ear-tag/shield-hero-rear.webp", caption: { id: "Sisi telinga: jendela PPG, IR, sekrup M2", en: "Ear side: PPG window, IR window, M2 screws" } },
      { src: "/Images/ear-tag/shield-exploded.webp", caption: { id: "Exploded view: male button sampai tutup pin", en: "Exploded view: male button through to the pin cap" } },
      { src: "/Images/ear-tag/shield-internal.webp", caption: { id: "Isi perangkat dengan cangkang depan dilepas", en: "Inside, with the front shell removed" } },
      { src: "/Images/ear-tag/shield-colorways.webp", caption: { id: "Pilihan warna: Field, Signature, Stealth", en: "Colourways: Field, Signature, Stealth" } },
      { src: "/Images/ear-tag/shield-solar.webp", caption: { id: "Solar edition: jendela PV 32 × 17 mm", en: "Solar edition: 32 × 17 mm PV window" } },
    ],
    drawings: sheets("shield"),
  },
  classic: {
    id: "classic",
    code: "TV-ET0",
    name: "Classic",
    model: "/models/ear-tag/tv-et0-classic.glb",
    tagline: {
      id: "Desain orisinal Terrava 2025 berbentuk dangle tag, dengan panel surya standar.",
      en: "The original 2025 Terrava dangle-tag design, with a standard solar cell.",
    },
    form: { id: "Dangle tag: leher bundar, bahu, badan lebar", en: "Dangle tag: round-top neck, shoulders, wide body" },
    bestFor: {
      id: "Tampilan tag yang familiar, isi ulang surya di padang rumput",
      en: "The familiar tag look, solar top-up on pasture",
    },
    envelope: [42, 66, 18],
    weightGrams: 44,
    batteryMah: 250,
    battery: "LiPo 302535 ≈ 250 mAh",
    solar: "standard",
    solarHarvestMah: [7, 15],
    runtimeDays: 22,
    pin: [0, 57.4, 0],
    focus: [0, 33, 8],
    frontShell: ["cover", "logo_inlay"],
    rearShell: "housing",
    explode: { yoke: -34, ppg_window: -46, housing: -12, gasket: 14, lock_ring: 22, cover: 40, logo_inlay: 56, pin_cap: 66 },
    usbExplode: [-24, -12],
    screwExplode: -60,
    insertExplode: 26,
    swingLimit: 0.38,
    colourways: [
      {
        id: "signature",
        label: { id: "Signature", en: "Signature" },
        swatch: ["#eeece6", "#0b6b3e"],
        parts: { housing: 0xeeece6, cover: 0xeeece6, logo_inlay: 0x0b6b3e, pin_cap: 0x8f9392, yoke: 0x8f9392, usb_plug: 0xeeece6 },
      },
      {
        id: "mint",
        label: { id: "Mint", en: "Mint" },
        swatch: ["#9bdcc1", "#0b6b3e"],
        parts: { housing: 0x9bdcc1, cover: 0x9bdcc1, logo_inlay: 0x0b6b3e, pin_cap: 0xe9ecea, yoke: 0xe9ecea, usb_plug: 0x9bdcc1 },
      },
      {
        id: "stealth",
        label: { id: "Stealth", en: "Stealth" },
        swatch: ["#2c3133", "#3fb27a"],
        parts: { housing: 0x2c3133, cover: 0x2c3133, logo_inlay: 0x3fb27a, pin_cap: 0x4a5052, yoke: 0x4a5052, usb_plug: 0x2c3133 },
      },
    ],
    heroImage: "/Images/ear-tag/classic-hero-front.webp",
    renders: [
      { src: "/Images/ear-tag/classic-hero-front.webp", caption: { id: "Depan: inlay logo dua warna, tutup pin abu-abu", en: "Front: two-colour logo inlay, grey pin cap" } },
      { src: "/Images/ear-tag/classic-hero-rear.webp", caption: { id: "Belakang: sel surya 154 mW dan yoke sensor TPU", en: "Rear: 154 mW solar cell and TPU sensor yoke" } },
      { src: "/Images/ear-tag/classic-exploded.webp", caption: { id: "Exploded view seluruh komponen", en: "Exploded view of every part" } },
      { src: "/Images/ear-tag/classic-internal.webp", caption: { id: "Isi perangkat dengan cover dilepas", en: "Inside, with the cover removed" } },
      { src: "/Images/ear-tag/classic-colorways.webp", caption: { id: "Pilihan warna: Mint, Signature, Stealth", en: "Colourways: Mint, Signature, Stealth" } },
      { src: "/Images/ear-tag/classic-mounted.webp", caption: { id: "Terpasang di sepertiga tengah telinga", en: "Mounted in the middle third of the ear" } },
    ],
    drawings: sheets("classic"),
  },
};

export const earTagVariantOrder: EarTagVariantId[] = ["shield", "classic"];

/**
 * Components a visitor can pick out in the 3D studio. `match` is tested
 * against the GLB node names; entries that match nothing in a variant are
 * hidden for that variant.
 */
export interface EarTagComponentInfo {
  id: string;
  match: RegExp;
  name: string;
  group: "enclosure" | "sensing" | "compute" | "power";
  description: Localized;
}

export const earTagComponents: EarTagComponentInfo[] = [
  {
    id: "front",
    match: /^cover$|^logo_inlay$/,
    name: "Front shell + logo inlay",
    group: "enclosure",
    description: {
      id: "Cangkang depan PETG/ASA dengan inlay logo dua warna yang rata. Patch GNSS menghadap keluar di belakang logo yang bebas logam.",
      en: "PETG/ASA front shell with a flush two-colour logo inlay. The GNSS patch faces out behind the logo, which has no metal paint.",
    },
  },
  {
    id: "rear",
    match: /^base$|^housing$/,
    name: "Rear shell (ear side)",
    group: "enclosure",
    description: {
      id: "Sisi yang menempel ke telinga. Lap joint + gasket TPU menyegel rongga elektronik dengan target desain IP67.",
      en: "The side that sits against the ear. A lap joint and TPU gasket seal the electronics cavity to an IP67 design target.",
    },
  },
  {
    id: "yoke",
    match: /^yoke$/,
    name: "TPU sensor yoke",
    group: "sensing",
    description: {
      id: "Yoke TPU abu-abu menonjol 1 mm di leher dan bahu, sehingga sensor menyentuh telinga lebih dulu.",
      en: "The grey TPU yoke stands 1 mm proud on the neck and shoulders, so the sensors touch the ear first.",
    },
  },
  {
    id: "pin",
    match: /^pin_cap$|^lock_ring$/,
    name: "Pin cap + TPU lock ring",
    group: "enclosure",
    description: {
      id: "Male button standar (pin ≈ 19 mm) dikunci ring TPU yang bisa diganti; tutup snap-in menyembunyikan ujung pin.",
      en: "A standard male button (≈ 19 mm pin) is locked by a replaceable TPU ring; a snap-in cap hides the tip.",
    },
  },
  {
    id: "temp",
    match: /MLX90614/,
    name: "MLX90614 IR thermometer",
    group: "sensing",
    description: {
      id: "Termometer inframerah non-kontak (FOV 90°) tepat di belakang permukaan telinga untuk membaca suhu tubuh.",
      en: "Non-contact infrared thermometer (90° FOV) just behind the ear face, reading body temperature.",
    },
  },
  {
    id: "ppg",
    match: /MAX30102|^ppg_window$/,
    name: "MAX30102 PPG (HR + SpO₂)",
    group: "sensing",
    description: {
      id: "Sensor optik reflektif untuk detak jantung dan SpO₂, membaca lewat jendela bening 1 mm di sisi telinga.",
      en: "Reflective optical sensor for heart rate and SpO₂, looking through a flush 1 mm clear window on the ear side.",
    },
  },
  {
    id: "imu",
    match: /IMU/,
    name: "6-axis IMU",
    group: "sensing",
    description: {
      id: "Akselerometer + giroskop untuk indeks aktivitas, langkah, dan pola gerak abnormal.",
      en: "Accelerometer + gyroscope for the activity index, steps and abnormal movement patterns.",
    },
  },
  {
    id: "gnss",
    match: /GNSS/,
    name: "GNSS module + 18 mm patch",
    group: "sensing",
    description: {
      id: "Modul kelas L76K dengan antena patch keramik 18 mm untuk lokasi dan geofence.",
      en: "L76K-class module with an 18 mm ceramic patch antenna for location and geofencing.",
    },
  },
  {
    id: "mcu",
    match: /XIAO|ESP32-S3_shield/,
    name: "Seeed XIAO ESP32S3",
    group: "compute",
    description: {
      id: "MCU utama dengan charger Li-ion dan USB-C. Menjalankan firmware Terrava dan menyimpan bacaan di flash saat sinyal hilang.",
      en: "Main MCU with a Li-ion charger and USB-C. Runs the Terrava firmware and buffers readings in flash when the link drops.",
    },
  },
  {
    id: "lora",
    match: /SX1262|FPC_antenna/,
    name: "Wio-SX1262 LoRa + FPC antenna",
    group: "compute",
    description: {
      id: "Radio LoRaWAN AS923-2 (923 MHz) dengan antena FPC di dinding samping. Payload vitals hanya 22 byte.",
      en: "LoRaWAN AS923-2 radio (923 MHz) with an FPC antenna along the side wall. A vitals payload is just 22 bytes.",
    },
  },
  {
    id: "battery",
    match: /LiPo|Battery_PCM/,
    name: "LiPo battery",
    group: "power",
    description: {
      id: "Sel LiPo 3,7 V dengan PCM. Classic: 302535 ≈ 250 mAh; Shield: 602535 ≈ 500 mAh.",
      en: "3.7 V LiPo pouch cell with PCM. Classic: 302535 ≈ 250 mAh; Shield: 602535 ≈ 500 mAh.",
    },
  },
  {
    id: "solar",
    match: /Solar/,
    name: "154 mW solar cell + harvester",
    group: "power",
    description: {
      id: "Sel surya SM141K05L di punggung tag melalui charger BQ25570: +7 sampai +15 mAh/hari di padang terbuka.",
      en: "SM141K05L cell on the back through a BQ25570-class harvester: +7 to +15 mAh/day in open pasture.",
    },
  },
  {
    id: "usb",
    match: /USB|usb_plug/,
    name: "USB-C + flush TPU plug",
    group: "power",
    description: {
      id: "Port pengisian dan firmware, ditutup plug TPU rata agar tetap kedap air.",
      en: "Charging and firmware port, closed by a flush TPU plug to stay sealed.",
    },
  },
  {
    id: "fasteners",
    match: /screw|insert|^gasket$/,
    name: "Gasket, M2 screws & inserts",
    group: "enclosure",
    description: {
      id: "Gasket TPU 0,8 mm tertekan ke 0,6 mm, sekrup M2 stainless ke insert kuningan heat-set.",
      en: "0.8 mm TPU gasket compressed to 0.6 mm, M2 stainless screws into brass heat-set inserts.",
    },
  },
];

/** Side-by-side specification rows; `shared` rows hold for both designs. */
export interface SpecComparisonRow {
  label: Localized;
  shield?: Localized;
  classic?: Localized;
  shared?: Localized;
}

const same = (value: string): Localized => ({ id: value, en: value });

export const specComparison: SpecComparisonRow[] = [
  {
    label: { id: "Bentuk", en: "Form" },
    shield: earTagVariants.shield.form,
    classic: earTagVariants.classic.form,
  },
  { label: { id: "Dimensi", en: "Envelope" }, shield: same("46 × 68 × 14 mm"), classic: same("42 × 66 × 18 mm") },
  { label: { id: "Berat lengkap", en: "Complete weight" }, shield: same("≈ 48 g"), classic: same("≈ 44 g") },
  {
    label: { id: "Cangkang", en: "Shell" },
    shield: { id: "Cangkang belakang + depan, 4 × sekrup M2", en: "Rear + front shell, 4 × M2 screws" },
    classic: { id: "Housing + cover, kait leher + 2 × sekrup M2", en: "Housing + cover, neck hook + 2 × M2 screws" },
  },
  {
    label: { id: "Sensor tubuh", en: "Body sensors" },
    shield: { id: "PPG + IR di kedua sisi pin", en: "PPG + IR either side of the pin" },
    classic: { id: "PPG + IR di yoke TPU lunak di bawah pin", en: "PPG + IR in a soft TPU yoke under the pin" },
  },
  { label: { id: "Baterai", en: "Battery" }, shield: same("LiPo 602535 ≈ 500 mAh"), classic: same("LiPo 302535 ≈ 250 mAh") },
  {
    label: { id: "Surya", en: "Solar" },
    shield: { id: "Opsional: sel depan 32 × 17 mm (solar edition)", en: "Optional 32 × 17 mm front cell (solar edition)" },
    classic: { id: "Standar: sel 154 mW di punggung, +7–15 mAh/hari", en: "Standard 154 mW cell on the back, +7–15 mAh/day" },
  },
  {
    label: { id: "Daya tahan (profil lapangan)", en: "Runtime (field profile)" },
    shield: { id: "≈ 45 hari", en: "≈ 45 days" },
    classic: { id: "≈ 22 hari tanpa matahari, energy-neutral di luar ruangan", en: "≈ 22 days without sun, energy-neutral outdoors" },
  },
  {
    label: { id: "Mikrokontroler", en: "Microcontroller" },
    shared: same("Seeed XIAO ESP32S3 · USB-C charging · flash buffer"),
  },
  {
    label: { id: "Konektivitas", en: "Connectivity" },
    shared: same("Wio-SX1262 · LoRaWAN AS923-2 (923 MHz) · FPC antenna"),
  },
  {
    label: { id: "Sensor", en: "Sensors" },
    shared: same("MLX90614 IR temp · MAX30102 HR + SpO₂ · 6-axis IMU · GNSS L76K + 18 mm patch"),
  },
  {
    label: { id: "Payload", en: "Payload" },
    shared: {
      id: "Vitals 22 byte (FPort 1), status 13 byte (FPort 2), perintah downlink (FPort 10)",
      en: "22-byte vitals (FPort 1), 13-byte status (FPort 2), downlink commands (FPort 10)",
    },
  },
  {
    label: { id: "Interval data", en: "Data interval" },
    shared: {
      id: "15 menit (profil lapangan) atau 5 menit (default firmware), diubah lewat downlink",
      en: "15 min (field profile) or 5 min (firmware default), changed over the air",
    },
  },
  {
    label: { id: "Pemasangan", en: "Mounting" },
    shared: {
      id: "Male button standar (pin ≈ 19 mm), ring kunci TPU, sepertiga tengah telinga",
      en: "Standard male button (≈ 19 mm pin), TPU lock ring, middle third of the ear",
    },
  },
  {
    label: { id: "Material & segel", en: "Materials & sealing" },
    shared: {
      id: "PETG/ASA + TPU 95A, inlay logo dua warna, gasket TPU, target desain IP67",
      en: "PETG/ASA + TPU 95A, two-colour logo inlay, TPU gasket, IP67 design target",
    },
  },
];
