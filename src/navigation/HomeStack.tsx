import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import HomeScreen from '../screens/home/HomeScreen';
import { ROUTES, HomeStackParamList } from './routes';
import { defaultStackOptions } from './stackOptions';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: 'Tổng quan' }} />
      <Stack.Screen
        name={ROUTES.COURSE_DETAIL}
        component={CourseDetailScreen}
        options={{ title: 'Chi tiết môn học' }}
      />
      <Stack.Screen
        name={ROUTES.ASSIGNMENT_DETAIL}
        component={AssignmentDetailScreen}
        options={{ title: 'Chi tiết bài tập' }}
      />
    </Stack.Navigator>
  );
}