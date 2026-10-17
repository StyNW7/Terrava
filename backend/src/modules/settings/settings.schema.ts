import { z } from 'zod';
import { DEFAULT_THRESHOLDS, type AlertThresholds } from '../../domain/thresholds';

/**
 * Settings mirror the dashboard's AppSettings (frontend/src/context/settings-context.ts):
 * - personal preferences live on the user (`users.preferences`)
 * - alert thresholds are organisation-wide (`organizations.settings.thresholds`)
 *   because the server-side rule engine evaluates every reading against them.
 */

export const preferencesSchema = z.object({
  farm: z
    .object({
      defaultFarmId: z.string().default('all'),
      namingFormat: z.enum(['code', 'name']).default('code'),
      dateFormat: z.enum(['dd-mm-yyyy', 'mm-dd-yyyy']).default('dd-mm-yyyy'),
      temperatureUnit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
      weightUnit: z.enum(['kg', 'lb']).default('kg'),
    })
    .prefault({}),
  notifications: z
    .object({
      inApp: z.boolean().default(true),
      email: z.boolean().default(true),
      whatsapp: z.boolean().default(false),
      criticalAlerts: z.boolean().default(true),
      deviceAlerts: z.boolean().default(true),
      weatherAlerts: z.boolean().default(false),
      dailySummary: z.boolean().default(true),
      weeklyReport: z.boolean().default(false),
    })
    .prefault({}),
  appearance: z
    .object({
      compact: z.boolean().default(false),
      sidebarExpanded: z.boolean().default(true),
      animations: z.boolean().default(true),
      theme: z.enum(['light', 'dark', 'system']).default('system'),
    })
    .prefault({}),
  privacy: z
    .object({
      retention: z.enum(['6', '12', '24', 'unlimited']).default('12'),
      aiConsent: z.boolean().default(true),
    })
    .prefault({}),
});

export type UserPreferences = z.infer<typeof preferencesSchema>;

export const thresholdsSchema = z
  .object({
    tempHigh: z.number().min(38).max(42).default(DEFAULT_THRESHOLDS.tempHigh),
    tempLow: z.number().min(34).max(38.5).default(DEFAULT_THRESHOLDS.tempLow),
    heartRate: z.number().int().min(60).max(160).default(DEFAULT_THRESHOLDS.heartRate),
    activityDrop: z.number().min(5).max(90).default(DEFAULT_THRESHOLDS.activityDrop),
    batteryLow: z.number().int().min(5).max(50).default(DEFAULT_THRESHOLDS.batteryLow),
    signalWeak: z.number().int().min(5).max(60).default(DEFAULT_THRESHOLDS.signalWeak),
    geofenceDuration: z.number().int().min(1).max(240).default(DEFAULT_THRESHOLDS.geofenceDuration),
  })
  .refine((value) => value.tempLow < value.tempHigh, {
    message: 'tempLow must be lower than tempHigh',
    path: ['tempLow'],
  });

export const orgSettingsSchema = z.object({
  thresholds: thresholdsSchema.prefault({}),
  timezone: z.string().default('Asia/Jakarta'),
});

export type OrgSettings = z.infer<typeof orgSettingsSchema>;

/** Parse stored JSON, falling back to defaults for anything missing or invalid. */
export function readPreferences(raw: unknown): UserPreferences {
  const parsed = preferencesSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : preferencesSchema.parse({});
}

export function readOrgSettings(raw: unknown): OrgSettings {
  const parsed = orgSettingsSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : orgSettingsSchema.parse({});
}

export function readThresholds(raw: unknown): AlertThresholds {
  return readOrgSettings(raw).thresholds;
}
