/**
 * @param {Grade} grade - Bắt buộc (có kèm course đã expand)
 * @param {(grade: Grade) => void} [onPress]
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type { Grade } from '../../types';
import { formatScore } from '../../utils/gpa';

interface GradeRowProps {
  grade: Grade;
  onPress?: (grade: Grade) => void;
}

function GradeRow({ grade, onPress }: GradeRowProps) {
  const name = grade.course?.name ?? `Môn học #${grade.courseId}`;
  const credits = grade.course?.credits ?? 0;
  const failed = grade.letter === 'F';

  return (
    <Pressable
      style={styles.row}
      onPress={onPress ? () => onPress(grade) : undefined}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${credits} tín chỉ, tổng kết ${formatScore(grade.total)}, điểm chữ ${grade.letter}`}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.credits}>{credits} tín chỉ</Text>
      </View>
      <View style={styles.score}>
        <Text style={styles.total}>{formatScore(grade.total)}</Text>
        <Text style={[styles.letter, failed && styles.letterFailed]}>{grade.letter}</Text>
      </View>
    </Pressable>
  );
}

export default React.memo(GradeRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: spacing.minTouch,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: spacing.borderWidth,
    borderColor: colors.border,
  },
  info: { flex: 1, paddingRight: spacing.md },
  name: { ...typography.h3, color: colors.text },
  credits: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  score: { alignItems: 'flex-end' },
  total: { ...typography.h3, color: colors.text },
  letter: { ...typography.bodyBold, color: colors.primary },
  letterFailed: { color: colors.danger },
});
