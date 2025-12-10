import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Clock, AlertTriangle, TrendingUp, History, FileText, Users } from 'lucide-react';
import { Incident } from '@/hooks/useIncidents';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IncidentTimelineDetail } from './IncidentTimelineDetail';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface IncidentDetailDialogProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IncidentDetailDialog = ({ incident, open, onOpenChange }: IncidentDetailDialogProps) => {
  const { data: responses } = useQuery({
    queryKey: ['incident-responses', incident?.id],
    queryFn: async () => {
      if (!incident?.id) return [];
      const { data, error } = await supabase
        .from('response_deployments')
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
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-5 h-5 text-primary" />
            {incident.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Status Overview */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={getSeverityColor(incident.severity)}>
                {incident.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline">{incident.status?.replace('_', ' ').toUpperCase()}</Badge>
              <Badge variant="secondary">{incident.incident_type}</Badge>
              {incident.is_anonymous && <Badge variant="outline">Anonymous</Badge>}
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="timeline" className="gap-1">
                  <History className="w-3 h-3" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="details" className="gap-1">
                  <FileText className="w-3 h-3" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="analysis" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  AI Analysis
                </TabsTrigger>
                <TabsTrigger value="responses" className="gap-1">
                  <Users className="w-3 h-3" />
                  Responses ({responses?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-4">
                <IncidentTimelineDetail 
                  incidentId={incident.id} 
                  incidentTitle={incident.title}
                />
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">{incident.location_name || 'Not specified'}</p>
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
                      <p className="text-sm font-medium">
                        {format(new Date(incident.created_at), 'PPp')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{incident.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="analysis" className="mt-4">
                {incident.ai_analysis ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        AI Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-[300px]">
                        {JSON.stringify(incident.ai_analysis, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No AI analysis available yet.</p>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* Responses Tab */}
              <TabsContent value="responses" className="space-y-2 mt-4">
                {responses && responses.length > 0 ? (
                  <div className="space-y-3">
                    {responses.map((response: any, index: number) => (
                      <motion.div
                        key={response.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{response.deployment_status}</p>
                                {response.notes && (
                                  <p className="text-sm mt-2 text-muted-foreground">{response.notes}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {format(new Date(response.created_at), 'PPp')}
                                </p>
                              </div>
                              <Badge variant={response.deployment_status === 'completed' ? 'default' : 'secondary'}>
                                {response.deployment_status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No response deployments yet.</p>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};