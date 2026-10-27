/**
 * @param {'todo' | 'done'} status - Bắt buộc
 * @param {() => void} onToggle - Bắt buộc: chuyển todo ↔ done
 */
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type { AssignmentStatus } from '../../types';

interface StatusToggleProps {
  status: AssignmentStatus;
  onToggle: () => void;
}

export default function StatusToggle({ status, onToggle }: StatusToggleProps) {
  const done = status === 'done';
  return (
    <Pressable
      style={styles.button}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={done ? 'Đã xong, bấm để đánh dấu chưa xong' : 'Chưa xong, bấm để đánh dấu đã xong'}>
      <Text style={styles.icon}>{done ? '✅' : '⭕'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: spacing.minTouch,
    height: spacing.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { ...typography.icon },
});
