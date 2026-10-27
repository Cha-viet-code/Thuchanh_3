import type { Grade, ID } from '../types';
import { request } from './client';

const RESOURCE = '/grades';

export function getAll(): Promise<Grade[]> {
  return request<Grade[]>('GET', `${RESOURCE}?_expand=course`);
}

export function getById(id: ID): Promise<Grade> {
  return request<Grade>('GET', `${RESOURCE}/${id}?_expand=course`);
}
