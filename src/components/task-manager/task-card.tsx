import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { DateField } from '@/components/task-manager/date-field';
import { DependsOnField } from '@/components/task-manager/depends-on-field';
import { StatusIcon } from '@/components/task-manager/status-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useStatusColors, useTheme } from '@/hooks/use-theme';
import { formatDateLabel } from '@/lib/date-utils';
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/task-utils';
import { Task, TaskStatus } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  allTasks: Task[];
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<Task>) => void;
  onStatusChange: (status: TaskStatus) => void;
}

export function TaskCard({
  task,
  allTasks,
  expanded,
  onToggleExpand,
  onUpdate,
  onStatusChange,
}: TaskCardProps) {
  const theme = useTheme();
  const statusColors = useStatusColors();
  const colors = statusColors[task.status];
  const dependsOnTask = task.dependsOn ? allTasks.find((t) => t.id === task.dependsOn) : undefined;
  const isCancelled = task.status === 'cancelled';

  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Pressable onPress={onToggleExpand} style={styles.headerTouchable}>
        <StatusIcon status={task.status} color={colors.accent} size={18} />
        <View style={styles.headerText}>
          <ThemedText
            numberOfLines={expanded ? undefined : 2}
            style={[isCancelled && styles.strikethrough, isCancelled && { color: colors.text }]}>
            {task.label}
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText type="small" style={{ color: colors.text }}>
              {STATUS_LABELS[task.status]}
            </ThemedText>
            {task.estimatedDate && (
              <ThemedText type="small" themeColor="textSecondary">
                · {formatDateLabel(task.estimatedDate)}
              </ThemedText>
            )}
            {dependsOnTask && (
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                · depends on {dependsOnTask.label}
              </ThemedText>
            )}
          </View>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.expandedContent}>
          <TextInput
            value={task.label}
            onChangeText={(label) => onUpdate({ label })}
            style={[styles.labelInput, { backgroundColor: theme.background, color: theme.text }]}
            multiline
          />

          <View style={styles.statusButtonsRow}>
            {STATUS_ORDER.map((status) => (
              <StatusButton
                key={status}
                status={status}
                active={status === task.status}
                onPress={() => onStatusChange(status)}
              />
            ))}
          </View>

          {task.status === 'blocked' && (
            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
                What&apos;s blocking it
              </ThemedText>
              <TextInput
                value={task.blockedReason ?? ''}
                onChangeText={(blockedReason) => onUpdate({ blockedReason })}
                placeholder="Describe the blocker…"
                placeholderTextColor={theme.textSecondary}
                style={[styles.textInput, { backgroundColor: theme.background, color: theme.text }]}
                multiline
              />
            </View>
          )}

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Estimated completion date
            </ThemedText>
            <DateField
              value={task.estimatedDate}
              onChange={(estimatedDate) => onUpdate({ estimatedDate })}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Depends on
            </ThemedText>
            <DependsOnField
              tasks={allTasks}
              currentTaskId={task.id}
              value={task.dependsOn}
              onChange={(dependsOn) => onUpdate({ dependsOn })}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function StatusButton({
  status,
  active,
  onPress,
}: {
  status: TaskStatus;
  active: boolean;
  onPress: () => void;
}) {
  const statusColors = useStatusColors();
  const colors = statusColors[status];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.statusButton,
        { backgroundColor: active ? colors.accent : colors.bg, borderColor: colors.border },
      ]}>
      <StatusIcon status={status} color={active ? '#fff' : colors.accent} size={14} />
      <ThemedText
        type="small"
        style={[styles.statusButtonText, { color: active ? '#fff' : colors.text }]}>
        {STATUS_LABELS[status]}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerTouchable: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  expandedContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  labelInput: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 16,
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
    paddingVertical: 8,
  },
  statusButtonText: {
    fontWeight: '600',
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
    fontSize: 15,
  },
});
