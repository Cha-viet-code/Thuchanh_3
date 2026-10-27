import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CacheEntry } from '../types';
import { STORAGE_KEYS } from './keys';

/** Đọc cache; trả về null nếu chưa có hoặc dữ liệu hỏng. */
export async function getCache<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.cachePrefix + key);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    return typeof parsed.savedAt === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

/** Lưu { data, savedAt } và trả về savedAt (ms). */
export async function setCache<T>(key: string, data: T, savedAt: number = Date.now()): Promise<number> {
  const entry: CacheEntry<T> = { data, savedAt };
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.cachePrefix + key, JSON.stringify(entry));
  } catch {
    // Ghi cache thất bại không được làm hỏng luồng chính.
  }
  return savedAt;
}
