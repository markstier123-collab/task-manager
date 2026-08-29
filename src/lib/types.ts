export type TaskStatus = 'not_started' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  label: string;
  status: TaskStatus;
  createdAt: number;
  estimatedDate?: string;
  blockedReason?: string;
  dependsOn?: string;
  completedAt?: number;
  cancelledAt?: number;
}

export interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
}

export interface TaskManagerState {
  lists: TaskList[];
  currentListId: string | null;
}

export type StatusFilter = 'all' | 'open' | 'closed';
export type DueFilter = 'anytime' | 'today' | 'this_week';
