import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export interface RealtimeAlert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  triggered_at: string;
  status: string;
  context_data?: any;
}

export const useRealtimeAlerts = () => {
  const [activeAlerts, setActiveAlerts] = useState<RealtimeAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<RealtimeAlert | null>(null);
  const queryClient = useQueryClient();

  const showAlertToast = useCallback((alert: RealtimeAlert) => {
    const toastOptions = {
      description: alert.message,
      duration: alert.severity === 'critical' ? 15000 : 8000,
      action: {
        label: 'View Details',
        onClick: () => {
          window.location.href = '/early-warning';
        },
      },
    };

    switch (alert.severity) {
      case 'critical':
        toast.error(`🚨 CRITICAL: ${alert.title}`, toastOptions);
        break;
      case 'high':
        toast.warning(`⚠️ HIGH ALERT: ${alert.title}`, toastOptions);
        break;
      case 'medium':
        toast.info(`📢 ${alert.title}`, toastOptions);
        break;
      default:
        toast(`📋 ${alert.title}`, toastOptions);
    }
  }, []);

  useEffect(() => {
    console.log('Setting up real-time alert subscriptions...');

    // Subscribe to alert_logs table
    const alertChannel = supabase
      .channel('realtime-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alert_logs',
        },
        (payload) => {
          console.log('New alert received:', payload.new);
          const newAlert = payload.new as RealtimeAlert;
          setLatestAlert(newAlert);
          setActiveAlerts((prev) => [newAlert, ...prev].slice(0, 10));
          showAlertToast(newAlert);
          queryClient.invalidateQueries({ queryKey: ['alert-logs'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alert_logs',
        },
        (payload) => {
          console.log('Alert updated:', payload.new);
          const updatedAlert = payload.new as RealtimeAlert;
          setActiveAlerts((prev) =>
            prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a))
          );
          queryClient.invalidateQueries({ queryKey: ['alert-logs'] });
          
          if (updatedAlert.status === 'resolved') {
            toast.success(`✅ Alert Resolved: ${updatedAlert.title}`);
          }
        }
      )
      .subscribe();

    // Subscribe to incident risk scores
    const riskChannel = supabase
      .channel('realtime-risk-scores')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incident_risk_scores',
        },
        (payload) => {
          console.log('New risk score:', payload.new);
          const riskScore = payload.new as any;
          
          if (riskScore.threat_level === 'critical' || riskScore.overall_risk_score >= 80) {
            toast.error(`🔴 Critical Risk Detected`, {
              description: `Threat Level: ${riskScore.threat_level} | Score: ${riskScore.overall_risk_score}%`,
              duration: 12000,
            });
          } else if (riskScore.threat_level === 'high' || riskScore.overall_risk_score >= 60) {
            toast.warning(`🟠 High Risk Incident`, {
              description: `Risk Score: ${riskScore.overall_risk_score}%`,
              duration: 8000,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ['high-risk-incidents'] });
          queryClient.invalidateQueries({ queryKey: ['risk-stats'] });
        }
      )
      .subscribe();

    // Subscribe to predictive hotspots
    const hotspotChannel = supabase
      .channel('realtime-hotspots')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'predictive_hotspots',
        },
        (payload) => {
          console.log('New hotspot prediction:', payload.new);
          const hotspot = payload.new as any;
          
          if (hotspot.risk_level === 'critical' || hotspot.risk_level === 'severe') {
            toast.warning(`📍 New Hotspot Alert: ${hotspot.region_name}`, {
              description: `Risk Level: ${hotspot.risk_level} | Country: ${hotspot.country}`,
              duration: 10000,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ['predictive-hotspots'] });
        }
      )
      .subscribe();

    // Subscribe to citizen reports (critical incidents)
    const incidentChannel = supabase
      .channel('realtime-incidents')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'citizen_reports',
        },
        (payload) => {
          console.log('New citizen report:', payload.new);
          const report = payload.new as any;
          
          if (report.severity_level === 'critical' || report.urgency_level === 'critical') {
            toast.error(`🆘 Critical Incident Reported`, {
              description: `${report.title} - ${report.location_city || report.location_country || 'Unknown location'}`,
              duration: 12000,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ['citizen-reports'] });
          queryClient.invalidateQueries({ queryKey: ['incidents'] });
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(alertChannel);
      supabase.removeChannel(riskChannel);
      supabase.removeChannel(hotspotChannel);
      supabase.removeChannel(incidentChannel);
    };
  }, [queryClient, showAlertToast]);

  const dismissAlert = useCallback((alertId: string) => {
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setActiveAlerts([]);
    setLatestAlert(null);
  }, []);

  return {
    activeAlerts,
    latestAlert,
    dismissAlert,
    clearAllAlerts,
  };
};
