import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const INTRO_WITH_TASKS = "Your Ultimate Task Assistant here. Today's priorities include:";
const INTRO_NO_TASKS = 'Your Ultimate Task Assistant here. No priorities due today.';

function buildMessage(titles: string[]): string {
  if (titles.length === 0) return INTRO_NO_TASKS;
  return [INTRO_WITH_TASKS, ...titles].join('\n');
}

interface SendResult {
  success: boolean;
  message: string;
  textbelt: unknown;
}

/**
 * Queries today's open tasks, builds the SMS text, and sends it via Textbelt.
 * Shared by both the daily cron and the manual "Send test text now" button so
 * the message-building/Textbelt logic exists in exactly one place.
 */
async function sendTaskSms(test: boolean): Promise<SendResult> {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL is not configured');
  }

  const sql = neon(connectionString);
  const rows = await sql`
    SELECT title FROM tasks
    WHERE completed = false AND due_date::date = CURRENT_DATE
    ORDER BY title ASC
  `;
  const titles = rows.map((row) => row.title as string);
  const message = buildMessage(titles);

  const phone = process.env.MY_PHONE;
  const baseKey = process.env.TEXTBELT_KEY;
  if (!phone || !baseKey) {
    throw new Error('MY_PHONE or TEXTBELT_KEY is not configured');
  }
  const key = test ? `${baseKey}_test` : baseKey;

  const response = await fetch('https://textbelt.com/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number: phone, message, key }),
  });
  const textbelt = await response.json();

  return { success: Boolean((textbelt as { success?: boolean })?.success), message, textbelt };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Vercel's cron invocations are always GET and (once CRON_SECRET is set in the
  // project's env vars) automatically carry this header. Optional hardening —
  // skipped entirely if CRON_SECRET isn't configured, so it can't break day-one setup.
  if (req.method === 'GET' && process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const bodyTest =
    req.body && typeof req.body === 'object' ? (req.body as { test?: boolean }).test : undefined;
  const test = req.query.test === 'true' || bodyTest === true;

  try {
    const result = await sendTaskSms(test);
    res.status(result.success ? 200 : 502).json(result);
  } catch (error) {
    console.error('send-task-sms failed:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
}
