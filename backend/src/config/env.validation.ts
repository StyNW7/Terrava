import { z } from 'zod';

/**
 * Environment contract. Validated once at boot so a misconfigured deployment
 * fails fast with a readable message instead of at the first request.
 */
const booleanish = (fallback: boolean) =>
  z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((value) => (value === undefined ? fallback : value === 'true' || value === '1'));

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:4173'),
  APP_URL: z.string().url().default('http://localhost:5173'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (Neon, Supabase or local Postgres)'),
  DIRECT_URL: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  /** Access token lifetime in seconds. Refresh tokens are opaque and stored hashed. */
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
  JWT_REFRESH_TTL_REMEMBER_DAYS: z.coerce.number().int().positive().default(30),

  THROTTLE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default('Terrava <no-reply@terrava.id>'),
  CONTACT_INBOX: z.string().email().default('hello@terrava.id'),

  WHATSAPP_API_URL: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),

  WEATHER_API_URL: z.string().default('https://api.open-meteo.com/v1/forecast'),
  WEATHER_ENABLED: booleanish(true),

  JOBS_ENABLED: booleanish(true),
  DEVICE_OFFLINE_MINUTES: z.coerce.number().int().positive().default(120),
  TELEMETRY_RETENTION_DAYS: z.coerce.number().int().positive().default(365),
  SWAGGER_ENABLED: booleanish(true),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
