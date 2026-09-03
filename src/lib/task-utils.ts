import { isThisWeek, isToday } from '@/lib/date-utils';
import {
  ClosedFilter,
  CustomFieldDef,
  CustomFilterState,
  DueFilter,
  PriorityFilter,
  StatusDef,
  StatusFilter,
  Task,
} from '@/lib/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function createDefaultStatuses(): StatusDef[] {
  return [
    { id: 'not_started', label: 'Not started', closed: false, colorIdx: 1, iconIdx: 0 },
    { id: 'in_progress', label: 'In progress', closed: false, colorIdx: 2, iconIdx: 1 },
    { id: 'in_review', label: 'In review', closed: false, colorIdx: 6, iconIdx: 2 },
    { id: 'blocked', label: 'Blocked', closed: false, colorIdx: 3, iconIdx: 3 },
    { id: 'completed', label: 'Completed', closed: true, colorIdx: 4, iconIdx: 4 },
    { id: 'cancelled', label: 'Cancelled', closed: true, colorIdx: 5, iconIdx: 5 },
  ];
}

export function getStatus(statuses: StatusDef[], statusId: string): StatusDef | undefined {
  return statuses.find((s) => s.id === statusId);
}

export function isClosedStatus(statuses: StatusDef[], statusId: string): boolean {
  return getStatus(statuses, statusId)?.closed ?? false;
}

/** completedAt/cancelledAt stamps stay tied to the seeded 'completed'/'cancelled' ids. */
export function statusChangeSideEffects(
  fromStatus: string,
  toStatus: string,
): { completedAt?: number; cancelledAt?: number } {
  const patch: { completedAt?: number; cancelledAt?: number } = {};

  if (toStatus === 'completed') {
    patch.completedAt = Date.now();
  } else if (fromStatus === 'completed') {
    patch.completedAt = undefined;
  }

  if (toStatus === 'cancelled') {
    patch.cancelledAt = Date.now();
  } else if (fromStatus === 'cancelled') {
    patch.cancelledAt = undefined;
  }

  return patch;
}

export function applyStatusChange(task: Task, status: string): Task {
  return { ...task, status, ...statusChangeSideEffects(task.status, status) };
}

export function matchesStatusFilter(task: Task, filter: StatusFilter): boolean {
  if (filter === 'all') return true;
  return task.status === filter;
}

export function matchesDueFilter(task: Task, filter: DueFilter): boolean {
  if (filter === 'anytime') return true;
  if (!task.estimatedDate) return false;
  if (filter === 'today') return isToday(task.estimatedDate);
  return isThisWeek(task.estimatedDate);
}

export function matchesPriorityFilter(task: Task, filter: PriorityFilter): boolean {
  if (filter === 'any') return true;
  return task.priority === filter;
}

export function matchesCustomFilters(
  task: Task,
  customFilters: CustomFilterState,
  customFields: CustomFieldDef[],
): boolean {
  return customFields.every((field) => {
    const active = customFilters[field.id];
    if (!active || active === 'any') return true;
    return task.customValues?.[field.id] === active;
  });
}

/** When a task was closed, for sorting/filtering the "Closed" section. Undefined for still-open tasks or a custom closed status that was never stamped. */
export function getClosedAt(task: Task): number | undefined {
  return task.completedAt ?? task.cancelledAt;
}

export function matchesClosedFilter(task: Task, filter: ClosedFilter): boolean {
  if (filter === 'anytime') return true;
  const closedAt = getClosedAt(task);
  if (!closedAt) return false;

  if (filter === 'today') {
    const closedDate = new Date(closedAt);
    const now = new Date();
    return (
      closedDate.getFullYear() === now.getFullYear() &&
      closedDate.getMonth() === now.getMonth() &&
      closedDate.getDate() === now.getDate()
    );
  }

  const days = filter === 'past_week' ? 7 : 30;
  return closedAt >= Date.now() - days * DAY_MS;
}

export function matchesSearchQuery(task: Task, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  return task.label.toLowerCase().includes(trimmed);
}

export function filterTasks(
  tasks: Task[],
  statusFilter: StatusFilter,
  dueFilter: DueFilter,
  priorityFilter: PriorityFilter,
  customFilters: CustomFilterState,
  customFields: CustomFieldDef[],
  searchQuery: string,
): Task[] {
  return tasks.filter(
    (task) =>
      matchesStatusFilter(task, statusFilter) &&
      matchesDueFilter(task, dueFilter) &&
      matchesPriorityFilter(task, priorityFilter) &&
      matchesCustomFilters(task, customFilters, customFields) &&
      matchesSearchQuery(task, searchQuery),
  );
}
