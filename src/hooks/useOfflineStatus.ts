import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-typed';

interface CachedData {
  alerts: any[];
  safeSpaces: any[];
  emergencyContacts: any[];
  lastSync: string;
}

interface OfflineReport {
  id: string;
  title: string;
  category: string;
  description: string;
  severity_level?: string;
  location_name?: string;
  location_country?: string;
  is_anonymous?: boolean;
  queuedAt: string;
  retryCount?: number;
  source?: string;
}

const CACHE_KEY = 'peaceverse_offline_cache';
const OFFLINE_REPORTS_KEY = 'peaceverse_offline_reports';
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
      syncOfflineReports();
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
      const [alertsRes, safeSpacesRes, emergencyContactsRes] = await Promise.all([
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
          .limit(50),
        supabase
          .from('emergency_contacts')
          .select('id, name, phone_number, country_code, category, region, is_verified, priority')
          .eq('is_active', true)
          .order('priority', { ascending: true })
          .limit(100)
      ]);

      const newCache: CachedData = {
        alerts: alertsRes.data || [],
        safeSpaces: safeSpacesRes.data || [],
        emergencyContacts: emergencyContactsRes.data || [],
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
  const queueOfflineReport = useCallback((report: Omit<OfflineReport, 'id' | 'queuedAt'>) => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]');
    const offlineReport: OfflineReport = {
      ...report,
      queuedAt: new Date().toISOString(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
      source: 'offline_queue'
    };
    queue.push(offlineReport);
    localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(queue));
    return queue.length;
  }, []);

  // Sync queued offline reports
  const syncOfflineReports = useCallback(async () => {
    if (!navigator.onLine) return { synced: 0, failed: 0 };
    
    const queue: OfflineReport[] = JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]');
    
    if (queue.length === 0) return { synced: 0, failed: 0 };
    
    let synced = 0;
    let failed = 0;
    const remaining: OfflineReport[] = [];

    for (const report of queue) {
      try {
        const { id, queuedAt, retryCount, ...reportData } = report;
        
        // First try to sync to the offline_report_queue table for tracking
        const { error: queueError } = await supabase
          .from('offline_report_queue')
          .insert({
            report_data: reportData,
            phone_number: 'web_offline',
            status: 'pending',
            source: 'pwa_offline'
          });

        if (queueError) {
          console.warn('Failed to log to offline queue:', queueError);
        }

        // Then submit to citizen_reports
        const { error } = await supabase
          .from('citizen_reports')
          .insert({
            title: reportData.title,
            description: reportData.description,
            category: reportData.category || 'general',
            severity_level: reportData.severity_level || 'medium',
            location_name: reportData.location_name,
            location_country: reportData.location_country || 'Kenya',
            is_anonymous: reportData.is_anonymous ?? false,
            source: 'offline_sync',
            status: 'pending'
          });

        if (error) throw error;
        synced++;
      } catch (error) {
        console.error('Failed to sync offline report:', error);
        // Increment retry count and keep in queue
        remaining.push({
          ...report,
          retryCount: (report.retryCount || 0) + 1
        });
        failed++;
      }
    }

    localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(remaining));
    return { synced, failed };
  }, []);

  // Get pending offline reports count
  const getPendingReportsCount = useCallback(() => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]');
    return queue.length;
  }, []);

  // Get all pending reports
  const getPendingReports = useCallback((): OfflineReport[] => {
    return JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]');
  }, []);

  // Remove a specific report from queue
  const removeFromQueue = useCallback((reportId: string) => {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]');
    const updated = queue.filter((r: OfflineReport) => r.id !== reportId);
    localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(updated));
  }, []);

  // Clear entire queue
  const clearQueue = useCallback(() => {
    localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify([]));
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
    getPendingReportsCount,
    getPendingReports,
    removeFromQueue,
    clearQueue
  };
};
