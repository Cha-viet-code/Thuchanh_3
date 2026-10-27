import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AssignmentItem from '../../components/assignment/AssignmentItem';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import InfoRow from '../../components/profile/InfoRow';
import SessionCard from '../../components/schedule/SessionCard';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { useCourseDetail, useSessions } from '../../hooks/useDataQueries';
import { DetailScreenParamList, ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type { Assignment } from '../../types';

type Props = NativeStackScreenProps<DetailScreenParamList, typeof ROUTES.COURSE_DETAIL>;

export default function CourseDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const course = useCourseDetail(id);
  const sessions = useSessions();
  const { assignments, pendingAssignmentIds, toggleAssignment } = useAppData();
  const { isOnline } = useSync();

  useEffect(() => {
    navigation.setOptions({ title: course.data?.name ?? 'Chi tiết môn học' });
  }, [navigation, course.data?.name]);

  const courseSessions = useMemo(
    () =>
      (sessions.data ?? [])
        .filter(s => String(s.courseId) === String(id))
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)),
    [sessions.data, id],
  );
  const courseAssignments = useMemo(
    () => (assignments.data ?? []).filter(a => String(a.courseId) === String(id)),
    [assignments.data, id],
  );

  const handleToggle = useCallback(
    (assignment: Assignment) => {
      toggleAssignment(assignment.id);
    },
    [toggleAssignment],
  );

  if (course.loading && course.data === null) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (course.data === null) {
    return (
      <ScreenContainer>
        <ErrorView message={course.error?.message} onRetry={course.refresh} />
      </ScreenContainer>
    );
  }

  const data = course.data;

  return (
    <ScreenContainer scroll>
      <LastUpdatedText timestamp={isOnline ? null : course.lastUpdated} />
      <View style={styles.card}>
        <InfoRow label="Mã môn" value={data.code} />
        <InfoRow label="Tên môn" value={data.name} />
        <InfoRow label="Số tín chỉ" value={String(data.credits)} />
        <InfoRow label="Giảng viên" value={data.lecturer} />
        <InfoRow label="Học kỳ" value={data.semester} />
        <Text style={styles.description}>{data.description}</Text>
      </View>

      <Text style={styles.sectionTitle}>Lịch học</Text>
      {courseSessions.length === 0 ? (
        <Text style={styles.emptyNote}>Môn học này chưa có lịch học.</Text>
      ) : (
        courseSessions.map(session => <SessionCard key={session.id} session={session} showDay />)
      )}

      <Text style={styles.sectionTitle}>Bài tập</Text>
      {courseAssignments.length === 0 ? (
        <Text style={styles.emptyNote}>Môn học này chưa có bài tập.</Text>
      ) : (
        courseAssignments.map(assignment => (
          <AssignmentItem
            key={String(assignment.id)}
            assignment={assignment}
            pending={pendingAssignmentIds.has(String(assignment.id))}
            onToggleStatus={handleToggle}
          />
        ))
      )}
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
  description: { ...typography.body, color: colors.text, marginTop: spacing.md },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyNote: { ...typography.body, color: colors.textMuted },
});
