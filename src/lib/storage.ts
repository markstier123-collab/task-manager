import AsyncStorage from '@react-native-async-storage/async-storage';

import { TaskManagerState } from '@/lib/types';

const STORAGE_KEY = '@task-manager/state';

export async function loadState(): Promise<TaskManagerState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TaskManagerState;
  } catch {
    return null;
  }
}

export async function saveState(state: TaskManagerState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
