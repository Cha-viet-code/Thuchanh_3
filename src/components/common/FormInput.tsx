/**
 * @param {string} label - Bắt buộc
 * @param {string} value - Bắt buộc
 * @param {(text: string) => void} onChangeText - Bắt buộc
 * @param {string} [error]
 * @param {KeyboardTypeOptions} [keyboardType='default']
 * @param {string} [placeholder]
 * @param {boolean} [multiline=false]
 * @param {boolean} [editable=true]
 */
import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
}

export default function FormInput({
  label,
  value,
  onChangeText,
  error = null,
  keyboardType = 'default',
  placeholder = '',
  multiline = false,
  editable = true,
}: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, !!error && styles.inputError, !editable && styles.disabled]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        editable={editable}
        accessibilityLabel={label}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.xs },
  input: {
    minHeight: spacing.minTouch,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: spacing.borderWidth,
    borderColor: colors.border,
    borderRadius: spacing.radiusSm,
    paddingHorizontal: spacing.md,
  },
  multiline: { minHeight: spacing.minTouch * 2, textAlignVertical: 'top', paddingTop: spacing.sm },
  inputError: { borderColor: colors.danger },
  disabled: { backgroundColor: colors.background, color: colors.textMuted },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
