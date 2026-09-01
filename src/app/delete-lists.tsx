import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTaskManagerContext } from '@/context/task-manager-context';
import { useFilterTint, useTheme } from '@/hooks/use-theme';
import { TaskList } from '@/lib/types';

export default function DeleteListsScreen() {
  const { lists, deleteList } = useTaskManagerContext();
  const theme = useTheme();
  const tint = useFilterTint();
  const [pending, setPending] = useState<TaskList | null>(null);

  const confirmDelete = () => {
    if (!pending) return;
    deleteList(pending.id);
    setPending(null);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
              <ThemedText type="linkPrimary" style={styles.backText}>
                ‹ Back
              </ThemedText>
            </Pressable>
            <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
              Delete task list
            </ThemedText>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {lists.map((list) => {
              const isLast = lists.length === 1;
              return (
                <View key={list.id} style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                  <View style={styles.rowText}>
                    <ThemedText numberOfLines={1}>{list.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {list.tasks.length} task{list.tasks.length === 1 ? '' : 's'}
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={() => setPending(list)}
                    disabled={isLast}
                    style={[
                      styles.deleteButton,
                      { borderColor: tint.red.border, opacity: isLast ? 0.4 : 1 },
                    ]}>
                    <ThemedText style={[styles.deleteButtonText, { color: tint.red.subtleText }]}>
                      Delete
                    </ThemedText>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          {lists.length === 1 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
              You need at least one task list, so the last one can&apos;t be deleted.
            </ThemedText>
          )}
        </ThemedView>
      </SafeAreaView>

      <ModalSheet visible={!!pending} onClose={() => setPending(null)}>
        {pending && (
          <>
            <ThemedText style={styles.confirmText}>
              Are you sure you want to delete &apos;{pending.name}&apos;? This will permanently
              delete {pending.tasks.length} task{pending.tasks.length === 1 ? '' : 's'}. This
              can&apos;t be undone.
            </ThemedText>
            <View style={styles.confirmRow}>
              <Pressable onPress={() => setPending(null)} style={styles.cancelButton}>
                <ThemedText themeColor="textSecondary" style={styles.cancelText}>
                  Cancel
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                style={[styles.confirmButton, { backgroundColor: tint.red.solidBg }]}>
                <ThemedText style={styles.confirmButtonText}>Delete</ThemedText>
              </Pressable>
            </View>
          </>
        )}
      </ModalSheet>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  backButton: {
    paddingVertical: Spacing.one,
  },
  backText: {
    fontWeight: Fonts.semibold,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    flex: 1,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  deleteButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontWeight: Fonts.semibold,
    fontSize: 13,
  },
  note: {
    paddingBottom: Spacing.three,
  },
  confirmText: {
    marginBottom: Spacing.three,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.three,
  },
  cancelButton: {
    paddingVertical: Spacing.one,
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: Fonts.semibold,
  },
  confirmButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: Fonts.semibold,
  },
});
