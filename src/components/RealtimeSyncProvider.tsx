import { useRealtimeSyncAll, useUserRealtimeSync } from '@/hooks/useRealtimeSync';
import { useAuth } from '@/contexts/AuthContext';

export const RealtimeSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  // Enable global real-time sync for all tables
  useRealtimeSyncAll();
  
  // Enable user-specific real-time sync
  useUserRealtimeSync(user?.id);

  return <>{children}</>;
};
