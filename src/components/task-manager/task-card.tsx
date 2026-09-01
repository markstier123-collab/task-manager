import { ReactNode, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ChevronDownIcon } from '@/components/task-manager/chevron-down-icon';
import { PaletteIcon } from '@/components/task-manager/palette-icon';
import { PriorityBadge } from '@/components/task-manager/priority-badge';
import { TaskDetailsForm } from '@/components/task-manager/task-details-form';
import { ThemedText } from '@/components/themed-text';
import { Fonts, PillHeight, Spacing } from '@/constants/theme';
import { useColorPalette, useTheme } from '@/hooks/use-theme';
import { formatDateTimeLabel } from '@/lib/date-utils';
import { getStatus } from '@/lib/task-utils';
import { CustomFieldDef, StatusDef, Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  allTasks: Task[];
  statuses: StatusDef[];
  customFields: CustomFieldDef[];
  expanded: boolean;
  isWide: boolean;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<Task>) => void;
  onStatusChange: (statusId: string) => void;
}

/** Status colors muted/neutral enough that the task label should stay the default text color. */
const NEUTRAL_COLOR_IDX = [0, 5];

export function TaskCard({
  task,
  allTasks,
  statuses,
  customFields,
  expanded,
  isWide,
  onToggleExpand,
  onUpdate,
  onStatusChange,
}: TaskCardProps) {
  const theme = useTheme();
  const palette = useColorPalette();
  const status = getStatus(statuses, task.status);
  const colors = palette[status?.colorIdx ?? 0];
  const dependsOnTask = task.dependsOn ? allTasks.find((t) => t.id === task.dependsOn) : undefined;
  const isCancelled = task.status === 'cancelled';

  // "Created" is dropped on narrow screens to keep the collapsed card to 2 lines.
  const metaParts: { key: string; text: string }[] = [];
  if (isWide) {
    metaParts.push({ key: 'created', text: `Created ${formatDateTimeLabel(task.createdAt)}` });
  }
  if (task.estimatedDate) {
    metaParts.push({ key: 'date', text: `Due ${task.estimatedDate}` });
  }
  if (task.status === 'blocked' && task.blockedReason) {
    metaParts.push({ key: 'blocked', text: `Blocked: ${task.blockedReason}` });
  }
  if (dependsOnTask) {
    metaParts.push({ key: 'depends', text: `Depends on: ${dependsOnTask.label}` });
  }
  for (const field of customFields) {
    const value = task.customValues?.[field.id];
    if (value) {
      metaParts.push({ key: `cf-${field.id}`, text: `${field.name}: ${value}` });
    }
  }

  const metaChunks: ReactNode[] = metaParts.map((part, index) => (
    <ThemedText key={part.key} themeColor="textSecondary" style={styles.metaText} numberOfLines={1}>
      {index === 0 ? part.text : `· ${part.text}`}
    </ThemedText>
  ));

  const labelColor =
    !isCancelled && status && !NEUTRAL_COLOR_IDX.includes(status.colorIdx) ? colors.text : undefined;
  const labelStyle = [
    styles.label,
    isCancelled && styles.strikethrough,
    isCancelled && { color: colors.text },
    labelColor && { color: labelColor },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Pressable onPress={onToggleExpand} style={styles.headerTouchable}>
        <StatusBadge status={status} colors={colors} statuses={statuses} onStatusChange={onStatusChange} />
        {task.priority && (
          <View style={styles.priorityOffset}>
            <PriorityBadge
              priority={task.priority}
              backgroundColor={colors.bg}
              borderColor={colors.border}
              textColor={colors.text}
            />
          </View>
        )}

        {isWide ? (
          <View style={styles.wideFlow}>
            <ThemedText style={[...labelStyle, styles.wideLabel]} numberOfLines={expanded ? undefined : 2}>
              {task.label}
            </ThemedText>
            {metaChunks}
          </View>
        ) : (
          <View style={styles.headerText}>
            <ThemedText numberOfLines={expanded ? undefined : 2} style={labelStyle}>
              {task.label}
            </ThemedText>
            <View style={styles.metaRow}>{metaChunks}</View>
          </View>
        )}

        <View style={[styles.chevron, expanded && styles.chevronExpanded]}>
          <ChevronDownIcon color={theme.textSecondary} size={9} />
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.expandedContent}>
          <TaskDetailsForm
            draft={task}
            onChange={onUpdate}
            statuses={statuses}
            customFields={customFields}
            allTasks={allTasks}
            currentTaskId={task.id}
          />
        </View>
      )}
    </View>
  );
}

interface BadgeColors {
  bg: string;
  border: string;
  accent: string;
  text: string;
}

/** The collapsed status pill — tapping anywhere on it (icon or label) opens a quick-switch dropdown, independent of the card's expand/collapse. */
function StatusBadge({
  status,
  colors,
  statuses,
  onStatusChange,
}: {
  status: StatusDef | undefined;
  colors: BadgeColors;
  statuses: StatusDef[];
  onStatusChange: (statusId: string) => void;
}) {
  const theme = useTheme();
  const palette = useColorPalette();
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number; height: number } | null>(null);

  const open = () => {
    anchorRef.current?.measureInWindow((x, y, _width, height) => {
      setAnchor({ x, y, height });
    });
  };

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        <Pressable
          onPress={open}
          style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <PaletteIcon iconIdx={status?.iconIdx ?? 0} color={colors.accent} size={17} />
          <ThemedText
            type="small"
            style={[styles.statusBadgeText, { color: colors.text }]}
            numberOfLines={1}>
            {status?.label ?? '—'}
          </ThemedText>
        </Pressable>
      </View>

      {anchor && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setAnchor(null)}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAnchor(null)}>
            <View
              style={[
                styles.quickPickerPanel,
                {
                  top: anchor.y + anchor.height + 4,
                  left: anchor.x,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              {statuses.map((s) => {
                const c = palette[s.colorIdx];
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => {
                      onStatusChange(s.id);
                      setAnchor(null);
                    }}
                    style={styles.quickPickerRow}>
                    <PaletteIcon iconIdx={s.iconIdx} color={c.accent} size={14} />
                    <ThemedText type="small" numberOfLines={1}>
                      {s.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerTouchable: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: PillHeight,
    paddingRight: 8,
    paddingLeft: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontWeight: Fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
  },
  headerText: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: Fonts.regular,
    opacity: 0.85,
    marginTop: 1,
  },
  priorityOffset: {
    marginTop: 1,
  },
  wideFlow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.one,
  },
  label: {
    fontWeight: Fonts.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  wideLabel: {
    flexShrink: 1,
    marginRight: Spacing.one,
  },
  chevron: {
    marginLeft: Spacing.one,
    opacity: 0.7,
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  expandedContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  quickPickerPanel: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.one,
    minWidth: 150,
    maxWidth: 220,
  },
  quickPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 8,
    paddingHorizontal: Spacing.two,
  },
});
