import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import LastUpdatedText from '../../components/common/LastUpdatedText';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import DaySelector from '../../components/schedule/DaySelector';
import SessionCard from '../../components/schedule/SessionCard';
import { useSync } from '../../context/SyncContext';
import { useSessions } from '../../hooks/useDataQueries';
import { ROUTES, ScheduleStackParamList } from '../../navigation/routes';
import spacing from '../../theme/spacing';
import type { Session } from '../../types';
import { DAY_LABELS, getTodayDayOfWeek } from '../../utils/date';

type Props = NativeStackScreenProps<ScheduleStackParamList, typeof ROUTES.SCHEDULE>;

export default function ScheduleScreen({ navigation }: Props) {
  const sessions = useSessions();
  const { isOnline } = useSync();
  const [selectedDay, setSelectedDay] = useState<number>(getTodayDayOfWeek());

  const daySessions = useMemo(
    () =>
      (sessions.data ?? [])
        .filter(s => s.dayOfWeek === selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [sessions.data, selectedDay],
  );

  const handlePress = useCallback(
    (session: Session) => navigation.navigate(ROUTES.SESSION_DETAIL, { id: session.id }),
    [navigation],
  );
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Session>) => <SessionCard session={item} onPress={handlePress} />,
    [handlePress],
  );
  const keyExtractor = useCallback((item: Session) => String(item.id), []);

  if (sessions.loading && sessions.data === null) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  if (sessions.data === null) {
    return (
      <ScreenContainer>
        <ErrorView message={sessions.error?.message} onRetry={sessions.refresh} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        <LastUpdatedText timestamp={isOnline ? null : sessions.lastUpdated} />
      </View>
      <FlatList
        data={daySessions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title={`Không có buổi học vào ${DAY_LABELS[selectedDay].full}`}
            description="Hãy chọn ngày khác hoặc kéo xuống để tải lại."
          />
        }
        refreshControl={<RefreshControl refreshing={sessions.refreshing} onRefresh={sessions.refresh} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  list: { flexGrow: 1, padding: spacing.lg },
});
