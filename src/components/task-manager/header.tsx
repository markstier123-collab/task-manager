import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  listName: string;
  onOpenDrawer: () => void;
  onNewList: () => void;
}

export function Header({ listName, onOpenDrawer, onNewList }: HeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Pressable onPress={onOpenDrawer} hitSlop={12} style={styles.iconButton}>
        <HamburgerIcon color={theme.text} />
      </Pressable>

      <View style={styles.titleWrap}>
        <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
          {listName} tasks
        </ThemedText>
      </View>

      <Pressable onPress={onNewList} hitSlop={12} style={styles.newListButton}>
        <ThemedText type="linkPrimary" style={styles.newListText}>
          + New list
        </ThemedText>
      </Pressable>
    </View>
  );
}

function HamburgerIcon({ color }: { color: string }) {
  return (
    <View style={styles.hamburger}>
      <View style={[styles.hamburgerBar, { backgroundColor: color }]} />
      <View style={[styles.hamburgerBar, { backgroundColor: color }]} />
      <View style={[styles.hamburgerBar, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconButton: {
    padding: Spacing.one,
  },
  hamburger: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerBar: {
    height: 2,
    borderRadius: 1,
    width: '100%',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
  },
  newListButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  newListText: {
    fontWeight: '600',
  },
});
