/**
 * @param {number} selectedDay - Bắt buộc: 2 (Thứ 2) ... 8 (Chủ nhật)
 * @param {(day: number) => void} onSelectDay - Bắt buộc
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { DAY_LABELS } from '../../utils/date';

interface DaySelectorProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

const DAYS = [2, 3, 4, 5, 6, 7, 8];

export default function DaySelector({ selectedDay, onSelectDay }: DaySelectorProps) {
  return (
    <View style={styles.row}>
      {DAYS.map(day => {
        const active = day === selectedDay;
        return (
          <Pressable
            key={day}
            style={[styles.day, active && styles.dayActive]}
            onPress={() => onSelectDay(day)}
            accessibilityRole="button"
            accessibilityLabel={`Chọn ${DAY_LABELS[day].full}`}
            accessibilityState={{ selected: active }}>
            <Text style={[styles.label, active && styles.labelActive]}>{DAY_LABELS[day].short}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  day: {
    flex: 1,
    minWidth: spacing.minTouch,
    minHeight: spacing.minTouch,
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.surface,
    borderWidth: spacing.borderWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...typography.bodyBold, color: colors.text },
  labelActive: { color: colors.white },
});
