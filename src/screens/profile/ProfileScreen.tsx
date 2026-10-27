import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import SyncBadge from '../../components/common/SyncBadge';
import GpaSummary from '../../components/grade/GpaSummary';
import InfoRow from '../../components/profile/InfoRow';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { ProfileStackParamList, ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { calcGpa } from '../../utils/gpa';

type Props = NativeStackScreenProps<ProfileStackParamList, typeof ROUTES.PROFILE>;

export default function ProfileScreen({ navigation }: Props) {
  const { student, courses, grades, studentPending, refreshAll } = useAppData();
  const { isOnline } = useSync();

  const summary = useMemo(
    () => calcGpa(grades.data ?? [], courses.data ?? []),
    [grades.data, courses.data],
  );

  if (student.data === null && student.loading) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (student.data === null) {
    return (
      <ScreenContainer>
        <ErrorView message={student.error?.message} onRetry={refreshAll} />
      </ScreenContainer>
    );
  }

  const data = student.data;
  const refreshing = student.refreshing || grades.refreshing;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} />}>
        <LastUpdatedText timestamp={isOnline ? null : student.lastUpdated} />
        <View style={styles.card}>
          <InfoRow label="Mã sinh viên" value={data.studentCode} />
          <InfoRow label="Họ tên" value={data.fullName} />
          <InfoRow label="Lớp" value={data.className} />
          <InfoRow label="Ngành" value={data.major} />
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="Số điện thoại" value={data.phone} />
          <View style={styles.badge}>
            <SyncBadge pending={studentPending} />
          </View>
        </View>

        {grades.data !== null ? (
          <GpaSummary gpa={summary.gpa} totalCredits={summary.totalCredits} />
        ) : null}

        <View style={styles.actions}>
          <AppButton title="Chỉnh sửa thông tin" onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)} />
          <AppButton
            title="Kết quả học tập"
            variant="outline"
            onPress={() => navigation.navigate(ROUTES.GRADE_LIST)}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius,
    padding: spacing.lg,
    borderWidth: spacing.borderWidth,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  badge: { marginTop: spacing.sm },
  actions: { gap: spacing.md },
});
