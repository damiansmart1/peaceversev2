import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShieldAlert, User, MapPin, Clock, AlertTriangle, 
  Phone, Mail, ChevronRight, Shield, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface SafetyAlert {
  id: string;
  reporterId: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  safetyScore: number;
  threatIndicators: string[];
  location: string;
  lastCheck: string;
  isAnonymous: boolean;
}

export const ReporterSafetyAlerts = () => {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSafetyAlerts = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('reporter_safety_profiles')
          .select('*')
          .in('risk_level', ['critical', 'high'])
          .order('safety_score', { ascending: true })
          .limit(10);

        if (data && data.length > 0) {
          setAlerts(data.map(profile => ({
            id: profile.id,
            reporterId: profile.reporter_id || profile.anonymous_reporter_hash || 'unknown',
            riskLevel: profile.risk_level as any,
            safetyScore: profile.safety_score || 0,
            threatIndicators: (profile.protection_measures as string[]) || [],
            location: 'Unknown',
            lastCheck: profile.last_safety_check 
              ? new Date(profile.last_safety_check).toLocaleString() 
              : 'Never',
            isAnonymous: !!profile.anonymous_reporter_hash,
          })));
        } else {
          // Mock data for demo
          setAlerts([
            {
              id: '1',
              reporterId: 'reporter_001',
              riskLevel: 'critical',
              safetyScore: 25,
              threatIndicators: ['Location exposed', 'Repeated targeting', 'No secure comms'],
              location: 'Nairobi, Kenya',
              lastCheck: new Date().toLocaleString(),
              isAnonymous: false,
            },
            {
              id: '2',
              reporterId: 'anon_hash_xyz',
              riskLevel: 'high',
              safetyScore: 45,
              threatIndicators: ['In danger zone', 'High-profile case'],
              location: 'Lagos, Nigeria',
              lastCheck: new Date().toLocaleString(),
              isAnonymous: true,
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching safety alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSafetyAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('safety-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'safety_alerts',
        },
        () => {
          fetchSafetyAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskBorder = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-500/50 bg-red-500/5';
      case 'high': return 'border-orange-500/50 bg-orange-500/5';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/5';
      default: return 'border-gray-500/50 bg-gray-500/5';
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score < 30) return 'text-red-500';
    if (score < 60) return 'text-orange-500';
    if (score < 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Reporter Safety Alerts
          </CardTitle>
          <Badge variant="destructive" className="animate-pulse">
            {alerts.filter(a => a.riskLevel === 'critical').length} Critical
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="p-6 text-center">
              <Shield className="w-8 h-8 animate-pulse mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading safety data...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>All reporters are safe</p>
              <p className="text-sm mt-1">No critical safety alerts</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              <AnimatePresence>
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border-l-4 ${getRiskBorder(alert.riskLevel)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getRiskColor(alert.riskLevel)}>
                            {alert.riskLevel.toUpperCase()} RISK
                          </Badge>
                          {alert.isAnonymous && (
                            <Badge variant="outline">Anonymous</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-xs truncate max-w-[120px]">
                            {alert.isAnonymous ? 'Anonymous Reporter' : alert.reporterId}
                          </span>
                        </div>
                        {alert.location && (
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{alert.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getSafetyScoreColor(alert.safetyScore)}`}>
                          {alert.safetyScore}
                        </div>
                        <p className="text-xs text-muted-foreground">Safety Score</p>
                      </div>
                    </div>

                    {alert.threatIndicators.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Threat Indicators:</p>
                        <div className="flex flex-wrap gap-1">
                          {alert.threatIndicators.slice(0, 3).map((indicator, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {indicator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last check: {alert.lastCheck}
                      </span>
                      <Button size="sm" variant="ghost" className="h-6 text-xs">
                        Respond
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
