import type { Course, ID } from '../types';
import { request } from './client';

const RESOURCE = '/courses';

export function getAll(): Promise<Course[]> {
  return request<Course[]>('GET', RESOURCE);
}

export function getById(id: ID): Promise<Course> {
  return request<Course>('GET', `${RESOURCE}/${id}`);
}
