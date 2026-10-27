/**
 * @param {string} [message]
 * @param {() => void} onRetry - Bắt buộc: gọi khi bấm nút "Thử lại"
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import AppButton from './AppButton';

interface ErrorViewProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorView({
  message = 'Đã xảy ra lỗi. Vui lòng thử lại.',
  onRetry,
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">
        ⚠️
      </Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.action}>
        <AppButton title="Thử lại" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  icon: { ...typography.iconLarge, marginBottom: spacing.md },
  message: { ...typography.body, color: colors.text, textAlign: 'center' },
  action: { marginTop: spacing.lg },
});
