/**
 * @param {string} label - Bắt buộc
 * @param {string} value - Bắt buộc
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface InfoRowProps {
  label: string;
  value: string;
}

export default function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.row} accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: spacing.minTouch,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: spacing.borderWidth,
    borderBottomColor: colors.border,
  },
  label: { ...typography.body, color: colors.textMuted, flex: 2 },
  value: { ...typography.bodyBold, color: colors.text, flex: 3, textAlign: 'right' },
});
