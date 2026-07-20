import type { Livestock, HealthStatus, DeviceStatus } from "@/types/dashboard";
import { createSeededRandom, pick, randomInt, randomFloat } from "@/utils/seededRandom";
import { farms, barns } from "@/data/mockFarms";
import { images } from "@/data/images";

const random = createSeededRandom(2002);

const names = [
  "Bella", "Luna", "Bima", "Sora", "Moka", "Kiku", "Nala", "Dewi", "Arjuna", "Kirana",
  "Sekar", "Bayu", "Cinta", "Gading", "Intan", "Jaya", "Kencana", "Lestari", "Mega", "Nirmala",
  "Oka", "Puspa", "Rama", "Sari", "Teja", "Utama", "Vira", "Wira", "Yudha", "Zahra",
  "Ayu", "Bagus", "Citra", "Dharma", "Endah", "Fajar", "Gita", "Hana", "Indra", "Jelita",
];

const livestockTypes = ["Sapi Perah", "Sapi Potong"];
const breeds = ["Friesian Holstein", "Limousin", "Simmental", "Brahman", "Ongole"];
const herdGroups = ["Herd 1", "Herd 2", "Herd 3"];
const acquisitionSources = ["Breeding internal", "Pembelian mitra", "Program koperasi", "Transfer antar farm"];

const healthStatusPool: HealthStatus[] = [
  "healthy", "healthy", "healthy", "healthy", "healthy", "healthy", "healthy",
  "attention", "attention", "attention",
  "critical", "critical",
  "inactive",
];

const deviceStatusPool: DeviceStatus[] = ["online", "online", "online", "online", "offline", "low-battery"];

const baseLat = -6.9;
const baseLng = 107.6;

export const livestock: Livestock[] = Array.from({ length: 40 }).map((_, index) => {
  const farm = farms[index % farms.length];
  const farmBarns = barns.filter((barn) => barn.farmId === farm.id);
  const barn = pick(random, farmBarns);
  const healthStatus = pick(random, healthStatusPool);
  const healthScore =
    healthStatus === "healthy"
      ? randomInt(random, 85, 98)
      : healthStatus === "attention"
      ? randomInt(random, 60, 78)
      : healthStatus === "critical"
      ? randomInt(random, 30, 55)
      : randomInt(random, 40, 70);

  const hasDevice = random() > 0.08;
  const deviceStatus = hasDevice ? pick(random, deviceStatusPool) : "unassigned";

  return {
    id: `LVS-${String(index + 1).padStart(3, "0")}`,
    code: `TRV-${String(index + 1).padStart(3, "0")}`,
    name: names[index % names.length],
    earTagId: `EAR-${String(1000 + index)}`,
    photo: images.cattleHerd,
    type: pick(random, livestockTypes),
    breed: pick(random, breeds),
    gender: random() > 0.5 ? "Female" : "Male",
    dateOfBirth: `20${randomInt(random, 19, 23)}-${String(randomInt(random, 1, 12)).padStart(2, "0")}-${String(
      randomInt(random, 1, 28)
    ).padStart(2, "0")}`,
    ageMonths: randomInt(random, 8, 60),
    weightKg: randomInt(random, 180, 620),
    bodyConditionScore: randomInt(random, 2, 5),
    farmId: farm.id,
    barnId: barn.id,
    herdGroup: pick(random, herdGroups),
    healthStatus,
    healthScore,
    temperature: randomFloat(random, healthStatus === "critical" ? 39.2 : 37.8, healthStatus === "critical" ? 40.5 : 39.1),
    heartRate: randomInt(random, healthStatus === "critical" ? 90 : 60, healthStatus === "critical" ? 120 : 85),
    activityLevel: randomInt(random, healthStatus === "attention" || healthStatus === "critical" ? 10 : 45, healthStatus === "attention" || healthStatus === "critical" ? 40 : 95),
    oxygenLevel: randomInt(random, 92, 99),
    deviceId: hasDevice ? `DEV-${String(index + 1).padStart(3, "0")}` : null,
    deviceStatus,
    batteryLevel: hasDevice ? randomInt(random, 15, 100) : 0,
    lastUpdate: `${randomInt(random, 1, 58)} menit lalu`,
    location: {
      lat: baseLat - randomFloat(random, 0, 0.6, 4),
      lng: baseLng + randomFloat(random, 0, 0.6, 4),
    },
    vaccinationStatus: pick(random, ["up-to-date", "up-to-date", "due", "overdue"]),
    arrivalDate: `20${randomInt(random, 20, 25)}-${String(randomInt(random, 1, 12)).padStart(2, "0")}-${String(
      randomInt(random, 1, 28)
    ).padStart(2, "0")}`,
    acquisitionSource: pick(random, acquisitionSources),
    notes: "Data prototype untuk keperluan demo Terrava.",
  };
});

export function getLivestockById(id: string): Livestock | undefined {
  return livestock.find((animal) => animal.id === id);
}

export function getLivestockByFarm(farmId: string): Livestock[] {
  return livestock.filter((animal) => animal.farmId === farmId);
}

export function getLivestockByBarn(barnId: string): Livestock[] {
  return livestock.filter((animal) => animal.barnId === barnId);
}
