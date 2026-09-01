import { isThisWeek, isToday } from '@/lib/date-utils';
import {
  CustomFieldDef,
  CustomFilterState,
  DueFilter,
  PriorityFilter,
  StatusDef,
  StatusFilter,
  Task,
} from '@/lib/types';

export function createDefaultStatuses(): StatusDef[] {
  return [
    { id: 'not_started', label: 'Not started', closed: false, colorIdx: 0, iconIdx: 0 },
    { id: 'in_progress', label: 'In progress', closed: false, colorIdx: 1, iconIdx: 1 },
    { id: 'in_review', label: 'In review', closed: false, colorIdx: 2, iconIdx: 2 },
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
export function applyStatusChange(task: Task, status: string): Task {
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

export function filterTasks(
  tasks: Task[],
  statusFilter: StatusFilter,
  dueFilter: DueFilter,
  priorityFilter: PriorityFilter,
  customFilters: CustomFilterState,
  customFields: CustomFieldDef[],
): Task[] {
  return tasks.filter(
    (task) =>
      matchesStatusFilter(task, statusFilter) &&
      matchesDueFilter(task, dueFilter) &&
      matchesPriorityFilter(task, priorityFilter) &&
      matchesCustomFilters(task, customFilters, customFields),
  );
}
