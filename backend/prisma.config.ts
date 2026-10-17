import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 configuration.
 *
 * - `DATABASE_URL` is the runtime connection (pooled on Neon / Supabase).
 * - `DIRECT_URL` (optional) is a non-pooled connection used by the CLI for
 *   migrations. Neon and Supabase both recommend a direct URL for DDL.
 *
 * A placeholder URL keeps `prisma generate` working on machines without a
 * database configured yet (e.g. during `npm install`).
 */
const url =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5433/terrava';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: { url },
});
