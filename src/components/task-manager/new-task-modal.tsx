import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { TaskDetailsForm, TaskDraftLike } from '@/components/task-manager/task-details-form';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useFilterTint } from '@/hooks/use-theme';
import { CustomFieldDef, StatusDef, Task } from '@/lib/types';

interface NewTaskModalProps {
  draft: TaskDraftLike | null;
  onChange: (patch: Partial<TaskDraftLike>) => void;
  statuses: StatusDef[];
  customFields: CustomFieldDef[];
  allTasks: Task[];
  onConfirm: () => void;
  onCancel: () => void;
}

/** Shown right after submitting a new task's name — lets the user fill in status/priority/due date/etc. before it's created. */
export function NewTaskModal({
  draft,
  onChange,
  statuses,
  customFields,
  allTasks,
  onConfirm,
  onCancel,
}: NewTaskModalProps) {
  const tint = useFilterTint();

  return (
    <ModalSheet visible={!!draft} onClose={onCancel}>
      {draft && (
        <>
          <ThemedText type="subtitle" style={styles.title}>
            New task
          </ThemedText>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <TaskDetailsForm
              draft={draft}
              onChange={onChange}
              statuses={statuses}
              customFields={customFields}
              allTasks={allTasks}
              currentTaskId=""
            />
          </ScrollView>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancelButton}>
              <ThemedText themeColor="textSecondary" style={styles.buttonLabel}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={!draft.label.trim()}
              style={[
                styles.confirmButton,
                { backgroundColor: tint.blue.solidBg, opacity: draft.label.trim() ? 1 : 0.5 },
              ]}>
              <ThemedText style={[styles.buttonLabel, { color: '#fff' }]}>Add task</ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: Spacing.three,
  },
  scroll: {
    maxHeight: 480,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  confirmButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: Spacing.two,
  },
  buttonLabel: {
    fontWeight: Fonts.semibold,
    fontSize: 14,
  },
});
