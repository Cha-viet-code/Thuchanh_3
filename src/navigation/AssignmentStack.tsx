import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen';
import AssignmentFormScreen from '../screens/assignments/AssignmentFormScreen';
import AssignmentListScreen from '../screens/assignments/AssignmentListScreen';
import { ROUTES, AssignmentStackParamList } from './routes';
import { defaultStackOptions } from './stackOptions';

const Stack = createNativeStackNavigator<AssignmentStackParamList>();

export default function AssignmentStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen
        name={ROUTES.ASSIGNMENT_LIST}
        component={AssignmentListScreen}
        options={{ title: 'Bài tập' }}
      />
      <Stack.Screen
        name={ROUTES.ASSIGNMENT_DETAIL}
        component={AssignmentDetailScreen}
        options={{ title: 'Chi tiết bài tập' }}
      />
      <Stack.Screen
        name={ROUTES.ASSIGNMENT_FORM}
        component={AssignmentFormScreen}
        options={{ title: 'Thêm bài tập' }}
      />
    </Stack.Navigator>
  );
}
