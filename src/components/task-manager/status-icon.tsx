import { StyleSheet, Text, View } from 'react-native';

import { TaskStatus } from '@/lib/types';

interface StatusIconProps {
  status: TaskStatus;
  color: string;
  size?: number;
}

export function StatusIcon({ status, color, size = 16 }: StatusIconProps) {
  const base = { width: size, height: size, borderRadius: size / 2 };

  if (status === 'not_started') {
    return <View style={[base, styles.ring, { borderColor: color }]} />;
  }

  if (status === 'in_progress') {
    return (
      <View style={[base, styles.ring, styles.clip, { borderColor: color }]}>
        <View
          style={[styles.halfFill, { width: size / 2, backgroundColor: color }]}
        />
      </View>
    );
  }

  if (status === 'blocked') {
    return (
      <View style={[base, styles.ring, styles.centered, { borderColor: color }]}>
        <View
          style={{
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: (size * 0.36) / 2,
            backgroundColor: color,
          }}
        />
      </View>
    );
  }

  if (status === 'completed') {
    return (
      <View style={[base, styles.centered, { backgroundColor: color }]}>
        <Text style={{ color: '#fff', fontSize: size * 0.62, fontWeight: '700' }}>✓</Text>
      </View>
    );
  }

  return (
    <View style={[base, styles.centered, { backgroundColor: color }]}>
      <Text style={{ color: '#fff', fontSize: size * 0.52, fontWeight: '700' }}>✕</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  clip: {
    overflow: 'hidden',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
});
