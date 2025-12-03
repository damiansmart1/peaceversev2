import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  Clock, 
  MapPin,
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase-typed';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'alert' | 'incident' | 'risk' | 'hotspot' | 'verification' | 'response';
  title: string;
  description: string;
  severity?: string;
  location?: string;
  timestamp: string;
}

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Fetch initial activities
    const fetchInitialActivities = async () => {
      const [alertsResult, incidentsResult, riskResult] = await Promise.all([
        supabase
          .from('alert_logs')
          .select('*')
          .order('triggered_at', { ascending: false })
          .limit(5),
        supabase
          .from('citizen_reports')
          .select('id, title, category, severity_level, location_city, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('incident_risk_scores')
          .select('id, threat_level, overall_risk_score, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const combinedActivities: ActivityItem[] = [];

      if (alertsResult.data) {
        alertsResult.data.forEach((alert) => {
          combinedActivities.push({
            id: `alert-${alert.id}`,
            type: 'alert',
            title: alert.title,
            description: alert.message,
            severity: alert.severity,
            timestamp: alert.triggered_at,
          });
        });
      }

      if (incidentsResult.data) {
        incidentsResult.data.forEach((incident) => {
          combinedActivities.push({
            id: `incident-${incident.id}`,
            type: 'incident',
            title: incident.title,
            description: `Category: ${incident.category}`,
            severity: incident.severity_level,
            location: incident.location_city,
            timestamp: incident.created_at,
          });
        });
      }

      if (riskResult.data) {
        riskResult.data.forEach((risk) => {
          combinedActivities.push({
            id: `risk-${risk.id}`,
            type: 'risk',
            title: `Risk Assessment: ${risk.threat_level}`,
            description: `Overall Score: ${risk.overall_risk_score}%`,
            severity: risk.threat_level,
            timestamp: risk.created_at,
          });
        });
      }

      // Sort by timestamp
      combinedActivities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(combinedActivities.slice(0, 15));
    };

    fetchInitialActivities();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('live-activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alert_logs' },
        (payload) => {
          const alert = payload.new as any;
          const newActivity: ActivityItem = {
            id: `alert-${alert.id}`,
            type: 'alert',
            title: alert.title,
            description: alert.message,
            severity: alert.severity,
            timestamp: alert.triggered_at,
          };
          setActivities((prev) => [newActivity, ...prev].slice(0, 15));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'citizen_reports' },
        (payload) => {
          const incident = payload.new as any;
          const newActivity: ActivityItem = {
            id: `incident-${incident.id}`,
            type: 'incident',
            title: incident.title,
            description: `Category: ${incident.category}`,
            severity: incident.severity_level,
            location: incident.location_city,
            timestamp: incident.created_at,
          };
          setActivities((prev) => [newActivity, ...prev].slice(0, 15));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incident_risk_scores' },
        (payload) => {
          const risk = payload.new as any;
          const newActivity: ActivityItem = {
            id: `risk-${risk.id}`,
            type: 'risk',
            title: `Risk Assessment: ${risk.threat_level}`,
            description: `Overall Score: ${risk.overall_risk_score}%`,
            severity: risk.threat_level,
            timestamp: risk.created_at,
          };
          setActivities((prev) => [newActivity, ...prev].slice(0, 15));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return Bell;
      case 'incident':
        return AlertTriangle;
      case 'risk':
        return TrendingUp;
      case 'hotspot':
        return MapPin;
      case 'verification':
        return CheckCircle2;
      case 'response':
        return Users;
      default:
        return Activity;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'medium':
        return 'bg-accent/20 text-accent border-accent/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Live Activity Feed</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-xs text-success font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className={cn(
                    'flex gap-3 p-3 rounded-lg border transition-all duration-300',
                    getSeverityColor(activity.severity),
                    index === 0 && 'animate-fade-in'
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm truncate">{activity.title}</p>
                      {activity.severity && (
                        <Badge
                          variant="outline"
                          className={cn('text-xs capitalize', getSeverityColor(activity.severity))}
                        >
                          {activity.severity}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-80 mt-0.5">{activity.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs opacity-70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      {activity.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default LiveActivityFeed;
