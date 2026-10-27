import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NewOutboxAction, OutboxAction } from '../types';
import { STORAGE_KEYS } from './keys';

// Mọi thao tác đọc-ghi hàng đợi chạy lần lượt để không ghi đè lẫn nhau.
let chain: Promise<unknown> = Promise.resolve();

function locked<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task);
  chain = run.catch(() => undefined);
  return run;
}

async function read(): Promise<OutboxAction[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.outbox);
    return raw ? (JSON.parse(raw) as OutboxAction[]) : [];
  } catch {
    return [];
  }
}

async function write(actions: OutboxAction[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.outbox, JSON.stringify(actions));
}

function makeActionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Thêm một thao tác vào cuối hàng đợi (giữ đúng thứ tự thêm vào). */
export function enqueue(action: NewOutboxAction): Promise<OutboxAction> {
  return locked(async () => {
    const created: OutboxAction = {
      ...action,
      id: makeActionId(),
      createdAt: new Date().toISOString(),
    };
    const current = await read();
    await write([...current, created]);
    return created;
  });
}

/** Lấy toàn bộ hàng đợi theo thứ tự thêm vào. */
export function getAll(): Promise<OutboxAction[]> {
  return locked(read);
}

/** Xóa một thao tác khỏi hàng đợi. */
export function remove(id: string): Promise<void> {
  return locked(async () => {
    const current = await read();
    await write(current.filter(a => a.id !== id));
  });
}

/** Thay id tạm bằng id thật trong url của các thao tác còn lại sau khi POST thành công. */
export function replaceInUrls(from: string, to: string): Promise<void> {
  return locked(async () => {
    const current = await read();
    await write(current.map(a => ({ ...a, url: a.url.split(from).join(to) })));
  });
}
