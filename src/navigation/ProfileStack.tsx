import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import GradeDetailScreen from '../screens/profile/GradeDetailScreen';
import GradeListScreen from '../screens/profile/GradeListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { ROUTES, ProfileStackParamList } from './routes';
import { defaultStackOptions } from './stackOptions';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ title: 'Cá nhân' }} />
      <Stack.Screen
        name={ROUTES.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{ title: 'Chỉnh sửa thông tin' }}
      />
      <Stack.Screen
        name={ROUTES.GRADE_LIST}
        component={GradeListScreen}
        options={{ title: 'Kết quả học tập' }}
      />
      <Stack.Screen
        name={ROUTES.GRADE_DETAIL}
        component={GradeDetailScreen}
        options={{ title: 'Chi tiết kết quả' }}
      />
    </Stack.Navigator>
  );
}
