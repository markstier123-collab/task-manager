import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTaskManagerContext } from '@/context/task-manager-context';
import { useTheme } from '@/hooks/use-theme';
import { GroupByOption, SortByOption } from '@/lib/types';

const SORT_OPTIONS: { value: SortByOption; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'due', label: 'Due date' },
  { value: 'created', label: 'Date created' },
  { value: 'label', label: 'Label A-Z' },
  { value: 'status', label: 'Status' },
];

export default function PreferencesScreen() {
  const { currentList, setGroupBy, setSortBy } = useTaskManagerContext();
  const theme = useTheme();

  if (!currentList) {
    return <ThemedView style={styles.container} />;
  }

  const groupOptions: { value: GroupByOption; label: string }[] = [
    { value: 'due', label: 'Due date' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    ...currentList.customFields.map((f) => ({ value: f.id, label: f.name })),
  ];

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
              {currentList.name} preferences
            </ThemedText>
          </View>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionHeading}>
            GROUP BY
          </ThemedText>
          <View style={styles.optionList}>
            {groupOptions.map((option) => {
              const active = currentList.groupBy === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setGroupBy(option.value)}
                  style={[
                    styles.option,
                    { backgroundColor: active ? theme.backgroundSelected : theme.backgroundElement },
                  ]}>
                  <ThemedText style={styles.optionText}>{option.label}</ThemedText>
                  {active && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </Pressable>
              );
            })}
          </View>

          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionHeading}>
            SORT WITHIN GROUP BY
          </ThemedText>
          <View style={styles.optionList}>
            {SORT_OPTIONS.map((option) => {
              const active = currentList.sortBy === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSortBy(option.value)}
                  style={[
                    styles.option,
                    { backgroundColor: active ? theme.backgroundSelected : theme.backgroundElement },
                  ]}>
                  <ThemedText style={styles.optionText}>{option.label}</ThemedText>
                  {active && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </Pressable>
              );
            })}
          </View>
        </ThemedView>
      </SafeAreaView>
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
  sectionHeading: {
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
  },
  optionList: {
    gap: Spacing.one,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  optionText: {
    fontSize: 15,
  },
  checkmark: {
    fontWeight: Fonts.bold,
  },
});
