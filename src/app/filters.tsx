import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTaskManagerContext } from '@/context/task-manager-context';
import { useTheme } from '@/hooks/use-theme';

export default function FiltersScreen() {
  const { currentList } = useTaskManagerContext();
  const theme = useTheme();

  if (!currentList) {
    return <ThemedView style={styles.container} />;
  }

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
              Edit filters
            </ThemedText>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            <Pressable
              onPress={() => router.push('/statuses')}
              style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={styles.rowText}>Statuses</ThemedText>
              <ThemedText themeColor="textSecondary">{currentList.statuses.length}</ThemedText>
            </Pressable>

            {currentList.customFields.map((field) => (
              <Pressable
                key={field.id}
                onPress={() => router.push({ pathname: '/custom-field', params: { id: field.id } })}
                style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={styles.rowText} numberOfLines={1}>
                  {field.name}
                </ThemedText>
                <ThemedText themeColor="textSecondary">{field.options.length}</ThemedText>
              </Pressable>
            ))}

            {currentList.customFields.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                Custom filter groups you add from the task list will show up here for editing.
              </ThemedText>
            )}
          </ScrollView>
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
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowText: {
    flex: 1,
  },
  hint: {
    paddingTop: Spacing.two,
  },
});
