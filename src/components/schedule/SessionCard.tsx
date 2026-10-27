/**
 * @param {Session} session - Bắt buộc (có kèm course đã expand)
 * @param {(session: Session) => void} [onPress]
 * @param {boolean} [showDay=false] - Hiện thêm thứ trong tuần
 */
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type { Session } from '../../types';
import { DAY_LABELS } from '../../utils/date';

interface SessionCardProps {
  session: Session;
  onPress?: (session: Session) => void;
  showDay?: boolean;
}

function SessionCard({ session, onPress, showDay = false }: SessionCardProps) {
  const courseName = session.course?.name ?? `Môn học #${session.courseId}`;
  const time = `${session.startTime} – ${session.endTime}`;
  const when = showDay ? `${DAY_LABELS[session.dayOfWeek]?.full ?? ''}, ${time}` : time;

  return (
    <Pressable
      style={styles.card}
      onPress={onPress ? () => onPress(session) : undefined}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${courseName}, ${when}, phòng ${session.room}`}>
      <Text style={styles.name}>{courseName}</Text>
      <Text style={styles.time}>{when}</Text>
      <Text style={styles.room}>Phòng: {session.room}</Text>
    </Pressable>
  );
}

export default React.memo(SessionCard);

const styles = StyleSheet.create({
  card: {
    minHeight: spacing.minTouch,
    backgroundColor: colors.surface,
    borderRadius: spacing.radius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: spacing.xs,
    borderLeftColor: colors.primary,
  },
  name: { ...typography.h3, color: colors.text },
  time: { ...typography.bodyBold, color: colors.primary, marginTop: spacing.xs },
  room: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
