import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError } from '../api/client';
import { CACHE_TTL } from '../config';
import { getCache, setCache } from '../storage/cache';
import type { ApiError } from '../types';
import { useNetworkStatus } from './useNetworkStatus';

// Thời điểm tải API thành công gần nhất của từng khóa (chỉ trong phiên chạy hiện tại).
const lastFetched = new Map<string, number>();

export interface CachedQueryResult<T> {
  data: T | null;
  loading: boolean;
  /** Chỉ có giá trị khi chưa có dữ liệu nào để hiển thị (kể cả từ cache). */
  error: ApiError | null;
  refreshing: boolean;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  /** Cập nhật dữ liệu tại chỗ (dùng cho optimistic update) và ghi lại vào cache. */
  setData: (updater: (previous: T | null) => T | null) => void;
}

const OFFLINE_ERROR: ApiError = {
  type: 'network',
  status: null,
  message: 'Bạn đang offline và chưa có dữ liệu đã lưu. Hãy kết nối mạng rồi thử lại.',
};

/**
 * Chiến lược "cache trước, mạng sau":
 * hiển thị ngay dữ liệu trong cache, sau đó gọi API để cập nhật nếu có mạng.
 * Truyền key = null để tắt truy vấn.
 */
export function useCachedQuery<T>(key: string | null, fetcher: () => Promise<T>): CachedQueryResult<T> {
  const { isOnline } = useNetworkStatus();
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(key !== null);
  const [error, setError] = useState<ApiError | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const keyRef = useRef(key);
  const dataRef = useRef<T | null>(null);
  const lastUpdatedRef = useRef<number | null>(null);
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  const wasOnlineRef = useRef(isOnline);

  const applyData = useCallback((next: T | null, savedAt: number | null) => {
    dataRef.current = next;
    lastUpdatedRef.current = savedAt;
    setDataState(next);
    setLastUpdated(savedAt);
  }, []);

  const fetchRemote = useCallback(
    async (target: string): Promise<boolean> => {
      try {
        const result = await fetcherRef.current();
        if (keyRef.current !== target) {
          return false;
        }
        const savedAt = await setCache(target, result);
        lastFetched.set(target, Date.now());
        applyData(result, savedAt);
        setError(null);
        return true;
      } catch (e) {
        if (keyRef.current === target) {
          setError(toApiError(e));
        }
        return false;
      }
    },
    [applyData],
  );

  // Tải khi mở màn hình hoặc khi đổi khóa.
  useEffect(() => {
    keyRef.current = key;
    if (key === null) {
      applyData(null, null);
      setError(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const cached = await getCache<T>(key);
      if (cancelled) {
        return;
      }
      if (cached) {
        applyData(cached.data, cached.savedAt);
        setLoading(false);
      } else {
        applyData(null, null);
      }

      const fetchedAt = lastFetched.get(key);
      const isFresh = fetchedAt !== undefined && Date.now() - fetchedAt < CACHE_TTL;
      if (cached && isFresh) {
        // Vừa tải xong cách đây ít lâu, không cần gọi lại API.
      } else if (isOnlineRef.current) {
        await fetchRemote(key);
      } else if (!cached) {
        setError(OFFLINE_ERROR);
      }
      if (!cancelled) {
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, applyData, fetchRemote]);

  // Có mạng trở lại: tải lại để cập nhật dữ liệu.
  useEffect(() => {
    const cameBack = isOnline && !wasOnlineRef.current;
    wasOnlineRef.current = isOnline;
    if (cameBack && keyRef.current !== null) {
      fetchRemote(keyRef.current);
    }
  }, [isOnline, fetchRemote]);

  const refresh = useCallback(async () => {
    const target = keyRef.current;
    if (target === null) {
      return;
    }
    setRefreshing(true);
    if (isOnlineRef.current) {
      await fetchRemote(target);
    }
    setRefreshing(false);
  }, [fetchRemote]);

  const setData = useCallback(
    (updater: (previous: T | null) => T | null) => {
      const next = updater(dataRef.current);
      const savedAt = lastUpdatedRef.current;
      applyData(next, savedAt);
      const target = keyRef.current;
      if (target !== null && next !== null) {
        // Giữ nguyên savedAt: đây là thay đổi cục bộ, không phải lần tải mới.
        setCache(target, next, savedAt ?? Date.now());
      }
    },
    [applyData],
  );

  return {
    data,
    loading,
    error: data === null ? error : null,
    refreshing,
    lastUpdated,
    refresh,
    setData,
  };
}
