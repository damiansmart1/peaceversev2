import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { format, differenceInMinutes } from 'date-fns';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Vote,
  Shield,
  Users,
  Activity,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useElectionIncidents, usePollingStations, useElectionObservers, type Election } from '@/hooks/useElections';

interface ElectionDayTimelineProps {
  election: Election;
}

interface TimelineEvent {
  id: string;
  time: Date;
  type: 'incident' | 'station' | 'observer' | 'system';
  severity?: string;
  title: string;
  description: string;
  region?: string;
  icon: typeof AlertTriangle;
  color: string;
}

const SEVERITY_TIMELINE_COLORS: Record<string, string> = {
  minor: 'border-slate-400 bg-slate-50 dark:bg-slate-900/30',
  moderate: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  serious: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
  critical: 'border-red-400 bg-red-50 dark:bg-red-900/20',
  emergency: 'border-red-600 bg-red-100 dark:bg-red-900/40',
};

export default function ElectionDayTimeline({ election }: ElectionDayTimelineProps) {
  const { data: incidents, refetch } = useElectionIncidents(election.id);
  const { data: stations } = usePollingStations(election.id);
  const { data: observers } = useElectionObservers(election.id);

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add incidents as events
    incidents?.forEach(incident => {
      events.push({
        id: `incident-${incident.id}`,
        time: new Date(incident.incident_datetime),
        type: 'incident',
        severity: incident.severity,
        title: incident.title,
        description: incident.description,
        region: incident.region || undefined,
        icon: incident.severity === 'critical' || incident.severity === 'emergency' ? Zap : AlertTriangle,
        color: SEVERITY_TIMELINE_COLORS[incident.severity] || SEVERITY_TIMELINE_COLORS.minor,
      });
    });

    // Add station events (opened/closed)
    stations?.forEach(station => {
      if (station.opened_at) {
        events.push({
          id: `station-open-${station.id}`,
          time: new Date(station.opened_at),
          type: 'station',
          title: `Station Opened: ${station.station_name}`,
          description: `Polling station ${station.station_code} opened in ${station.region || 'Unknown'}`,
          region: station.region || undefined,
          icon: Vote,
          color: 'border-green-400 bg-green-50 dark:bg-green-900/20',
        });
      }
      if (station.closed_at) {
        events.push({
          id: `station-close-${station.id}`,
          time: new Date(station.closed_at),
          type: 'station',
          title: `Station Closed: ${station.station_name}`,
          description: `Polling station ${station.station_code} closed in ${station.region || 'Unknown'}`,
          region: station.region || undefined,
          icon: CheckCircle2,
          color: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
        });
      }
    });

    // Sort by time (newest first)
    events.sort((a, b) => b.time.getTime() - a.time.getTime());

    return events;
  }, [incidents, stations, observers]);

  const getTimeAgo = (time: Date) => {
    const mins = differenceInMinutes(new Date(), time);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  // Group events by hour
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, TimelineEvent[]>();
    timelineEvents.forEach(event => {
      const hourKey = format(event.time, 'yyyy-MM-dd HH:00');
      const existing = groups.get(hourKey) || [];
      existing.push(event);
      groups.set(hourKey, existing);
    });
    return Array.from(groups.entries());
  }, [timelineEvents]);

  const stats = useMemo(() => ({
    total: timelineEvents.length,
    incidents: timelineEvents.filter(e => e.type === 'incident').length,
    critical: timelineEvents.filter(e => e.severity === 'critical' || e.severity === 'emergency').length,
    stations: timelineEvents.filter(e => e.type === 'station').length,
  }), [timelineEvents]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Election Day Timeline
          </h3>
          <p className="text-sm text-muted-foreground">
            Chronological feed of all election-day activity — {stats.total} events
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <div>
              <p className="text-lg font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-lg font-bold">{stats.incidents}</p>
              <p className="text-xs text-muted-foreground">Incidents</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-lg font-bold text-red-600">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-lg font-bold">{stats.stations}</p>
              <p className="text-xs text-muted-foreground">Station Events</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="pt-4">
          {timelineEvents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events recorded yet</p>
            </div>
          ) : (
            <ScrollArea className="h-[550px]">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-1">
                  {groupedEvents.map(([hourKey, events]) => (
                    <div key={hourKey}>
                      {/* Hour Header */}
                      <div className="flex items-center gap-3 mb-2 sticky top-0 bg-background z-10 py-1">
                        <div className="w-12 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {format(new Date(hourKey), 'MMM dd, HH:mm')}
                        </span>
                        <Badge variant="secondary" className="text-xs">{events.length} events</Badge>
                      </div>

                      {/* Events in this hour */}
                      {events.map((event) => {
                        const EventIcon = event.icon;
                        return (
                          <div key={event.id} className="flex items-start gap-3 mb-3 ml-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-background ${
                              event.type === 'incident' 
                                ? event.severity === 'critical' || event.severity === 'emergency' 
                                  ? 'border-red-500' 
                                  : 'border-orange-400'
                                : 'border-green-400'
                            }`}>
                              <EventIcon className={`h-4 w-4 ${
                                event.type === 'incident'
                                  ? event.severity === 'critical' || event.severity === 'emergency'
                                    ? 'text-red-500'
                                    : 'text-orange-500'
                                  : 'text-green-500'
                              }`} />
                            </div>

                            <div className={`flex-1 p-3 rounded-lg border-l-4 ${event.color}`}>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                {event.severity && (
                                  <Badge variant="outline" className="text-xs capitalize">{event.severity}</Badge>
                                )}
                                <Badge variant="secondary" className="text-xs capitalize">{event.type}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(event.time, 'HH:mm:ss')} · {getTimeAgo(event.time)}
                                </span>
                              </div>
                              <p className="font-medium text-sm line-clamp-1">{event.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{event.description}</p>
                              {event.region && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {event.region}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
