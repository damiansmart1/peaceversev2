import { useState, useEffect } from 'react';
import { AlertTriangle, X, Bell, ChevronRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeAlerts, RealtimeAlert } from '@/hooks/useRealtimeAlerts';
import { cn } from '@/lib/utils';

const GlobalAlertBanner = () => {
  const { activeAlerts, latestAlert, dismissAlert } = useRealtimeAlerts();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (latestAlert && (latestAlert.severity === 'critical' || latestAlert.severity === 'high')) {
      setIsVisible(true);
    }
  }, [latestAlert]);

  const criticalAlerts = activeAlerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'high'
  );

  if (!isVisible || criticalAlerts.length === 0) return null;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/95 border-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning/95 border-warning text-warning-foreground';
      default:
        return 'bg-primary/95 border-primary text-primary-foreground';
    }
  };

  const primaryAlert = criticalAlerts[0];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-fade-in">
      <div
        className={cn(
          'backdrop-blur-md border-b shadow-lg',
          getSeverityStyles(primaryAlert.severity)
        )}
      >
        <div className="container mx-auto px-4">
          {/* Main Alert Bar */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                {criticalAlerts.length > 1 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
                  >
                    {criticalAlerts.length}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="font-bold text-sm uppercase tracking-wide">
                  {primaryAlert.severity === 'critical' ? '🚨 Critical Alert' : '⚠️ High Priority Alert'}
                </span>
                <span className="text-sm font-medium opacity-90">
                  {primaryAlert.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-inherit border-white/30"
                onClick={() => window.location.href = '/early-warning'}
              >
                <Shield className="w-4 h-4 mr-1" />
                View Details
              </Button>
              
              {criticalAlerts.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-inherit hover:bg-white/20"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Hide' : `+${criticalAlerts.length - 1} more`}
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 ml-1 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="text-inherit hover:bg-white/20 h-8 w-8"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Expanded Alerts List */}
          {isExpanded && criticalAlerts.length > 1 && (
            <div className="border-t border-white/20 py-3 space-y-2">
              {criticalAlerts.slice(1).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between px-4 py-2 rounded-lg bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <div>
                      <span className="font-medium text-sm">{alert.title}</span>
                      <p className="text-xs opacity-80">{alert.message}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-inherit hover:bg-white/20"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalAlertBanner;
