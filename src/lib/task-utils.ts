import { isThisWeek, isToday } from '@/lib/date-utils';
import { DueFilter, StatusFilter, Task, TaskStatus } from '@/lib/types';

export const STATUS_ORDER: TaskStatus[] = [
  'not_started',
  'in_progress',
  'blocked',
  'completed',
  'cancelled',
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const OPEN_STATUSES: TaskStatus[] = ['not_started', 'in_progress', 'blocked'];
const CLOSED_STATUSES: TaskStatus[] = ['completed', 'cancelled'];

export function isOpenStatus(status: TaskStatus): boolean {
  return OPEN_STATUSES.includes(status);
}

export function isClosedStatus(status: TaskStatus): boolean {
  return CLOSED_STATUSES.includes(status);
}

export function applyStatusChange(task: Task, status: TaskStatus): Task {
  const next: Task = { ...task, status };

  if (status === 'completed') {
    next.completedAt = Date.now();
  } else if (task.status === 'completed') {
    next.completedAt = undefined;
  }

  if (status === 'cancelled') {
    next.cancelledAt = Date.now();
  } else if (task.status === 'cancelled') {
    next.cancelledAt = undefined;
  }

  return next;
}

export function matchesStatusFilter(task: Task, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'open') return isOpenStatus(task.status);
  return isClosedStatus(task.status);
}

export function matchesDueFilter(task: Task, filter: DueFilter): boolean {
  if (filter === 'anytime') return true;
  if (!task.estimatedDate) return false;
  if (filter === 'today') return isToday(task.estimatedDate);
  return isThisWeek(task.estimatedDate);
}

export function filterTasks(tasks: Task[], statusFilter: StatusFilter, dueFilter: DueFilter): Task[] {
  return tasks.filter(
    (task) => matchesStatusFilter(task, statusFilter) && matchesDueFilter(task, dueFilter),
  );
}

/** Completed and cancelled tasks always sort to the bottom, in original (createdAt) order otherwise. */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aClosed = isClosedStatus(a.status);
    const bClosed = isClosedStatus(b.status);
    if (aClosed !== bClosed) return aClosed ? 1 : -1;
    return a.createdAt - b.createdAt;
  });
}
