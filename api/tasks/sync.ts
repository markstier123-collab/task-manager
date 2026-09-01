import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SyncTaskBody {
  id?: string;
  title?: string;
  due_date?: string | null;
  completed?: boolean;
}

/** Upserts one task row into Postgres — a read-only mirror for a future server-side job. Not part of the app's source of truth (AsyncStorage). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    res.status(500).json({ error: 'POSTGRES_URL is not configured' });
    return;
  }

  const { id, title, due_date, completed } = (req.body ?? {}) as SyncTaskBody;

  if (!id || typeof title !== 'string') {
    res.status(400).json({ error: 'id and title are required' });
    return;
  }

  try {
    const sql = neon(connectionString);
    await sql`
      INSERT INTO tasks (id, title, due_date, completed, updated_at)
      VALUES (${id}, ${title}, ${due_date ?? null}, ${completed ?? false}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        due_date = EXCLUDED.due_date,
        completed = EXCLUDED.completed,
        updated_at = NOW()
    `;
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('tasks/sync upsert failed:', error);
    res.status(500).json({ error: 'Failed to sync task' });
  }
}
