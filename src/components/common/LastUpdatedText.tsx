/**
 * @param {string | number | null} [timestamp] - Thời điểm cập nhật; rỗng thì không hiển thị
 */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { formatDateTime } from '../../utils/date';

interface LastUpdatedTextProps {
  timestamp?: string | number | null;
}

export default function LastUpdatedText({ timestamp = null }: LastUpdatedTextProps) {
  if (timestamp === null || timestamp === '') {
    return null;
  }
  return <Text style={styles.text}>Cập nhật lần cuối: {formatDateTime(timestamp)}</Text>;
}

const styles = StyleSheet.create({
  text: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.xs,
  },
});
