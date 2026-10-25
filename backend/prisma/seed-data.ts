/**
 * Demo dataset generators ported from the frontend prototype
 * (frontend/src/data/mock*.ts). They use the same seeded PRNG, seeds and call
 * order, so the database holds exactly the farms, barns, animals, devices,
 * alerts, insights and staff the prototype shows, with the same ids.
 */

export type L = { id: string; en: string };

export function createSeededRandom(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = <T>(random: () => number, items: T[]): T => items[Math.floor(random() * items.length)];
export const randomInt = (random: () => number, min: number, max: number) =>
  Math.floor(random() * (max - min + 1)) + min;
export const randomFloat = (random: () => number, min: number, max: number, decimals = 1) =>
  Number((random() * (max - min) + min).toFixed(decimals));

export const images = {
  modernBarn: 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?q=80&w=1400&auto=format&fit=crop',
  cattleHerd: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=1400&auto=format&fit=crop',
  farmLandscape: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=1600&auto=format&fit=crop',
  sustainableFarming: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop',
};

/** "3 hours ago" -> Date relative to `now`. */
export function relative(text: string, now = Date.now()): Date {
  const match = /^(\d+)\s+(minute|hour|day|week|month)s?\s+ago$/.exec(text.trim());
  if (!match) return new Date(now);
  const unit = { minute: 60_000, hour: 3_600_000, day: 86_400_000, week: 7 * 86_400_000, month: 30 * 86_400_000 }[
    match[2] as 'minute'
  ];
  return new Date(now - Number(match[1]) * unit);
}

// ---------------------------------------------------------------------------
// Farms and barns (seed 1001)
// ---------------------------------------------------------------------------

export const farms = [
  {
    id: 'farm-1',
    name: 'Green Valley Farm',
    location: 'Boyolali, Jawa Tengah',
    region: 'Jawa Tengah',
    // manager: 'Stanley Nathanael Wijaya',
    manager: 'Arif Setiawan',
    image: images.modernBarn,
  },
  {
    id: 'farm-2',
    name: 'Lembang Dairy Farm',
    location: 'Lembang, Jawa Barat',
    region: 'Jawa Barat',
    manager: 'Ratna Kusuma',
    image: images.cattleHerd,
  },
  {
    id: 'farm-3',
    name: 'Nusantara Livestock Center',
    location: 'Pasuruan, Jawa Timur',
    region: 'Jawa Timur',
    manager: 'Andi Wirawan',
    image: images.farmLandscape,
  },
  {
    id: 'farm-4',
    name: 'Terrava Demo Farm',
    location: 'Cianjur, Jawa Barat',
    region: 'Jawa Barat',
    manager: 'Clarissa Halim',
    image: images.sustainableFarming,
  },
];

export function generateBarns() {
  const random = createSeededRandom(1001);
  const barnNames = ['Barn A', 'Barn B', 'Barn C'];
  const barnManagers = [
    // 'Stanley Nathanael Wijaya',
    'Arif Setiawan',
    'Ratna Kusuma',
    'Andi Wirawan',
    'Budi Santoso',
    'Clarissa Halim',
    'Reza Aditama',
  ];
  return farms.flatMap((farm, farmIndex) =>
    barnNames.map((name, barnIndex) => {
      const capacity = randomInt(random, 6, 10);
      return {
        id: `barn-${farmIndex * 3 + barnIndex + 1}`,
        name: `${name} - ${farm.name.split(' ')[0]}`,
        farmId: farm.id,
        capacity,
        occupancy: randomInt(random, Math.max(2, capacity - 4), capacity),
        healthScore: randomInt(random, 70, 96),
        temperature: randomFloat(random, 24, 31),
        humidity: randomInt(random, 55, 78),
        alertCount: randomInt(random, 0, 4),
        manager: barnManagers[(farmIndex + barnIndex) % barnManagers.length],
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// Livestock (seed 2002)
// ---------------------------------------------------------------------------

type Health = 'healthy' | 'attention' | 'critical' | 'inactive';
type DevStatus = 'online' | 'offline' | 'low-battery' | 'maintenance';

export function generateLivestock(barns: ReturnType<typeof generateBarns>) {
  const random = createSeededRandom(2002);
  const names = [
    'Bella',
    'Luna',
    'Bima',
    'Sora',
    'Moka',
    'Kiku',
    'Nala',
    'Dewi',
    'Arjuna',
    'Kirana',
    'Sekar',
    'Bayu',
    'Cinta',
    'Gading',
    'Intan',
    'Jaya',
    'Kencana',
    'Lestari',
    'Mega',
    'Nirmala',
    'Oka',
    'Puspa',
    'Rama',
    'Sari',
    'Teja',
    'Utama',
    'Vira',
    'Wira',
    'Yudha',
    'Zahra',
    'Ayu',
    'Bagus',
    'Citra',
    'Dharma',
    'Endah',
    'Fajar',
    'Gita',
    'Hana',
    'Indra',
    'Jelita',
  ];
  const livestockTypes = ['Dairy Cattle', 'Beef Cattle'];
  const breeds = ['Friesian Holstein', 'Limousin', 'Simmental', 'Brahman', 'Ongole'];
  const herdGroups = ['Herd 1', 'Herd 2', 'Herd 3'];
  const acquisitionSources = ['Internal breeding', 'Partner purchase', 'Cooperative program', 'Inter-farm transfer'];
  const healthStatusPool: Health[] = [
    'healthy',
    'healthy',
    'healthy',
    'healthy',
    'healthy',
    'healthy',
    'healthy',
    'attention',
    'attention',
    'attention',
    'critical',
    'critical',
    'inactive',
  ];
  const deviceStatusPool: DevStatus[] = ['online', 'online', 'online', 'online', 'offline', 'low-battery'];
  const baseLat = -6.9;
  const baseLng = 107.6;

  return Array.from({ length: 40 }).map((_, index) => {
    const farm = farms[index % farms.length];
    const farmBarns = barns.filter((barn) => barn.farmId === farm.id);
    const barn = pick(random, farmBarns);
    const healthStatus = pick(random, healthStatusPool);
    const healthScore =
      healthStatus === 'healthy'
        ? randomInt(random, 85, 98)
        : healthStatus === 'attention'
          ? randomInt(random, 60, 78)
          : healthStatus === 'critical'
            ? randomInt(random, 30, 55)
            : randomInt(random, 40, 70);
    const hasDevice = random() > 0.08;
    const deviceStatus: DevStatus | 'unassigned' = hasDevice ? pick(random, deviceStatusPool) : 'unassigned';

    return {
      id: `LVS-${String(index + 1).padStart(3, '0')}`,
      code: `TRV-${String(index + 1).padStart(3, '0')}`,
      name: names[index % names.length],
      earTagId: `EAR-${String(1000 + index)}`,
      photo: images.cattleHerd,
      type: pick(random, livestockTypes),
      breed: pick(random, breeds),
      gender: (random() > 0.5 ? 'Female' : 'Male') as 'Female' | 'Male',
      dateOfBirth: `20${randomInt(random, 19, 23)}-${String(randomInt(random, 1, 12)).padStart(2, '0')}-${String(randomInt(random, 1, 28)).padStart(2, '0')}`,
      ageMonths: randomInt(random, 8, 60),
      weightKg: randomInt(random, 180, 620),
      bodyConditionScore: randomInt(random, 2, 5),
      farmId: farm.id,
      barnId: barn.id,
      herdGroup: pick(random, herdGroups),
      healthStatus,
      healthScore,
      temperature: randomFloat(
        random,
        healthStatus === 'critical' ? 39.2 : 37.8,
        healthStatus === 'critical' ? 40.5 : 39.1,
      ),
      heartRate: randomInt(random, healthStatus === 'critical' ? 90 : 60, healthStatus === 'critical' ? 120 : 85),
      activityLevel: randomInt(
        random,
        healthStatus === 'attention' || healthStatus === 'critical' ? 10 : 45,
        healthStatus === 'attention' || healthStatus === 'critical' ? 40 : 95,
      ),
      oxygenLevel: randomInt(random, 92, 99),
      hasDevice,
      deviceStatus,
      batteryLevel: hasDevice ? randomInt(random, 15, 100) : 0,
      lastUpdate: `${randomInt(random, 1, 58)} minutes ago`,
      location: { lat: baseLat - randomFloat(random, 0, 0.6, 4), lng: baseLng + randomFloat(random, 0, 0.6, 4) },
      vaccinationStatus: pick(random, ['up-to-date', 'up-to-date', 'due', 'overdue'] as const),
      arrivalDate: `20${randomInt(random, 20, 25)}-${String(randomInt(random, 1, 12)).padStart(2, '0')}-${String(randomInt(random, 1, 28)).padStart(2, '0')}`,
      acquisitionSource: pick(random, acquisitionSources),
      notes: { id: 'Data prototype untuk keperluan demo Terrava.', en: 'Prototype data used for the Terrava demo.' },
    };
  });
}

// ---------------------------------------------------------------------------
// Devices (seed 3003)
// ---------------------------------------------------------------------------

export function generateDevices(livestock: ReturnType<typeof generateLivestock>) {
  const random = createSeededRandom(3003);
  const statusPool: DevStatus[] = ['online', 'online', 'online', 'online', 'offline', 'low-battery', 'maintenance'];

  const earTags = Array.from({ length: 12 }).map((_, index) => {
    const status = pick(random, statusPool);
    const animal = livestock[index];
    return {
      id: `DEV-${String(index + 1).padStart(3, '0')}`,
      name: `Smart Ear Tag ${String(index + 1).padStart(3, '0')}`,
      type: 'ear-tag' as const,
      status,
      assignedLivestockId: animal.id as string | null,
      farmId: animal.farmId,
      battery: status === 'low-battery' ? randomInt(random, 8, 22) : randomInt(random, 45, 100),
      signal: status === 'offline' ? randomInt(random, 0, 10) : randomInt(random, 55, 100),
      firmware: pick(random, ['v2.4.1', 'v2.4.0', 'v2.3.5']),
      lastSync:
        status === 'offline' ? `${randomInt(random, 3, 20)} hours ago` : `${randomInt(random, 1, 45)} minutes ago`,
      uptime: randomInt(random, 82, 99),
      dataPackets: randomInt(random, 1200, 8600),
    };
  });
  const gateways = farms.map((farm, index) => ({
    id: `DEV-${String(13 + index).padStart(3, '0')}`,
    name: `LoRa Gateway ${farm.name.split(' ')[0]}`,
    type: 'gateway' as const,
    status: pick(random, ['online', 'online', 'online', 'maintenance'] as DevStatus[]),
    assignedLivestockId: null as string | null,
    farmId: farm.id,
    battery: 100,
    signal: randomInt(random, 80, 100),
    firmware: 'v1.8.2',
    lastSync: `${randomInt(random, 1, 10)} minutes ago`,
    uptime: randomInt(random, 95, 100),
    dataPackets: randomInt(random, 15000, 42000),
  }));
  const sensors = farms.map((farm, index) => ({
    id: `DEV-${String(17 + index).padStart(3, '0')}`,
    name: `Environmental Sensor ${farm.name.split(' ')[0]}`,
    type: 'environmental-sensor' as const,
    status: pick(random, ['online', 'online', 'low-battery'] as DevStatus[]),
    assignedLivestockId: null as string | null,
    farmId: farm.id,
    battery: randomInt(random, 30, 100),
    signal: randomInt(random, 60, 100),
    firmware: 'v1.2.0',
    lastSync: `${randomInt(random, 1, 30)} minutes ago`,
    uptime: randomInt(random, 88, 100),
    dataPackets: randomInt(random, 5000, 12000),
  }));
  const devices = [...earTags, ...gateways, ...sensors];

  const logTypes = ['connected', 'data-sent', 'warning', 'firmware-updated', 'offline'] as const;
  const logMessages: Record<(typeof logTypes)[number], L[]> = {
    connected: [
      { id: 'Perangkat berhasil terhubung ke gateway.', en: 'Device connected to the gateway successfully.' },
      { id: 'Koneksi LoRa dipulihkan.', en: 'LoRa connection restored.' },
    ],
    'data-sent': [
      { id: 'Data sensor berhasil dikirim ke cloud.', en: 'Sensor data uploaded to the cloud successfully.' },
      { id: 'Paket data terkirim tanpa error.', en: 'Data packet transmitted without errors.' },
    ],
    warning: [
      { id: 'Sinyal lemah terdeteksi.', en: 'Weak signal detected.' },
      { id: 'Suhu perangkat lebih tinggi dari batas normal.', en: 'Device temperature is above the normal limit.' },
    ],
    'firmware-updated': [
      { id: 'Firmware diperbarui ke versi terbaru.', en: 'Firmware updated to the latest version.' },
      { id: 'Pembaruan konfigurasi berhasil diterapkan.', en: 'Configuration update applied successfully.' },
    ],
    offline: [
      { id: 'Perangkat kehilangan koneksi.', en: 'Device lost its connection.' },
      { id: 'Tidak ada data diterima dalam 2 jam terakhir.', en: 'No data received in the last two hours.' },
    ],
  };
  const logs = devices.flatMap((device) =>
    Array.from({ length: randomInt(random, 3, 6) }).map((_, index) => {
      const type = pick(random, [...logTypes]);
      return {
        id: `${device.id}-LOG-${index}`,
        deviceId: device.id,
        type,
        message: pick(random, logMessages[type]),
        timestamp: `${randomInt(random, 1, 72)} hours ago`,
      };
    }),
  );
  return { devices, logs };
}

// ---------------------------------------------------------------------------
// Alerts (seed 4004)
// ---------------------------------------------------------------------------

const alertTemplates = [
  {
    ruleKey: 'tempHigh',
    category: 'health',
    title: { id: 'Suhu tubuh meningkat signifikan', en: 'Body temperature rising sharply' },
    description: {
      id: 'Suhu tubuh tercatat di atas ambang normal selama lebih dari 3 jam berturut-turut.',
      en: 'Body temperature has stayed above the normal threshold for more than three consecutive hours.',
    },
    cause: {
      id: 'Kemungkinan indikasi awal infeksi atau demam ringan.',
      en: 'Possibly an early indication of infection or a mild fever.',
    },
    recommendations: ['Inspect livestock', 'Check hydration', 'Contact veterinarian'],
  },
  {
    ruleKey: 'activityDrop',
    category: 'behavior',
    title: { id: 'Penurunan aktivitas drastis', en: 'Sharp drop in activity' },
    description: {
      id: 'Tingkat aktivitas menurun lebih dari 30% dibandingkan baseline 7 hari terakhir.',
      en: 'Activity level has fallen more than 30% below the seven-day baseline.',
    },
    cause: {
      id: 'Kemungkinan tanda awal ketidaknyamanan atau kelelahan.',
      en: 'Possibly an early sign of discomfort or fatigue.',
    },
    recommendations: ['Monitor for next 6 hours', 'Inspect livestock', 'Move to observation barn'],
  },
  {
    ruleKey: 'geofence',
    category: 'location',
    title: { id: 'Ternak keluar dari geofence', en: 'Animal left the geofence' },
    description: {
      id: 'Lokasi ternak terdeteksi berada di luar batas area yang ditentukan.',
      en: 'The animal has been detected outside its designated boundary.',
    },
    cause: {
      id: 'Kemungkinan pagar rusak atau ternak lepas dari kandang.',
      en: 'A damaged fence or an animal that has escaped the barn.',
    },
    recommendations: ['Inspect livestock', 'Contact veterinarian', 'Create task'],
  },
  {
    ruleKey: 'batteryLow',
    category: 'device',
    title: { id: 'Baterai perangkat rendah', en: 'Low device battery' },
    description: {
      id: 'Baterai smart ear tag berada di bawah 20 persen kapasitas.',
      en: 'The smart ear tag battery has dropped below 20 percent capacity.',
    },
    cause: {
      id: 'Perangkat mendekati akhir siklus daya sebelum pengisian ulang.',
      en: 'The device is nearing the end of its power cycle before a recharge.',
    },
    recommendations: ['Check hydration', 'Create task'],
  },
  {
    ruleKey: 'heatStress',
    category: 'environmental',
    title: { id: 'Suhu kandang di luar batas nyaman', en: 'Barn temperature outside comfort range' },
    description: {
      id: 'Suhu lingkungan kandang tercatat lebih tinggi dari ambang batas yang ditentukan.',
      en: 'Ambient barn temperature has been recorded above the configured threshold.',
    },
    cause: {
      id: 'Potensi risiko heat stress pada ternak di kandang tersebut.',
      en: 'A potential heat stress risk for the livestock in that barn.',
    },
    recommendations: ['Monitor for next 6 hours', 'Move to observation barn'],
  },
  {
    ruleKey: 'heatWaveForecast',
    category: 'weather',
    title: { id: 'Prediksi gelombang panas besok', en: 'Heat wave forecast for tomorrow' },
    description: {
      id: 'Model cuaca menunjukkan potensi gelombang panas dalam 24 jam ke depan.',
      en: 'Weather models indicate a possible heat wave within the next 24 hours.',
    },
    cause: {
      id: 'Kondisi atmosfer regional menunjukkan tren suhu ekstrem.',
      en: 'Regional atmospheric conditions point to an extreme temperature trend.',
    },
    recommendations: ['Monitor for next 6 hours', 'Create task'],
  },
  {
    ruleKey: 'heartRate',
    category: 'health',
    title: { id: 'Detak jantung tidak stabil', en: 'Unstable heart rate' },
    description: {
      id: 'Pola detak jantung menunjukkan fluktuasi tidak biasa dibandingkan riwayat data.',
      en: 'Heart rate patterns show unusual fluctuation compared with historical data.',
    },
    cause: {
      id: 'Kemungkinan stres akut atau gangguan ringan pada sistem kardiovaskular.',
      en: 'Possibly acute stress or a mild cardiovascular disturbance.',
    },
    recommendations: ['Inspect livestock', 'Contact veterinarian', 'Monitor for next 6 hours'],
  },
];

export function generateAlerts(livestock: ReturnType<typeof generateLivestock>) {
  const random = createSeededRandom(4004);
  const severityPool = ['info', 'warning', 'warning', 'high', 'high', 'critical'] as const;
  const assignees = ['Budi Santoso', 'Reza Aditama', 'Andi Wirawan', null, null];
  return Array.from({ length: 18 }).map((_, index) => {
    const template = pick(random, alertTemplates);
    const animal = pick(random, livestock);
    const severity = pick(random, [...severityPool]);
    const status = pick(random, ['active', 'active', 'acknowledged', 'resolved'] as const);
    return {
      id: `ALT-${String(index + 1).padStart(3, '0')}`,
      ruleKey: template.ruleKey,
      title: template.title,
      severity,
      category: template.category,
      status,
      livestockId: animal.id,
      farmId: animal.farmId,
      barnId: animal.barnId,
      detectedAt: `${randomInt(random, 1, 96)} hours ago`,
      assignedTo: status === 'active' ? pick(random, assignees) : pick(random, assignees.slice(0, 3)),
      description: template.description,
      aiConfidence: randomInt(random, 68, 96),
      aiCause: template.cause,
      recommendations: template.recommendations,
      dataAtDetection: {
        temperature: randomFloat(random, 37.9, 40.2),
        heartRate: randomInt(random, 62, 118),
        activity: randomInt(random, 8, 92),
        oxygen: randomInt(random, 90, 99),
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Team (seed 5005)
// ---------------------------------------------------------------------------

export function generateStaff() {
  const random = createSeededRandom(5005);
  const staffData: {
    name: string;
    role: string;
    title?: string;
    status: 'active' | 'invited' | 'disabled';
    avatar?: string;
    email?: string;
  }[] = [
    // {
    //   name: 'Stanley Nathanael Wijaya',
    //   role: 'Owner',
    //   title: 'Founder & CEO',
    //   status: 'active',
    //   avatar: '/Images/profile/snw.png',
    //   email: 'stanley.wijaya@terrava.id',
    // },
    // {
    //   name: 'Britney Angeline Soeseno',
    //   role: 'Operational',
    //   title: 'CMO',
    //   status: 'active',
    //   avatar: '/Images/profile/britney.jpeg',
    //   email: 'britney.soeseno@terrava.id',
    // },
    // {
    //   name: 'Ahmad Hamra',
    //   role: 'Operational',
    //   title: 'CTO',
    //   status: 'active',
    //   avatar: '/Images/profile/hamra.png',
    //   email: 'ahmad.hamra@terrava.id',
    // },
    { name: 'Arif Setiawan', role: 'Owner', title: 'Farm Owner', status: 'active' },
    { name: 'Sinta Maharani', role: 'Operational', title: 'Operations Lead', status: 'active' },
    { name: 'Fajar Nugroho', role: 'Operational', title: 'Technical Lead', status: 'active' },
    // {
    //   name: 'Aqnhatul Shabrina',
    //   role: 'Operational',
    //   title: 'CFO',
    //   status: 'active',
    //   avatar: '/Images/profile/aqna.jpeg',
    //   email: 'aqnhatul.shabrina@terrava.id',
    // },
    // {
    //   name: 'Alexandra Clarissa',
    //   role: 'Operational',
    //   title: 'COO',
    //   status: 'active',
    //   avatar: '/Images/profile/alexandra.png',
    //   email: 'alexandra.clarissa@terrava.id',
    // },
    { name: 'Ratna Kusuma', role: 'Farm Manager', status: 'active' },
    { name: 'Andi Wirawan', role: 'Veterinarian', status: 'active' },
    { name: 'Budi Santoso', role: 'Staff', status: 'active' },
    { name: 'Reza Aditama', role: 'Staff', status: 'active' },
    { name: 'Clarissa Halim', role: 'Cooperative Admin', status: 'active' },
    { name: 'Ayu Pramesti', role: 'Viewer', status: 'invited' },
    { name: 'Dimas Prakoso', role: 'Staff', status: 'disabled' },
  ];
  const avatarPool = [
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop',
  ];
  return staffData.map((person, index) => ({
    id: `STF-${String(index + 1).padStart(3, '0')}`,
    name: person.name,
    email: person.email ?? `${person.name.toLowerCase().replace(/\s+/g, '.')}@terrava.id`,
    avatar: person.avatar ?? avatarPool[index % avatarPool.length],
    role: person.role,
    title: person.title,
    farmId: farms[index % farms.length].id,
    status: person.status,
    lastActive: person.status === 'active' ? `${randomInt(random, 1, 6)} hours ago` : null,
  }));
}

/** Demo logins (frontend/src/data/demoAccounts.ts) mapped onto staff members. */
export const DEMO_LOGINS: Record<string, string> = {
  'STF-001': 'demo@terrava.id',
  'STF-004': 'manager@terrava.id',
  'STF-005': 'vet@terrava.id',
};
export const DEMO_PASSWORD = 'Terrava123';

// ---------------------------------------------------------------------------
// AI insights (seed 6006)
// ---------------------------------------------------------------------------

const insightSeeds: {
  priority: 'low' | 'medium' | 'high';
  category: string;
  title: L;
  summary: L;
  recommendation: L;
}[] = [
  {
    priority: 'high',
    category: 'behavior',
    title: { id: 'Penurunan aktivitas di Barn B', en: 'Activity decline in Barn B' },
    summary: {
      id: 'Lima ternak di Barn B menunjukkan penurunan aktivitas rata-rata 16% selama dua hari terakhir.',
      en: 'Five animals in Barn B have shown an average 16% drop in activity over the past two days.',
    },
    recommendation: {
      id: 'Jadwalkan inspeksi lapangan dan pantau pola aktivitas selama 24 jam ke depan.',
      en: 'Schedule a field inspection and watch activity patterns for the next 24 hours.',
    },
  },
  {
    priority: 'high',
    category: 'health',
    title: { id: 'Anomali suhu berulang', en: 'Recurring temperature anomaly' },
    summary: {
      id: 'Tiga ternak menunjukkan pola kenaikan suhu tubuh berulang pada jam malam selama seminggu terakhir.',
      en: 'Three animals have shown a recurring night-time temperature rise over the past week.',
    },
    recommendation: {
      id: 'Rekomendasikan pemeriksaan dokter hewan untuk kelompok ternak terkait.',
      en: 'Arrange a veterinary examination for the affected group.',
    },
  },
  {
    priority: 'medium',
    category: 'devices',
    title: { id: 'Perangkat baterai rendah meningkat', en: 'More devices running low on battery' },
    summary: {
      id: 'Jumlah smart ear tag dengan baterai di bawah 20 persen meningkat 40% dibanding minggu lalu.',
      en: 'The number of smart ear tags below 20 percent battery is up 40% on last week.',
    },
    recommendation: {
      id: 'Jadwalkan penggantian atau pengisian daya perangkat secara proaktif.',
      en: 'Proactively schedule device replacement or recharging.',
    },
  },
  {
    priority: 'high',
    category: 'environment',
    title: { id: 'Risiko heat stress besok', en: 'Heat stress risk tomorrow' },
    summary: {
      id: 'Prediksi cuaca menunjukkan suhu lingkungan berpotensi melewati ambang nyaman pada siang hari besok.',
      en: 'The forecast suggests ambient temperature may exceed the comfort threshold tomorrow afternoon.',
    },
    recommendation: {
      id: 'Siapkan ventilasi tambahan dan pastikan akses air minum memadai.',
      en: 'Prepare additional ventilation and make sure drinking water is readily available.',
    },
  },
  {
    priority: 'medium',
    category: 'productivity',
    title: { id: 'Skor kesehatan kelompok menurun', en: 'Group health score is falling' },
    summary: {
      id: 'Rata-rata skor kesehatan Herd 2 menurun 6 poin dalam 10 hari terakhir dibandingkan baseline.',
      en: 'The average health score for Herd 2 has dropped six points below baseline over the last 10 days.',
    },
    recommendation: {
      id: 'Tinjau kualitas pakan dan kondisi lingkungan kandang terkait.',
      en: 'Review feed quality and the environmental conditions in the relevant barn.',
    },
  },
  {
    priority: 'medium',
    category: 'health',
    title: { id: 'Follow-up vaksinasi tertunda', en: 'Vaccination follow-up overdue' },
    summary: {
      id: 'Beberapa ternak melewati jadwal follow-up vaksinasi lebih dari 14 hari.',
      en: 'Several animals are more than 14 days past their vaccination follow-up date.',
    },
    recommendation: {
      id: 'Jadwalkan ulang sesi vaksinasi lanjutan bersama dokter hewan.',
      en: 'Reschedule the follow-up vaccination session with the veterinarian.',
    },
  },
  {
    priority: 'low',
    category: 'behavior',
    title: { id: 'Pola makan tidak biasa', en: 'Unusual feeding pattern' },
    summary: {
      id: 'Terdeteksi perubahan pola waktu makan pada beberapa ternak di Barn A.',
      en: 'A shift in feeding times has been detected for several animals in Barn A.',
    },
    recommendation: {
      id: 'Pantau kembali dalam 48 jam sebelum mengambil tindakan lanjutan.',
      en: 'Re-check in 48 hours before taking further action.',
    },
  },
  {
    priority: 'medium',
    category: 'devices',
    title: { id: 'Sinyal gateway melemah', en: 'Gateway signal weakening' },
    summary: {
      id: 'Kekuatan sinyal pada satu gateway menurun secara konsisten dalam tiga hari terakhir.',
      en: 'Signal strength on one gateway has declined steadily over the past three days.',
    },
    recommendation: {
      id: 'Jadwalkan pemeriksaan teknis pada lokasi gateway terkait.',
      en: 'Schedule a technical inspection at that gateway location.',
    },
  },
  {
    priority: 'low',
    category: 'productivity',
    title: { id: 'Potensi peningkatan bobot', en: 'Weight gain opportunity' },
    summary: {
      id: 'Tren bobot pada kelompok ternak tertentu menunjukkan pertumbuhan lebih cepat dari rata-rata.',
      en: 'Weight trends in one group show faster-than-average growth.',
    },
    recommendation: {
      id: 'Evaluasi kembali komposisi pakan untuk mempertahankan tren positif.',
      en: 'Reassess the feed mix to sustain the positive trend.',
    },
  },
  {
    priority: 'high',
    category: 'health',
    title: { id: 'Indikasi dehidrasi ringan', en: 'Signs of mild dehydration' },
    summary: {
      id: 'Kombinasi suhu tinggi dan penurunan aktivitas mengindikasikan potensi dehidrasi pada beberapa ternak.',
      en: 'High temperature combined with reduced activity points to possible dehydration in several animals.',
    },
    recommendation: {
      id: 'Pastikan akses air minum dan pantau kondisi selama 6 jam ke depan.',
      en: 'Ensure drinking water is accessible and monitor the condition for the next six hours.',
    },
  },
];

export function generateInsights(livestock: ReturnType<typeof generateLivestock>) {
  const random = createSeededRandom(6006);
  return insightSeeds.map((seed, index) => ({
    ...seed,
    id: `INS-${String(index + 1).padStart(3, '0')}`,
    affectedLivestock: Array.from({ length: randomInt(random, 2, 5) }).map(
      () => livestock[randomInt(random, 0, livestock.length - 1)].id,
    ),
    confidence: randomInt(random, 72, 95),
    generatedAt: `${randomInt(random, 1, 48)} hours ago`,
    reviewed: index % 3 === 0,
  }));
}

export const seedTasks = [
  {
    id: 'TSK-001',
    titleKey: 'overview.task.vaccination',
    kind: 'VACCINATION',
    farmId: 'farm-1',
    assignee: 'Andi Wirawan',
    dueInDays: 1,
  },
  {
    id: 'TSK-002',
    titleKey: 'overview.task.vetCheckup',
    kind: 'VET',
    farmId: 'farm-2',
    assignee: 'Andi Wirawan',
    dueInDays: 2,
  },
  {
    id: 'TSK-003',
    titleKey: 'overview.task.weighing',
    kind: 'WEIGHING',
    farmId: 'farm-3',
    assignee: 'Budi Santoso',
    dueInDays: 3,
  },
  {
    id: 'TSK-004',
    titleKey: 'overview.task.barnInspection',
    kind: 'INSPECTION',
    farmId: 'farm-4',
    assignee: 'Reza Aditama',
    dueInDays: 5,
  },
] as const;
