import * as assignmentService from '../api/assignmentService';
import * as courseService from '../api/courseService';
import * as gradeService from '../api/gradeService';
import * as sessionService from '../api/sessionService';
import { CACHE_KEYS } from '../storage/keys';
import type { Assignment, Course, Grade, ID, Session } from '../types';
import { isLocalId } from '../utils/id';
import { useCachedQuery } from './useCachedQuery';

// Các hook truy vấn dữ liệu cho màn hình (màn hình không được gọi service/storage trực tiếp).

export function useSessions() {
  return useCachedQuery<Session[]>(CACHE_KEYS.sessions, sessionService.getAll);
}

export function useSessionDetail(id: ID) {
  return useCachedQuery<Session>(CACHE_KEYS.sessionDetail(id), () => sessionService.getById(id));
}

export function useCourseDetail(id: ID) {
  return useCachedQuery<Course>(CACHE_KEYS.courseDetail(id), () => courseService.getById(id));
}

/** Bài tập tạo offline (id tạm) chưa có trên máy chủ nên không gọi API. */
export function useAssignmentDetail(id: ID) {
  const key = isLocalId(id) ? null : CACHE_KEYS.assignmentDetail(id);
  return useCachedQuery<Assignment>(key, () => assignmentService.getById(id));
}

export function useGradeDetail(id: ID) {
  return useCachedQuery<Grade>(CACHE_KEYS.gradeDetail(id), () => gradeService.getById(id));
}
