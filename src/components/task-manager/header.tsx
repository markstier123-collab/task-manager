import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  listName: string;
  onOpenDrawer: () => void;
  onRenameList: (name: string) => void;
}

export function Header({ listName, onOpenDrawer, onRenameList }: HeaderProps) {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(listName);

  const startEditing = () => {
    setDraft(listName);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    onRenameList(draft);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onOpenDrawer}
        hitSlop={8}
        style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <HamburgerIcon color={theme.text} />
      </Pressable>

      <View style={styles.titleWrap}>
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onBlur={commit}
            onSubmitEditing={commit}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            style={[styles.title, styles.titleInput, { color: theme.text, borderColor: theme.border }]}
          />
        ) : (
          <Pressable onPress={startEditing}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {listName}
            </ThemedText>
          </Pressable>
        )}
      </View>
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
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburger: {
    width: 18,
    height: 14,
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
    fontSize: 22,
    lineHeight: 28,
    fontWeight: Fonts.bold,
  },
  titleInput: {
    borderBottomWidth: 1,
    paddingVertical: 0,
  },
});
