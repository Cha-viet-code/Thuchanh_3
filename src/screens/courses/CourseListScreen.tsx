import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import FilterChips from '../../components/common/FilterChips';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import SearchBar from '../../components/common/SearchBar';
import CourseCard from '../../components/course/CourseCard';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { CourseStackParamList, ROUTES } from '../../navigation/routes';
import spacing from '../../theme/spacing';
import type { Course } from '../../types';
import { normalizeText } from '../../utils/text';

type Props = NativeStackScreenProps<CourseStackParamList, typeof ROUTES.COURSE_LIST>;

const ALL = 'all';

export default function CourseListScreen({ navigation }: Props) {
  const { courses } = useAppData();
  const { isOnline } = useSync();
  const [query, setQuery] = useState('');
  const [semester, setSemester] = useState(ALL);

  const semesterOptions = useMemo(() => {
    const semesters = Array.from(new Set((courses.data ?? []).map(c => c.semester)));
    return [{ value: ALL, label: 'Tất cả' }, ...semesters.map(s => ({ value: s, label: s }))];
  }, [courses.data]);

  const filtered = useMemo(() => {
    const keyword = normalizeText(query);
    return (courses.data ?? []).filter(
      c =>
        (semester === ALL || c.semester === semester) &&
        (keyword === '' || normalizeText(c.name).includes(keyword)),
    );
  }, [courses.data, query, semester]);

  const hasFilter = query.trim() !== '' || semester !== ALL;

  const handlePress = useCallback(
    (course: Course) => navigation.navigate(ROUTES.COURSE_DETAIL, { id: course.id }),
    [navigation],
  );
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Course>) => <CourseCard course={item} onPress={handlePress} />,
    [handlePress],
  );
  const keyExtractor = useCallback((item: Course) => String(item.id), []);
  const clearFilters = useCallback(() => {
    setQuery('');
    setSemester(ALL);
  }, []);

  if (courses.loading && courses.data === null) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (courses.data === null) {
    return (
      <ScreenContainer>
        <ErrorView message={courses.error?.message} onRetry={courses.refresh} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.filters}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Tìm môn học theo tên" />
        <FilterChips options={semesterOptions} selected={semester} onSelect={setSemester} />
        <LastUpdatedText timestamp={isOnline ? null : courses.lastUpdated} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          hasFilter ? (
            <EmptyState
              title="Không tìm thấy môn học"
              description="Không có môn học nào khớp với từ khóa hoặc học kỳ đã chọn."
              actionLabel="Xóa bộ lọc"
              onAction={clearFilters}
            />
          ) : (
            <EmptyState title="Chưa có môn học nào" description="Kéo xuống để tải lại." />
          )
        }
        refreshControl={<RefreshControl refreshing={courses.refreshing} onRefresh={courses.refresh} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  list: { flexGrow: 1, padding: spacing.lg },
});
