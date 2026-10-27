import type { ID } from '../types';

const LOCAL_PREFIX = 'local';

/** Tạo id tạm cho bản ghi được tạo khi offline, ví dụ "local-1730000000000-ab12cd". */
export function makeLocalId(): string {
  return `${LOCAL_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isLocalId(id: ID): boolean {
  return String(id).startsWith(`${LOCAL_PREFIX}-`);
}
