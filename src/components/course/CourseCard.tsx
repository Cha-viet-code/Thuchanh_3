/**
 * @param {Course} course - Bắt buộc
 * @param {(course: Course) => void} [onPress]
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  onPress?: (course: Course) => void;
}

function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress ? () => onPress(course) : undefined}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Môn ${course.name}, ${course.credits} tín chỉ`}>
      <View style={styles.header}>
        <Text style={styles.code}>{course.code}</Text>
        <Text style={styles.credits}>{course.credits} tín chỉ</Text>
      </View>
      <Text style={styles.name}>{course.name}</Text>
      <Text style={styles.lecturer}>{course.lecturer}</Text>
    </Pressable>
  );
}

export default React.memo(CourseCard);

const styles = StyleSheet.create({
  card: {
    minHeight: spacing.minTouch,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: spacing.borderWidth,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  code: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  credits: { ...typography.caption, color: colors.textMuted },
  name: { ...typography.h3, color: colors.text },
  lecturer: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
