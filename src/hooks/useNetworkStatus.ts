import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Chỉ coi là offline khi thiết bị báo rõ ràng là không kết nối.
// (Không dùng isInternetReachable vì json-server chạy trong mạng LAN có thể không ra Internet.)
const toOnline = (state: NetInfoState): boolean => state.isConnected !== false;

export function useNetworkStatus(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    NetInfo.fetch().then(state => {
      if (mounted) {
        setIsOnline(toOnline(state));
      }
    });
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(toOnline(state));
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { isOnline };
}
