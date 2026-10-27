import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import InfoRow from '../../components/profile/InfoRow';
import { useSync } from '../../context/SyncContext';
import { useSessionDetail } from '../../hooks/useDataQueries';
import { DetailScreenParamList, ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { DAY_LABELS } from '../../utils/date';

type Props = NativeStackScreenProps<DetailScreenParamList, typeof ROUTES.SESSION_DETAIL>;

export default function SessionDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const session = useSessionDetail(id);
  const { isOnline } = useSync();

  useEffect(() => {
    navigation.setOptions({ title: session.data?.course?.name ?? 'Chi tiết buổi học' });
  }, [navigation, session.data?.course?.name]);

  if (session.loading && session.data === null) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (session.data === null) {
    return (
      <ScreenContainer>
        <ErrorView message={session.error?.message} onRetry={session.refresh} />
      </ScreenContainer>
    );
  }

  const data = session.data;

  return (
    <ScreenContainer scroll>
      <LastUpdatedText timestamp={isOnline ? null : session.lastUpdated} />
      <View style={styles.card}>
        <InfoRow label="Môn học" value={data.course?.name ?? `Môn học #${data.courseId}`} />
        <InfoRow label="Mã môn" value={data.course?.code ?? '—'} />
        <InfoRow label="Giảng viên" value={data.course?.lecturer ?? '—'} />
        <InfoRow label="Thứ" value={DAY_LABELS[data.dayOfWeek]?.full ?? String(data.dayOfWeek)} />
        <InfoRow label="Thời gian" value={`${data.startTime} – ${data.endTime}`} />
        <InfoRow label="Phòng học" value={data.room} />
        <InfoRow label="Ghi chú" value={data.note === '' ? 'Không có' : data.note} />
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
