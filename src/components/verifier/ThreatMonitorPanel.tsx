import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, Shield, MapPin, Clock, ChevronRight, 
  Activity, Zap, Eye, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ThreatAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'emerging';
  title: string;
  location: string;
  country: string;
  time: string;
  threatLevel: number;
  category: string;
  isNew?: boolean;
}

export const ThreatMonitorPanel = () => {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Fetch initial alerts
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('citizen_reports_safe' as any)
        .select('*')
        .in('ai_threat_level', ['critical', 'high', 'extreme'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setAlerts((data as any[]).map((report: any) => ({
          id: report.id,
          type: report.ai_threat_level === 'extreme' ? 'critical' : 
                report.ai_threat_level === 'high' ? 'high' : 'medium',
          title: report.title,
          location: report.location_name || 'Unknown',
          country: report.location_country || 'Unknown',
          time: new Date(report.created_at).toLocaleTimeString(),
          threatLevel: report.credibility_score || 50,
          category: report.category,
        })));
      }
    };

    fetchAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('threat-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'citizen_reports',
        },
        (payload) => {
          const report = payload.new as any;
          if (['critical', 'high', 'extreme'].includes(report.ai_threat_level)) {
            setAlerts(prev => [{
              id: report.id,
              type: report.ai_threat_level === 'extreme' ? 'critical' : 
                    report.ai_threat_level === 'high' ? 'high' : 'medium',
              title: report.title,
              location: report.location_name || 'Unknown',
              country: report.location_country || 'Unknown',
              time: new Date(report.created_at).toLocaleTimeString(),
              threatLevel: report.credibility_score || 50,
              category: report.category,
              isNew: true,
            }, ...prev.slice(0, 9)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'emerging': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'emerging': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Threat Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${isLive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
              <Radio className={`w-3 h-3 ${isLive ? 'animate-pulse' : ''}`} />
              {isLive ? 'LIVE' : 'PAUSED'}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <AnimatePresence>
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active threat alerts</p>
                <p className="text-sm mt-1">System monitoring active</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={alert.isNew ? { opacity: 0, x: -20, scale: 0.95 } : { opacity: 1, x: 0, scale: 1 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.type)} cursor-pointer hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getAlertBadge(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.category}
                          </Badge>
                          {alert.isNew && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-500 text-xs">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.location}, {alert.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.time}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            alert.threatLevel >= 80 ? 'bg-red-500' : 
                            alert.threatLevel >= 60 ? 'bg-orange-500' : 
                            alert.threatLevel >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${alert.threatLevel}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{alert.threatLevel}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
