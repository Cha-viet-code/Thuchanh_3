import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import StatusToggle from '../../components/assignment/StatusToggle';
import AppButton from '../../components/common/AppButton';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import SyncBadge from '../../components/common/SyncBadge';
import InfoRow from '../../components/profile/InfoRow';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { useAssignmentDetail } from '../../hooks/useDataQueries';
import { DetailScreenParamList, ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import type { Assignment } from '../../types';
import { formatDateTime, isOverdue } from '../../utils/date';

type Props = NativeStackScreenProps<DetailScreenParamList, typeof ROUTES.ASSIGNMENT_DETAIL>;

export default function AssignmentDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const detail = useAssignmentDetail(id);
  const { assignments, pendingAssignmentIds, toggleAssignment } = useAppData();
  const { isOnline } = useSync();

  // Trạng thái trong Context luôn mới nhất (kể cả thay đổi offline), nên ưu tiên khi hiển thị.
  const assignment = useMemo<Assignment | null>(() => {
    const fromContext = assignments.data?.find(a => String(a.id) === String(id)) ?? null;
    if (detail.data && fromContext) {
      return { ...detail.data, status: fromContext.status, updatedAt: fromContext.updatedAt };
    }
    return detail.data ?? fromContext;
  }, [detail.data, assignments.data, id]);

  useEffect(() => {
    navigation.setOptions({ title: assignment?.title ?? 'Chi tiết bài tập' });
  }, [navigation, assignment?.title]);

  if (assignment === null && detail.loading) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (assignment === null) {
    return (
      <ScreenContainer>
        {detail.error ? (
          <ErrorView message={detail.error.message} onRetry={detail.refresh} />
        ) : (
          <EmptyState title="Không tìm thấy bài tập" description="Bài tập này có thể đã bị xóa." />
        )}
      </ScreenContainer>
    );
  }

  const done = assignment.status === 'done';
  const overdue = isOverdue(assignment.dueDate, assignment.status);
  const pending = pendingAssignmentIds.has(String(assignment.id));

  return (
    <ScreenContainer scroll>
      <LastUpdatedText timestamp={isOnline ? null : detail.lastUpdated} />
      <View style={styles.card}>
        <InfoRow label="Tiêu đề" value={assignment.title} />
        <InfoRow
          label="Môn học"
          value={assignment.course ? `${assignment.course.code} – ${assignment.course.name}` : `#${assignment.courseId}`}
        />
        <InfoRow
          label="Hạn nộp"
          value={`${formatDateTime(assignment.dueDate)}${overdue ? ' (Quá hạn)' : ''}`}
        />
        <InfoRow label="Trạng thái" value={done ? 'Đã xong' : 'Chưa xong'} />
        <InfoRow label="Mô tả" value={assignment.description === '' ? 'Không có' : assignment.description} />
        <View style={styles.badge}>
          <SyncBadge pending={pending} />
        </View>
      </View>
      <View style={styles.actions}>
        <StatusToggle status={assignment.status} onToggle={() => toggleAssignment(assignment.id)} />
        <View style={styles.actionButton}>
          <AppButton
            title={done ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'}
            variant={done ? 'outline' : 'primary'}
            onPress={() => toggleAssignment(assignment.id)}
          />
        </View>
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
  badge: { marginTop: spacing.md },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  actionButton: { flex: 1, marginLeft: spacing.sm },
});
