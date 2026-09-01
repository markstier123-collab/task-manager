import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTaskManagerContext } from '@/context/task-manager-context';
import { useFilterTint, useTheme } from '@/hooks/use-theme';

interface PendingRemoval {
  value: string;
  count: number;
}

export default function CustomFieldScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const {
    currentList,
    updateCustomFieldName,
    addCustomFieldOption,
    renameCustomFieldOption,
    removeCustomFieldOption,
    reassignAndRemoveCustomFieldOption,
  } = useTaskManagerContext();
  const theme = useTheme();
  const tint = useFilterTint();

  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [newOption, setNewOption] = useState('');

  const field = currentList?.customFields.find((f) => f.id === params.id);

  if (!currentList || !field) {
    return <ThemedView style={styles.container} />;
  }

  const requestRemove = (value: string) => {
    const count = currentList.tasks.filter((t) => t.customValues?.[field.id] === value).length;
    if (count === 0) {
      removeCustomFieldOption(field.id, value);
      return;
    }
    setPendingRemoval({ value, count });
  };

  const confirmReplacement = (replacement: string) => {
    if (!pendingRemoval) return;
    reassignAndRemoveCustomFieldOption(field.id, pendingRemoval.value, replacement);
    setPendingRemoval(null);
  };

  const submitNewOption = () => {
    if (!newOption.trim()) return;
    addCustomFieldOption(field.id, newOption);
    setNewOption('');
  };

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
            <TextInput
              value={field.name}
              onChangeText={(name) => updateCustomFieldName(field.id, name)}
              style={[styles.nameInput, { color: theme.text }]}
            />
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {field.options.map((option) => (
              <OptionRow
                key={option}
                option={option}
                onRename={(newValue) => renameCustomFieldOption(field.id, option, newValue)}
                onRemove={() => requestRemove(option)}
              />
            ))}

            <View style={styles.addRow}>
              <TextInput
                value={newOption}
                onChangeText={setNewOption}
                placeholder="New option"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.addInput,
                  { backgroundColor: theme.backgroundElement, color: theme.text },
                ]}
                returnKeyType="done"
                onSubmitEditing={submitNewOption}
              />
              <Pressable
                onPress={submitNewOption}
                disabled={!newOption.trim()}
                style={[
                  styles.addButton,
                  { backgroundColor: tint.blue.solidBg, opacity: newOption.trim() ? 1 : 0.5 },
                ]}>
                <ThemedText style={styles.addButtonText}>Add option</ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </ThemedView>
      </SafeAreaView>

      <ModalSheet visible={!!pendingRemoval} onClose={() => setPendingRemoval(null)}>
        {pendingRemoval && (
          <>
            <ThemedText style={styles.removalPrompt}>
              {pendingRemoval.count} task{pendingRemoval.count === 1 ? '' : 's'} use &apos;
              {pendingRemoval.value}&apos; for {field.name}. Choose a replacement value:
            </ThemedText>
            <View style={styles.replacementList}>
              {field.options
                .filter((o) => o !== pendingRemoval.value)
                .map((o) => (
                  <Pressable
                    key={o}
                    onPress={() => confirmReplacement(o)}
                    style={[styles.replacementOption, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText>{o}</ThemedText>
                  </Pressable>
                ))}
            </View>
            <Pressable onPress={() => setPendingRemoval(null)} style={styles.cancelButton}>
              <ThemedText themeColor="textSecondary" style={styles.cancelText}>
                Cancel
              </ThemedText>
            </Pressable>
          </>
        )}
      </ModalSheet>
    </ThemedView>
  );
}

function OptionRow({
  option,
  onRename,
  onRemove,
}: {
  option: string;
  onRename: (newValue: string) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const [draft, setDraft] = useState(option);

  const commit = () => {
    if (draft !== option) onRename(draft);
  };

  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onBlur={commit}
        onSubmitEditing={commit}
        style={[styles.optionInput, { color: theme.text }]}
      />
      <Pressable onPress={onRemove} hitSlop={8} style={styles.removeButton}>
        <ThemedText themeColor="textSecondary" style={styles.removeText}>
          ✕
        </ThemedText>
      </Pressable>
    </View>
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
  nameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: Fonts.semibold,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.five,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  optionInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
  },
  removeButton: {
    padding: Spacing.one,
  },
  removeText: {
    fontSize: 13,
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  addInput: {
    flex: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 15,
  },
  addButton: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: Fonts.semibold,
    fontSize: 14,
  },
  removalPrompt: {
    marginBottom: Spacing.three,
  },
  replacementList: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  replacementOption: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.one,
  },
  cancelText: {
    fontWeight: Fonts.semibold,
  },
});
