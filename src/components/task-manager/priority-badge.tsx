import { StyleSheet, Text, View } from 'react-native';

import { ColorPalette, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Priority } from '@/lib/types';

/** Maps priority level to a ColorPalette colorIdx: P1 red, P2 amber, P3 gray. */
export const PRIORITY_COLOR_IDX: Record<Priority, number> = { 1: 3, 2: 6, 3: 5 };

interface PriorityBadgeProps {
  priority: Priority;
  /** Overrides the badge's own fill/border/text so it blends into the card it's shown on, instead of adding more distinct colors. */
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export function PriorityBadge({ priority, backgroundColor, borderColor, textColor }: PriorityBadgeProps) {
  const scheme = useColorScheme();
  const palette = ColorPalette[scheme === 'dark' ? 'dark' : 'light'];
  const colors = palette[PRIORITY_COLOR_IDX[priority]];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: backgroundColor ?? colors.bg,
          borderColor: borderColor ?? colors.border,
        },
      ]}>
      <Text style={[styles.text, { color: textColor ?? colors.text }]}>P{priority}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 9,
    fontWeight: Fonts.bold,
  },
});
