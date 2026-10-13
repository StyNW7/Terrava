import type { Farm, Barn } from "@/types/dashboard";
import { createSeededRandom, randomInt, randomFloat } from "@/utils/seededRandom";
import { images } from "@/data/images";

const random = createSeededRandom(1001);

export const farms: Farm[] = [
  {
    id: "farm-1",
    name: "Green Valley Farm",
    location: "Boyolali, Jawa Tengah",
    region: "Jawa Tengah",
    manager: "Stanley Nathanael Wijaya",
    image: images.modernBarn,
    status: "active",
    livestockCount: 14,
    barnCount: 3,
    healthScore: 88,
    deviceCoverage: 92,
    activeAlerts: 5,
    staffCount: 3,
    capacity: 20,
  },
  {
    id: "farm-2",
    name: "Lembang Dairy Farm",
    location: "Lembang, Jawa Barat",
    region: "Jawa Barat",
    manager: "Ratna Kusuma",
    image: images.cattleHerd,
    status: "active",
    livestockCount: 12,
    barnCount: 3,
    healthScore: 82,
    deviceCoverage: 85,
    activeAlerts: 6,
    staffCount: 2,
    capacity: 16,
  },
  {
    id: "farm-3",
    name: "Nusantara Livestock Center",
    location: "Pasuruan, Jawa Timur",
    region: "Jawa Timur",
    manager: "Andi Wirawan",
    image: images.farmLandscape,
    status: "active",
    livestockCount: 9,
    barnCount: 3,
    healthScore: 79,
    deviceCoverage: 78,
    activeAlerts: 4,
    staffCount: 2,
    capacity: 14,
  },
  {
    id: "farm-4",
    name: "Terrava Demo Farm",
    location: "Cianjur, Jawa Barat",
    region: "Jawa Barat",
    manager: "Clarissa Halim",
    image: images.sustainableFarming,
    status: "active",
    livestockCount: 5,
    barnCount: 3,
    healthScore: 91,
    deviceCoverage: 96,
    activeAlerts: 3,
    staffCount: 1,
    capacity: 10,
  },
];

const barnNames = ["Barn A", "Barn B", "Barn C"];
const barnManagers = [
  "Stanley Nathanael Wijaya",
  "Ratna Kusuma",
  "Andi Wirawan",
  "Budi Santoso",
  "Clarissa Halim",
  "Reza Aditama",
];

export const barns: Barn[] = farms.flatMap((farm, farmIndex) =>
  barnNames.map((name, barnIndex) => {
    const capacity = randomInt(random, 6, 10);
    return {
      id: `barn-${farmIndex * 3 + barnIndex + 1}`,
      name: `${name} - ${farm.name.split(" ")[0]}`,
      farmId: farm.id,
      capacity,
      occupancy: randomInt(random, Math.max(2, capacity - 4), capacity),
      healthScore: randomInt(random, 70, 96),
      temperature: randomFloat(random, 24, 31),
      humidity: randomInt(random, 55, 78),
      alertCount: randomInt(random, 0, 4),
      manager: barnManagers[(farmIndex + barnIndex) % barnManagers.length],
    };
  })
);

export function getFarmById(id: string): Farm | undefined {
  return farms.find((farm) => farm.id === id);
}

export function getBarnsByFarm(farmId: string): Barn[] {
  return barns.filter((barn) => barn.farmId === farmId);
}

export function getBarnById(id: string): Barn | undefined {
  return barns.find((barn) => barn.id === id);
}
