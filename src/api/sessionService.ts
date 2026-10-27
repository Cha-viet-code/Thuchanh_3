import type { ID, Session } from '../types';
import { request } from './client';

const RESOURCE = '/sessions';

export function getAll(): Promise<Session[]> {
  return request<Session[]>('GET', `${RESOURCE}?_expand=course`);
}

export function getById(id: ID): Promise<Session> {
  return request<Session>('GET', `${RESOURCE}/${id}?_expand=course`);
}
