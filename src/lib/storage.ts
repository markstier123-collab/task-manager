import AsyncStorage from '@react-native-async-storage/async-storage';

import { createDefaultStatuses } from '@/lib/task-utils';
import { TaskManagerState } from '@/lib/types';

const STORAGE_KEY = '@task-manager/state';

function migrate(state: TaskManagerState): TaskManagerState {
  return {
    ...state,
    lists: state.lists.map((list) => ({
      ...list,
      statuses: list.statuses && list.statuses.length > 0 ? list.statuses : createDefaultStatuses(),
      customFields: list.customFields ?? [],
      groupBy: list.groupBy ?? 'due',
      sortBy: list.sortBy ?? 'priority',
    })),
  };
}

export async function loadState(): Promise<TaskManagerState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return migrate(JSON.parse(raw) as TaskManagerState);
  } catch {
    return null;
  }
}

export async function saveState(state: TaskManagerState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
