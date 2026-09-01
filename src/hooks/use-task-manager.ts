import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildImportedTasks, ImportTarget } from '@/lib/csv';
import { generateId } from '@/lib/id';
import { createSeedList } from '@/lib/seed-data';
import { loadState, saveState } from '@/lib/storage';
import { applyStatusChange, createDefaultStatuses } from '@/lib/task-utils';
import {
  CustomFieldDef,
  GroupByOption,
  SortByOption,
  StatusDef,
  Task,
  TaskList,
  TaskManagerState,
} from '@/lib/types';

const SAVE_DEBOUNCE_MS = 300;

function createEmptyList(name: string): TaskList {
  return {
    id: generateId(),
    name,
    tasks: [],
    statuses: createDefaultStatuses(),
    customFields: [],
    groupBy: 'due',
    sortBy: 'priority',
  };
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
        const seedList = createSeedList();
        setState({ lists: [seedList], currentListId: seedList.id });
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

  /** No-op if `id` is the last remaining list — the app always needs at least one. */
  const deleteList = useCallback((id: string) => {
    setState((prev) => {
      const remaining = prev.lists.filter((list) => list.id !== id);
      if (remaining.length === 0) return prev;
      const currentListId = prev.currentListId === id ? remaining[0].id : prev.currentListId;
      return { lists: remaining, currentListId };
    });
  }, []);

  const updateCurrentList = useCallback((updater: (list: TaskList) => TaskList) => {
    setState((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => (list.id === prev.currentListId ? updater(list) : list)),
    }));
  }, []);

  const renameCurrentList = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateCurrentList((list) => ({ ...list, name: trimmed }));
    },
    [updateCurrentList],
  );

  const updateCurrentListTasks = useCallback(
    (updater: (tasks: Task[]) => Task[]) => {
      updateCurrentList((list) => ({ ...list, tasks: updater(list.tasks) }));
    },
    [updateCurrentList],
  );

  const addTask = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      updateCurrentList((list) => {
        const defaultStatus = list.statuses[0]?.id ?? 'not_started';
        const task: Task = {
          id: generateId(),
          label: trimmed,
          status: defaultStatus,
          createdAt: Date.now(),
        };
        return { ...list, tasks: [...list.tasks, task] };
      });
    },
    [updateCurrentList],
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
    (taskId: string, status: string) => {
      updateCurrentListTasks((tasks) =>
        tasks.map((task) => (task.id === taskId ? applyStatusChange(task, status) : task)),
      );
    },
    [updateCurrentListTasks],
  );

  const addStatus = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      const status: StatusDef = {
        id: generateId(),
        label: trimmed,
        closed: false,
        colorIdx: 0,
        iconIdx: 6,
      };
      updateCurrentList((list) => ({ ...list, statuses: [...list.statuses, status] }));
    },
    [updateCurrentList],
  );

  const updateStatus = useCallback(
    (statusId: string, patch: Partial<StatusDef>) => {
      updateCurrentList((list) => ({
        ...list,
        statuses: list.statuses.map((s) => (s.id === statusId ? { ...s, ...patch } : s)),
      }));
    },
    [updateCurrentList],
  );

  /** Removes a status with no tasks assigned to it. Callers must check usage first. */
  const removeStatus = useCallback(
    (statusId: string) => {
      updateCurrentList((list) => ({
        ...list,
        statuses: list.statuses.filter((s) => s.id !== statusId),
      }));
    },
    [updateCurrentList],
  );

  /** Reassigns all tasks using statusId to replacementId, then removes statusId. */
  const reassignAndRemoveStatus = useCallback(
    (statusId: string, replacementId: string) => {
      updateCurrentList((list) => ({
        ...list,
        tasks: list.tasks.map((task) =>
          task.status === statusId ? { ...task, status: replacementId } : task,
        ),
        statuses: list.statuses.filter((s) => s.id !== statusId),
      }));
    },
    [updateCurrentList],
  );

  const addCustomField = useCallback(
    (name: string, options: string[]) => {
      const trimmedName = name.trim();
      const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
      if (!trimmedName || trimmedOptions.length === 0) return;
      updateCurrentList((list) => {
        const tintIdx = list.customFields.length % 2 === 0 ? 6 : 7;
        const field: CustomFieldDef = {
          id: generateId(),
          name: trimmedName,
          options: trimmedOptions,
          tintIdx,
        };
        return { ...list, customFields: [...list.customFields, field] };
      });
    },
    [updateCurrentList],
  );

  const updateCustomFieldName = useCallback(
    (fieldId: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateCurrentList((list) => ({
        ...list,
        customFields: list.customFields.map((f) => (f.id === fieldId ? { ...f, name: trimmed } : f)),
      }));
    },
    [updateCurrentList],
  );

  const addCustomFieldOption = useCallback(
    (fieldId: string, option: string) => {
      const trimmed = option.trim();
      if (!trimmed) return;
      updateCurrentList((list) => ({
        ...list,
        customFields: list.customFields.map((f) =>
          f.id === fieldId ? { ...f, options: [...f.options, trimmed] } : f,
        ),
      }));
    },
    [updateCurrentList],
  );

  /** Renames an option value in place and updates any tasks currently using the old value. */
  const renameCustomFieldOption = useCallback(
    (fieldId: string, oldValue: string, newValue: string) => {
      if (newValue === oldValue) return;
      updateCurrentList((list) => ({
        ...list,
        customFields: list.customFields.map((f) =>
          f.id === fieldId
            ? { ...f, options: f.options.map((o) => (o === oldValue ? newValue : o)) }
            : f,
        ),
        tasks: list.tasks.map((task) =>
          task.customValues?.[fieldId] === oldValue
            ? { ...task, customValues: { ...task.customValues, [fieldId]: newValue } }
            : task,
        ),
      }));
    },
    [updateCurrentList],
  );

  /** Removes an option with no tasks assigned to it. Callers must check usage first. */
  const removeCustomFieldOption = useCallback(
    (fieldId: string, value: string) => {
      updateCurrentList((list) => ({
        ...list,
        customFields: list.customFields.map((f) =>
          f.id === fieldId ? { ...f, options: f.options.filter((o) => o !== value) } : f,
        ),
      }));
    },
    [updateCurrentList],
  );

  /** Reassigns all tasks using this option value to a replacement, then removes the option. */
  const reassignAndRemoveCustomFieldOption = useCallback(
    (fieldId: string, value: string, replacementValue: string) => {
      updateCurrentList((list) => ({
        ...list,
        customFields: list.customFields.map((f) =>
          f.id === fieldId ? { ...f, options: f.options.filter((o) => o !== value) } : f,
        ),
        tasks: list.tasks.map((task) =>
          task.customValues?.[fieldId] === value
            ? { ...task, customValues: { ...task.customValues, [fieldId]: replacementValue } }
            : task,
        ),
      }));
    },
    [updateCurrentList],
  );

  /** Removes a custom field entirely and strips its values from every task in the list. */
  const removeCustomField = useCallback(
    (fieldId: string) => {
      updateCurrentList((list) => ({
        ...list,
        customFields: list.customFields.filter((f) => f.id !== fieldId),
        tasks: list.tasks.map((task) => {
          if (!task.customValues || !(fieldId in task.customValues)) return task;
          const { [fieldId]: _removed, ...rest } = task.customValues;
          return { ...task, customValues: rest };
        }),
      }));
    },
    [updateCurrentList],
  );

  const setGroupBy = useCallback(
    (groupBy: GroupByOption) => {
      updateCurrentList((list) => ({ ...list, groupBy }));
    },
    [updateCurrentList],
  );

  const setSortBy = useCallback(
    (sortBy: SortByOption) => {
      updateCurrentList((list) => ({ ...list, sortBy }));
    },
    [updateCurrentList],
  );

  /** Builds tasks from parsed CSV rows and appends them to the current list. Returns the count imported. */
  const importTasks = useCallback(
    (rows: string[][], mapping: Record<number, ImportTarget>): number => {
      if (!currentList) return 0;
      const { newTasks, customFields } = buildImportedTasks(
        rows,
        mapping,
        currentList.statuses,
        currentList.customFields,
      );
      updateCurrentList((list) => ({ ...list, tasks: [...list.tasks, ...newTasks], customFields }));
      return newTasks.length;
    },
    [currentList, updateCurrentList],
  );

  return {
    loading,
    lists: state.lists,
    currentList,
    createList,
    switchList,
    deleteList,
    renameCurrentList,
    addTask,
    updateTask,
    setTaskStatus,
    addStatus,
    updateStatus,
    removeStatus,
    reassignAndRemoveStatus,
    addCustomField,
    updateCustomFieldName,
    addCustomFieldOption,
    renameCustomFieldOption,
    removeCustomFieldOption,
    reassignAndRemoveCustomFieldOption,
    removeCustomField,
    setGroupBy,
    setSortBy,
    importTasks,
  };
}
