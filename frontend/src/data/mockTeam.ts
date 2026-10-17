import type { StaffMember, StaffRole } from "@/types/dashboard";
import { createSeededRandom, randomInt } from "@/utils/seededRandom";
import { farms } from "@/data/mockFarms";

const random = createSeededRandom(5005);

const staffData: { name: string; role: StaffRole; title?: string; status: StaffMember["status"]; avatar?: string; email?: string }[] = [
  { name: "Stanley Nathanael Wijaya", role: "Owner", title: "Founder & CEO", status: "active", avatar: "/Images/profile/snw.png", email: "stanley.wijaya@terrava.id" },
  // { name: "Britney Angeline Soeseno", role: "Operational", title: "CMO", status: "active", avatar: "/Images/profile/britney.jpeg", email: "britney.soeseno@terrava.id" },
  // { name: "Ahmad Hamra", role: "Operational", title: "CTO", status: "active", avatar: "/Images/profile/hamra.png", email: "ahmad.hamra@terrava.id" },
  { name: "Aqnhatul Shabrina", role: "Operational", title: "CFO", status: "active", avatar: "/Images/profile/aqna.jpeg", email: "aqnhatul.shabrina@terrava.id" },
  { name: "Alexandra Clarissa", role: "Operational", title: "COO", status: "active", avatar: "/Images/profile/alexandra.png", email: "alexandra.clarissa@terrava.id" },
  { name: "Ratna Kusuma", role: "Farm Manager", status: "active" },
  { name: "Andi Wirawan", role: "Veterinarian", status: "active" },
  { name: "Budi Santoso", role: "Staff", status: "active" },
  { name: "Reza Aditama", role: "Staff", status: "active" },
  { name: "Clarissa Halim", role: "Cooperative Admin", status: "active" },
  { name: "Ayu Pramesti", role: "Viewer", status: "invited" },
  { name: "Dimas Prakoso", role: "Staff", status: "disabled" },
];

const avatarPool = [
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop",
];

export const staff: StaffMember[] = staffData.map((person, index) => ({
  id: `STF-${String(index + 1).padStart(3, "0")}`,
  name: person.name,
  email: person.email ?? `${person.name.toLowerCase().replace(/\s+/g, ".")}@terrava.id`,
  avatar: person.avatar ?? avatarPool[index % avatarPool.length],
  role: person.role,
  title: person.title,
  farmId: farms[index % farms.length].id,
  status: person.status,
  lastActive: person.status === "active" ? `${randomInt(random, 1, 6)} hours ago` : "Never active",
  tasksAssigned: randomInt(random, 2, 18),
  alertsAssigned: randomInt(random, 0, 9),
  resolutionRate: randomInt(random, 68, 98),
}));

export function getStaffById(id: string): StaffMember | undefined {
  return staff.find((member) => member.id === id);
}
