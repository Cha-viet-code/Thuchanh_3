import type { Assignment, Course, OutboxAction, Student } from '../types';

const ASSIGNMENT_ITEM_URL = /^\/assignments\/([^/?]+)/;

function sortByDueDate(list: Assignment[]): Assignment[] {
  return [...list].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

/**
 * Áp các thao tác đang chờ trong hàng đợi lên dữ liệu máy chủ để hiển thị.
 * Nhờ vậy giao diện luôn phản ánh thay đổi offline mà không làm bẩn dữ liệu cache.
 */
export function applyAssignmentOutbox(
  base: Assignment[],
  actions: OutboxAction[],
  courses: Course[],
): Assignment[] {
  let result = base;
  for (const action of actions) {
    if (action.entity !== 'assignment') {
      continue;
    }
    if (action.method === 'POST' && action.localId) {
      const body = action.body as Omit<Assignment, 'id' | 'course'>;
      const course = courses.find(c => c.id === body.courseId);
      result = [...result, { ...body, id: action.localId, course }];
    } else if (action.method === 'PATCH') {
      const match = ASSIGNMENT_ITEM_URL.exec(action.url);
      if (!match) {
        continue;
      }
      const id = match[1];
      const patch = action.body as Partial<Assignment>;
      result = result.map(a => (String(a.id) === id ? { ...a, ...patch } : a));
    }
  }
  return result === base ? base : sortByDueDate(result);
}

export function applyStudentOutbox(student: Student | null, actions: OutboxAction[]): Student | null {
  if (!student) {
    return student;
  }
  let result = student;
  for (const action of actions) {
    if (action.entity === 'student' && action.method === 'PATCH') {
      result = { ...result, ...(action.body as Partial<Student>) };
    }
  }
  return result;
}

/** Tập id (dạng chuỗi) các bài tập có thay đổi chưa đồng bộ. */
export function getPendingAssignmentIds(actions: OutboxAction[]): Set<string> {
  const ids = new Set<string>();
  for (const action of actions) {
    if (action.entity !== 'assignment') {
      continue;
    }
    if (action.method === 'POST' && action.localId) {
      ids.add(action.localId);
    } else {
      const match = ASSIGNMENT_ITEM_URL.exec(action.url);
      if (match) {
        ids.add(match[1]);
      }
    }
  }
  return ids;
}
