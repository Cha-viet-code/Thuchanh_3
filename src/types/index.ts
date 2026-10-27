export type ID = number | string;

export interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  className: string;
  major: string;
  email: string;
  phone: string;
  updatedAt: string;
}

export type StudentPatch = Partial<
  Pick<Student, 'fullName' | 'className' | 'major' | 'email' | 'phone'>
>;

export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  lecturer: string;
  description: string;
  semester: string;
}

export interface Session {
  id: number;
  courseId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  note: string;
  course?: Course;
}

export type AssignmentStatus = 'todo' | 'done';

export interface Assignment {
  id: ID;
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  updatedAt: string;
  course?: Course;
}

export interface NewAssignmentInput {
  courseId: number;
  title: string;
  description: string;
  dueDate: string;
}

export interface Grade {
  id: number;
  courseId: number;
  semester: string;
  attendance: number;
  midterm: number;
  final: number;
  total: number;
  letter: string;
  course?: Course;
}

export type ApiErrorType = 'network' | 'timeout' | 'http';

export interface ApiError {
  type: ApiErrorType;
  status: number | null;
  message: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface OutboxAction {
  id: string;
  method: HttpMethod;
  url: string;
  body: unknown;
  createdAt: string;
  entity: 'assignment' | 'student';
  /** Id tạm của bản ghi tạo offline (chỉ có ở thao tác POST). */
  localId?: string;
}

export type NewOutboxAction = Omit<OutboxAction, 'id' | 'createdAt'>;

export interface CacheEntry<T> {
  data: T;
  savedAt: number;
}

export interface Query<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refreshing: boolean;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
}

export interface SyncResult {
  synced: number;
  conflicts: number;
  failed: number;
}
