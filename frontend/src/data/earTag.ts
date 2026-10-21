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
import type { SensorItem } from "@/types";

export const sensorItems: SensorItem[] = [
  {
    id: "temperature",
    icon: Thermometer,
    title: "Temperature Sensor",
    description: {
      id: "Merekam suhu tubuh ternak secara berkala untuk mendeteksi indikasi demam atau infeksi.",
      en: "Records body temperature at regular intervals to catch signs of fever or infection.",
    },
  },
  {
    id: "heart-rate",
    icon: HeartPulse,
    title: "Heart Rate and Oxygen Sensor",
    description: {
      id: "Memantau detak jantung dan kadar oksigen sebagai indikator kondisi fisiologis.",
      en: "Tracks heart rate and oxygen saturation as indicators of physiological condition.",
    },
  },
  {
    id: "motion",
    icon: Cpu,
    title: "Accelerometer and Gyroscope",
    description: {
      id: "Mendeteksi tingkat aktivitas, pola gerak, dan potensi perilaku abnormal.",
      en: "Detects activity levels, movement patterns, and potentially abnormal behaviour.",
    },
  },
  {
    id: "gps",
    icon: MapPin,
    title: "GPS",
    description: {
      id: "Melacak posisi ternak secara real-time untuk mendukung geofence dan keamanan.",
      en: "Tracks animal position in real time to support geofencing and security.",
    },
  },
  {
    id: "memory",
    icon: Database,
    title: "External Flash Memory",
    description: {
      id: "Menyimpan data sensor secara lokal sebelum dikirimkan ke cloud.",
      en: "Buffers sensor data locally before it is transmitted to the cloud.",
    },
  },
  {
    id: "lora",
    icon: Radio,
    title: "LoRa Communication",
    description: {
      id: "Mengirimkan data ke gateway dengan konektivitas jarak jauh dan hemat energi.",
      en: "Sends data to the gateway over long-range, low-power connectivity.",
    },
  },
  {
    id: "battery",
    icon: BatteryCharging,
    title: "Battery",
    description: {
      id: "Baterai hemat daya yang dirancang untuk mendukung penggunaan jangka panjang di lapangan.",
      en: "A low-power battery designed for long deployments in the field.",
    },
  },
  {
    id: "solar",
    icon: Sun,
    title: "Solar Charging",
    description: {
      id: "Dukungan pengisian daya tambahan melalui panel surya kecil pada perangkat.",
      en: "Supplementary charging from a compact solar panel on the device.",
    },
  },
];
