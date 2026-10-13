import type { AuthUser } from "@/types/auth";
import type { Localized } from "@/i18n/types";

export interface DemoAccount extends AuthUser {
  password: string;
  /** Short descriptor shown on the login page persona switcher. */
  tagline: Localized;
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
    tagline: { id: "Akses penuh seluruh fitur dashboard", en: "Full access to every dashboard feature" },
  },
  {
    id: "usr-manager",
    email: "manager@terrava.id",
    password: "Terrava123",
    name: "Ratna Kusuma",
    role: "Farm Manager",
    farmName: "Koperasi Ternak Pasuruan",
    initials: "RK",
    tagline: { id: "Operasional harian dan tim lapangan", en: "Daily operations and field teams" },
  },
  {
    id: "usr-vet",
    email: "vet@terrava.id",
    password: "Terrava123",
    name: "drh. Andi Prasetyo",
    role: "Veterinarian",
    farmName: "Terrava Farm Boyolali",
    initials: "AP",
    tagline: { id: "Fokus kesehatan dan rekam medis ternak", en: "Focused on herd health and medical records" },
  },
];

export const primaryDemoAccount = demoAccounts[0];

export function findDemoAccount(email: string, password: string): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return demoAccounts.find((account) => account.email === normalized && account.password === password);
}

/** Password changes made in Settings are kept per browser as SHA-256 hashes, never in plain text. */
export const PASSWORD_OVERRIDES_KEY = "terrava-password-overrides";

export async function hashPassword(email: string, password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`terrava:${email.trim().toLowerCase()}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readOverrides(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(PASSWORD_OVERRIDES_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

/** Check credentials against the demo accounts, honouring a password changed in Settings. */
export async function verifyCredentials(email: string, password: string): Promise<DemoAccount | undefined> {
  const normalized = email.trim().toLowerCase();
  const account = demoAccounts.find((item) => item.email === normalized);
  if (!account) return undefined;
  const override = readOverrides()[normalized];
  if (override) return override === (await hashPassword(normalized, password)) ? account : undefined;
  return account.password === password ? account : undefined;
}

export async function setPasswordOverride(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const overrides = readOverrides();
  overrides[normalized] = await hashPassword(normalized, password);
  window.localStorage.setItem(PASSWORD_OVERRIDES_KEY, JSON.stringify(overrides));
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
