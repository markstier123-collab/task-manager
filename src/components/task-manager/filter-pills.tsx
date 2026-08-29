import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useFilterTint } from '@/hooks/use-theme';
import { DueFilter, StatusFilter } from '@/lib/types';

interface FilterPillsProps {
  statusFilter: StatusFilter;
  dueFilter: DueFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onDueFilterChange: (filter: DueFilter) => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Status: All' },
  { value: 'open', label: 'Status: Open' },
  { value: 'closed', label: 'Status: Closed' },
];

const DUE_OPTIONS: { value: DueFilter; label: string }[] = [
  { value: 'anytime', label: 'Due: Anytime' },
  { value: 'today', label: 'Due: Today' },
  { value: 'this_week', label: 'Due: This week' },
];

export function FilterPills({
  statusFilter,
  dueFilter,
  onStatusFilterChange,
  onDueFilterChange,
}: FilterPillsProps) {
  const tint = useFilterTint();

  return (
    <View style={styles.row}>
      <View style={styles.group}>
        {STATUS_OPTIONS.map((option) => (
          <Pill
            key={option.value}
            label={option.label}
            active={statusFilter === option.value}
            subtleBg={tint.blue.subtleBg}
            solidBg={tint.blue.solidBg}
            subtleText={tint.blue.subtleText}
            solidText={tint.blue.solidText}
            onPress={() => onStatusFilterChange(option.value)}
          />
        ))}
      </View>
      <View style={styles.group}>
        {DUE_OPTIONS.map((option) => (
          <Pill
            key={option.value}
            label={option.label}
            active={dueFilter === option.value}
            subtleBg={tint.green.subtleBg}
            solidBg={tint.green.solidBg}
            subtleText={tint.green.subtleText}
            solidText={tint.green.solidText}
            onPress={() => onDueFilterChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

interface PillProps {
  label: string;
  active: boolean;
  subtleBg: string;
  solidBg: string;
  subtleText: string;
  solidText: string;
  onPress: () => void;
}

function Pill({ label, active, subtleBg, solidBg, subtleText, solidText, onPress }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, { backgroundColor: active ? solidBg : subtleBg }]}>
      <ThemedText
        style={[styles.pillText, { color: active ? solidText : subtleText }]}
        numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  pill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Spacing.four,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
