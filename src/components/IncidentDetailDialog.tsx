import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, User, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Incident } from '@/hooks/useIncidents';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface IncidentDetailDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IncidentDetailDialog = ({ incident, open, onOpenChange }: IncidentDetailDialogProps) => {
  const { data: timeline } = useQuery({
    queryKey: ['incident-timeline', incident?.id],
    queryFn: async () => {
      if (!incident?.id) return [];
      const { data, error } = await (supabase as any)
        .from('incident_timeline')
        .select('*')
        .eq('incident_id', incident.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!incident?.id && open,
  });

  const { data: responses } = useQuery({
    queryKey: ['incident-responses', incident?.id],
    queryFn: async () => {
      if (!incident?.id) return [];
      const { data, error } = await (supabase as any)
        .from('incident_responses')
        .select('*')
        .eq('incident_id', incident.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!incident?.id && open,
  });

  if (!incident) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {incident.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Overview */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getSeverityColor(incident.severity)}`} />
              {incident.severity.toUpperCase()}
            </Badge>
            <Badge>{incident.status}</Badge>
            <Badge variant="secondary">{incident.incident_type}</Badge>
            {incident.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
          </div>

          {/* Location & Time */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{incident.location_name || 'Not specified'}</p>
                <p className="text-xs text-muted-foreground">{incident.country_code}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Reported
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{new Date(incident.created_at).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Priority: {incident.priority}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{incident.description}</p>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {incident.ai_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(incident.ai_analysis, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Timeline and Responses */}
          <Tabs defaultValue="timeline">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Timeline ({timeline?.length || 0})</TabsTrigger>
              <TabsTrigger value="responses">Responses ({responses?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-2">
              {timeline && timeline.length > 0 ? (
                <div className="space-y-2">
                  {timeline.map((entry: any) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{entry.event_type}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(entry.created_at).toLocaleString()}
                            </p>
                            {entry.notes && (
                              <p className="text-sm mt-2">{entry.notes}</p>
                            )}
                          </div>
                          {entry.new_status && (
                            <Badge variant="outline">{entry.new_status}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No timeline events yet</p>
              )}
            </TabsContent>

            <TabsContent value="responses" className="space-y-2">
              {responses && responses.length > 0 ? (
                <div className="space-y-2">
                  {responses.map((response: any) => (
                    <Card key={response.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{response.response_type}</p>
                            <p className="text-sm mt-2">{response.response_details}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(response.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge>{response.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No responses yet</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};