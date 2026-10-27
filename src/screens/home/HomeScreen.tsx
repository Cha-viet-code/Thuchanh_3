import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AssignmentItem from '../../components/assignment/AssignmentItem';
import AppButton from '../../components/common/AppButton';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import CourseCard from '../../components/course/CourseCard';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { HomeStackParamList, ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import type { Assignment, Course } from '../../types';

type Props = NativeStackScreenProps<HomeStackParamList, typeof ROUTES.HOME>;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function HomeScreen({ navigation }: Props) {
  const { student, courses, assignments, pendingAssignmentIds, toggleAssignment, refreshAll } =
    useAppData();
  const { isOnline, pendingCount, syncing, syncNow } = useSync();

  // Bài tập chưa xong, đến hạn trong 7 ngày tới.
  const dueSoon = useMemo(() => {
    const now = Date.now();
    return (assignments.data ?? []).filter(a => {
      const due = new Date(a.dueDate).getTime();
      return a.status === 'todo' && due >= now && due - now <= WEEK_MS;
    });
  }, [assignments.data]);

  const handleCoursePress = useCallback(
    (course: Course) => navigation.navigate(ROUTES.COURSE_DETAIL, { id: course.id }),
    [navigation],
  );
  const handleAssignmentPress = useCallback(
    (assignment: Assignment) => navigation.navigate(ROUTES.ASSIGNMENT_DETAIL, { id: assignment.id }),
    [navigation],
  );
  const handleToggle = useCallback(
    (assignment: Assignment) => {
      toggleAssignment(assignment.id);
    },
    [toggleAssignment],
  );

  const renderCourse = useCallback(
    ({ item }: ListRenderItemInfo<Course>) => <CourseCard course={item} onPress={handleCoursePress} />,
    [handleCoursePress],
  );
  const keyExtractor = useCallback((item: Course) => String(item.id), []);

  const refreshing = courses.refreshing || student.refreshing || assignments.refreshing;
  const initialLoading = courses.data === null && courses.loading;
  const error = courses.error ?? student.error ?? assignments.error;

  if (initialLoading) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (courses.data === null && error) {
    return (
      <ScreenContainer>
        <ErrorView message={error.message} onRetry={refreshAll} />
      </ScreenContainer>
    );
  }

  const header = (
    <View>
      <View style={styles.profileCard}>
        <Text style={styles.hello}>Xin chào,</Text>
        <Text style={styles.name}>{student.data?.fullName ?? '—'}</Text>
        <Text style={styles.code}>Mã sinh viên: {student.data?.studentCode ?? '—'}</Text>
      </View>
      <LastUpdatedText timestamp={isOnline ? null : courses.lastUpdated} />
      <View style={styles.syncCard}>
        <Text style={styles.syncText}>Thay đổi chưa đồng bộ: {pendingCount}</Text>
        {pendingCount > 0 ? (
          <AppButton
            title="Đồng bộ ngay"
            variant="outline"
            onPress={syncNow}
            loading={syncing}
            disabled={!isOnline}
          />
        ) : null}
      </View>
      <Text style={styles.sectionTitle}>Môn đang học</Text>
    </View>
  );

  const footer = (
    <View>
      <Text style={styles.sectionTitle}>Bài tập đến hạn trong 7 ngày tới</Text>
      {dueSoon.length === 0 ? (
        <Text style={styles.emptyNote}>Không có bài tập nào đến hạn trong 7 ngày tới.</Text>
      ) : (
        dueSoon.map(assignment => (
          <AssignmentItem
            key={String(assignment.id)}
            assignment={assignment}
            pending={pendingAssignmentIds.has(String(assignment.id))}
            onPress={handleAssignmentPress}
            onToggleStatus={handleToggle}
          />
        ))
      )}
    </View>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={courses.data ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderCourse}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={<EmptyState title="Chưa có môn học nào" description="Kéo xuống để tải lại." />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  profileCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radius,
    padding: spacing.lg,
  },
  hello: { ...typography.body, color: colors.primaryLight },
  name: { ...typography.h1, color: colors.white },
  code: { ...typography.body, color: colors.primaryLight, marginTop: spacing.xs },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: spacing.radius,
    borderWidth: spacing.borderWidth,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  syncText: { ...typography.bodyBold, color: colors.text, flexShrink: 1, marginRight: spacing.sm },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  emptyNote: { ...typography.body, color: colors.textMuted },
});
