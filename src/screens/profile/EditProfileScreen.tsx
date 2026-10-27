import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import FormInput from '../../components/common/FormInput';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { ProfileStackParamList, ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { getErrorMessage } from '../../utils/errors';
import { validateEmail, validatePhone, validateRequired } from '../../utils/validators';

type Props = NativeStackScreenProps<ProfileStackParamList, typeof ROUTES.EDIT_PROFILE>;

interface FormErrors {
  fullName: string | null;
  className: string | null;
  major: string | null;
  email: string | null;
  phone: string | null;
}

const NO_ERRORS: FormErrors = { fullName: null, className: null, major: null, email: null, phone: null };

export default function EditProfileScreen({ navigation }: Props) {
  const { student, updateStudent } = useAppData();
  const { isOnline } = useSync();

  const initial = student.data;
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [className, setClassName] = useState(initial?.className ?? '');
  const [major, setMajor] = useState(initial?.major ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const next: FormErrors = {
      fullName: validateRequired('Họ tên', fullName),
      className: validateRequired('Lớp', className),
      major: validateRequired('Ngành', major),
      email: validateEmail(email),
      phone: validatePhone(phone),
    };
    setErrors(next);
    if (Object.values(next).some(error => error !== null)) {
      return;
    }

    setSaving(true);
    try {
      await updateStudent({
        fullName: fullName.trim(),
        className: className.trim(),
        major: major.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      navigation.goBack();
    } catch (e) {
      setSaving(false);
      Alert.alert('Không thể lưu thông tin', getErrorMessage(e));
    }
  }, [fullName, className, major, email, phone, updateStudent, navigation]);

  if (initial === null) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <FormInput label="Mã sinh viên" value={initial.studentCode} onChangeText={() => undefined} editable={false} />
      <FormInput label="Họ tên" value={fullName} onChangeText={setFullName} error={errors.fullName} />
      <FormInput label="Lớp" value={className} onChangeText={setClassName} error={errors.className} />
      <FormInput label="Ngành" value={major} onChangeText={setMajor} error={errors.major} />
      <FormInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
      />
      <FormInput
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone}
        keyboardType="phone-pad"
      />

      {!isOnline ? (
        <Text style={styles.note}>
          Bạn đang offline: thay đổi sẽ được lưu trên máy và tự đồng bộ khi có mạng.
        </Text>
      ) : null}

      <View style={styles.submit}>
        <AppButton title="Lưu thay đổi" onPress={handleSave} loading={saving} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  note: { ...typography.caption, color: colors.warning, marginTop: spacing.sm },
  submit: { marginTop: spacing.xl },
});
