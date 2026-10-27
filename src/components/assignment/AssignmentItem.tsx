/**
 * @param {Assignment} assignment - Bắt buộc (có kèm course đã expand)
 * @param {boolean} [pending=false] - Có thay đổi chưa đồng bộ
 * @param {(assignment: Assignment) => void} [onPress]
 * @param {(assignment: Assignment) => void} onToggleStatus - Bắt buộc
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type { Assignment } from '../../types';
import { formatDateTime, isOverdue } from '../../utils/date';
import SyncBadge from '../common/SyncBadge';
import StatusToggle from './StatusToggle';

interface AssignmentItemProps {
  assignment: Assignment;
  pending?: boolean;
  onPress?: (assignment: Assignment) => void;
  onToggleStatus: (assignment: Assignment) => void;
}

function AssignmentItem({ assignment, pending = false, onPress, onToggleStatus }: AssignmentItemProps) {
  const overdue = isOverdue(assignment.dueDate, assignment.status);
  const done = assignment.status === 'done';

  return (
    <Pressable
      style={styles.card}
      onPress={onPress ? () => onPress(assignment) : undefined}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Bài tập ${assignment.title}, hạn ${formatDateTime(assignment.dueDate)}`}>
      <StatusToggle status={assignment.status} onToggle={() => onToggleStatus(assignment)} />
      <View style={styles.content}>
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
          {assignment.title}
        </Text>
        <Text style={styles.course} numberOfLines={1}>
          {assignment.course?.name ?? `Môn học #${assignment.courseId}`}
        </Text>
        <Text style={[styles.due, overdue && styles.dueOverdue]}>
          Hạn nộp: {formatDateTime(assignment.dueDate)}
          {overdue ? ' · Quá hạn' : ''}
        </Text>
        <SyncBadge pending={pending} />
      </View>
    </Pressable>
  );
}

export default React.memo(AssignmentItem);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: spacing.minTouch,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: spacing.borderWidth,
    borderColor: colors.border,
  },
  content: { flex: 1, paddingVertical: spacing.sm, paddingRight: spacing.sm, gap: spacing.xs },
  title: { ...typography.h3, color: colors.text },
  titleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  course: { ...typography.caption, color: colors.textMuted },
  due: { ...typography.caption, color: colors.text },
  dueOverdue: { color: colors.danger, fontWeight: '700' },
});
