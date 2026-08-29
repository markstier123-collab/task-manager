import { useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddTaskRow } from '@/components/task-manager/add-task-row';
import { FilterPills } from '@/components/task-manager/filter-pills';
import { Header } from '@/components/task-manager/header';
import { ListDrawer } from '@/components/task-manager/list-drawer';
import { NewListModal } from '@/components/task-manager/new-list-modal';
import { TaskCard } from '@/components/task-manager/task-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTaskManager } from '@/hooks/use-task-manager';
import { filterTasks, sortTasks } from '@/lib/task-utils';
import { DueFilter, StatusFilter } from '@/lib/types';

export default function TaskManagerScreen() {
  const { loading, lists, currentList, createList, switchList, addTask, updateTask, setTaskStatus } =
    useTaskManager();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [newListVisible, setNewListVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dueFilter, setDueFilter] = useState<DueFilter>('anytime');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const visibleTasks = useMemo(() => {
    if (!currentList) return [];
    return sortTasks(filterTasks(currentList.tasks, statusFilter, dueFilter));
  }, [currentList, statusFilter, dueFilter]);

  if (loading || !currentList) {
    return <ThemedView style={styles.container} />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.content}>
          <Header
            listName={currentList.name}
            onOpenDrawer={() => setDrawerVisible(true)}
            onNewList={() => setNewListVisible(true)}
          />

          <AddTaskRow onAdd={addTask} />

          <FilterPills
            statusFilter={statusFilter}
            dueFilter={dueFilter}
            onStatusFilterChange={setStatusFilter}
            onDueFilterChange={setDueFilter}
          />

          <FlatList
            data={visibleTasks}
            keyExtractor={(task) => task.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                allTasks={currentList.tasks}
                expanded={expandedTaskId === item.id}
                onToggleExpand={() =>
                  setExpandedTaskId((prev) => (prev === item.id ? null : item.id))
                }
                onUpdate={(patch) => updateTask(item.id, patch)}
                onStatusChange={(status) => setTaskStatus(item.id, status)}
              />
            )}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                {currentList.tasks.length === 0
                  ? 'No tasks yet — add one above.'
                  : 'No tasks match these filters.'}
              </ThemedText>
            }
          />
        </ThemedView>
      </SafeAreaView>

      <ListDrawer
        visible={drawerVisible}
        lists={lists}
        currentListId={currentList.id}
        onSelect={switchList}
        onClose={() => setDrawerVisible(false)}
      />

      <NewListModal
        visible={newListVisible}
        onCreate={createList}
        onClose={() => setNewListVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
