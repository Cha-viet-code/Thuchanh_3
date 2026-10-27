import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../components/common/AppButton';
import FilterChips from '../../components/common/FilterChips';
import FormInput from '../../components/common/FormInput';
import LoadingView from '../../components/common/LoadingView';
import ScreenContainer from '../../components/common/ScreenContainer';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { AssignmentStackParamList, ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
import { parseDateTimeInput, toInputString } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';
import { validateDueDate, validateTitle } from '../../utils/validators';

type Props = NativeStackScreenProps<AssignmentStackParamList, typeof ROUTES.ASSIGNMENT_FORM>;

interface FormErrors {
  title: string | null;
  dueDate: string | null;
  course: string | null;
}

const NO_ERRORS: FormErrors = { title: null, dueDate: null, course: null };

function defaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(23, 59, 0, 0);
  return toInputString(date);
}

export default function AssignmentFormScreen({ navigation }: Props) {
  const { courses, addAssignment } = useAppData();
  const { isOnline } = useSync();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [saving, setSaving] = useState(false);

  const courseOptions = useMemo(
    () => (courses.data ?? []).map(c => ({ value: String(c.id), label: c.code })),
    [courses.data],
  );
  // Mặc định chọn môn đầu tiên.
  const selectedCourse = courseId ?? courseOptions[0]?.value ?? null;
  const selectedCourseName = courses.data?.find(c => String(c.id) === selectedCourse)?.name;

  const handleSubmit = useCallback(async () => {
    const nextErrors: FormErrors = {
      title: validateTitle(title),
      dueDate: validateDueDate(dueDate),
      course: selectedCourse === null ? 'Vui lòng chọn môn học' : null,
    };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.dueDate || nextErrors.course || selectedCourse === null) {
      return;
    }
    const dueIso = parseDateTimeInput(dueDate);
    if (dueIso === null) {
      return;
    }

    setSaving(true);
    try {
      await addAssignment({
        courseId: Number(selectedCourse),
        title: title.trim(),
        description: description.trim(),
        dueDate: dueIso,
      });
      navigation.goBack();
    } catch (e) {
      setSaving(false);
      Alert.alert('Không thể thêm bài tập', getErrorMessage(e));
    }
  }, [title, dueDate, description, selectedCourse, addAssignment, navigation]);

  if (courses.data === null && courses.loading) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <FormInput
        label="Tiêu đề"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
        placeholder="Ví dụ: Thực hành 5"
      />
      <FormInput
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        placeholder="Nội dung bài tập (không bắt buộc)"
        multiline
      />
      <FormInput
        label="Hạn nộp (dd/MM/yyyy HH:mm)"
        value={dueDate}
        onChangeText={setDueDate}
        error={errors.dueDate}
        placeholder="31/12/2026 23:59"
      />
      <Text style={styles.label}>Môn học</Text>
      <FilterChips options={courseOptions} selected={selectedCourse ?? ''} onSelect={setCourseId} />
      {selectedCourseName ? <Text style={styles.courseName}>{selectedCourseName}</Text> : null}
      {errors.course ? <Text style={styles.error}>{errors.course}</Text> : null}

      {!isOnline ? (
        <Text style={styles.note}>
          Bạn đang offline: bài tập sẽ được lưu trên máy và tự đồng bộ khi có mạng.
        </Text>
      ) : null}

      <View style={styles.submit}>
        <AppButton title="Lưu bài tập" onPress={handleSubmit} loading={saving} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.bodyBold, color: colors.text },
  courseName: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
  note: { ...typography.caption, color: colors.warning, marginTop: spacing.md },
  submit: { marginTop: spacing.xl },
});
