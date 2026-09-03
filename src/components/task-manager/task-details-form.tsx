import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { DateField } from '@/components/task-manager/date-field';
import { DependsOnField } from '@/components/task-manager/depends-on-field';
import { PaletteIcon } from '@/components/task-manager/palette-icon';
import { PriorityBadge } from '@/components/task-manager/priority-badge';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useColorPalette, useTheme } from '@/hooks/use-theme';
import { statusChangeSideEffects } from '@/lib/task-utils';
import { CustomFieldDef, Priority, StatusDef, Task } from '@/lib/types';

const PRIORITY_OPTIONS: Priority[] = [1, 2, 3];

/** The subset of Task fields editable through this form — used both for an existing task and a not-yet-created draft. */
export interface TaskDraftLike {
  label: string;
  status: string;
  priority?: Priority;
  customValues?: Record<string, string | undefined>;
  blockedReason?: string;
  estimatedDate?: string;
  dependsOn?: string;
  completedAt?: number;
  cancelledAt?: number;
}

interface TaskDetailsFormProps {
  draft: TaskDraftLike;
  onChange: (patch: Partial<TaskDraftLike>) => void;
  statuses: StatusDef[];
  customFields: CustomFieldDef[];
  allTasks: Task[];
  /** The task's own id, so it doesn't show up as a "Depends on" option for itself. Pass '' for a draft with no id yet. */
  currentTaskId: string;
}

/** Status/priority/custom-field/blocked-reason/due-date/depends-on editing controls — shared by the expanded task card and the new-task modal. */
export function TaskDetailsForm({
  draft,
  onChange,
  statuses,
  customFields,
  allTasks,
  currentTaskId,
}: TaskDetailsFormProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <TextInput
        value={draft.label}
        onChangeText={(label) => onChange({ label })}
        style={[styles.labelInput, { backgroundColor: theme.surface, color: theme.text }]}
        multiline
      />

      <View style={styles.statusButtonsRow}>
        {statuses.map((s) => (
          <StatusButton
            key={s.id}
            status={s}
            active={s.id === draft.status}
            onPress={() => onChange({ status: s.id, ...statusChangeSideEffects(draft.status, s.id) })}
          />
        ))}
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
          Priority
        </ThemedText>
        <View style={styles.priorityRow}>
          <Pressable
            onPress={() => onChange({ priority: undefined })}
            style={[styles.priorityOption, !draft.priority && { borderColor: theme.text }]}>
            <ThemedText type="small" themeColor="textSecondary">
              None
            </ThemedText>
          </Pressable>
          {PRIORITY_OPTIONS.map((p) => (
            <Pressable
              key={p}
              onPress={() => onChange({ priority: p })}
              style={[styles.priorityOption, draft.priority === p && { borderColor: theme.text }]}>
              <PriorityBadge priority={p} />
            </Pressable>
          ))}
        </View>
      </View>

      {customFields.map((field) => (
        <View key={field.id} style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            {field.name}
          </ThemedText>
          <View style={styles.priorityRow}>
            <Pressable
              onPress={() => onChange({ customValues: { ...draft.customValues, [field.id]: undefined } })}
              style={[
                styles.customOption,
                !draft.customValues?.[field.id] && { borderColor: theme.text },
              ]}>
              <ThemedText type="small" themeColor="textSecondary">
                None
              </ThemedText>
            </Pressable>
            {field.options.map((option) => (
              <CustomFieldOptionButton
                key={option}
                label={option}
                tintIdx={field.tintIdx}
                active={draft.customValues?.[field.id] === option}
                onPress={() =>
                  onChange({ customValues: { ...draft.customValues, [field.id]: option } })
                }
              />
            ))}
          </View>
        </View>
      ))}

      {draft.status === 'blocked' && (
        <View style={styles.field}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            What&apos;s blocking it
          </ThemedText>
          <TextInput
            value={draft.blockedReason ?? ''}
            onChangeText={(blockedReason) => onChange({ blockedReason })}
            placeholder="Describe the blocker…"
            placeholderTextColor={theme.textSecondary}
            style={[styles.textInput, { backgroundColor: theme.surface, color: theme.text }]}
            multiline
          />
        </View>
      )}

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
          Due Date
        </ThemedText>
        <DateField
          value={draft.estimatedDate}
          onChange={(estimatedDate) => onChange({ estimatedDate })}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
          Depends on
        </ThemedText>
        <DependsOnField
          tasks={allTasks}
          statuses={statuses}
          currentTaskId={currentTaskId}
          value={draft.dependsOn}
          onChange={(dependsOn) => onChange({ dependsOn })}
        />
      </View>
    </View>
  );
}

function CustomFieldOptionButton({
  label,
  tintIdx,
  active,
  onPress,
}: {
  label: string;
  tintIdx: number;
  active: boolean;
  onPress: () => void;
}) {
  const palette = useColorPalette();
  const colors = palette[tintIdx];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.customOption,
        {
          backgroundColor: active ? colors.accent : colors.bg,
          borderColor: colors.border,
        },
      ]}>
      <ThemedText type="small" style={{ color: active ? '#fff' : colors.text, fontWeight: Fonts.semibold }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function StatusButton({
  status,
  active,
  onPress,
}: {
  status: StatusDef;
  active: boolean;
  onPress: () => void;
}) {
  const palette = useColorPalette();
  const colors = palette[status.colorIdx];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.statusButton,
        { backgroundColor: active ? colors.accent : colors.bg, borderColor: colors.border },
      ]}>
      <PaletteIcon iconIdx={status.iconIdx} color={active ? '#fff' : colors.accent} size={14} />
      <ThemedText type="small" style={[styles.statusButtonText, { color: active ? '#fff' : colors.text }]}>
        {status.label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  labelInput: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: Fonts.medium,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
  },
  statusButtonText: {
    fontWeight: Fonts.semibold,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    alignItems: 'center',
  },
  priorityOption: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  customOption: {
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  field: {
    gap: Spacing.one,
  },
  fieldLabel: {
    marginBottom: 2,
  },
  textInput: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: Fonts.medium,
  },
});
