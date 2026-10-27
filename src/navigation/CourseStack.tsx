import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import CourseListScreen from '../screens/courses/CourseListScreen';
import { ROUTES, CourseStackParamList } from './routes';
import { defaultStackOptions } from './stackOptions';

const Stack = createNativeStackNavigator<CourseStackParamList>();

export default function CourseStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen
        name={ROUTES.COURSE_LIST}
        component={CourseListScreen}
        options={{ title: 'Môn học' }}
      />
      <Stack.Screen
        name={ROUTES.COURSE_DETAIL}
        component={CourseDetailScreen}
        options={{ title: 'Chi tiết môn học' }}
      />
    </Stack.Navigator>
  );
}
