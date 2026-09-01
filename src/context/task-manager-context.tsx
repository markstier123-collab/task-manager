import { createContext, ReactNode, useContext } from 'react';

import { useTaskManager } from '@/hooks/use-task-manager';

type TaskManagerValue = ReturnType<typeof useTaskManager>;

const TaskManagerContext = createContext<TaskManagerValue | null>(null);

export function TaskManagerProvider({ children }: { children: ReactNode }) {
  const value = useTaskManager();
  return <TaskManagerContext.Provider value={value}>{children}</TaskManagerContext.Provider>;
}

export function useTaskManagerContext(): TaskManagerValue {
  const ctx = useContext(TaskManagerContext);
  if (!ctx) throw new Error('useTaskManagerContext must be used within a TaskManagerProvider');
  return ctx;
}
