import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ModalSheet } from '@/components/task-manager/modal-sheet';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { TaskList } from '@/lib/types';

interface ListDrawerProps {
  visible: boolean;
  lists: TaskList[];
  currentListId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function ListDrawer({ visible, lists, currentListId, onSelect, onClose }: ListDrawerProps) {
  const theme = useTheme();

  return (
    <ModalSheet visible={visible} onClose={onClose} align="left">
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.heading}>
        TASK LISTS
      </ThemedText>
      <ScrollView contentContainerStyle={styles.listContent}>
        {lists.map((list) => {
          const active = list.id === currentListId;
          return (
            <Pressable
              key={list.id}
              onPress={() => {
                onSelect(list.id);
                onClose();
              }}
              style={[
                styles.row,
                { backgroundColor: active ? theme.backgroundSelected : 'transparent' },
              ]}>
              <ThemedText numberOfLines={1} style={styles.rowText}>
                {list.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {list.tasks.length}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  heading: {
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  listContent: {
    gap: Spacing.half,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  rowText: {
    flex: 1,
  },
});
