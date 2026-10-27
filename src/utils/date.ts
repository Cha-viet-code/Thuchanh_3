type DateInput = string | number | Date;

const pad = (n: number): string => String(n).padStart(2, '0');

export const DAY_LABELS: Record<number, { short: string; full: string }> = {
  2: { short: 'T2', full: 'Thứ 2' },
  3: { short: 'T3', full: 'Thứ 3' },
  4: { short: 'T4', full: 'Thứ 4' },
  5: { short: 'T5', full: 'Thứ 5' },
  6: { short: 'T6', full: 'Thứ 6' },
  7: { short: 'T7', full: 'Thứ 7' },
  8: { short: 'CN', full: 'Chủ nhật' },
};

/** dd/MM/yyyy */
export function formatDate(value: DateInput): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return '';
  }
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** HH:mm */
export function formatTime(value: DateInput): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return '';
  }
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** HH:mm, dd/MM/yyyy */
export function formatDateTime(value: DateInput): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return '';
  }
  return `${formatTime(d)}, ${formatDate(d)}`;
}

/** Bài chưa xong và hạn nộp đã qua. */
export function isOverdue(dueDate: string, status: string = 'todo'): boolean {
  return status !== 'done' && new Date(dueDate).getTime() < Date.now();
}

/** Số ngày còn lại tới hạn (làm tròn lên, âm nếu đã quá hạn). */
export function daysLeft(dueDate: string): number {
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

/** Đổi Date sang chuỗi nhập liệu "dd/MM/yyyy HH:mm". */
export function toInputString(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Đọc chuỗi "dd/MM/yyyy" hoặc "dd/MM/yyyy HH:mm" (giờ địa phương), trả về ISO 8601.
 * Không hợp lệ thì trả về null. Nếu không nhập giờ thì mặc định 23:59.
 */
export function parseDateTimeInput(text: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/.exec(text.trim());
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const hour = match[4] !== undefined ? Number(match[4]) : 23;
  const minute = match[5] !== undefined ? Number(match[5]) : 59;
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  const valid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute;
  return valid ? date.toISOString() : null;
}

/** Thứ trong tuần theo quy ước đề bài: 2 (Thứ 2) ... 8 (Chủ nhật). */
export function getTodayDayOfWeek(): number {
  const day = new Date().getDay();
  return day === 0 ? 8 : day + 1;
}
