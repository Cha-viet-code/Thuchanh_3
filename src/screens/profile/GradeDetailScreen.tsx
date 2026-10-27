import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import InfoRow from '../../components/profile/InfoRow';
import { useSync } from '../../context/SyncContext';
import { useGradeDetail } from '../../hooks/useDataQueries';
import { DetailScreenParamList, ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { formatScore } from '../../utils/gpa';

type Props = NativeStackScreenProps<DetailScreenParamList, typeof ROUTES.GRADE_DETAIL>;

export default function GradeDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const grade = useGradeDetail(id);
  const { isOnline } = useSync();

  useEffect(() => {
    navigation.setOptions({ title: grade.data?.course?.name ?? 'Chi tiết kết quả' });
  }, [navigation, grade.data?.course?.name]);

  if (grade.loading && grade.data === null) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (grade.data === null) {
    return (
      <ScreenContainer>
        <ErrorView message={grade.error?.message} onRetry={grade.refresh} />
      </ScreenContainer>
    );
  }

  const data = grade.data;

  return (
    <ScreenContainer scroll>
      <LastUpdatedText timestamp={isOnline ? null : grade.lastUpdated} />
      <View style={styles.card}>
        <InfoRow label="Môn học" value={data.course?.name ?? `Môn học #${data.courseId}`} />
        <InfoRow label="Số tín chỉ" value={String(data.course?.credits ?? '—')} />
        <InfoRow label="Học kỳ" value={data.semester} />
        <InfoRow label="Điểm chuyên cần (10%)" value={formatScore(data.attendance)} />
        <InfoRow label="Điểm giữa kỳ (30%)" value={formatScore(data.midterm)} />
        <InfoRow label="Điểm cuối kỳ (60%)" value={formatScore(data.final)} />
        <InfoRow label="Điểm tổng kết" value={formatScore(data.total)} />
        <InfoRow label="Điểm chữ" value={data.letter} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.radius,
    padding: spacing.lg,
    borderWidth: spacing.borderWidth,
    borderColor: colors.border,
  },
});
