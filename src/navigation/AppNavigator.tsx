import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppData } from '../context/AppDataContext';
import colors from '../theme/colors';
import typography from '../theme/typography';
import AssignmentStack from './AssignmentStack';
import CourseStack from './CourseStack';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import ScheduleStack from './ScheduleStack';
import { ROUTES, RootTabParamList } from './routes';

const Tab = createBottomTabNavigator<RootTabParamList>();

function makeTabIcon(symbol: string) {
  return function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={[styles.icon, !focused && styles.iconInactive]}>{symbol}</Text>;
  };
}

const HomeIcon = makeTabIcon('🏠');
const CourseIcon = makeTabIcon('📚');
const ScheduleIcon = makeTabIcon('🗓️');
const AssignmentIcon = makeTabIcon('📝');
const ProfileIcon = makeTabIcon('👤');

export default function AppNavigator() {
  const { assignments } = useAppData();

  // Số bài tập chưa hoàn thành, hiển thị làm badge của tab Bài tập.
  const unfinished = useMemo(
    () => (assignments.data ?? []).filter(a => a.status === 'todo').length,
    [assignments.data],
  );

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: typography.tabLabel,
        }}>
        <Tab.Screen
          name={ROUTES.HOME_TAB}
          component={HomeStack}
          options={{ tabBarLabel: 'Tổng quan', tabBarIcon: HomeIcon }}
        />
        <Tab.Screen
          name={ROUTES.COURSE_TAB}
          component={CourseStack}
          options={{ tabBarLabel: 'Môn học', tabBarIcon: CourseIcon }}
        />
        <Tab.Screen
          name={ROUTES.SCHEDULE_TAB}
          component={ScheduleStack}
          options={{ tabBarLabel: 'Thời khóa biểu', tabBarIcon: ScheduleIcon }}
        />
        <Tab.Screen
          name={ROUTES.ASSIGNMENT_TAB}
          component={AssignmentStack}
          options={{
            tabBarLabel: 'Bài tập',
            tabBarIcon: AssignmentIcon,
            tabBarBadge: unfinished > 0 ? unfinished : undefined,
          }}
        />
        <Tab.Screen
          name={ROUTES.PROFILE_TAB}
          component={ProfileStack}
          options={{ tabBarLabel: 'Cá nhân', tabBarIcon: ProfileIcon }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  icon: { ...typography.icon },
  iconInactive: { opacity: 0.5 },
});
