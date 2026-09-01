import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useFilterTint, useTheme } from '@/hooks/use-theme';
import { guessImportTarget, ImportTarget, importTargetLabel, importTargetOptions } from '@/lib/csv';
import { CustomFieldDef } from '@/lib/types';

interface ImportModalProps {
  visible: boolean;
  header: string[];
  rowCount: number;
  customFields: CustomFieldDef[];
  onConfirm: (mapping: Record<number, ImportTarget>) => void;
  onCancel: () => void;
}

export function ImportModal({
  visible,
  header,
  rowCount,
  customFields,
  onConfirm,
  onCancel,
}: ImportModalProps) {
  const theme = useTheme();
  const tint = useFilterTint();
  const [openColumn, setOpenColumn] = useState<number | null>(null);
  const [mapping, setMapping] = useState<Record<number, ImportTarget>>(() => {
    const initial: Record<number, ImportTarget> = {};
    header.forEach((col, idx) => {
      initial[idx] = guessImportTarget(col, customFields);
    });
    return initial;
  });

  const options = importTargetOptions(customFields);

  return (
    <ModalSheet visible={visible} onClose={onCancel}>
      <ThemedText type="subtitle" style={styles.title}>
        Map columns
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        {rowCount} row{rowCount === 1 ? '' : 's'} detected
      </ThemedText>

      <ScrollView style={styles.list}>
        {header.map((col, idx) => {
          const target = mapping[idx] ?? 'ignore';
          const isOpen = openColumn === idx;
          return (
            <View key={idx} style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.rowMain}>
                <ThemedText numberOfLines={1} style={styles.columnName}>
                  {col || `Column ${idx + 1}`}
                </ThemedText>
                <Pressable
                  onPress={() => setOpenColumn(isOpen ? null : idx)}
                  style={[styles.targetTrigger, { backgroundColor: theme.surface }]}>
                  <ThemedText numberOfLines={1} style={styles.targetLabel}>
                    {importTargetLabel(target, customFields)}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary">▾</ThemedText>
                </Pressable>
              </View>

              {isOpen && (
                <View style={styles.optionList}>
                  {options.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setMapping((prev) => ({ ...prev, [idx]: option.value }));
                        setOpenColumn(null);
                      }}
                      style={[
                        styles.option,
                        option.value === target && { backgroundColor: theme.backgroundSelected },
                      ]}>
                      <ThemedText numberOfLines={1}>{option.label}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable onPress={onCancel} style={styles.cancelButton}>
          <ThemedText themeColor="textSecondary" style={styles.buttonLabel}>
            Cancel
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onConfirm(mapping)}
          style={[styles.importButton, { backgroundColor: tint.blue.solidBg }]}>
          <ThemedText style={[styles.buttonLabel, { color: '#fff' }]}>Import</ThemedText>
        </Pressable>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    marginBottom: Spacing.three,
  },
  list: {
    maxHeight: 380,
  },
  row: {
    borderRadius: Spacing.two,
    padding: Spacing.two,
    marginBottom: Spacing.two,
    gap: Spacing.one,
  },
  rowMain: {
    gap: Spacing.one,
  },
  columnName: {
    fontWeight: Fonts.semibold,
  },
  targetTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
  },
  targetLabel: {
    flex: 1,
  },
  optionList: {
    paddingTop: Spacing.one,
    gap: 2,
  },
  option: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
    borderRadius: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  importButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: Spacing.two,
  },
  buttonLabel: {
    fontWeight: Fonts.semibold,
    fontSize: 14,
  },
});
