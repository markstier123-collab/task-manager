import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useFilterTint, useTheme } from '@/hooks/use-theme';

interface AddCustomFieldModalProps {
  visible: boolean;
  onCreate: (name: string, options: string[]) => void;
  onClose: () => void;
}

export function AddCustomFieldModal({ visible, onCreate, onClose }: AddCustomFieldModalProps) {
  const [name, setName] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const theme = useTheme();
  const tint = useFilterTint();

  const handleClose = () => {
    setName('');
    setOptionsText('');
    onClose();
  };

  const options = optionsText
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const canSubmit = name.trim().length > 0 && options.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onCreate(name.trim(), options);
    handleClose();
  };

  return (
    <ModalSheet visible={visible} onClose={handleClose}>
      <ThemedText type="subtitle" style={styles.title}>
        New filter group
      </ThemedText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Field name (e.g. Type)"
        placeholderTextColor={theme.textSecondary}
        autoFocus
        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        returnKeyType="next"
      />
      <TextInput
        value={optionsText}
        onChangeText={setOptionsText}
        placeholder="Options, comma separated (e.g. Bug, Feature, Chore)"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <View style={styles.actions}>
        <Pressable onPress={handleClose} style={styles.cancelButton}>
          <ThemedText themeColor="textSecondary" style={styles.buttonLabel}>
            Cancel
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          style={[
            styles.createButton,
            { backgroundColor: tint.blue.solidBg, opacity: canSubmit ? 1 : 0.5 },
          ]}>
          <ThemedText style={[styles.buttonLabel, { color: '#fff' }]}>Create</ThemedText>
        </Pressable>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: Spacing.three,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  createButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: Spacing.two,
  },
  buttonLabel: {
    fontWeight: Fonts.semibold,
    fontSize: 14,
  },
});
