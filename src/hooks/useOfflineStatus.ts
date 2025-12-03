import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-typed';

interface CachedData {
  alerts: any[];
  safeSpaces: any[];
  emergencyContacts: any[];
  lastSync: string;
}

const CACHE_KEY = 'peaceverse_offline_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load cached data on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setCachedData(data);
        setLastSyncTime(new Date(data.lastSync));
      } catch (e) {
        console.error('Error loading cached data:', e);
      }
    }
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync when coming back online
      syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync critical data for offline use
  const syncData = useCallback(async () => {
    if (!navigator.onLine) return;
    
    setIsSyncing(true);
    try {
      // Fetch critical data for offline access
      const [alertsRes, safeSpacesRes] = await Promise.all([
        supabase
          .from('alert_logs')
          .select('id, title, message, severity, triggered_at, status')
          .eq('status', 'active')
          .order('triggered_at', { ascending: false })
          .limit(20),
        supabase
          .from('safe_spaces')
          .select('id, name, location_name, latitude, longitude, contact_phone, capacity, is_archived')
          .eq('is_archived', false)
          .limit(50)
      ]);

      const newCache: CachedData = {
        alerts: alertsRes.data || [],
        safeSpaces: safeSpacesRes.data || [],
        emergencyContacts: [
          { name: 'Emergency Services', number: '112', country: 'Universal' },
          { name: 'Red Cross', number: '0800-723-253', country: 'Kenya' },
          { name: 'UNHCR Hotline', number: '0800-727-253', country: 'Kenya' },
          { name: 'Police Emergency', number: '999', country: 'Multi' },
          { name: 'Ambulance', number: '114', country: 'Kenya' }
        ],
        lastSync: new Date().toISOString()
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      setCachedData(newCache);
      setLastSyncTime(new Date());
      
      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Check if cache is stale
  const isCacheStale = useCallback(() => {
    if (!lastSyncTime) return true;
    return Date.now() - lastSyncTime.getTime() > CACHE_DURATION;
  }, [lastSyncTime]);

  // Queue offline report for later sync
  const queueOfflineReport = useCallback((report: any) => {
    const queueKey = 'peaceverse_offline_reports';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    queue.push({
      ...report,
      queuedAt: new Date().toISOString(),
      id: `offline_${Date.now()}`
    });
    localStorage.setItem(queueKey, JSON.stringify(queue));
    return queue.length;
  }, []);

  // Sync queued offline reports
  const syncOfflineReports = useCallback(async () => {
    if (!navigator.onLine) return { synced: 0, failed: 0 };
    
    const queueKey = 'peaceverse_offline_reports';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    
    if (queue.length === 0) return { synced: 0, failed: 0 };
    
    let synced = 0;
    let failed = 0;
    const remaining: any[] = [];

    for (const report of queue) {
      try {
        const { id, queuedAt, ...reportData } = report;
        const { error } = await supabase
          .from('citizen_reports')
          .insert({
            ...reportData,
            source: 'offline_sync'
          });

        if (error) throw error;
        synced++;
      } catch (error) {
        console.error('Failed to sync offline report:', error);
        remaining.push(report);
        failed++;
      }
    }

    localStorage.setItem(queueKey, JSON.stringify(remaining));
    return { synced, failed };
  }, []);

  // Get pending offline reports count
  const getPendingReportsCount = useCallback(() => {
    const queueKey = 'peaceverse_offline_reports';
    const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    return queue.length;
  }, []);

  return {
    isOnline,
    cachedData,
    isSyncing,
    lastSyncTime,
    isCacheStale,
    syncData,
    queueOfflineReport,
    syncOfflineReports,
    getPendingReportsCount
  };
};
