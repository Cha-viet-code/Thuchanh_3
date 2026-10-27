import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import FilterChips from '../../components/common/FilterChips';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import GpaSummary from '../../components/grade/GpaSummary';
import GradeRow from '../../components/grade/GradeRow';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { ProfileStackParamList, ROUTES } from '../../navigation/routes';
import spacing from '../../theme/spacing';
import type { Grade } from '../../types';
import { calcGpa } from '../../utils/gpa';

type Props = NativeStackScreenProps<ProfileStackParamList, typeof ROUTES.GRADE_LIST>;

const ALL = 'all';

export default function GradeListScreen({ navigation }: Props) {
  const { grades, courses } = useAppData();
  const { isOnline } = useSync();
  const [semester, setSemester] = useState(ALL);

  const semesterOptions = useMemo(() => {
    const semesters = Array.from(new Set((grades.data ?? []).map(g => g.semester)));
    return [{ value: ALL, label: 'Tất cả' }, ...semesters.map(s => ({ value: s, label: s }))];
  }, [grades.data]);

  const filtered = useMemo(
    () => (grades.data ?? []).filter(g => semester === ALL || g.semester === semester),
    [grades.data, semester],
  );

  // GPA và tín chỉ tích lũy tính theo học kỳ đang lọc.
  const summary = useMemo(() => calcGpa(filtered, courses.data ?? []), [filtered, courses.data]);

  const handlePress = useCallback(
    (grade: Grade) => navigation.navigate(ROUTES.GRADE_DETAIL, { id: grade.id }),
    [navigation],
  );
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Grade>) => <GradeRow grade={item} onPress={handlePress} />,
    [handlePress],
  );
  const keyExtractor = useCallback((item: Grade) => String(item.id), []);
  const resetFilter = useCallback(() => setSemester(ALL), []);

  if (grades.loading && grades.data === null) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (grades.data === null) {
    return (
      <ScreenContainer>
        <ErrorView message={grades.error?.message} onRetry={grades.refresh} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <GpaSummary gpa={summary.gpa} totalCredits={summary.totalCredits} />
        <FilterChips options={semesterOptions} selected={semester} onSelect={setSemester} />
        <LastUpdatedText timestamp={isOnline ? null : grades.lastUpdated} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          semester === ALL ? (
            <EmptyState title="Chưa có kết quả học tập" description="Kéo xuống để tải lại." />
          ) : (
            <EmptyState
              title="Không có điểm trong học kỳ này"
              description="Hãy chọn học kỳ khác."
              actionLabel="Xem tất cả"
              onAction={resetFilter}
            />
          )
        }
        refreshControl={<RefreshControl refreshing={grades.refreshing} onRefresh={grades.refresh} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  list: { flexGrow: 1, padding: spacing.lg },
});
