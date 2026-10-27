import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import * as assignmentService from '../api/assignmentService';
import * as courseService from '../api/courseService';
import * as gradeService from '../api/gradeService';
import * as studentService from '../api/studentService';
import { STUDENT_ID } from '../config';
import { useCachedQuery } from '../hooks/useCachedQuery';
import { CACHE_KEYS } from '../storage/keys';
import type {
  Assignment,
  Course,
  Grade,
  ID,
  NewAssignmentInput,
  Query,
  Student,
  StudentPatch,
} from '../types';
import { getErrorMessage } from '../utils/errors';
import { isLocalId, makeLocalId } from '../utils/id';
import {
  applyAssignmentOutbox,
  applyStudentOutbox,
  getPendingAssignmentIds,
} from '../utils/outboxOverlay';
import { useSync } from './SyncContext';

export interface AppDataValue {
  student: Query<Student>;
  courses: Query<Course[]>;
  assignments: Query<Assignment[]>;
  grades: Query<Grade[]>;
  /** Id (dạng chuỗi) của các bài tập có thay đổi chưa đồng bộ. */
  pendingAssignmentIds: Set<string>;
  studentPending: boolean;
  /** Đổi trạng thái bài tập với optimistic update; offline thì đưa vào hàng đợi. */
  toggleAssignment: (id: ID) => Promise<void>;
  /** Thêm bài tập; offline thì đưa vào hàng đợi. Ném lỗi nếu API báo lỗi. */
  addAssignment: (input: NewAssignmentInput) => Promise<void>;
  /** Sửa thông tin cá nhân; offline thì đưa vào hàng đợi. Ném lỗi nếu API báo lỗi. */
  updateStudent: (patch: StudentPatch) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, pendingActions, enqueueAction, syncVersion } = useSync();

  const studentQuery = useCachedQuery<Student>(CACHE_KEYS.student, () =>
    studentService.getById(STUDENT_ID),
  );
  const coursesQuery = useCachedQuery<Course[]>(CACHE_KEYS.courses, courseService.getAll);
  const assignmentsQuery = useCachedQuery<Assignment[]>(
    CACHE_KEYS.assignments,
    assignmentService.getAll,
  );
  const gradesQuery = useCachedQuery<Grade[]>(CACHE_KEYS.grades, gradeService.getAll);

  // Dữ liệu hiển thị = dữ liệu máy chủ + các thao tác offline đang chờ.
  const assignmentsData = useMemo(
    () =>
      assignmentsQuery.data
        ? applyAssignmentOutbox(assignmentsQuery.data, pendingActions, coursesQuery.data ?? [])
        : null,
    [assignmentsQuery.data, pendingActions, coursesQuery.data],
  );
  const studentData = useMemo(
    () => applyStudentOutbox(studentQuery.data, pendingActions),
    [studentQuery.data, pendingActions],
  );
  const pendingAssignmentIds = useMemo(() => getPendingAssignmentIds(pendingActions), [pendingActions]);
  const studentPending = useMemo(
    () => pendingActions.some(a => a.entity === 'student'),
    [pendingActions],
  );

  // Giữ giá trị mới nhất trong ref để các hàm xử lý luôn ổn định.
  const latest = useRef({ isOnline, assignmentsData, studentData, coursesQuery, assignmentsQuery, studentQuery });
  latest.current = { isOnline, assignmentsData, studentData, coursesQuery, assignmentsQuery, studentQuery };

  const refreshAll = useCallback(async () => {
    await Promise.all([
      studentQuery.refresh(),
      coursesQuery.refresh(),
      assignmentsQuery.refresh(),
      gradesQuery.refresh(),
    ]);
  }, [studentQuery.refresh, coursesQuery.refresh, assignmentsQuery.refresh, gradesQuery.refresh]);

  const refreshAllRef = useRef(refreshAll);
  refreshAllRef.current = refreshAll;

  // Vừa đồng bộ xong: tải lại để lấy dữ liệu chuẩn từ máy chủ (kể cả id thật của bài tập mới).
  useEffect(() => {
    if (syncVersion > 0) {
      refreshAllRef.current();
    }
  }, [syncVersion]);

  const toggleAssignment = useCallback(
    async (id: ID) => {
      const { isOnline: online, assignmentsData: list, assignmentsQuery: query } = latest.current;
      const current = list?.find(a => String(a.id) === String(id));
      if (!current) {
        return;
      }
      const nextStatus = current.status === 'done' ? 'todo' : 'done';

      // Offline, hoặc bài tập còn là bản tạo offline chưa có trên máy chủ: đưa vào hàng đợi.
      if (!online || isLocalId(id)) {
        await enqueueAction({
          method: 'PATCH',
          url: `/assignments/${id}`,
          body: { status: nextStatus },
          entity: 'assignment',
        });
        return;
      }

      // Optimistic update: đổi giao diện ngay, lỗi thì hoàn tác.
      const now = new Date().toISOString();
      query.setData(prev =>
        prev
          ? prev.map(a => (String(a.id) === String(id) ? { ...a, status: nextStatus, updatedAt: now } : a))
          : prev,
      );
      try {
        await assignmentService.update(id, { status: nextStatus, updatedAt: now });
      } catch (e) {
        query.setData(prev =>
          prev
            ? prev.map(a =>
                String(a.id) === String(id)
                  ? { ...a, status: current.status, updatedAt: current.updatedAt }
                  : a,
              )
            : prev,
        );
        Alert.alert('Không thể cập nhật bài tập', getErrorMessage(e));
      }
    },
    [enqueueAction],
  );

  const addAssignment = useCallback(
    async (input: NewAssignmentInput) => {
      const { isOnline: online, coursesQuery: courses, assignmentsQuery: query } = latest.current;
      const body = {
        courseId: input.courseId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        status: 'todo' as const,
        updatedAt: new Date().toISOString(),
      };

      if (!online) {
        await enqueueAction({
          method: 'POST',
          url: '/assignments',
          body,
          entity: 'assignment',
          localId: makeLocalId(),
        });
        return;
      }

      const created = await assignmentService.create(body);
      const course = courses.data?.find(c => c.id === created.courseId);
      query.setData(prev =>
        [...(prev ?? []), { ...created, course }].sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        ),
      );
    },
    [enqueueAction],
  );

  const updateStudent = useCallback(
    async (patch: StudentPatch) => {
      const { isOnline: online, studentQuery: query } = latest.current;
      if (!online) {
        await enqueueAction({
          method: 'PATCH',
          url: `/students/${STUDENT_ID}`,
          body: patch,
          entity: 'student',
        });
        return;
      }
      const now = new Date().toISOString();
      const updated = await studentService.update(STUDENT_ID, { ...patch, updatedAt: now });
      query.setData(prev => (prev ? { ...prev, ...updated } : updated));
    },
    [enqueueAction],
  );

  const value = useMemo<AppDataValue>(
    () => ({
      student: {
        data: studentData,
        loading: studentQuery.loading,
        error: studentQuery.error,
        refreshing: studentQuery.refreshing,
        lastUpdated: studentQuery.lastUpdated,
        refresh: studentQuery.refresh,
      },
      courses: {
        data: coursesQuery.data,
        loading: coursesQuery.loading,
        error: coursesQuery.error,
        refreshing: coursesQuery.refreshing,
        lastUpdated: coursesQuery.lastUpdated,
        refresh: coursesQuery.refresh,
      },
      assignments: {
        data: assignmentsData,
        loading: assignmentsQuery.loading,
        error: assignmentsQuery.error,
        refreshing: assignmentsQuery.refreshing,
        lastUpdated: assignmentsQuery.lastUpdated,
        refresh: assignmentsQuery.refresh,
      },
      grades: {
        data: gradesQuery.data,
        loading: gradesQuery.loading,
        error: gradesQuery.error,
        refreshing: gradesQuery.refreshing,
        lastUpdated: gradesQuery.lastUpdated,
        refresh: gradesQuery.refresh,
      },
      pendingAssignmentIds,
      studentPending,
      toggleAssignment,
      addAssignment,
      updateStudent,
      refreshAll,
    }),
    [
      studentData,
      studentQuery.loading,
      studentQuery.error,
      studentQuery.refreshing,
      studentQuery.lastUpdated,
      studentQuery.refresh,
      coursesQuery.data,
      coursesQuery.loading,
      coursesQuery.error,
      coursesQuery.refreshing,
      coursesQuery.lastUpdated,
      coursesQuery.refresh,
      assignmentsData,
      assignmentsQuery.loading,
      assignmentsQuery.error,
      assignmentsQuery.refreshing,
      assignmentsQuery.lastUpdated,
      assignmentsQuery.refresh,
      gradesQuery.data,
      gradesQuery.loading,
      gradesQuery.error,
      gradesQuery.refreshing,
      gradesQuery.lastUpdated,
      gradesQuery.refresh,
      pendingAssignmentIds,
      studentPending,
      toggleAssignment,
      addAssignment,
      updateStudent,
      refreshAll,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('useAppData phải được dùng bên trong AppDataProvider');
  }
  return value;
}
