import { Task } from '@/lib/types';

/**
 * Best-effort mirror of a task into the Postgres `tasks` table for a future server-side job.
 * AsyncStorage remains the source of truth for the app UI — a failure here (e.g. offline)
 * is swallowed and only logged, never surfaced to the user.
 */
export async function syncTaskToServer(task: Task): Promise<void> {
  try {
    await fetch('/api/tasks/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: task.id,
        title: task.label,
        due_date: task.estimatedDate ?? null,
        completed: task.status === 'completed',
      }),
    });
  } catch (error) {
    console.warn('Task sync to Postgres failed (AsyncStorage is unaffected):', error);
  }
}
