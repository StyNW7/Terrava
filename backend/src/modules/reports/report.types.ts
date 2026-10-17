import type { Language } from '../../common/utils/localized';

export const REPORT_TYPES = ['overview', 'health', 'alerts', 'devices', 'farm', 'environment', 'staff'] as const;
export type ReportKind = (typeof REPORT_TYPES)[number];

export type Tone = 'default' | 'good' | 'warning' | 'danger' | 'neutral';

export interface ReportKpi {
  label: string;
  value: string;
  tone?: Tone;
}

export interface ReportChart {
  title: string;
  unit?: string;
  max?: number;
  bars: { label: string; value: number; tone?: Tone }[];
}

export interface ReportTable {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

/** Same structure as the dashboard's ReportDocument (frontend/src/lib/reports.ts). */
export interface ReportDocument {
  type: ReportKind;
  title: string;
  scope: string;
  period: { from: string; to: string };
  generatedAt: string;
  language: Language;
  kpis: ReportKpi[];
  chart?: ReportChart;
  findings: string[];
  tables: ReportTable[];
}

export interface ReportFilters {
  farmId: string;
  livestockType: string;
  health: string;
  /** Look-back window in days for time-based figures. */
  days: number;
}

/** Bilingual labels used by the server-side report builder. */
export const LABELS = {
  'title.overview': { id: 'Ringkasan Dashboard', en: 'Dashboard Overview' },
  'title.health': { id: 'Laporan Kesehatan Ternak', en: 'Livestock Health Report' },
  'title.alerts': { id: 'Laporan Alert', en: 'Alerts Report' },
  'title.devices': { id: 'Laporan Perangkat', en: 'Device Report' },
  'title.farm': { id: 'Laporan Operasional Peternakan', en: 'Farm Operations Report' },
  'title.environment': { id: 'Laporan Lingkungan & THI', en: 'Environment & THI Report' },
  'title.staff': { id: 'Laporan Kinerja Tim', en: 'Staff Performance Report' },
  'desc.overview': {
    id: 'Ringkasan satu halaman kondisi ternak, alert, perangkat dan tugas.',
    en: 'One-page snapshot of herd, alerts, devices and tasks.',
  },
  'desc.health': {
    id: 'Distribusi kesehatan, skor rata-rata, ternak yang perlu perhatian dan status vaksinasi.',
    en: 'Health distribution, average scores, animals needing attention and vaccination status.',
  },
  'desc.alerts': {
    id: 'Volume alert per kategori dan tingkat keparahan, waktu respons dan daftar alert.',
    en: 'Alert volume by category and severity, response times and the alert log.',
  },
  'desc.devices': {
    id: 'Status armada perangkat, baterai, sinyal, uptime dan perangkat bermasalah.',
    en: 'Device fleet status, battery, signal, uptime and devices with issues.',
  },
  'desc.farm': {
    id: 'Okupansi, kapasitas, skor kesehatan dan cakupan perangkat per peternakan.',
    en: 'Occupancy, capacity, health and device coverage per farm.',
  },
  'desc.environment': {
    id: 'Suhu, kelembapan dan Temperature-Humidity Index kandang.',
    en: 'Barn temperature, humidity and Temperature-Humidity Index.',
  },
  'desc.staff': {
    id: 'Tugas, alert yang ditangani dan tingkat penyelesaian setiap anggota tim.',
    en: 'Tasks, handled alerts and resolution rate for every team member.',
  },
  allFarms: { id: 'Semua peternakan', en: 'All farms' },
  totalLivestock: { id: 'Total ternak', en: 'Total livestock' },
  healthy: { id: 'Sehat', en: 'Healthy' },
  attention: { id: 'Perlu perhatian', en: 'Needs attention' },
  critical: { id: 'Kritis', en: 'Critical' },
  inactive: { id: 'Tidak aktif', en: 'Inactive' },
  avgHealth: { id: 'Skor kesehatan rata-rata', en: 'Average health score' },
  vaccinationOverdue: { id: 'Vaksinasi terlambat', en: 'Vaccination overdue' },
  healthDistribution: { id: 'Distribusi status kesehatan', en: 'Health status distribution' },
  needsAttentionTable: { id: 'Ternak yang perlu perhatian', en: 'Animals needing attention' },
  vaccinationTable: { id: 'Vaksinasi jatuh tempo / terlambat', en: 'Vaccinations due / overdue' },
  alertsInPeriod: { id: 'Alert dalam periode', en: 'Alerts in period' },
  openAlerts: { id: 'Alert terbuka', en: 'Open alerts' },
  criticalAlerts: { id: 'Alert kritis', en: 'Critical alerts' },
  resolved: { id: 'Terselesaikan', en: 'Resolved' },
  mttr: { id: 'Rata-rata waktu penyelesaian', en: 'Mean time to resolve' },
  alertsByCategory: { id: 'Alert per kategori', en: 'Alerts by category' },
  alertLog: { id: 'Daftar alert', en: 'Alert log' },
  totalDevices: { id: 'Total perangkat', en: 'Total devices' },
  online: { id: 'Online', en: 'Online' },
  offline: { id: 'Offline', en: 'Offline' },
  lowBattery: { id: 'Baterai rendah', en: 'Low battery' },
  maintenance: { id: 'Perawatan', en: 'Maintenance' },
  avgBattery: { id: 'Baterai rata-rata', en: 'Average battery' },
  avgUptime: { id: 'Uptime rata-rata', en: 'Average uptime' },
  deviceStatus: { id: 'Status perangkat', en: 'Device status' },
  deviceTable: { id: 'Daftar perangkat', en: 'Device list' },
  farms: { id: 'Peternakan', en: 'Farms' },
  capacity: { id: 'Kapasitas', en: 'Capacity' },
  occupancy: { id: 'Okupansi', en: 'Occupancy' },
  coverage: { id: 'Cakupan perangkat', en: 'Device coverage' },
  occupancyByFarm: { id: 'Okupansi per peternakan', en: 'Occupancy by farm' },
  farmTable: { id: 'Ringkasan per peternakan', en: 'Per-farm summary' },
  avgTemperature: { id: 'Suhu rata-rata', en: 'Average temperature' },
  avgHumidity: { id: 'Kelembapan rata-rata', en: 'Average humidity' },
  avgThi: { id: 'THI rata-rata', en: 'Average THI' },
  maxThi: { id: 'THI tertinggi', en: 'Peak THI' },
  heatStressDays: { id: 'Hari dengan heat stress', en: 'Heat stress days' },
  thiByFarm: { id: 'THI terkini per peternakan', en: 'Current THI by farm' },
  dailyEnvironment: { id: 'Lingkungan harian', en: 'Daily environment' },
  members: { id: 'Anggota aktif', en: 'Active members' },
  tasksOpen: { id: 'Tugas terbuka', en: 'Open tasks' },
  tasksDone: { id: 'Tugas selesai', en: 'Completed tasks' },
  avgResolution: { id: 'Tingkat penyelesaian rata-rata', en: 'Average resolution rate' },
  resolutionByMember: { id: 'Tingkat penyelesaian per anggota', en: 'Resolution rate by member' },
  staffTable: { id: 'Kinerja anggota tim', en: 'Team member performance' },
  openTasks: { id: 'Tugas terbuka', en: 'Open tasks' },
  activeDevices: { id: 'Perangkat aktif', en: 'Active devices' },
  col: {
    id: { id: 'ID', en: 'ID' },
    code: { id: 'Kode', en: 'Code' },
    name: { id: 'Nama', en: 'Name' },
    farm: { id: 'Peternakan', en: 'Farm' },
    barn: { id: 'Kandang', en: 'Barn' },
    score: { id: 'Skor', en: 'Score' },
    status: { id: 'Status', en: 'Status' },
    temperature: { id: 'Suhu (°C)', en: 'Temp (°C)' },
    heartRate: { id: 'Detak (bpm)', en: 'HR (bpm)' },
    vaccination: { id: 'Vaksinasi', en: 'Vaccination' },
    alert: { id: 'Alert', en: 'Alert' },
    severity: { id: 'Keparahan', en: 'Severity' },
    category: { id: 'Kategori', en: 'Category' },
    detected: { id: 'Terdeteksi', en: 'Detected' },
    assignee: { id: 'Penanggung jawab', en: 'Assignee' },
    type: { id: 'Tipe', en: 'Type' },
    battery: { id: 'Baterai', en: 'Battery' },
    signal: { id: 'Sinyal', en: 'Signal' },
    firmware: { id: 'Firmware', en: 'Firmware' },
    lastSync: { id: 'Sinkron terakhir', en: 'Last sync' },
    livestock: { id: 'Ternak', en: 'Livestock' },
    alerts: { id: 'Alert', en: 'Alerts' },
    staff: { id: 'Staf', en: 'Staff' },
    date: { id: 'Tanggal', en: 'Date' },
    humidity: { id: 'Kelembapan (%)', en: 'Humidity (%)' },
    thi: { id: 'THI', en: 'THI' },
    role: { id: 'Peran', en: 'Role' },
    tasks: { id: 'Tugas', en: 'Tasks' },
    resolution: { id: 'Penyelesaian', en: 'Resolution' },
  },
} as const;

/** Display names for enum values that appear inside report tables and charts. */
export const ENUM_LABELS: Record<string, { id: string; en: string }> = {
  'up-to-date': { id: 'Terkini', en: 'Up to date' },
  due: { id: 'Jatuh tempo', en: 'Due' },
  overdue: { id: 'Terlambat', en: 'Overdue' },
  active: { id: 'Aktif', en: 'Active' },
  acknowledged: { id: 'Ditinjau', en: 'Acknowledged' },
  resolved: { id: 'Selesai', en: 'Resolved' },
  info: { id: 'Info', en: 'Info' },
  warning: { id: 'Peringatan', en: 'Warning' },
  high: { id: 'Tinggi', en: 'High' },
  critical: { id: 'Kritis', en: 'Critical' },
  health: { id: 'Kesehatan', en: 'Health' },
  behavior: { id: 'Perilaku', en: 'Behaviour' },
  location: { id: 'Lokasi', en: 'Location' },
  device: { id: 'Perangkat', en: 'Device' },
  environmental: { id: 'Lingkungan', en: 'Environmental' },
  weather: { id: 'Cuaca', en: 'Weather' },
  online: { id: 'Online', en: 'Online' },
  offline: { id: 'Offline', en: 'Offline' },
  'low-battery': { id: 'Baterai rendah', en: 'Low battery' },
  maintenance: { id: 'Perawatan', en: 'Maintenance' },
  'ear-tag': { id: 'Smart ear tag', en: 'Smart ear tag' },
  gateway: { id: 'Gateway LoRa', en: 'LoRa gateway' },
  'environmental-sensor': { id: 'Sensor lingkungan', en: 'Environmental sensor' },
};
