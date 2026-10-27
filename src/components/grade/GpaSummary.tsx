/**
 * @param {number} gpa - Bắt buộc: GPA hệ 4
 * @param {number} totalCredits - Bắt buộc: tổng tín chỉ tích lũy
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface GpaSummaryProps {
  gpa: number;
  totalCredits: number;
}

export default function GpaSummary({ gpa, totalCredits }: GpaSummaryProps) {
  const gpaText = gpa.toFixed(2).replace('.', ',');
  return (
    <View style={styles.container} accessibilityLabel={`GPA ${gpaText}, ${totalCredits} tín chỉ tích lũy`}>
      <View style={styles.cell}>
        <Text style={styles.value}>{gpaText}</Text>
        <Text style={styles.label}>GPA (hệ 4)</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.cell}>
        <Text style={styles.value}>{totalCredits}</Text>
        <Text style={styles.label}>Tín chỉ tích lũy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: spacing.radius,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  cell: { flex: 1, alignItems: 'center' },
  divider: { width: spacing.borderWidth, backgroundColor: colors.primaryLight },
  value: { ...typography.h1, color: colors.white },
  label: { ...typography.caption, color: colors.primaryLight },
});
