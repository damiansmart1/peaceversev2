import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AlertSystemProps {
  selectedCountry?: string;
}

const AlertSystem = ({ selectedCountry = 'ALL' }: AlertSystemProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alert-logs', selectedCountry],
    queryFn: async () => {
      // Get incident IDs for the selected country
      if (selectedCountry !== 'ALL') {
        const { data: incidents } = await supabase
          .from('citizen_reports')
          .select('id')
          .eq('location_country', selectedCountry);
        
        const incidentIds = incidents?.map(i => i.id) || [];
        
        const { data, error } = await supabase
          .from('alert_logs')
          .select('*')
          .order('triggered_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        
        // Filter alerts that have incident_ids matching the country
        return data?.filter(alert => {
          if (!alert.incident_ids || alert.incident_ids.length === 0) return false;
          return alert.incident_ids.some((id: string) => incidentIds.includes(id));
        }) || [];
      }

      const { data, error } = await supabase
        .from('alert_logs')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('alert_logs')
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'acknowledged'
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-logs'] });
      toast({
        title: 'Alert Acknowledged',
        description: 'Alert has been marked as acknowledged.',
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('alert_logs')
        .update({
          status: 'resolved'
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-logs'] });
      toast({
        title: 'Alert Resolved',
        description: 'Alert has been marked as resolved.',
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-600 text-white';
      case 'critical': return 'bg-red-500 text-white';
      case 'alert': return 'bg-orange-500 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4" />;
      case 'acknowledged': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Alerts...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Active Alerts & Notifications
            </CardTitle>
            <CardDescription>
              Real-time alerts from the early warning system
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="destructive">
              {alerts?.filter(a => a.status === 'active').length || 0} Active
            </Badge>
            <Badge variant="secondary">
              {alerts?.filter(a => a.status === 'acknowledged').length || 0} Acknowledged
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
            <p className="text-muted-foreground">No alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 space-y-3 ${
                  alert.status === 'active' ? 'border-l-4 border-l-red-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(alert.status)}
                      <h3 className="font-semibold">{alert.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.triggered_at).toLocaleString()}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {alert.alert_type}
                  </Badge>
                  {alert.channels_sent && (
                    <span className="text-xs">
                      Sent via: {alert.channels_sent.join(', ')}
                    </span>
                  )}
                </div>

                {alert.context_data && (
                  <div className="bg-muted/50 p-3 rounded text-sm space-y-1">
                    {alert.context_data.risk_score && (
                      <p>
                        <span className="font-semibold">Risk Score:</span>{' '}
                        {alert.context_data.risk_score}/100
                      </p>
                    )}
                    {alert.context_data.threat_level && (
                      <p>
                        <span className="font-semibold">Threat Level:</span>{' '}
                        <span className="capitalize">{alert.context_data.threat_level}</span>
                      </p>
                    )}
                    {alert.context_data.primary_concerns && (
                      <div>
                        <p className="font-semibold">Primary Concerns:</p>
                        <ul className="list-disc list-inside ml-2">
                          {alert.context_data.primary_concerns.map((concern: string, i: number) => (
                            <li key={i}>{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {alert.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeMutation.mutate(alert.id)}
                      disabled={acknowledgeMutation.isPending}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {alert.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => resolveMutation.mutate(alert.id)}
                      disabled={resolveMutation.isPending}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {alert.status === 'resolved' && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertSystem;