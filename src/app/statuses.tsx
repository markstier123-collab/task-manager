import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ICON_COUNT, PaletteIcon } from '@/components/task-manager/palette-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { COLOR_PALETTE_NAMES, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTaskManagerContext } from '@/context/task-manager-context';
import { useColorPalette, useFilterTint, useTheme } from '@/hooks/use-theme';
import { StatusDef } from '@/lib/types';

type OpenPicker = { statusId: string; kind: 'color' | 'icon' } | null;
type PendingRemoval = { status: StatusDef; count: number } | null;

export default function StatusesScreen() {
  const { currentList, addStatus, updateStatus, removeStatus, reassignAndRemoveStatus } =
    useTaskManagerContext();
  const theme = useTheme();
  const tint = useFilterTint();

  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval>(null);
  const [newStatusName, setNewStatusName] = useState('');

  if (!currentList) {
    return <ThemedView style={styles.container} />;
  }

  const togglePicker = (statusId: string, kind: 'color' | 'icon') => {
    setOpenPicker((prev) =>
      prev && prev.statusId === statusId && prev.kind === kind ? null : { statusId, kind },
    );
  };

  const requestRemove = (status: StatusDef) => {
    const count = currentList.tasks.filter((t) => t.status === status.id).length;
    if (count === 0) {
      removeStatus(status.id);
      return;
    }
    setPendingRemoval({ status, count });
  };

  const confirmReplacement = (replacementId: string) => {
    if (!pendingRemoval) return;
    reassignAndRemoveStatus(pendingRemoval.status.id, replacementId);
    setPendingRemoval(null);
  };

  const submitNewStatus = () => {
    if (!newStatusName.trim()) return;
    addStatus(newStatusName);
    setNewStatusName('');
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
            <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
              {currentList.name} statuses
            </ThemedText>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {currentList.statuses.map((status) => (
              <StatusRow
                key={status.id}
                status={status}
                openPicker={openPicker}
                onTogglePicker={togglePicker}
                onUpdate={(patch) => updateStatus(status.id, patch)}
                onRemove={() => requestRemove(status)}
              />
            ))}

            <View style={styles.addRow}>
              <TextInput
                value={newStatusName}
                onChangeText={setNewStatusName}
                placeholder="New status name"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.addInput,
                  { backgroundColor: theme.backgroundElement, color: theme.text },
                ]}
                returnKeyType="done"
                onSubmitEditing={submitNewStatus}
              />
              <Pressable
                onPress={submitNewStatus}
                disabled={!newStatusName.trim()}
                style={[
                  styles.addButton,
                  { backgroundColor: tint.blue.solidBg, opacity: newStatusName.trim() ? 1 : 0.5 },
                ]}>
                <ThemedText style={styles.addButtonText}>Add status</ThemedText>
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
              {pendingRemoval.status.label}&apos;. Choose a replacement value:
            </ThemedText>
            <View style={styles.replacementList}>
              {currentList.statuses
                .filter((s) => s.id !== pendingRemoval.status.id)
                .map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => confirmReplacement(s.id)}
                    style={[styles.replacementOption, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText>{s.label}</ThemedText>
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

interface StatusRowProps {
  status: StatusDef;
  openPicker: OpenPicker;
  onTogglePicker: (statusId: string, kind: 'color' | 'icon') => void;
  onUpdate: (patch: Partial<StatusDef>) => void;
  onRemove: () => void;
}

function StatusRow({ status, openPicker, onTogglePicker, onUpdate, onRemove }: StatusRowProps) {
  const theme = useTheme();
  const palette = useColorPalette();
  const colors = palette[status.colorIdx];
  const [closedPickerVisible, setClosedPickerVisible] = useState(false);
  const colorPickerOpen = openPicker?.statusId === status.id && openPicker.kind === 'color';
  const iconPickerOpen = openPicker?.statusId === status.id && openPicker.kind === 'icon';

  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.rowMain}>
        <Pressable
          onPress={() => onTogglePicker(status.id, 'color')}
          style={[styles.swatch, { backgroundColor: colors.bg, borderColor: colors.border }]}
        />
        <Pressable
          onPress={() => onTogglePicker(status.id, 'icon')}
          style={[styles.iconSwatch, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <PaletteIcon iconIdx={status.iconIdx} color={colors.accent} size={16} />
        </Pressable>
        <TextInput
          value={status.label}
          onChangeText={(label) => onUpdate({ label })}
          style={[styles.nameInput, { color: theme.text }]}
        />
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeButton}>
          <ThemedText themeColor="textSecondary" style={styles.removeText}>
            ✕
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.rowSecondary}>
        <ThemedText type="small" themeColor="textSecondary">
          Closed
        </ThemedText>
        <Pressable
          onPress={() => setClosedPickerVisible(true)}
          style={[styles.closedTrigger, { backgroundColor: theme.surface }]}>
          <ThemedText type="small">{status.closed ? 'Yes' : 'No'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            ▾
          </ThemedText>
        </Pressable>
      </View>

      {colorPickerOpen && (
        <View style={styles.colorPickerGrid}>
          {COLOR_PALETTE_NAMES.map((name, idx) => (
            <Pressable
              key={name}
              onPress={() => {
                onUpdate({ colorIdx: idx });
                onTogglePicker(status.id, 'color');
              }}
              style={[
                styles.colorOption,
                { backgroundColor: palette[idx].bg, borderColor: palette[idx].border },
                idx === status.colorIdx && styles.optionActive,
              ]}
            />
          ))}
        </View>
      )}

      {iconPickerOpen && (
        <View style={styles.pickerGrid}>
          {Array.from({ length: ICON_COUNT }).map((_, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                onUpdate({ iconIdx: idx });
                onTogglePicker(status.id, 'icon');
              }}
              style={[
                styles.iconOption,
                { backgroundColor: theme.surface },
                idx === status.iconIdx && styles.optionActive,
              ]}>
              <PaletteIcon iconIdx={idx} color={colors.accent} size={16} />
            </Pressable>
          ))}
        </View>
      )}

      <ModalSheet visible={closedPickerVisible} onClose={() => setClosedPickerVisible(false)}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.closedHeading}>
          CLOSED
        </ThemedText>
        {[
          { value: false, label: 'No' },
          { value: true, label: 'Yes' },
        ].map((option) => (
          <Pressable
            key={option.label}
            onPress={() => {
              onUpdate({ closed: option.value });
              setClosedPickerVisible(false);
            }}
            style={[
              styles.closedOption,
              option.value === status.closed && { backgroundColor: theme.backgroundSelected },
            ]}>
            <ThemedText>{option.label}</ThemedText>
          </Pressable>
        ))}
      </ModalSheet>
    </View>
  );
}

const SWATCH_SIZE = 28;

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
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 1.5,
  },
  iconSwatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: Spacing.two,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
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
  rowSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  closedTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.two,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  // Capped to exactly 8 columns so the second row of colors always starts a new line.
  colorPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.one,
    width: SWATCH_SIZE * 8 + Spacing.two * 7,
  },
  colorOption: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOption: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: {
    borderWidth: 3,
    borderColor: '#1f1f1d',
  },
  closedHeading: {
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  closedOption: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
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
