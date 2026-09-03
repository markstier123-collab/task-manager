import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ChevronDownIcon } from '@/components/task-manager/chevron-down-icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, PillHeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDropdownTop } from '@/lib/dropdown-position';
import { CustomFieldDef } from '@/lib/types';

interface CustomFilterDropdownProps {
  field: CustomFieldDef;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

interface Anchor {
  x: number;
  y: number;
  height: number;
}

export function CustomFilterDropdown({ field, value, onChange, onRemove }: CustomFilterDropdownProps) {
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  const selectionLabel = value === 'any' ? 'Any' : value;

  const open = () => {
    anchorRef.current?.measureInWindow((x, y, _width, height) => {
      setAnchor({ x, y, height });
    });
  };

  return (
    <View style={styles.wrap}>
      <View ref={anchorRef} collapsable={false}>
        <Pressable
          onPress={open}
          style={[styles.trigger, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText style={[styles.triggerText, { color: theme.textSecondary }]} numberOfLines={1}>
            {field.name}: {selectionLabel}
          </ThemedText>
          <ChevronDownIcon color={theme.textSecondary} size={9} />
        </Pressable>
      </View>
      <Pressable onPress={onRemove} hitSlop={8} style={styles.removeButton}>
        <ThemedText themeColor="textSecondary" style={styles.removeText}>
          ✕
        </ThemedText>
      </Pressable>

      {anchor && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setAnchor(null)}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAnchor(null)}>
            <View
              style={[
                styles.panel,
                {
                  top: getDropdownTop(anchor.y, anchor.height, field.options.length + 1, windowHeight),
                  left: anchor.x,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <Pressable
                onPress={() => {
                  onChange('any');
                  setAnchor(null);
                }}
                style={[styles.option, value === 'any' && { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText themeColor="textSecondary" style={styles.optionText}>
                  Any
                </ThemedText>
              </Pressable>
              {field.options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    onChange(option);
                    setAnchor(null);
                  }}
                  style={[styles.option, value === option && { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText style={styles.optionText} numberOfLines={1}>
                    {option}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: PillHeight,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 200,
  },
  triggerText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: Fonts.semibold,
  },
  removeButton: {
    padding: 2,
  },
  removeText: {
    fontSize: 12,
  },
  panel: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
    minWidth: 160,
    maxWidth: 240,
  },
  option: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  optionText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: Fonts.semibold,
  },
});
