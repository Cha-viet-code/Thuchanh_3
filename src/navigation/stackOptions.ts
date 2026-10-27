import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import colors from '../theme/colors';

/** Tùy chọn header dùng chung cho cả 5 Native Stack. */
export const defaultStackOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700' },
  headerBackTitle: 'Quay lại',
  contentStyle: { backgroundColor: colors.background },
};
