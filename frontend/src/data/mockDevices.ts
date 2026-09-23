import type { Device, DeviceLog, DeviceStatus } from "@/types/dashboard";
import type { Localized } from "@/i18n/types";
import { createSeededRandom, pick, randomInt } from "@/utils/seededRandom";
import { farms } from "@/data/mockFarms";
import { livestock } from "@/data/mockLivestock";

const random = createSeededRandom(3003);

const statusPool: DeviceStatus[] = ["online", "online", "online", "online", "offline", "low-battery", "maintenance"];

const earTagDevices: Device[] = Array.from({ length: 12 }).map((_, index) => {
  const status = pick(random, statusPool);
  const animal = livestock[index];
  return {
    id: `DEV-${String(index + 1).padStart(3, "0")}`,
    name: `Smart Ear Tag ${String(index + 1).padStart(3, "0")}`,
    type: "ear-tag",
    status,
    assignedLivestockId: animal.id,
    farmId: animal.farmId,
    battery: status === "low-battery" ? randomInt(random, 8, 22) : randomInt(random, 45, 100),
    signal: status === "offline" ? randomInt(random, 0, 10) : randomInt(random, 55, 100),
    firmware: pick(random, ["v2.4.1", "v2.4.0", "v2.3.5"]),
    lastSync: status === "offline" ? `${randomInt(random, 3, 20)} hours ago` : `${randomInt(random, 1, 45)} minutes ago`,
    uptime: randomInt(random, 82, 99),
    dataPackets: randomInt(random, 1200, 8600),
  };
});

const gatewayDevices: Device[] = farms.map((farm, index) => ({
  id: `DEV-${String(13 + index).padStart(3, "0")}`,
  name: `LoRa Gateway ${farm.name.split(" ")[0]}`,
  type: "gateway",
  status: pick(random, ["online", "online", "online", "maintenance"]),
  assignedLivestockId: null,
  farmId: farm.id,
  battery: 100,
  signal: randomInt(random, 80, 100),
  firmware: "v1.8.2",
  lastSync: `${randomInt(random, 1, 10)} minutes ago`,
  uptime: randomInt(random, 95, 100),
  dataPackets: randomInt(random, 15000, 42000),
}));

const sensorDevices: Device[] = farms.map((farm, index) => ({
  id: `DEV-${String(17 + index).padStart(3, "0")}`,
  name: `Environmental Sensor ${farm.name.split(" ")[0]}`,
  type: "environmental-sensor",
  status: pick(random, ["online", "online", "low-battery"]),
  assignedLivestockId: null,
  farmId: farm.id,
  battery: randomInt(random, 30, 100),
  signal: randomInt(random, 60, 100),
  firmware: "v1.2.0",
  lastSync: `${randomInt(random, 1, 30)} minutes ago`,
  uptime: randomInt(random, 88, 100),
  dataPackets: randomInt(random, 5000, 12000),
}));

export const devices: Device[] = [...earTagDevices, ...gatewayDevices, ...sensorDevices];

earTagDevices.forEach((device, index) => {
  const animal = livestock[index];
  animal.deviceId = device.id;
  animal.deviceStatus = device.status;
  animal.batteryLevel = device.battery;
});

const logTypes: DeviceLog["type"][] = ["connected", "data-sent", "warning", "firmware-updated", "offline"];
const logMessages: Record<DeviceLog["type"], Localized[]> = {
  connected: [
    { id: "Perangkat berhasil terhubung ke gateway.", en: "Device connected to the gateway successfully." },
    { id: "Koneksi LoRa dipulihkan.", en: "LoRa connection restored." },
  ],
  "data-sent": [
    { id: "Data sensor berhasil dikirim ke cloud.", en: "Sensor data uploaded to the cloud successfully." },
    { id: "Paket data terkirim tanpa error.", en: "Data packet transmitted without errors." },
  ],
  warning: [
    { id: "Sinyal lemah terdeteksi.", en: "Weak signal detected." },
    { id: "Suhu perangkat lebih tinggi dari batas normal.", en: "Device temperature is above the normal limit." },
  ],
  "firmware-updated": [
    { id: "Firmware diperbarui ke versi terbaru.", en: "Firmware updated to the latest version." },
    { id: "Pembaruan konfigurasi berhasil diterapkan.", en: "Configuration update applied successfully." },
  ],
  offline: [
    { id: "Perangkat kehilangan koneksi.", en: "Device lost its connection." },
    { id: "Tidak ada data diterima dalam 2 jam terakhir.", en: "No data received in the last two hours." },
  ],
};

export const deviceLogs: DeviceLog[] = devices.flatMap((device) =>
  Array.from({ length: randomInt(random, 3, 6) }).map((_, index) => {
    const type = pick(random, logTypes);
    return {
      id: `${device.id}-LOG-${index}`,
      deviceId: device.id,
      type,
      message: pick(random, logMessages[type]),
      timestamp: `${randomInt(random, 1, 72)} hours ago`,
    };
  })
);

export function getDeviceById(id: string): Device | undefined {
  return devices.find((device) => device.id === id);
}

export function getLogsByDevice(deviceId: string): DeviceLog[] {
  return deviceLogs.filter((log) => log.deviceId === deviceId);
}
