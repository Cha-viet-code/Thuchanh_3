import type { ID, Student, StudentPatch } from '../types';
import { request } from './client';

const RESOURCE = '/students';

export function getAll(): Promise<Student[]> {
  return request<Student[]>('GET', RESOURCE);
}

export function getById(id: ID): Promise<Student> {
  return request<Student>('GET', `${RESOURCE}/${id}`);
}

export function update(id: ID, data: StudentPatch & { updatedAt?: string }): Promise<Student> {
  return request<Student>('PATCH', `${RESOURCE}/${id}`, data);
}
