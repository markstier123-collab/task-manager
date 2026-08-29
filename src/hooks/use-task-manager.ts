import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { generateId } from '@/lib/id';
import { loadState, saveState } from '@/lib/storage';
import { applyStatusChange } from '@/lib/task-utils';
import { Task, TaskList, TaskManagerState, TaskStatus } from '@/lib/types';

const SAVE_DEBOUNCE_MS = 300;

function createEmptyList(name: string): TaskList {
  return { id: generateId(), name, tasks: [] };
}

export function useTaskManager() {
  const [state, setState] = useState<TaskManagerState>({ lists: [], currentListId: null });
  const [loading, setLoading] = useState(true);
  const hasLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await loadState();
      if (stored && stored.lists.length > 0) {
        setState(stored);
      } else {
        const defaultList = createEmptyList('Tasks');
        setState({ lists: [defaultList], currentListId: defaultList.id });
      }
      hasLoaded.current = true;
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveState(state);
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  const currentList = useMemo(
    () => state.lists.find((list) => list.id === state.currentListId) ?? null,
    [state.lists, state.currentListId],
  );

  const createList = useCallback((name: string) => {
    const list = createEmptyList(name);
    setState((prev) => ({ lists: [...prev.lists, list], currentListId: list.id }));
  }, []);

  const switchList = useCallback((id: string) => {
    setState((prev) => ({ ...prev, currentListId: id }));
  }, []);

  const updateCurrentListTasks = useCallback((updater: (tasks: Task[]) => Task[]) => {
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === prev.currentListId ? { ...list, tasks: updater(list.tasks) } : list,
      ),
    }));
  }, []);

  const addTask = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      const task: Task = {
        id: generateId(),
        label: trimmed,
        status: 'not_started',
        createdAt: Date.now(),
      };
      updateCurrentListTasks((tasks) => [...tasks, task]);
    },
    [updateCurrentListTasks],
  );

  const updateTask = useCallback(
    (taskId: string, patch: Partial<Task>) => {
      updateCurrentListTasks((tasks) =>
        tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
      );
    },
    [updateCurrentListTasks],
  );

  const setTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      updateCurrentListTasks((tasks) =>
        tasks.map((task) => (task.id === taskId ? applyStatusChange(task, status) : task)),
      );
    },
    [updateCurrentListTasks],
  );

  return {
    loading,
    lists: state.lists,
    currentList,
    createList,
    switchList,
    addTask,
    updateTask,
    setTaskStatus,
  };
}
