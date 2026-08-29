import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Task } from '@/lib/types';

interface DependsOnFieldProps {
  tasks: Task[];
  currentTaskId: string;
  value?: string;
  onChange: (taskId: string | undefined) => void;
}

export function DependsOnField({ tasks, currentTaskId, value, onChange }: DependsOnFieldProps) {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const options = tasks.filter((task) => task.id !== currentTaskId);
  const selectedTask = options.find((task) => task.id === value);

  return (
    <View>
      <Pressable
        onPress={() => setVisible(true)}
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText numberOfLines={1} style={selectedTask ? undefined : { color: theme.textSecondary }}>
          {selectedTask ? selectedTask.label : 'None'}
        </ThemedText>
        <ThemedText themeColor="textSecondary">▾</ThemedText>
      </Pressable>

      <ModalSheet visible={visible} onClose={() => setVisible(false)}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.heading}>
          DEPENDS ON
        </ThemedText>
        <ScrollView style={styles.list}>
          <Pressable
            onPress={() => {
              onChange(undefined);
              setVisible(false);
            }}
            style={[styles.option, !value && { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText themeColor="textSecondary">None</ThemedText>
          </Pressable>
          {options.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => {
                onChange(task.id);
                setVisible(false);
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
              No other tasks in this list yet.
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
  heading: {
    letterSpacing: 0.5,
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
