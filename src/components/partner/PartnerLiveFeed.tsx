import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Radio, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Bell,
  BellOff,
  Activity,
  MapPin,
  TrendingUp
} from 'lucide-react';

interface LiveIncident {
  id: string;
  title: string;
  category: string;
  severity_level: string;
  status: string;
  location_country: string;
  location_region: string | null;
  created_at: string;
  isNew?: boolean;
}

interface PartnerLiveFeedProps {
  onIncidentClick?: (id: string) => void;
}

export const PartnerLiveFeed = ({ onIncidentClick }: PartnerLiveFeedProps) => {
  const [incidents, setIncidents] = useState<LiveIncident[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('citizen_reports')
        .select('id, title, category, severity_level, status, location_country, location_region, created_at')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) {
        setIncidents(data as unknown as LiveIncident[]);
      }
    };

    fetchInitial();
  }, []);

  useEffect(() => {
    if (!isLive) return;

    const channel = supabase
      .channel('partner-live-incidents')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'citizen_reports',
        },
        (payload) => {
          const newIncident = {
            ...payload.new,
            isNew: true,
          } as LiveIncident;
          
          setIncidents((prev) => [newIncident, ...prev].slice(0, 50));
          setNewCount((prev) => prev + 1);
          setLastUpdate(new Date());

          if (notifications && newIncident.severity_level === 'critical') {
            // Browser notification for critical incidents
            if (Notification.permission === 'granted') {
              new Notification('Critical Incident Alert', {
                body: `${newIncident.title} - ${newIncident.location_country}`,
                icon: '/peaceverse-icon-192.png',
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'citizen_reports',
        },
        (payload) => {
          setIncidents((prev) =>
            prev.map((i) =>
              i.id === payload.new.id ? { ...payload.new, isNew: false } as LiveIncident : i
            )
          );
          setLastUpdate(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLive, notifications]);

  const handleEnableNotifications = async () => {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifications(true);
      }
    } else if (Notification.permission === 'granted') {
      setNotifications(!notifications);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'escalated': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'resolved': return <CheckCircle className="w-3 h-3 text-blue-500" />;
      default: return <Clock className="w-3 h-3 text-yellow-500" />;
    }
  };

  const clearNewCount = () => setNewCount(0);

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${isLive ? 'bg-green-500/20' : 'bg-muted'}`}>
              <Radio className={`w-4 h-4 ${isLive ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Live Incident Feed
                {newCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5" onClick={clearNewCount}>
                    +{newCount} new
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Last update: {format(lastUpdate, 'HH:mm:ss')}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={handleEnableNotifications}
            >
              {notifications ? (
                <Bell className="w-4 h-4 text-primary" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Live</span>
              <Switch checked={isLive} onCheckedChange={setIsLive} />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 pt-0 space-y-2">
            <AnimatePresence initial={false}>
              {incidents.map((incident) => (
                <motion.div
                  key={incident.id}
                  initial={incident.isNew ? { opacity: 0, x: -20, scale: 0.95 } : false}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                    incident.isNew ? 'bg-primary/5 border-primary/30' : 'bg-card'
                  }`}
                  onClick={() => onIncidentClick?.(incident.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {incident.isNew && (
                          <Zap className="w-3 h-3 text-primary" />
                        )}
                        <span className="text-sm font-medium truncate">{incident.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{incident.location_country}{incident.location_region ? `, ${incident.location_region}` : ''}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className={`text-[10px] ${getSeverityColor(incident.severity_level)}`}>
                        {incident.severity_level}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(incident.status)}
                        <span className="text-[10px] text-muted-foreground">{incident.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <Badge variant="secondary" className="text-[10px]">{incident.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(incident.created_at), 'MMM d, HH:mm')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {incidents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No incidents to display</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
