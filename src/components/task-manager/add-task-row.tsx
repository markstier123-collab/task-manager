import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useFilterTint, useTheme } from '@/hooks/use-theme';

interface AddTaskRowProps {
  onAdd: (label: string) => void;
}

export function AddTaskRow({ onAdd }: AddTaskRowProps) {
  const [label, setLabel] = useState('');
  const theme = useTheme();
  const tint = useFilterTint();

  const submit = () => {
    if (!label.trim()) return;
    onAdd(label);
    setLabel('');
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Add a task…"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <Pressable
        onPress={submit}
        disabled={!label.trim()}
        style={[
          styles.button,
          { backgroundColor: tint.blue.solidBg, opacity: label.trim() ? 1 : 0.5 },
        ]}>
        <ThemedText style={styles.buttonText}>Add task</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
