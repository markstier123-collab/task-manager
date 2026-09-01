import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useFilterTint, useTheme } from '@/hooks/use-theme';
import { TaskList } from '@/lib/types';

interface ListDrawerProps {
  visible: boolean;
  lists: TaskList[];
  currentListId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
  onCreateNewList: () => void;
}

export function ListDrawer({
  visible,
  lists,
  currentListId,
  onSelect,
  onClose,
  onExport,
  onImport,
  onCreateNewList,
}: ListDrawerProps) {
  const theme = useTheme();
  const tint = useFilterTint();

  return (
    <ModalSheet visible={visible} onClose={onClose} align="left">
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.heading}>
        TASK LISTS
      </ThemedText>
      <ScrollView contentContainerStyle={styles.listContent}>
        {lists.map((list) => {
          const active = list.id === currentListId;
          return (
            <Pressable
              key={list.id}
              onPress={() => {
                onSelect(list.id);
                onClose();
              }}
              style={[
                styles.row,
                { backgroundColor: active ? theme.backgroundSelected : 'transparent' },
              ]}>
              <ThemedText numberOfLines={1} style={styles.rowText}>
                {list.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {list.tasks.length}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Pressable
        onPress={() => {
          onClose();
          onCreateNewList();
        }}
        style={styles.row}>
        <ThemedText numberOfLines={1} style={styles.rowText}>
          Create New Task List
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={() => {
          onClose();
          router.push('/delete-lists');
        }}
        style={styles.row}>
        <ThemedText numberOfLines={1} style={[styles.rowText, { color: tint.red.subtleText }]}>
          Delete Task List
        </ThemedText>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Pressable
        onPress={() => {
          onClose();
          router.push('/filters');
        }}
        style={styles.row}>
        <ThemedText numberOfLines={1} style={styles.rowText}>
          Edit filters
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={() => {
          onClose();
          router.push('/preferences');
        }}
        style={styles.row}>
        <ThemedText numberOfLines={1} style={styles.rowText}>
          Preferences
        </ThemedText>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Pressable
        onPress={() => {
          onClose();
          onExport();
        }}
        style={styles.row}>
        <ThemedText numberOfLines={1} style={styles.rowText}>
          Export tasks
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={() => {
          onClose();
          onImport();
        }}
        style={styles.row}>
        <ThemedText numberOfLines={1} style={styles.rowText}>
          Import tasks
        </ThemedText>
      </Pressable>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  heading: {
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  listContent: {
    gap: Spacing.half,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  rowText: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
  },
});
