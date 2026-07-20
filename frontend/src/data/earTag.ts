import {
  Thermometer,
  HeartPulse,
  Radio,
  MapPin,
  Database,
  BatteryCharging,
  Cpu,
  Sun,
} from "lucide-react";
import type { SensorItem, AnatomyCallout, SpecRow } from "@/types";

export const sensorItems: SensorItem[] = [
  {
    id: "temperature",
    icon: Thermometer,
    title: "Temperature Sensor",
    description: "Merekam suhu tubuh ternak secara berkala untuk mendeteksi indikasi demam atau infeksi.",
  },
  {
    id: "heart-rate",
    icon: HeartPulse,
    title: "Heart Rate and Oxygen Sensor",
    description: "Memantau detak jantung dan kadar oksigen sebagai indikator kondisi fisiologis.",
  },
  {
    id: "motion",
    icon: Cpu,
    title: "Accelerometer and Gyroscope",
    description: "Mendeteksi tingkat aktivitas, pola gerak, dan potensi perilaku abnormal.",
  },
  {
    id: "gps",
    icon: MapPin,
    title: "GPS",
    description: "Melacak posisi ternak secara real-time untuk mendukung geofence dan keamanan.",
  },
  {
    id: "memory",
    icon: Database,
    title: "External Flash Memory",
    description: "Menyimpan data sensor secara lokal sebelum dikirimkan ke cloud.",
  },
  {
    id: "lora",
    icon: Radio,
    title: "LoRa Communication",
    description: "Mengirimkan data ke gateway dengan konektivitas jarak jauh dan hemat energi.",
  },
  {
    id: "battery",
    icon: BatteryCharging,
    title: "Battery",
    description: "Baterai hemat daya yang dirancang untuk mendukung penggunaan jangka panjang di lapangan.",
  },
  {
    id: "solar",
    icon: Sun,
    title: "Solar Charging",
    description: "Dukungan pengisian daya tambahan melalui panel surya kecil pada perangkat.",
  },
];

export const anatomyCallouts: AnatomyCallout[] = [
  { id: "sensor-module", label: "Sensor Module", description: "Kumpulan sensor fisiologis dan gerak.", top: "18%", left: "62%" },
  { id: "mcu", label: "MCU", description: "Unit pemroses utama perangkat.", top: "38%", left: "70%" },
  { id: "lora-antenna", label: "LoRa Antenna", description: "Antena untuk transmisi data jarak jauh.", top: "12%", left: "30%" },
  { id: "battery-part", label: "Battery", description: "Sumber daya utama perangkat.", top: "58%", left: "55%" },
  { id: "solar-panel", label: "Solar Panel", description: "Panel pengisian daya tambahan.", top: "70%", left: "35%" },
  { id: "enclosure", label: "Ear Tag Enclosure", description: "Casing pelindung yang tahan terhadap kondisi lapangan.", top: "82%", left: "68%" },
];

export const specifications: SpecRow[] = [
  { label: "MCU", value: "Low-power 32-bit microcontroller" },
  { label: "Temperature Sensor", value: "Digital body temperature sensor" },
  { label: "Heart Rate Sensor", value: "Optical heart rate and oxygen sensor" },
  { label: "Motion Sensor", value: "6-axis accelerometer and gyroscope" },
  { label: "GPS", value: "Low-power GPS module" },
  { label: "Connectivity", value: "LoRa long-range wireless" },
  { label: "Memory", value: "External flash storage" },
  { label: "Battery", value: "Rechargeable low-power battery" },
  { label: "Solar Panel", value: "Optional solar-assisted charging" },
  { label: "Data Interval", value: "Configurable periodic transmission" },
];
