/**
 * @param {{ value: string, label: string }[]} options - Bắt buộc
 * @param {string} selected - Bắt buộc: value của chip đang chọn
 * @param {(value: string) => void} onSelect - Bắt buộc
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export interface ChipOption {
  value: string;
  label: string;
}

interface FilterChipsProps {
  options: ChipOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {options.map(option => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(option.value)}
            accessibilityRole="button"
            accessibilityLabel={`Lọc ${option.label}`}
            accessibilityState={{ selected: active }}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { paddingVertical: spacing.sm, gap: spacing.sm },
  chip: {
    minHeight: spacing.minTouch,
    minWidth: spacing.minTouch,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.pill,
    borderWidth: spacing.borderWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...typography.body, color: colors.text },
  labelActive: { color: colors.white, fontWeight: '600' },
});
