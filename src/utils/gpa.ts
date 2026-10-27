import type { Course, Grade } from '../types';

/** Quy đổi điểm hệ 10 sang hệ 4 theo bảng của đề bài. */
export function toScale4(score10: number): number {
  if (score10 >= 8.5) {
    return 4.0;
  }
  if (score10 >= 8.0) {
    return 3.5;
  }
  if (score10 >= 7.0) {
    return 3.0;
  }
  if (score10 >= 6.5) {
    return 2.5;
  }
  if (score10 >= 5.5) {
    return 2.0;
  }
  if (score10 >= 5.0) {
    return 1.5;
  }
  if (score10 >= 4.0) {
    return 1.0;
  }
  return 0;
}

/** Quy đổi điểm hệ 10 sang điểm chữ. */
export function toLetter(score10: number): string {
  if (score10 >= 8.5) {
    return 'A';
  }
  if (score10 >= 8.0) {
    return 'B+';
  }
  if (score10 >= 7.0) {
    return 'B';
  }
  if (score10 >= 6.5) {
    return 'C+';
  }
  if (score10 >= 5.5) {
    return 'C';
  }
  if (score10 >= 5.0) {
    return 'D+';
  }
  if (score10 >= 4.0) {
    return 'D';
  }
  return 'F';
}

export function getCredits(grade: Grade, courses: Course[]): number {
  return grade.course?.credits ?? courses.find(c => c.id === grade.courseId)?.credits ?? 0;
}

/**
 * GPA hệ 4 có trọng số theo tín chỉ.
 * totalCredits là số tín chỉ tích lũy: môn điểm F không được tính.
 */
export function calcGpa(
  grades: Grade[],
  courses: Course[],
): { gpa: number; totalCredits: number } {
  let weighted = 0;
  let creditsAll = 0;
  let creditsPassed = 0;
  for (const grade of grades) {
    const credits = getCredits(grade, courses);
    const point = toScale4(grade.total);
    weighted += point * credits;
    creditsAll += credits;
    if (point > 0) {
      creditsPassed += credits;
    }
  }
  return {
    gpa: creditsAll === 0 ? 0 : weighted / creditsAll,
    totalCredits: creditsPassed,
  };
}

/** 8.25 -> "8,25" (kiểu hiển thị tiếng Việt). */
export function formatScore(value: number): string {
  return String(value).replace('.', ',');
}
