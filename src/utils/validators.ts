import { parseDateTimeInput } from './date';

/** Mỗi hàm trả về chuỗi lỗi (tiếng Việt) hoặc null nếu hợp lệ. */

export function validateRequired(label: string, value: string): string | null {
  return value.trim() === '' ? `${label} không được để trống` : null;
}

export function validateTitle(value: string): string | null {
  return validateRequired('Tiêu đề', value);
}

export function validateDueDate(text: string): string | null {
  if (text.trim() === '') {
    return 'Hạn nộp không được để trống';
  }
  const iso = parseDateTimeInput(text);
  if (iso === null) {
    return 'Hạn nộp phải có dạng dd/MM/yyyy HH:mm';
  }
  if (new Date(iso).getTime() < Date.now()) {
    return 'Hạn nộp không được ở quá khứ';
  }
  return null;
}

export function validateEmail(value: string): string | null {
  if (value.trim() === '') {
    return 'Email không được để trống';
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Email không hợp lệ';
}

export function validatePhone(value: string): string | null {
  if (value.trim() === '') {
    return 'Số điện thoại không được để trống';
  }
  return /^0\d{9,10}$/.test(value.trim()) ? null : 'Số điện thoại phải gồm 10–11 chữ số, bắt đầu bằng 0';
}
