import type { StaffRole } from '../generated/prisma/enums';

/**
 * Role-based access control. The first seven permissions mirror the matrix on
 * the dashboard Team page (PermissionsMatrix.tsx) one-to-one; MANAGE_FARMS and
 * MANAGE_TASKS cover actions the matrix does not list explicitly.
 */
export enum Permission {
  VIEW_LIVESTOCK = 'view-livestock',
  EDIT_LIVESTOCK = 'edit-livestock',
  MANAGE_ALERTS = 'manage-alerts',
  MANAGE_DEVICES = 'manage-devices',
  MANAGE_TEAM = 'manage-team',
  EXPORT_REPORTS = 'export-reports',
  EDIT_SETTINGS = 'edit-settings',
  MANAGE_FARMS = 'manage-farms',
  MANAGE_TASKS = 'manage-tasks',
}

const ALL = Object.values(Permission);

export const ROLE_PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
  OWNER: ALL,
  FARM_MANAGER: [
    Permission.VIEW_LIVESTOCK,
    Permission.EDIT_LIVESTOCK,
    Permission.MANAGE_ALERTS,
    Permission.MANAGE_DEVICES,
    Permission.MANAGE_TEAM,
    Permission.EXPORT_REPORTS,
    Permission.MANAGE_FARMS,
    Permission.MANAGE_TASKS,
  ],
  OPERATIONAL: [
    Permission.VIEW_LIVESTOCK,
    Permission.EDIT_LIVESTOCK,
    Permission.MANAGE_ALERTS,
    Permission.MANAGE_DEVICES,
    Permission.MANAGE_TEAM,
    Permission.EXPORT_REPORTS,
    Permission.MANAGE_FARMS,
    Permission.MANAGE_TASKS,
  ],
  STAFF: [Permission.VIEW_LIVESTOCK, Permission.EDIT_LIVESTOCK, Permission.MANAGE_ALERTS, Permission.MANAGE_TASKS],
  VETERINARIAN: [
    Permission.VIEW_LIVESTOCK,
    Permission.EDIT_LIVESTOCK,
    Permission.MANAGE_ALERTS,
    Permission.EXPORT_REPORTS,
    Permission.MANAGE_TASKS,
  ],
  COOPERATIVE_ADMIN: [
    Permission.VIEW_LIVESTOCK,
    Permission.MANAGE_TEAM,
    Permission.EXPORT_REPORTS,
    Permission.MANAGE_FARMS,
  ],
  VIEWER: [Permission.VIEW_LIVESTOCK],
};

export function hasPermission(role: StaffRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionsFor(role: StaffRole): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}
