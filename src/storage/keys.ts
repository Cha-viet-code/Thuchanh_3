import type { ID } from '../types';

export const STORAGE_KEYS = {
  /** Mọi khóa cache có dạng "cache:<tên>", ví dụ "cache:courses". */
  cachePrefix: 'cache:',
  outbox: 'outbox',
};

/** Tên (không gồm tiền tố "cache:") của từng loại dữ liệu được lưu đệm. */
export const CACHE_KEYS = {
  student: 'student',
  courses: 'courses',
  sessions: 'sessions',
  assignments: 'assignments',
  grades: 'grades',
  courseDetail: (id: ID) => `courses/${id}`,
  sessionDetail: (id: ID) => `sessions/${id}`,
  assignmentDetail: (id: ID) => `assignments/${id}`,
  gradeDetail: (id: ID) => `grades/${id}`,
};
