import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ChevronDownIcon } from '@/components/task-manager/chevron-down-icon';
import { ThemedText } from '@/components/themed-text';
import { Fonts, PillHeight, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FilterDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface Anchor {
  x: number;
  y: number;
  height: number;
}

/** A single "{Label}: {value} ⌄" pill that opens an anchored dropdown of options — used for the built-in filters. */
export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const anchorRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const theme = useTheme();
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  const open = () => {
    anchorRef.current?.measureInWindow((x, y, _width, height) => {
      setAnchor({ x, y, height });
    });
  };

  return (
    <View ref={anchorRef} collapsable={false}>
      <Pressable
        onPress={open}
        style={[styles.trigger, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ThemedText style={[styles.triggerText, { color: theme.textSecondary }]} numberOfLines={1}>
          {label}: {selectedLabel}
        </ThemedText>
        <ChevronDownIcon color={theme.textSecondary} size={9} />
      </Pressable>

      {anchor && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setAnchor(null)}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAnchor(null)}>
            <View
              style={[
                styles.panel,
                {
                  top: anchor.y + anchor.height + 4,
                  left: anchor.x,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setAnchor(null);
                  }}
                  style={[
                    styles.option,
                    option.value === value && { backgroundColor: theme.backgroundSelected },
                  ]}>
                  <ThemedText style={styles.optionText} numberOfLines={1}>
                    {option.label}
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
