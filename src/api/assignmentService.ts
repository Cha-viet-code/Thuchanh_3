import type { Assignment, ID } from '../types';
import { request } from './client';

const RESOURCE = '/assignments';

export function getAll(): Promise<Assignment[]> {
  return request<Assignment[]>('GET', `${RESOURCE}?_expand=course&_sort=dueDate`);
}

export function getById(id: ID): Promise<Assignment> {
  return request<Assignment>('GET', `${RESOURCE}/${id}?_expand=course`);
}

export function update(id: ID, data: Partial<Assignment>): Promise<Assignment> {
  return request<Assignment>('PATCH', `${RESOURCE}/${id}`, data);
}

export function create(data: Omit<Assignment, 'id' | 'course'>): Promise<Assignment> {
  return request<Assignment>('POST', RESOURCE, data);
}
