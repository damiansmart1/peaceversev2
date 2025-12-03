import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Webhook, Plus, Trash2, Activity, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const availableEvents = [
  { key: 'incident.created', label: 'Incident Created', description: 'When a new incident is reported' },
  { key: 'incident.verified', label: 'Incident Verified', description: 'When an incident is verified' },
  { key: 'incident.updated', label: 'Incident Updated', description: 'When an incident status changes' },
  { key: 'alert.triggered', label: 'Alert Triggered', description: 'When a new alert is triggered' },
  { key: 'hotspot.detected', label: 'Hotspot Detected', description: 'When a new hotspot is predicted' },
  { key: 'report.submitted', label: 'Report Submitted', description: 'When a citizen report is submitted' },
];

const generateSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'whsec_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const WebhooksManager = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: ['incident.created', 'alert.triggered'],
    filters: {} as Record<string, any>
  });

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: deliveries } = useQuery({
    queryKey: ['webhook-deliveries', selectedWebhook?.id],
    queryFn: async () => {
      if (!selectedWebhook) return [];
      const { data, error } = await supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('webhook_id', selectedWebhook.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedWebhook
  });

  const createWebhookMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const secret = generateSecret();

      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .insert({
          name: newWebhook.name,
          url: newWebhook.url,
          secret,
          events: newWebhook.events,
          filters: newWebhook.filters,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, secret };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook created! Secret: ' + data.secret);
      setIsCreateOpen(false);
      setNewWebhook({ name: '', url: '', events: ['incident.created', 'alert.triggered'], filters: {} });
    },
    onError: (error) => {
      toast.error('Failed to create webhook: ' + error.message);
    }
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhook_subscriptions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook deleted');
    }
  });

  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('webhook_subscriptions')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    }
  });

  const testWebhookMutation = useMutation({
    mutationFn: async (webhook: any) => {
      const response = await supabase.functions.invoke('webhook-trigger', {
        body: {
          event_type: 'test.ping',
          payload: {
            message: 'Test webhook from Peaceverse',
            timestamp: new Date().toISOString(),
            webhook_id: webhook.id
          }
        }
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast.success('Test webhook sent!');
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] });
    },
    onError: (error) => {
      toast.error('Test failed: ' + error.message);
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhooks List */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Webhook Endpoints</CardTitle>
              <CardDescription>Configure webhook URLs for real-time notifications</CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Webhook</DialogTitle>
                  <DialogDescription>
                    Configure a new webhook endpoint to receive real-time events
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      placeholder="e.g., Production Alert System"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endpoint URL *</Label>
                    <Input
                      placeholder="https://your-system.com/webhooks/peaceverse"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events to Subscribe</Label>
                    <div className="grid grid-cols-1 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
                      {availableEvents.map((event) => (
                        <div key={event.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={event.key}
                            checked={newWebhook.events.includes(event.key)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event.key] });
                              } else {
                                setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event.key) });
                              }
                            }}
                          />
                          <label htmlFor={event.key} className="flex-1 cursor-pointer">
                            <div className="font-medium text-sm">{event.label}</div>
                            <div className="text-xs text-muted-foreground">{event.description}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => createWebhookMutation.mutate()}
                    disabled={!newWebhook.name || !newWebhook.url || createWebhookMutation.isPending}
                  >
                    {createWebhookMutation.isPending ? 'Creating...' : 'Create Webhook'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : webhooks?.length === 0 ? (
              <div className="text-center py-8">
                <Webhook className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Add a webhook to receive real-time notifications
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks?.map((webhook: any) => (
                  <div
                    key={webhook.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedWebhook?.id === webhook.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedWebhook(webhook)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{webhook.name}</h4>
                        <Badge variant={webhook.is_active ? 'default' : 'secondary'} className="text-xs">
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {webhook.last_status && (
                          <Badge variant={webhook.last_status === 'success' ? 'default' : 'destructive'} className="text-xs">
                            {webhook.last_status === 'success' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {webhook.last_status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={(checked) => 
                            toggleWebhookMutation.mutate({ id: webhook.id, isActive: checked })
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            testWebhookMutation.mutate(webhook);
                          }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWebhookMutation.mutate(webhook.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{webhook.url}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {(webhook.events as string[])?.slice(0, 3).map((event: string) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                      {(webhook.events as string[])?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{webhook.events.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Logs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Delivery Logs
            </CardTitle>
            <CardDescription>
              {selectedWebhook ? `Recent deliveries for ${selectedWebhook.name}` : 'Select a webhook to view logs'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedWebhook ? (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a webhook to view delivery logs</p>
              </div>
            ) : deliveries?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No deliveries yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {deliveries?.map((delivery: any) => (
                  <div
                    key={delivery.id}
                    className="p-3 border rounded-lg text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {delivery.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="font-medium">{delivery.event_type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(delivery.created_at), 'MMM d, HH:mm:ss')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Status: {delivery.response_status || 'N/A'}</span>
                      <span>Duration: {delivery.duration_ms}ms</span>
                      <span>Attempt: {delivery.attempt_number}</span>
                    </div>
                    {delivery.error_message && (
                      <p className="text-xs text-red-500 mt-1">{delivery.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebhooksManager;
