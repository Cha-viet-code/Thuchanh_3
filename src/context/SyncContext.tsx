import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useOutboxSync } from '../hooks/useOutboxSync';
import type { NewOutboxAction, OutboxAction, SyncResult } from '../types';

export interface SyncContextValue {
  isOnline: boolean;
  pendingCount: number;
  pendingActions: OutboxAction[];
  syncing: boolean;
  syncNow: () => Promise<SyncResult | null>;
  enqueueAction: (action: NewOutboxAction) => Promise<OutboxAction>;
  /** Tăng lên mỗi khi vừa đồng bộ xong, để dữ liệu được tải lại. */
  syncVersion: number;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

function buildMessage(result: SyncResult): string {
  const lines: string[] = [];
  if (result.synced > 0) {
    lines.push(`Đã đồng bộ ${result.synced} thay đổi`);
  }
  if (result.conflicts > 0) {
    lines.push(
      `${result.conflicts} thay đổi bị bỏ qua vì dữ liệu trên máy chủ mới hơn (ưu tiên dữ liệu máy chủ)`,
    );
  }
  if (result.failed > 0) {
    lines.push(`${result.failed} thay đổi chưa gửi được, sẽ thử lại sau`);
  }
  return lines.join('\n');
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncVersion, setSyncVersion] = useState(0);

  const handleSynced = useCallback((result: SyncResult) => {
    setSyncVersion(v => v + 1);
    Alert.alert('Đồng bộ', buildMessage(result));
  }, []);

  const sync = useOutboxSync({ onSynced: handleSynced });

  const value = useMemo<SyncContextValue>(
    () => ({
      isOnline: sync.isOnline,
      pendingCount: sync.pendingCount,
      pendingActions: sync.pendingActions,
      syncing: sync.syncing,
      syncNow: sync.syncNow,
      enqueueAction: sync.enqueueAction,
      syncVersion,
    }),
    [
      sync.isOnline,
      sync.pendingCount,
      sync.pendingActions,
      sync.syncing,
      sync.syncNow,
      sync.enqueueAction,
      syncVersion,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const value = useContext(SyncContext);
  if (!value) {
    throw new Error('useSync phải được dùng bên trong SyncProvider');
  }
  return value;
}
