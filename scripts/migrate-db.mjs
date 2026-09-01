// One-off migration — run manually with `npm run db:migrate`, not on every request.
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error(
    'POSTGRES_URL is not set. Run `vercel env pull .env.local` first, then re-run this ' +
      'with `node --env-file=.env.local scripts/migrate-db.mjs` (or `npm run db:migrate`).',
  );
  process.exit(1);
}

const sql = neon(connectionString);

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      due_date TIMESTAMP,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ tasks table is ready');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
