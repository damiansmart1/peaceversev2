import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, MapPin, Clock, ExternalLink, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Alert {
  id: string;
  title: string;
  description: string;
  location_country: string | null;
  location_region: string | null;
  severity_level: string;
  created_at: string;
  category: string;
}

interface CriticalAlertsPanelProps {
  alerts: Alert[] | undefined;
  isLoading: boolean;
}

export const CriticalAlertsPanel = ({ alerts, isLoading }: CriticalAlertsPanelProps) => {
  const navigate = useNavigate();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-amber-500 text-white';
    }
  };

  return (
    <Card className="border-red-200 dark:border-red-900/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Bell className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Critical Alerts</CardTitle>
              <CardDescription>High-priority incidents requiring immediate attention</CardDescription>
            </div>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            {alerts?.length || 0} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !alerts || alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No critical alerts at this time</p>
              <p className="text-sm text-muted-foreground/70">All high-priority incidents are addressed</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/incidents?id=${alert.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity_level)}>
                            {alert.severity_level}
                          </Badge>
                          <Badge variant="outline">{alert.category}</Badge>
                        </div>
                        <h4 className="font-medium truncate">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {(alert.location_country || alert.location_region) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {alert.location_region || alert.location_country}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
