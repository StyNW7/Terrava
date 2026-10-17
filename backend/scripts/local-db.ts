/**
 * Zero-setup PostgreSQL for local development: downloads nothing at runtime
 * (binaries ship with the `embedded-postgres` package) and needs no Docker or
 * cloud account. Data persists in backend/.local-db/.
 *
 *   npm run db:local          # keep this terminal open
 *
 * Matching connection string (already in .env.example):
 *   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/terrava"
 *
 * For staging/production use Neon or Supabase instead (see README).
 */
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PORT = Number(process.env.LOCAL_DB_PORT ?? 5433);
const DATABASE = process.env.LOCAL_DB_NAME ?? 'terrava';
const dataDir = join(__dirname, '..', '.local-db', 'data');

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port: PORT,
    persistent: true,
    onLog: () => undefined,
    onError: (message) => console.error(String(message)),
  });

  if (!existsSync(join(dataDir, 'PG_VERSION'))) {
    console.log('Initialising a new local PostgreSQL cluster...');
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase(DATABASE);
    console.log(`Created database "${DATABASE}".`);
  } catch {
    // Already exists.
  }

  console.log(`\nLocal PostgreSQL is running on port ${PORT}.`);
  console.log(`DATABASE_URL="postgresql://postgres:postgres@localhost:${PORT}/${DATABASE}"`);
  console.log('Press Ctrl+C to stop.\n');

  const shutdown = async () => {
    console.log('\nStopping PostgreSQL...');
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  // Keep the process alive.
  setInterval(() => undefined, 1 << 30);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
