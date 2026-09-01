import { ReactNode, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ChevronDownIcon } from '@/components/task-manager/chevron-down-icon';
import { DateField } from '@/components/task-manager/date-field';
import { DependsOnField } from '@/components/task-manager/depends-on-field';
import { PaletteIcon } from '@/components/task-manager/palette-icon';
import { PriorityBadge } from '@/components/task-manager/priority-badge';
import { ThemedText } from '@/components/themed-text';
import { Fonts, PillHeight, Spacing } from '@/constants/theme';
import { useColorPalette, useTheme } from '@/hooks/use-theme';
import { formatDateTimeLabel } from '@/lib/date-utils';
import { getStatus } from '@/lib/task-utils';
import { CustomFieldDef, Priority, StatusDef, Task } from '@/lib/types';

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

const PRIORITY_OPTIONS: Priority[] = [1, 2, 3];
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
          <TextInput
            value={task.label}
            onChangeText={(label) => onUpdate({ label })}
            style={[styles.labelInput, { backgroundColor: theme.surface, color: theme.text }]}
            multiline
          />

          <View style={styles.statusButtonsRow}>
            {statuses.map((s) => (
              <StatusButton
                key={s.id}
                status={s}
                active={s.id === task.status}
                onPress={() => onStatusChange(s.id)}
              />
            ))}
          </View>

          <View style={styles.field}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Priority
            </ThemedText>
            <View style={styles.priorityRow}>
              <Pressable
                onPress={() => onUpdate({ priority: undefined })}
                style={[
                  styles.priorityOption,
                  !task.priority && { borderColor: theme.text },
                ]}>
                <ThemedText type="small" themeColor="textSecondary">
                  None
                </ThemedText>
              </Pressable>
              {PRIORITY_OPTIONS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => onUpdate({ priority: p })}
                  style={[
                    styles.priorityOption,
                    task.priority === p && { borderColor: theme.text },
                  ]}>
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
                  onPress={() => onUpdate({ customValues: { ...task.customValues, [field.id]: undefined } })}
                  style={[
                    styles.customOption,
                    !task.customValues?.[field.id] && { borderColor: theme.text },
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
                    active={task.customValues?.[field.id] === option}
                    onPress={() =>
                      onUpdate({ customValues: { ...task.customValues, [field.id]: option } })
                    }
                  />
                ))}
              </View>
            </View>
          ))}

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
      <ThemedText
        type="small"
        style={[styles.statusButtonText, { color: active ? '#fff' : colors.text }]}>
        {status.label}
      </ThemedText>
    </Pressable>
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
