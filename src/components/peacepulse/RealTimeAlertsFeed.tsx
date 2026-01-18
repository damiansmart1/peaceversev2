import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle,
  Info,
  X,
  Volume2,
  VolumeX,
  Filter,
  Clock,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslationContext } from '@/components/TranslationProvider';

interface RealTimeAlertsFeedProps {
  countryFilter?: string;
  maxAlerts?: number;
}

const RealTimeAlertsFeed = ({ countryFilter = 'all', maxAlerts = 15 }: RealTimeAlertsFeedProps) => {
  const { t } = useTranslationContext();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Fetch real alerts from database
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['realtime-alerts', countryFilter, severityFilter],
    queryFn: async () => {
      let query = supabase
        .from('alert_logs')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(maxAlerts);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter out dismissed alerts
  const visibleAlerts = alerts?.filter(a => !dismissedAlerts.has(a.id)) || [];

  const getSeverityConfig = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          pulse: true,
          bgColor: 'bg-red-500/5 border-red-500/20'
        };
      case 'high':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          pulse: true,
          bgColor: 'bg-orange-500/5 border-orange-500/20'
        };
      case 'medium':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          pulse: false,
          bgColor: 'bg-yellow-500/5 border-yellow-500/20'
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          pulse: false,
          bgColor: 'bg-blue-500/5 border-blue-500/20'
        };
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await supabase
        .from('alert_logs')
        .update({ 
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);
      
      refetch();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const criticalCount = visibleAlerts.filter(a => a.severity === 'critical').length;
  const highCount = visibleAlerts.filter(a => a.severity === 'high').length;

  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-5 h-5 text-primary" />
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-xs text-white animate-pulse">
                  {criticalCount}
                </span>
              )}
            </div>
            <div>
              <CardTitle>Real-Time Alert Feed</CardTitle>
              <CardDescription>
                Live monitoring • {visibleAlerts.length} active alerts
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={soundEnabled ? 'text-primary' : 'text-muted-foreground'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-sm bg-muted border border-border rounded-md px-2 py-1"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 mt-3">
          {criticalCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
              {criticalCount} Critical
            </Badge>
          )}
          {highCount > 0 && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {highCount} High
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading alerts...
          </div>
        ) : visibleAlerts.length > 0 ? (
          <ScrollArea className="h-[400px] pr-2">
            <AnimatePresence>
              <div className="space-y-3">
                {visibleAlerts.map((alert: any, index: number) => {
                  const config = getSeverityConfig(alert.severity);
                  
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 100, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${config.bgColor} ${config.pulse ? 'animate-pulse' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm truncate">{alert.title}</h4>
                              <Badge className={config.color} variant="outline">
                                {alert.severity}
                              </Badge>
                              {alert.status === 'acknowledged' && (
                                <Badge variant="secondary" className="text-xs">
                                  Acknowledged
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {alert.triggered_at 
                                  ? formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })
                                  : 'Unknown'
                                }
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs capitalize">
                                  {alert.alert_type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDismiss(alert.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          {alert.status !== 'acknowledged' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              ACK
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active alerts</p>
            <p className="text-sm mt-1">System monitoring is active</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeAlertsFeed;
