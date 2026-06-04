import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Code2, Webhook, ArrowUpRight, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const PartnerApiConsole = () => {
  const navigate = useNavigate();

  const { data: keys = [] } = useQuery({
    queryKey: ['partner-api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase.from('api_keys').select('id,name,description,key_prefix,organization_name,permissions,rate_limit_per_minute,is_active,last_used_at,expires_at,created_at').order('created_at', { ascending: false }).limit(25);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: hooks = [] } = useQuery({
    queryKey: ['partner-webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('webhook_subscriptions').select('id,name,url,events,is_active,organization_name,last_triggered_at,last_status,failure_count,created_at').order('created_at', { ascending: false }).limit(25);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: usage = [] } = useQuery({
    queryKey: ['partner-api-usage'],
    queryFn: async () => {
      const { data, error } = await supabase.from('api_usage_logs').select('id,api_key_id,endpoint,method,response_status,response_time_ms,created_at').order('created_at', { ascending: false }).limit(40);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: deliveries = [] } = useQuery({
    queryKey: ['partner-webhook-deliveries'],
    queryFn: async () => {
      const { data, error } = await supabase.from('webhook_deliveries').select('id,webhook_id,event_type,response_status,success,duration_ms,attempt_number,error_message,created_at').order('created_at', { ascending: false }).limit(40);
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><Code2 className="w-5 h-5 text-primary" /> API & Webhooks Console</CardTitle>
            <CardDescription>REST, GeoJSON, CAP 1.2 feeds & event-driven webhooks</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate('/admin?tab=integrations')}>
            Manage <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="keys">
          <TabsList className="grid grid-cols-4 w-full md:w-fit">
            <TabsTrigger value="keys" className="gap-2 text-xs"><Code2 className="w-4 h-4" /> Keys</TabsTrigger>
            <TabsTrigger value="usage" className="gap-2 text-xs"><Activity className="w-4 h-4" /> Usage</TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2 text-xs"><Webhook className="w-4 h-4" /> Webhooks</TabsTrigger>
            <TabsTrigger value="deliveries" className="gap-2 text-xs"><CheckCircle2 className="w-4 h-4" /> Deliveries</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="mt-4">
            <ScrollArea className="h-[380px]">
              {keys.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No API keys yet — request one from Integration Hub.</p> :
                <div className="space-y-2">
                  {keys.map((k: any) => (
                    <div key={k.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{k.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{k.description || k.organization_name}</p>
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{k.key_prefix}…</code>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={k.is_active ? 'default' : 'secondary'} className="text-[10px]">{k.is_active ? 'Active' : 'Disabled'}</Badge>
                          <span className="text-[10px] text-muted-foreground">{k.rate_limit_per_minute}/min</span>
                          {k.last_used_at && <span className="text-[10px] text-muted-foreground">used {format(new Date(k.last_used_at), 'MMM d')}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </ScrollArea>
          </TabsContent>

          <TabsContent value="usage" className="mt-4">
            <ScrollArea className="h-[380px]">
              {usage.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No API calls recorded</p> :
                <div className="space-y-1">
                  {usage.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between text-xs px-3 py-2 rounded border bg-card">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="outline" className="text-[10px]">{u.method}</Badge>
                        <code className="truncate max-w-[220px]">{u.endpoint}</code>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={u.response_status >= 400 ? 'destructive' : 'secondary'} className="text-[10px]">{u.response_status}</Badge>
                        <span className="text-muted-foreground">{u.response_time_ms}ms</span>
                        <span className="text-muted-foreground">{format(new Date(u.created_at), 'HH:mm:ss')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </ScrollArea>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4">
            <ScrollArea className="h-[380px]">
              {hooks.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No webhook subscriptions</p> :
                <div className="space-y-2">
                  {hooks.map((h: any) => (
                    <div key={h.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{h.name}</p>
                          <code className="text-[10px] text-muted-foreground truncate block max-w-md">{h.url}</code>
                          <div className="flex gap-1 mt-1 flex-wrap">{(h.events || []).slice(0, 4).map((ev: string) => <Badge key={ev} variant="outline" className="text-[10px]">{ev}</Badge>)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={h.is_active ? 'default' : 'secondary'} className="text-[10px]">{h.is_active ? 'Active' : 'Paused'}</Badge>
                          {h.failure_count > 0 && <Badge variant="destructive" className="text-[10px]">{h.failure_count} failures</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </ScrollArea>
          </TabsContent>

          <TabsContent value="deliveries" className="mt-4">
            <ScrollArea className="h-[380px]">
              {deliveries.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No deliveries yet</p> :
                <div className="space-y-1">
                  {deliveries.map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between text-xs px-3 py-2 rounded border bg-card">
                      <div className="flex items-center gap-2 min-w-0">
                        {d.success ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                        <code className="truncate">{d.event_type}</code>
                        {d.attempt_number > 1 && <Badge variant="outline" className="text-[10px]">retry {d.attempt_number}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-muted-foreground">{d.response_status ?? '—'}</span>
                        <span className="text-muted-foreground">{d.duration_ms ?? '—'}ms</span>
                        <span className="text-muted-foreground">{format(new Date(d.created_at), 'HH:mm')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
