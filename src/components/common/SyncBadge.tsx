/**
 * @param {boolean} [pending=false] - true thì hiện nhãn "Chưa đồng bộ"
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface SyncBadgeProps {
  pending?: boolean;
}

export default function SyncBadge({ pending = false }: SyncBadgeProps) {
  if (!pending) {
    return null;
  }
  return (
    <View style={styles.badge} accessibilityLabel="Chưa đồng bộ">
      <Text style={styles.text}>Chưa đồng bộ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: spacing.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: { ...typography.caption, color: colors.warning, fontWeight: '600' },
});
