import type { ID } from '../types';

/** Tên màn hình khai báo một lần ở đây, không viết chuỗi trực tiếp khi gọi navigate. */
export const ROUTES = {
  // Tab
  HOME_TAB: 'HomeTab',
  COURSE_TAB: 'CourseTab',
  SCHEDULE_TAB: 'ScheduleTab',
  ASSIGNMENT_TAB: 'AssignmentTab',
  PROFILE_TAB: 'ProfileTab',
  // Tổng quan
  HOME: 'Home',
  // Môn học
  COURSE_LIST: 'CourseList',
  COURSE_DETAIL: 'CourseDetail',
  // Thời khóa biểu
  SCHEDULE: 'Schedule',
  SESSION_DETAIL: 'SessionDetail',
  // Bài tập
  ASSIGNMENT_LIST: 'AssignmentList',
  ASSIGNMENT_DETAIL: 'AssignmentDetail',
  ASSIGNMENT_FORM: 'AssignmentForm',
  // Cá nhân
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
  GRADE_LIST: 'GradeList',
  GRADE_DETAIL: 'GradeDetail',
} as const;

/** Màn hình chi tiết chỉ nhận { id } qua route.params. */
export type DetailParams = { id: ID };

export type RootTabParamList = {
  [ROUTES.HOME_TAB]: undefined;
  [ROUTES.COURSE_TAB]: undefined;
  [ROUTES.SCHEDULE_TAB]: undefined;
  [ROUTES.ASSIGNMENT_TAB]: undefined;
  [ROUTES.PROFILE_TAB]: undefined;
};

export type HomeStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.COURSE_DETAIL]: DetailParams;
  [ROUTES.ASSIGNMENT_DETAIL]: DetailParams;
};

export type CourseStackParamList = {
  [ROUTES.COURSE_LIST]: undefined;
  [ROUTES.COURSE_DETAIL]: DetailParams;
};

export type ScheduleStackParamList = {
  [ROUTES.SCHEDULE]: undefined;
  [ROUTES.SESSION_DETAIL]: DetailParams;
};

export type AssignmentStackParamList = {
  [ROUTES.ASSIGNMENT_LIST]: undefined;
  [ROUTES.ASSIGNMENT_DETAIL]: DetailParams;
  [ROUTES.ASSIGNMENT_FORM]: undefined;
};

export type ProfileStackParamList = {
  [ROUTES.PROFILE]: undefined;
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.GRADE_LIST]: undefined;
  [ROUTES.GRADE_DETAIL]: DetailParams;
};

/** Danh sách tham số dùng chung cho các màn hình chi tiết (có mặt ở nhiều Stack). */
export type DetailScreenParamList = {
  [ROUTES.COURSE_DETAIL]: DetailParams;
  [ROUTES.SESSION_DETAIL]: DetailParams;
  [ROUTES.ASSIGNMENT_DETAIL]: DetailParams;
  [ROUTES.GRADE_DETAIL]: DetailParams;
};
