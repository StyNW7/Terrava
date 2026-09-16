import type { AuthUser } from "@/types/auth";

export interface DemoAccount extends AuthUser {
  password: string;
  /** Short descriptor shown on the login page persona switcher. */
  tagline: string;
}

/**
 * Dummy credentials for the prototype. Any account below can be used to sign in
 * and land directly on the farmer dashboard. The first entry is the primary demo
 * account surfaced on the login page.
 */
export const demoAccounts: DemoAccount[] = [
  {
    id: "usr-owner",
    email: "demo@terrava.id",
    password: "Terrava123",
    name: "Stanley Wijaya",
    role: "Farm Owner",
    farmName: "Terrava Farm Boyolali",
    initials: "SW",
    tagline: "Akses penuh seluruh fitur dashboard",
  },
  {
    id: "usr-manager",
    email: "manager@terrava.id",
    password: "Terrava123",
    name: "Ratna Kusuma",
    role: "Farm Manager",
    farmName: "Koperasi Ternak Pasuruan",
    initials: "RK",
    tagline: "Operasional harian dan tim lapangan",
  },
  {
    id: "usr-vet",
    email: "vet@terrava.id",
    password: "Terrava123",
    name: "drh. Andi Prasetyo",
    role: "Dokter Hewan",
    farmName: "Terrava Farm Boyolali",
    initials: "AP",
    tagline: "Fokus kesehatan dan rekam medis ternak",
  },
];

export const primaryDemoAccount = demoAccounts[0];

export function findDemoAccount(email: string, password: string): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return demoAccounts.find((account) => account.email === normalized && account.password === password);
}

export function toAuthUser(account: DemoAccount): AuthUser {
  const { id, email, name, role, farmName, initials } = account;
  return { id, email, name, role, farmName, initials };
}

export function getInitials(name: string): string {
  return name
    .replace(/^(drh\.|dr\.|ir\.)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
