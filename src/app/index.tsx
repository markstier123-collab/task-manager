import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddCustomFieldModal } from '@/components/task-manager/add-custom-field-modal';
import { AddTaskRow } from '@/components/task-manager/add-task-row';
import { CustomFilterDropdown } from '@/components/task-manager/custom-filter-dropdown';
import { FilterPills } from '@/components/task-manager/filter-pills';
import { Header } from '@/components/task-manager/header';
import { ImportModal } from '@/components/task-manager/import-modal';
import { ListDrawer } from '@/components/task-manager/list-drawer';
import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { NewListModal } from '@/components/task-manager/new-list-modal';
import { TaskCard } from '@/components/task-manager/task-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Fonts,
  MaxContentWidth,
  MaxContentWidthWide,
  PillHeight,
  Spacing,
  WideBreakpoint,
} from '@/constants/theme';
import { useTaskManagerContext } from '@/context/task-manager-context';
import { useTheme } from '@/hooks/use-theme';
import { parseCsv, tasksToCsv } from '@/lib/csv';
import { downloadCsv, pickCsvFileText } from '@/lib/file-io';
import { groupTasks } from '@/lib/group-sort';
import { filterTasks } from '@/lib/task-utils';
import { CustomFilterState, DueFilter, PriorityFilter, StatusFilter } from '@/lib/types';

export default function TaskManagerScreen() {
  const {
    loading,
    lists,
    currentList,
    createList,
    switchList,
    renameCurrentList,
    addTask,
    updateTask,
    setTaskStatus,
    addCustomField,
    removeCustomField,
    importTasks,
  } = useTaskManagerContext();

  const { width } = useWindowDimensions();
  const isWide = width >= WideBreakpoint;
  const theme = useTheme();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [newListVisible, setNewListVisible] = useState(false);
  const [addFieldVisible, setAddFieldVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dueFilter, setDueFilter] = useState<DueFilter>('anytime');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('any');
  const [customFilters, setCustomFilters] = useState<CustomFilterState>({});
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const [importState, setImportState] = useState<{ header: string[]; rows: string[][] } | null>(
    null,
  );
  const [importResult, setImportResult] = useState<number | null>(null);
  const [importAttemptId, setImportAttemptId] = useState(0);

  // Falls back to 'all' if the selected status was deleted from the list's status set.
  const effectiveStatusFilter: StatusFilter =
    statusFilter === 'all' || currentList?.statuses.some((s) => s.id === statusFilter)
      ? statusFilter
      : 'all';

  const sections = useMemo(() => {
    if (!currentList) return [];
    const filtered = filterTasks(
      currentList.tasks,
      effectiveStatusFilter,
      dueFilter,
      priorityFilter,
      customFilters,
      currentList.customFields,
    );
    return groupTasks(
      filtered,
      currentList.groupBy,
      currentList.sortBy,
      currentList.statuses,
      currentList.customFields,
    );
  }, [currentList, effectiveStatusFilter, dueFilter, priorityFilter, customFilters]);

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleExport = async () => {
    if (!currentList) return;
    const csv = tasksToCsv(currentList.tasks, currentList.customFields, currentList.statuses);
    await downloadCsv(`${currentList.name}.csv`, csv);
  };

  const handleImportPick = async () => {
    const text = await pickCsvFileText();
    if (!text) return;
    const parsed = parseCsv(text);
    if (parsed.length === 0) return;
    setImportAttemptId((prev) => prev + 1);
    setImportState({ header: parsed[0], rows: parsed.slice(1) });
  };

  if (loading || !currentList) {
    return <ThemedView style={styles.container} />;
  }

  const sectionListData = sections.map((section) => ({
    ...section,
    data: collapsedSections.has(section.key) ? [] : section.tasks,
  }));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={[styles.content, { maxWidth: isWide ? MaxContentWidthWide : MaxContentWidth }]}>
          <Header
            listName={currentList.name}
            onOpenDrawer={() => setDrawerVisible(true)}
            onRenameList={renameCurrentList}
          />

          <AddTaskRow onAdd={addTask} />

          <View style={styles.filterRow}>
            <FilterPills
              statuses={currentList.statuses}
              statusFilter={effectiveStatusFilter}
              dueFilter={dueFilter}
              priorityFilter={priorityFilter}
              onStatusFilterChange={setStatusFilter}
              onDueFilterChange={setDueFilter}
              onPriorityFilterChange={setPriorityFilter}
            />
            {currentList.customFields.map((field) => (
              <CustomFilterDropdown
                key={field.id}
                field={field}
                value={customFilters[field.id] ?? 'any'}
                onChange={(value) => setCustomFilters((prev) => ({ ...prev, [field.id]: value }))}
                onRemove={() => {
                  removeCustomField(field.id);
                  setCustomFilters((prev) => {
                    const { [field.id]: _removed, ...rest } = prev;
                    return rest;
                  });
                }}
              />
            ))}
            <Pressable
              onPress={() => setAddFieldVisible(true)}
              style={[styles.addFieldButton, { borderColor: theme.border }]}>
              <ThemedText themeColor="textSecondary" style={styles.addFieldText}>
                + Add filter group
              </ThemedText>
            </Pressable>
          </View>

          <SectionList
            sections={sectionListData}
            keyExtractor={(task) => task.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <SectionHeader
                title={section.title}
                count={section.tasks.length}
                collapsible={section.collapsible}
                collapsed={collapsedSections.has(section.key)}
                onToggle={() => toggleSection(section.key)}
              />
            )}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                allTasks={currentList.tasks}
                statuses={currentList.statuses}
                customFields={currentList.customFields}
                expanded={expandedTaskId === item.id}
                isWide={isWide}
                onToggleExpand={() =>
                  setExpandedTaskId((prev) => (prev === item.id ? null : item.id))
                }
                onUpdate={(patch) => updateTask(item.id, patch)}
                onStatusChange={(status) => setTaskStatus(item.id, status)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
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
        onExport={handleExport}
        onImport={handleImportPick}
        onCreateNewList={() => setNewListVisible(true)}
      />

      <NewListModal
        visible={newListVisible}
        onCreate={createList}
        onClose={() => setNewListVisible(false)}
      />

      <AddCustomFieldModal
        visible={addFieldVisible}
        onCreate={addCustomField}
        onClose={() => setAddFieldVisible(false)}
      />

      {importState && (
        <ImportModal
          key={importAttemptId}
          visible
          header={importState.header}
          rowCount={importState.rows.length}
          customFields={currentList.customFields}
          onCancel={() => setImportState(null)}
          onConfirm={(mapping) => {
            const count = importTasks(importState.rows, mapping);
            setImportState(null);
            setImportResult(count);
          }}
        />
      )}

      <ModalSheet visible={importResult !== null} onClose={() => setImportResult(null)}>
        <ThemedText style={styles.importResultText}>
          Imported {importResult} task{importResult === 1 ? '' : 's'}.
        </ThemedText>
        <Pressable
          onPress={() => setImportResult(null)}
          style={[styles.importResultButton, { alignSelf: 'flex-end' }]}>
          <ThemedText type="linkPrimary" style={styles.importResultButtonText}>
            OK
          </ThemedText>
        </Pressable>
      </ModalSheet>
    </ThemedView>
  );
}

function SectionHeader({
  title,
  count,
  collapsible,
  collapsed,
  onToggle,
}: {
  title: string;
  count: number;
  collapsible: boolean;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();

  const content = (
    <View style={styles.sectionHeaderRow}>
      <ThemedText themeColor="textSecondary" style={styles.sectionTitle} numberOfLines={1}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.sectionCount}>
        ({count})
      </ThemedText>
      {collapsible && (
        <ThemedText themeColor="textSecondary" style={styles.chevron}>
          {collapsed ? '▴' : '▾'}
        </ThemedText>
      )}
      <View style={[styles.sectionDivider, { backgroundColor: theme.border }]} />
    </View>
  );

  if (!collapsible) return content;

  return <Pressable onPress={onToggle}>{content}</Pressable>;
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
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: -6,
  },
  addFieldButton: {
    height: PillHeight,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addFieldText: {
    fontWeight: Fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.five,
  },
  itemSeparator: {
    height: Spacing.two,
  },
  sectionSeparator: {
    height: Spacing.one,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two - 4,
  },
  sectionDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    transform: [{ translateY: -7 }],
  },
  sectionTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: Fonts.semibold,
  },
  sectionCount: {
    fontSize: 12,
  },
  chevron: {
    width: 16,
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
  importResultText: {
    marginBottom: Spacing.three,
  },
  importResultButton: {
    paddingVertical: Spacing.one,
  },
  importResultButtonText: {
    fontWeight: Fonts.semibold,
  },
});
