import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AssignmentItem from '../../components/assignment/AssignmentItem';
import AppButton from '../../components/common/AppButton';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import FilterChips from '../../components/common/FilterChips';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { AssignmentStackParamList, ROUTES } from '../../navigation/routes';
import spacing from '../../theme/spacing';
import type { Assignment } from '../../types';
import { isOverdue } from '../../utils/date';

type Props = NativeStackScreenProps<AssignmentStackParamList, typeof ROUTES.ASSIGNMENT_LIST>;

type Filter = 'all' | 'todo' | 'done' | 'overdue';

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'todo', label: 'Chưa xong' },
  { value: 'done', label: 'Đã xong' },
  { value: 'overdue', label: 'Quá hạn' },
];

export default function AssignmentListScreen({ navigation }: Props) {
  const { assignments, pendingAssignmentIds, toggleAssignment } = useAppData();
  const { isOnline } = useSync();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const list = assignments.data ?? [];
    switch (filter) {
      case 'todo':
        return list.filter(a => a.status === 'todo');
      case 'done':
        return list.filter(a => a.status === 'done');
      case 'overdue':
        return list.filter(a => isOverdue(a.dueDate, a.status));
      default:
        return list;
    }
  }, [assignments.data, filter]);

  const handlePress = useCallback(
    (assignment: Assignment) => navigation.navigate(ROUTES.ASSIGNMENT_DETAIL, { id: assignment.id }),
    [navigation],
  );
  const handleToggle = useCallback(
    (assignment: Assignment) => {
      toggleAssignment(assignment.id);
    },
    [toggleAssignment],
  );
  const handleAdd = useCallback(() => navigation.navigate(ROUTES.ASSIGNMENT_FORM), [navigation]);
  const handleSelectFilter = useCallback((value: string) => setFilter(value as Filter), []);
  const resetFilter = useCallback(() => setFilter('all'), []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Assignment>) => (
      <AssignmentItem
        assignment={item}
        pending={pendingAssignmentIds.has(String(item.id))}
        onPress={handlePress}
        onToggleStatus={handleToggle}
      />
    ),
    [pendingAssignmentIds, handlePress, handleToggle],
  );
  const keyExtractor = useCallback((item: Assignment) => String(item.id), []);

  if (assignments.loading && assignments.data === null) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (assignments.data === null) {
    return (
      <ScreenContainer>
        <ErrorView message={assignments.error?.message} onRetry={assignments.refresh} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppButton title="Thêm bài tập" onPress={handleAdd} />
        <FilterChips options={FILTER_OPTIONS} selected={filter} onSelect={handleSelectFilter} />
        <LastUpdatedText timestamp={isOnline ? null : assignments.lastUpdated} />
      </View>
      <FlatList
        data={filtered}
        extraData={pendingAssignmentIds}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          filter === 'all' ? (
            <EmptyState
              title="Chưa có bài tập nào"
              description="Bấm “Thêm bài tập” để tạo bài tập đầu tiên."
              actionLabel="Thêm bài tập"
              onAction={handleAdd}
            />
          ) : (
            <EmptyState
              title="Không có bài tập phù hợp"
              description="Không có bài tập nào thuộc nhóm đã chọn."
              actionLabel="Xem tất cả"
              onAction={resetFilter}
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={assignments.refreshing} onRefresh={assignments.refresh} />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  list: { flexGrow: 1, padding: spacing.lg },
});
