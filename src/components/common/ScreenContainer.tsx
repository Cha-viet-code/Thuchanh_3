/**
 * @param {React.ReactNode} children - Bắt buộc
 * @param {boolean} [scroll=false] - Bọc nội dung trong ScrollView
 */
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import OfflineBanner from './OfflineBanner';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
}

export default function ScreenContainer({ children, scroll = false }: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <OfflineBanner />
      {scroll ? (
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={styles.body}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
});
