import { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  align?: 'center' | 'left';
}

export function ModalSheet({ visible, onClose, children, align = 'center' }: ModalSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, align === 'left' ? styles.backdropLeft : styles.backdropCenter]}
        onPress={onClose}>
        <Pressable
          onPress={() => {}}
          style={[
            align === 'left'
              ? [styles.leftPanel, { paddingTop: insets.top + Spacing.four }]
              : styles.centerPanel,
            { backgroundColor: theme.background, borderColor: theme.backgroundSelected },
          ]}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdropLeft: {
    flexDirection: 'row',
  },
  backdropCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  leftPanel: {
    width: '78%',
    maxWidth: 320,
    height: '100%',
    paddingHorizontal: Spacing.three,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  centerPanel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
