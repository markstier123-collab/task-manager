export interface StatusDef {
  id: string;
  label: string;
  closed: boolean;
  colorIdx: number;
  iconIdx: number;
}

export type Priority = 1 | 2 | 3;

export interface CustomFieldDef {
  id: string;
  name: string;
  options: string[];
  /** ColorPalette index used for this field's filter dropdown + option buttons (alternates amber/teal). */
  tintIdx: number;
}

export interface Task {
  id: string;
  label: string;
  status: string;
  createdAt: number;
  estimatedDate?: string;
  blockedReason?: string;
  dependsOn?: string;
  completedAt?: number;
  cancelledAt?: number;
  priority?: Priority;
  customValues?: Record<string, string | undefined>;
}

export type GroupByOption = 'due' | 'status' | 'priority' | string;
export type SortByOption = 'priority' | 'due' | 'created' | 'label' | 'status';

export interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
  statuses: StatusDef[];
  customFields: CustomFieldDef[];
  groupBy: GroupByOption;
  sortBy: SortByOption;
}

export interface TaskManagerState {
  lists: TaskList[];
  currentListId: string | null;
}

/** 'all' or a specific StatusDef id. */
export type StatusFilter = string;
export type DueFilter = 'anytime' | 'today' | 'this_week';
export type PriorityFilter = 'any' | Priority;
/** How far back to show closed tasks in the "Closed" section, by their completed/cancelled date. */
export type ClosedFilter = 'anytime' | 'today' | 'past_week' | 'past_month';
/** Maps a custom field's id to its active filter value, or 'any'. */
export type CustomFilterState = Record<string, string>;
