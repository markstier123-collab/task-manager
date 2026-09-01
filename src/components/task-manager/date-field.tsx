import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
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

  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const weeks = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const nextWeeks = useMemo(
    () => getMonthGrid(nextMonthYear, nextMonth),
    [nextMonthYear, nextMonth],
  );

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

  const selectDay = (iso: string) => {
    onChange(iso);
    setVisible(false);
  };

  return (
    <View>
      <Pressable
        onPress={open}
        style={[styles.trigger, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="small" style={value ? undefined : { color: theme.textSecondary }}>
          {value ? formatDateLabel(value) : 'Set date'}
        </ThemedText>
      </Pressable>

      <ModalSheet visible={visible} onClose={() => setVisible(false)}>
        <View style={styles.calendarHeader}>
          <Pressable onPress={() => changeMonth(-1)} hitSlop={8} style={styles.navButton}>
            <ThemedText style={styles.navArrow}>‹</ThemedText>
          </Pressable>
          <ThemedText type="smallBold">
            {getMonthLabel(viewYear, viewMonth)} – {getMonthLabel(nextMonthYear, nextMonth)}
          </ThemedText>
          <Pressable onPress={() => changeMonth(1)} hitSlop={8} style={styles.navButton}>
            <ThemedText style={styles.navArrow}>›</ThemedText>
          </Pressable>
        </View>

        <ScrollView style={styles.monthsScroll} showsVerticalScrollIndicator={false}>
          <MonthGrid
            year={viewYear}
            month={viewMonth}
            weeks={weeks}
            value={value}
            tint={tint}
            onSelectDay={selectDay}
          />
          <MonthGrid
            year={nextMonthYear}
            month={nextMonth}
            weeks={nextWeeks}
            value={value}
            tint={tint}
            onSelectDay={selectDay}
            style={styles.secondMonth}
          />
        </ScrollView>

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

interface MonthGridTint {
  blue: { solidBg: string };
}

function MonthGrid({
  year,
  month,
  weeks,
  value,
  tint,
  onSelectDay,
  style,
}: {
  year: number;
  month: number;
  weeks: (Date | null)[][];
  value?: string;
  tint: MonthGridTint;
  onSelectDay: (iso: string) => void;
  style?: object;
}) {
  return (
    <View style={style}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.monthLabel}>
        {getMonthLabel(year, month)}
      </ThemedText>

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
                onPress={() => onSelectDay(iso)}
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
    fontWeight: Fonts.semibold,
  },
  monthsScroll: {
    maxHeight: 480,
  },
  monthLabel: {
    marginBottom: Spacing.two,
  },
  secondMonth: {
    marginTop: Spacing.four,
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
    fontWeight: Fonts.bold,
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
