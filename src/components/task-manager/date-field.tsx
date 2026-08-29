import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useFilterTint, useTheme } from '@/hooks/use-theme';
import {
  formatDateLabel,
  getMonthGrid,
  getMonthLabel,
  parseISODate,
  toISODate,
  WEEKDAY_LABELS,
} from '@/lib/date-utils';

interface DateFieldProps {
  value?: string;
  onChange: (date: string | undefined) => void;
}

export function DateField({ value, onChange }: DateFieldProps) {
  const [visible, setVisible] = useState(false);
  const initial = value ? parseISODate(value) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const theme = useTheme();
  const tint = useFilterTint();

  const weeks = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const open = () => {
    const base = value ? parseISODate(value) : new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setVisible(true);
  };

  const changeMonth = (delta: number) => {
    let month = viewMonth + delta;
    let year = viewYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    setViewMonth(month);
    setViewYear(year);
  };

  return (
    <View>
      <Pressable
        onPress={open}
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText style={value ? undefined : { color: theme.textSecondary }}>
          {value ? formatDateLabel(value) : 'Set date'}
        </ThemedText>
      </Pressable>

      <ModalSheet visible={visible} onClose={() => setVisible(false)}>
        <View style={styles.calendarHeader}>
          <Pressable onPress={() => changeMonth(-1)} hitSlop={8} style={styles.navButton}>
            <ThemedText style={styles.navArrow}>‹</ThemedText>
          </Pressable>
          <ThemedText type="smallBold">{getMonthLabel(viewYear, viewMonth)}</ThemedText>
          <Pressable onPress={() => changeMonth(1)} hitSlop={8} style={styles.navButton}>
            <ThemedText style={styles.navArrow}>›</ThemedText>
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label, i) => (
            <ThemedText key={i} type="small" themeColor="textSecondary" style={styles.weekdayCell}>
              {label}
            </ThemedText>
          ))}
        </View>

        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              if (!day) return <View key={dayIndex} style={styles.dayCell} />;
              const iso = toISODate(day);
              const selected = iso === value;
              return (
                <Pressable
                  key={dayIndex}
                  onPress={() => {
                    onChange(iso);
                    setVisible(false);
                  }}
                  style={[
                    styles.dayCell,
                    styles.dayCellButton,
                    selected && { backgroundColor: tint.blue.solidBg },
                  ]}>
                  <ThemedText style={selected ? styles.selectedDayText : undefined}>
                    {day.getDate()}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        ))}

        {value && (
          <Pressable
            onPress={() => {
              onChange(undefined);
              setVisible(false);
            }}
            style={styles.clearButton}>
            <ThemedText themeColor="textSecondary" style={styles.clearText}>
              Clear date
            </ThemedText>
          </Pressable>
        )}
      </ModalSheet>
    </View>
  );
}

const CELL_SIZE = 36;

const styles = StyleSheet.create({
  trigger: {
    alignSelf: 'flex-start',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  navButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  navArrow: {
    fontSize: 20,
    fontWeight: '600',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Spacing.one,
  },
  weekdayCell: {
    width: CELL_SIZE,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellButton: {
    borderRadius: CELL_SIZE / 2,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  clearButton: {
    marginTop: Spacing.two,
    alignSelf: 'center',
  },
  clearText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
