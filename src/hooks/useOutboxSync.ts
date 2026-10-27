import { useCallback, useEffect, useRef, useState } from 'react';
import { request, toApiError } from '../api/client';
import { enqueue, getAll, remove, replaceInUrls } from '../storage/outbox';
import type { ID, NewOutboxAction, OutboxAction, SyncResult } from '../types';
import { useNetworkStatus } from './useNetworkStatus';

type Outcome = 'synced' | 'conflict' | 'failed' | 'network';

/** Khi còn thao tác chờ mà vẫn có mạng, thử đồng bộ lại sau mỗi khoảng này (ms). */
const RETRY_INTERVAL = 20000;
const LOCAL_ID_PATTERN = /local-\w+-\w+/;

interface UseOutboxSyncOptions {
  /** Gọi sau mỗi lần đồng bộ có thay đổi (thành công hoặc bị bỏ qua do xung đột). */
  onSynced?: (result: SyncResult) => void;
}

/** Xung đột: bản ghi trên máy chủ có updatedAt mới hơn thời điểm người dùng thao tác offline. */
function isServerNewer(serverUpdatedAt: string | undefined, createdAt: string): boolean {
  if (!serverUpdatedAt) {
    return false;
  }
  return new Date(serverUpdatedAt).getTime() > new Date(createdAt).getTime();
}

async function processAction(action: OutboxAction, later: OutboxAction[]): Promise<Outcome> {
  // Thao tác phụ thuộc vào bản ghi tạo offline mà chưa được POST lên máy chủ.
  if (LOCAL_ID_PATTERN.test(action.url)) {
    return 'failed';
  }

  try {
    if (action.method === 'PATCH') {
      const server = await request<{ updatedAt?: string }>('GET', action.url);
      if (isServerNewer(server?.updatedAt, action.createdAt)) {
        // Ưu tiên dữ liệu máy chủ: bỏ thao tác offline.
        await remove(action.id);
        return 'conflict';
      }
      await request('PATCH', action.url, {
        ...(action.body as object),
        updatedAt: action.createdAt,
      });
    } else if (action.method === 'POST') {
      const created = await request<{ id: ID }>('POST', action.url, {
        ...(action.body as object),
        updatedAt: action.createdAt,
      });
      const localId = action.localId;
      if (localId) {
        const realId = String(created.id);
        await replaceInUrls(localId, realId);
        later.forEach(next => {
          next.url = next.url.split(localId).join(realId);
        });
      }
    } else {
      await request(action.method, action.url, action.body);
    }
    await remove(action.id);
    return 'synced';
  } catch (e) {
    const error = toApiError(e);
    if (error.type === 'http') {
      if (error.status === 404 && action.method === 'PATCH') {
        // Bản ghi không còn trên máy chủ: ưu tiên máy chủ.
        await remove(action.id);
        return 'conflict';
      }
      return 'failed';
    }
    return 'network';
  }
}

/**
 * Quản lý hàng đợi thao tác offline:
 * tự đồng bộ khi isOnline chuyển sang true, và thử lại định kỳ nếu còn thao tác chờ.
 */
export function useOutboxSync(options: UseOutboxSyncOptions = {}) {
  const { isOnline } = useNetworkStatus();
  const [pendingActions, setPendingActions] = useState<OutboxAction[]>([]);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  const onSyncedRef = useRef(options.onSynced);
  onSyncedRef.current = options.onSynced;

  const refreshPending = useCallback(async () => {
    setPendingActions(await getAll());
  }, []);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  const enqueueAction = useCallback(
    async (action: NewOutboxAction): Promise<OutboxAction> => {
      const created = await enqueue(action);
      await refreshPending();
      return created;
    },
    [refreshPending],
  );

  const syncNow = useCallback(async (): Promise<SyncResult | null> => {
    if (syncingRef.current || !isOnlineRef.current) {
      return null;
    }
    syncingRef.current = true;
    setSyncing(true);
    const result: SyncResult = { synced: 0, conflicts: 0, failed: 0 };
    try {
      const actions = await getAll();
      for (let i = 0; i < actions.length; i++) {
        const outcome = await processAction(actions[i], actions.slice(i + 1));
        if (outcome === 'synced') {
          result.synced += 1;
        } else if (outcome === 'conflict') {
          result.conflicts += 1;
        } else if (outcome === 'failed') {
          result.failed += 1;
        } else {
          // Mất mạng hoặc máy chủ không phản hồi: dừng lại để giữ đúng thứ tự.
          result.failed += actions.length - i;
          break;
        }
      }
      await refreshPending();
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
    if (result.synced > 0 || result.conflicts > 0) {
      onSyncedRef.current?.(result);
    }
    return result;
  }, [refreshPending]);

  // Có mạng (hoặc mạng trở lại): tự đồng bộ.
  useEffect(() => {
    if (isOnline) {
      syncNow();
    }
  }, [isOnline, syncNow]);

  // Còn thao tác chờ: thử lại định kỳ.
  const pendingCount = pendingActions.length;
  useEffect(() => {
    if (!isOnline || pendingCount === 0) {
      return undefined;
    }
    const timer = setInterval(() => {
      syncNow();
    }, RETRY_INTERVAL);
    return () => clearInterval(timer);
  }, [isOnline, pendingCount, syncNow]);

  return {
    isOnline,
    pendingCount,
    pendingActions,
    syncing,
    syncNow,
    enqueueAction,
    refreshPending,
  };
}
