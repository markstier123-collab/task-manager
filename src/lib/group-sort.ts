import { formatDateShort, isToday } from '@/lib/date-utils';
import { isClosedStatus } from '@/lib/task-utils';
import { CustomFieldDef, GroupByOption, SortByOption, StatusDef, Task } from '@/lib/types';

export interface TaskSection {
  key: string;
  title: string;
  tasks: Task[];
  collapsible: boolean;
}

function compareBySortOption(a: Task, b: Task, sortBy: SortByOption, statuses: StatusDef[]): number {
  switch (sortBy) {
    case 'priority': {
      const pa = a.priority ?? 4;
      const pb = b.priority ?? 4;
      return pa - pb;
    }
    case 'due': {
      if (a.estimatedDate && b.estimatedDate) {
        return a.estimatedDate < b.estimatedDate ? -1 : a.estimatedDate > b.estimatedDate ? 1 : 0;
      }
      if (a.estimatedDate) return -1;
      if (b.estimatedDate) return 1;
      return 0;
    }
    case 'created':
      return a.createdAt - b.createdAt;
    case 'label':
      return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
    case 'status': {
      const ia = statuses.findIndex((s) => s.id === a.status);
      const ib = statuses.findIndex((s) => s.id === b.status);
      return ia - ib;
    }
    default:
      return 0;
  }
}

function sortWithinGroup(tasks: Task[], sortBy: SortByOption, statuses: StatusDef[]): Task[] {
  return [...tasks].sort(
    (a, b) => compareBySortOption(a, b, sortBy, statuses) || a.createdAt - b.createdAt,
  );
}

function groupByDue(tasks: Task[], sortBy: SortByOption, statuses: StatusDef[]): TaskSection[] {
  const closed = tasks.filter((t) => isClosedStatus(statuses, t.status));
  const open = tasks.filter((t) => !isClosedStatus(statuses, t.status));
  const withDate = open.filter((t) => t.estimatedDate);
  const withoutDate = open.filter((t) => !t.estimatedDate);

  const byDate = new Map<string, Task[]>();
  for (const t of withDate) {
    const arr = byDate.get(t.estimatedDate!) ?? [];
    arr.push(t);
    byDate.set(t.estimatedDate!, arr);
  }
  const sortedDates = Array.from(byDate.keys()).sort();

  const sections: TaskSection[] = [];
  for (const date of sortedDates) {
    sections.push({
      key: `date-${date}`,
      title: `Due: ${formatDateShort(date)}${isToday(date) ? ' (Today)' : ''}`,
      tasks: sortWithinGroup(byDate.get(date)!, sortBy, statuses),
      collapsible: false,
    });
  }
  if (withoutDate.length > 0) {
    sections.push({
      key: 'no-date',
      title: 'No due date',
      tasks: sortWithinGroup(withoutDate, sortBy, statuses),
      collapsible: false,
    });
  }
  if (closed.length > 0) {
    sections.push({
      key: 'closed',
      title: 'Closed',
      tasks: sortWithinGroup(closed, sortBy, statuses),
      collapsible: false,
    });
  }
  return sections;
}

function groupByStatus(tasks: Task[], sortBy: SortByOption, statuses: StatusDef[]): TaskSection[] {
  const sections: TaskSection[] = [];
  for (const status of statuses) {
    const group = tasks.filter((t) => t.status === status.id);
    if (group.length === 0) continue;
    sections.push({
      key: `status-${status.id}`,
      title: status.label,
      tasks: sortWithinGroup(group, sortBy, statuses),
      collapsible: true,
    });
  }
  return sections;
}

function groupByPriority(tasks: Task[], sortBy: SortByOption, statuses: StatusDef[]): TaskSection[] {
  const sections: TaskSection[] = [];
  const levels: (1 | 2 | 3 | undefined)[] = [1, 2, 3, undefined];
  for (const level of levels) {
    const group = tasks.filter((t) => t.priority === level);
    if (group.length === 0) continue;
    sections.push({
      key: `priority-${level ?? 'none'}`,
      title: level ? `P${level}` : 'No priority',
      tasks: sortWithinGroup(group, sortBy, statuses),
      collapsible: true,
    });
  }
  return sections;
}

function groupByCustomField(
  tasks: Task[],
  field: CustomFieldDef,
  sortBy: SortByOption,
  statuses: StatusDef[],
): TaskSection[] {
  const sections: TaskSection[] = [];
  for (const option of field.options) {
    const group = tasks.filter((t) => t.customValues?.[field.id] === option);
    if (group.length === 0) continue;
    sections.push({
      key: `custom-${field.id}-${option}`,
      title: option,
      tasks: sortWithinGroup(group, sortBy, statuses),
      collapsible: true,
    });
  }
  const unassigned = tasks.filter((t) => !t.customValues?.[field.id]);
  if (unassigned.length > 0) {
    sections.push({
      key: `custom-${field.id}-unassigned`,
      title: 'Unassigned',
      tasks: sortWithinGroup(unassigned, sortBy, statuses),
      collapsible: true,
    });
  }
  return sections;
}

export function groupTasks(
  tasks: Task[],
  groupBy: GroupByOption,
  sortBy: SortByOption,
  statuses: StatusDef[],
  customFields: CustomFieldDef[],
): TaskSection[] {
  if (groupBy === 'due') return groupByDue(tasks, sortBy, statuses);
  if (groupBy === 'status') return groupByStatus(tasks, sortBy, statuses);
  if (groupBy === 'priority') return groupByPriority(tasks, sortBy, statuses);

  const field = customFields.find((f) => f.id === groupBy);
  if (field) return groupByCustomField(tasks, field, sortBy, statuses);

  // Fall back to due-date grouping if the stored groupBy references a removed custom field.
  return groupByDue(tasks, sortBy, statuses);
}
