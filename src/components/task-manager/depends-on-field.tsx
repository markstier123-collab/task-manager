import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isClosedStatus } from '@/lib/task-utils';
import { StatusDef, Task } from '@/lib/types';

interface DependsOnFieldProps {
  tasks: Task[];
  statuses: StatusDef[];
  currentTaskId: string;
  value?: string;
  onChange: (taskId: string | undefined) => void;
}

function compareByDueDate(a: Task, b: Task): number {
  if (a.estimatedDate && b.estimatedDate) {
    return a.estimatedDate < b.estimatedDate ? -1 : a.estimatedDate > b.estimatedDate ? 1 : 0;
  }
  if (a.estimatedDate) return -1;
  if (b.estimatedDate) return 1;
  return a.createdAt - b.createdAt;
}

export function DependsOnField({ tasks, statuses, currentTaskId, value, onChange }: DependsOnFieldProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const theme = useTheme();

  const openOptions = tasks
    .filter((task) => task.id !== currentTaskId && !isClosedStatus(statuses, task.status))
    .sort(compareByDueDate);
  const selectedTask = tasks.find((task) => task.id === value);

  const trimmedQuery = query.trim().toLowerCase();
  const options = trimmedQuery
    ? openOptions.filter((task) => task.label.toLowerCase().includes(trimmedQuery))
    : openOptions;

  const close = () => {
    setVisible(false);
    setQuery('');
  };

  return (
    <View>
      <Pressable
        onPress={() => setVisible(true)}
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText
          type="small"
          numberOfLines={1}
          style={selectedTask ? undefined : { color: theme.textSecondary }}>
          {selectedTask ? selectedTask.label : 'None'}
        </ThemedText>
        <ThemedText themeColor="textSecondary">▾</ThemedText>
      </Pressable>

      <ModalSheet visible={visible} onClose={close}>
        <View style={styles.headingRow}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.headingText}>
            DEPENDS ON
          </ThemedText>
          <Pressable onPress={close} hitSlop={8} style={styles.closeButton}>
            <ThemedText themeColor="textSecondary" style={styles.closeButtonText}>
              ✕
            </ThemedText>
          </Pressable>
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Type to search"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.searchInput,
            { backgroundColor: theme.backgroundElement, color: theme.text },
          ]}
        />
        <ScrollView style={styles.list}>
          <Pressable
            onPress={() => {
              onChange(undefined);
              close();
            }}
            style={[styles.option, !value && { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText themeColor="textSecondary">None</ThemedText>
          </Pressable>
          {options.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => {
                onChange(task.id);
                close();
              }}
              style={[
                styles.option,
                task.id === value && { backgroundColor: theme.backgroundSelected },
              ]}>
              <ThemedText numberOfLines={1}>{task.label}</ThemedText>
            </Pressable>
          ))}
          {options.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              {openOptions.length === 0
                ? 'No other open tasks in this list yet.'
                : 'No matching tasks.'}
            </ThemedText>
          )}
        </ScrollView>
      </ModalSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  headingText: {
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 2,
  },
  closeButtonText: {
    fontSize: 15,
  },
  searchInput: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: Spacing.two,
  },
  list: {
    maxHeight: 320,
  },
  option: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  empty: {
    paddingVertical: Spacing.two,
  },
});
