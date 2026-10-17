import type { StaffRole } from '../../generated/prisma/enums';

/**
 * The database stores enums as UPPER_SNAKE; the frontend speaks kebab-case
 * ("low-battery", "ear-tag", "up-to-date"). These helpers translate both ways
 * so the API contract matches the existing dashboard types exactly.
 */
export function toApiEnum<T extends string>(value: T): string;
export function toApiEnum<T extends string>(value: T | null | undefined): string | null;
export function toApiEnum<T extends string>(value: T | null | undefined): string | null {
  return value == null ? null : value.toLowerCase().replace(/_/g, '-');
}

export function fromApiEnum<T extends string>(value: string): T {
  return value.toUpperCase().replace(/-/g, '_') as T;
}

/** Kebab-case values accepted by the API for a given Prisma enum object. */
export function apiValues(enumObject: Record<string, string>): string[] {
  return Object.values(enumObject).map((value) => toApiEnum(value));
}

const ROLE_LABELS: Record<StaffRole, string> = {
  OWNER: 'Owner',
  FARM_MANAGER: 'Farm Manager',
  OPERATIONAL: 'Operational',
  STAFF: 'Staff',
  VETERINARIAN: 'Veterinarian',
  COOPERATIVE_ADMIN: 'Cooperative Admin',
  VIEWER: 'Viewer',
};

/** "FARM_MANAGER" -> "Farm Manager" (the StaffRole strings used by the dashboard). */
export function roleLabel(role: StaffRole): string {
  return ROLE_LABELS[role];
}

export const ROLE_LABEL_VALUES = Object.values(ROLE_LABELS);

/** "Farm Manager" -> "FARM_MANAGER". */
export function roleFromLabel(label: string): StaffRole {
  const entry = (Object.entries(ROLE_LABELS) as [StaffRole, string][]).find(([, value]) => value === label);
  if (!entry) throw new Error(`Unknown role "${label}"`);
  return entry[0];
}

export function genderLabel(gender: 'MALE' | 'FEMALE'): 'Male' | 'Female' {
  return gender === 'MALE' ? 'Male' : 'Female';
}
