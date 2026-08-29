import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useFilterTint, useTheme } from '@/hooks/use-theme';

interface NewListModalProps {
  visible: boolean;
  onCreate: (name: string) => void;
  onClose: () => void;
}

export function NewListModal({ visible, onCreate, onClose }: NewListModalProps) {
  const [name, setName] = useState('');
  const theme = useTheme();
  const tint = useFilterTint();

  const handleClose = () => {
    setName('');
    onClose();
  };

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    handleClose();
  };

  return (
    <ModalSheet visible={visible} onClose={handleClose}>
      <ThemedText type="subtitle" style={styles.title}>
        New task list
      </ThemedText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="List name"
        placeholderTextColor={theme.textSecondary}
        autoFocus
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
          disabled={!name.trim()}
          style={[
            styles.createButton,
            { backgroundColor: tint.blue.solidBg, opacity: name.trim() ? 1 : 0.5 },
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
    fontWeight: '600',
    fontSize: 14,
  },
});
