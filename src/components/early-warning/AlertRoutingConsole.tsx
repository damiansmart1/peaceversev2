import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  BellRing, Plus, Settings2, CheckCircle2, Clock, Radio, Mail, Smartphone,
  MessageSquare, Globe, ShieldAlert, Activity, Users, Megaphone,
} from 'lucide-react';

type Severity = 'info' | 'warning' | 'alert' | 'critical' | 'emergency';
type Channel = 'in_app' | 'email' | 'sms' | 'push' | 'ussd' | 'radio' | 'webhook';

const SEVERITIES: Severity[] = ['info', 'warning', 'alert', 'critical', 'emergency'];

const SEVERITY_META: Record<Severity, { color: string; label: string }> = {
  info:       { color: 'hsl(210 80% 50%)', label: 'Info' },
  warning:    { color: 'hsl(45 95% 50%)',  label: 'Warning' },
  alert:      { color: 'hsl(25 95% 55%)',  label: 'Alert' },
  critical:   { color: 'hsl(10 85% 50%)',  label: 'Critical' },
  emergency:  { color: 'hsl(0 90% 45%)',   label: 'Emergency' },
};

const CHANNELS: { id: Channel; label: string; icon: any }[] = [
  { id: 'in_app',  label: 'In-App',  icon: BellRing },
  { id: 'email',   label: 'Email',   icon: Mail },
  { id: 'sms',     label: 'SMS',     icon: Smartphone },
  { id: 'push',    label: 'Push',    icon: MessageSquare },
  { id: 'ussd',    label: 'USSD',    icon: Globe },
  { id: 'radio',   label: 'Radio',   icon: Radio },
  { id: 'webhook', label: 'Webhook', icon: Activity },
];

const ROLES = ['admin', 'government', 'partner', 'verifier', 'citizen'];

const TRIGGER_TYPES = [
  'risk_score', 'incident_count', 'hotspot', 'correlation', 'escalation', 'cross_border',
];

interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: string;
  threshold_value: number | null;
  severity: Severity;
  notification_channels: string[] | null;
  recipient_roles: string[] | null;
  cooldown_minutes: number | null;
  max_alerts_per_day: number | null;
}

const DEFAULT_RULE: Partial<AlertRule> = {
  name: '',
  description: '',
  is_active: true,
  trigger_type: 'risk_score',
  severity: 'warning',
  threshold_value: 70,
  notification_channels: ['in_app', 'email'],
  recipient_roles: ['admin', 'government'],
  cooldown_minutes: 60,
  max_alerts_per_day: 50,
};

export default function AlertRoutingConsole() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<AlertRule> | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch rules
  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .order('severity', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as AlertRule[];
    },
  });

  // Fetch recent logs for ack tracking
  const { data: logs = [], refetch: refetchLogs } = useQuery({
    queryKey: ['alert-logs-ack'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_logs')
        .select('id,severity,title,message,channels_sent,recipients,status,triggered_at,acknowledged_at,acknowledged_by')
        .order('triggered_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  // Realtime ack updates
  useEffect(() => {
    const ch = supabase
      .channel('alert-routing-acks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alert_logs' }, () => {
        refetchLogs();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetchLogs]);

  // Severity matrix: which channels are configured for each severity (union across active rules)
  const severityMatrix = useMemo(() => {
    const map: Record<Severity, Set<string>> = {
      info: new Set(), warning: new Set(), alert: new Set(),
      critical: new Set(), emergency: new Set(),
    };
    rules.filter(r => r.is_active).forEach(r => {
      (r.notification_channels ?? []).forEach(c => map[r.severity]?.add(c));
    });
    return map;
  }, [rules]);

  // Ack stats
  const ackStats = useMemo(() => {
    const total = logs.length;
    const acked = logs.filter((l: any) => l.acknowledged_at).length;
    const pending = total - acked;
    const critical = logs.filter((l: any) =>
      ['critical', 'emergency'].includes(l.severity) && !l.acknowledged_at).length;
    const avgMins = (() => {
      const acks = logs.filter((l: any) => l.acknowledged_at);
      if (!acks.length) return 0;
      const sum = acks.reduce((s: number, l: any) =>
        s + (new Date(l.acknowledged_at).getTime() - new Date(l.triggered_at).getTime()), 0);
      return Math.round((sum / acks.length) / 60000);
    })();
    return { total, acked, pending, critical, avgMins, rate: total ? Math.round((acked/total)*100) : 0 };
  }, [logs]);

  const handleSave = async () => {
    if (!editing?.name?.trim()) {
      toast.error('Rule name is required');
      return;
    }
    const payload = {
      name: editing.name,
      description: editing.description ?? null,
      is_active: editing.is_active ?? true,
      trigger_type: editing.trigger_type ?? 'risk_score',
      severity: editing.severity ?? 'warning',
      threshold_value: editing.threshold_value ?? null,
      notification_channels: editing.notification_channels ?? ['in_app'],
      recipient_roles: editing.recipient_roles ?? ['admin'],
      cooldown_minutes: editing.cooldown_minutes ?? 60,
      max_alerts_per_day: editing.max_alerts_per_day ?? 50,
    };
    const { error } = editing.id
      ? await supabase.from('alert_rules').update(payload).eq('id', editing.id)
      : await supabase.from('alert_rules').insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.id });
    if (error) {
      toast.error(`Failed to save rule: ${error.message}`);
      return;
    }
    toast.success(editing.id ? 'Routing rule updated' : 'Routing rule created');
    setOpen(false);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ['alert-rules'] });
  };

  const toggleActive = async (rule: AlertRule) => {
    const { error } = await supabase
      .from('alert_rules')
      .update({ is_active: !rule.is_active })
      .eq('id', rule.id);
    if (error) {
      toast.error(`Could not toggle: ${error.message}`);
      return;
    }
    qc.invalidateQueries({ queryKey: ['alert-rules'] });
  };

  const acknowledge = async (logId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      toast.error('Sign in to acknowledge alerts');
      return;
    }
    const { error } = await supabase
      .from('alert_logs')
      .update({
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user.id,
        status: 'acknowledged',
      })
      .eq('id', logId);
    if (error) {
      toast.error(`Acknowledgement failed: ${error.message}`);
      return;
    }
    toast.success('Alert acknowledged');
    refetchLogs();
  };

  const toggleChannel = (channel: string) => {
    const cur = new Set(editing?.notification_channels ?? []);
    cur.has(channel) ? cur.delete(channel) : cur.add(channel);
    setEditing({ ...editing, notification_channels: Array.from(cur) });
  };

  const toggleRole = (role: string) => {
    const cur = new Set(editing?.recipient_roles ?? []);
    cur.has(role) ? cur.delete(role) : cur.add(role);
    setEditing({ ...editing, recipient_roles: Array.from(cur) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-card to-accent/5 border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Alert Routing &amp; Acknowledgement</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Configure how each severity tier disseminates across channels and track who has acknowledged active alerts.
              </p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(DEFAULT_RULE)} className="gap-2">
                <Plus className="w-4 h-4" /> New Routing Rule
              </Button>
            </DialogTrigger>
            <RuleDialog
              editing={editing}
              setEditing={setEditing}
              onSave={handleSave}
              toggleChannel={toggleChannel}
              toggleRole={toggleRole}
            />
          </Dialog>
        </div>
      </Card>

      {/* Ack KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total (50 latest)" value={ackStats.total} icon={BellRing} />
        <StatCard label="Acknowledged" value={ackStats.acked} icon={CheckCircle2} tint="hsl(160 70% 40%)" />
        <StatCard label="Pending" value={ackStats.pending} icon={Clock} tint="hsl(45 95% 50%)" />
        <StatCard label="Critical Unacked" value={ackStats.critical} icon={ShieldAlert} tint="hsl(0 90% 45%)" />
        <StatCard label="Avg MTTA" value={`${ackStats.avgMins}m`} icon={Activity} tint="hsl(210 80% 50%)" />
      </div>

      {/* Severity → Channel matrix */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Severity → Channel Routing Matrix</h3>
            <p className="text-xs text-muted-foreground mt-1">Aggregated from active rules. Edit a rule to change routing for a tier.</p>
          </div>
          <Badge variant="outline" className="gap-1"><Settings2 className="w-3 h-3" /> {rules.filter(r=>r.is_active).length} active</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Severity</th>
                {CHANNELS.map(c => (
                  <th key={c.id} className="text-center py-2 px-2 font-medium text-muted-foreground">
                    <div className="flex flex-col items-center gap-1">
                      <c.icon className="w-4 h-4" />
                      <span className="text-xs">{c.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEVERITIES.map(sev => (
                <tr key={sev} className="border-b border-border/50">
                  <td className="py-3 pr-4">
                    <Badge
                      style={{ backgroundColor: SEVERITY_META[sev].color, color: 'white' }}
                      className="border-0"
                    >
                      {SEVERITY_META[sev].label}
                    </Badge>
                  </td>
                  {CHANNELS.map(c => {
                    const on = severityMatrix[sev].has(c.id);
                    return (
                      <td key={c.id} className="text-center py-3 px-2">
                        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center ${
                          on ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground/40'
                        }`}>
                          {on ? '●' : '○'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rules list */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Configured Routing Rules</h3>
        {rulesLoading ? (
          <p className="text-sm text-muted-foreground">Loading rules…</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No routing rules configured yet. Create one to begin dispatching alerts.
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map(rule => (
              <div key={rule.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Switch checked={rule.is_active} onCheckedChange={() => toggleActive(rule)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">{rule.name}</span>
                      <Badge
                        style={{ backgroundColor: SEVERITY_META[rule.severity]?.color, color: 'white' }}
                        className="border-0 text-xs"
                      >
                        {rule.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{rule.trigger_type}</Badge>
                    </div>
                    {rule.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{rule.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {(rule.notification_channels ?? []).map(c => (
                        <Badge key={c} variant="secondary" className="text-xs gap-1">
                          {CHANNELS.find(ch => ch.id === c)?.label ?? c}
                        </Badge>
                      ))}
                      <Separator orientation="vertical" className="h-3 mx-1" />
                      {(rule.recipient_roles ?? []).map(r => (
                        <Badge key={r} variant="outline" className="text-xs gap-1">
                          <Users className="w-2.5 h-2.5" />{r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    cooldown {rule.cooldown_minutes}m · cap {rule.max_alerts_per_day}/d
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditing(rule); setOpen(true); }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Ack tracking */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Acknowledgement Tracking</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Acknowledgement rate: <span className="font-semibold text-foreground">{ackStats.rate}%</span> · Latest 50 alerts
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Alert</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Triggered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    No alerts to acknowledge.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((l: any) => {
                const acked = !!l.acknowledged_at;
                const sev = (l.severity as Severity) ?? 'info';
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      <Badge
                        style={{ backgroundColor: SEVERITY_META[sev]?.color, color: 'white' }}
                        className="border-0 text-xs"
                      >
                        {sev}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="font-medium text-sm text-foreground truncate">{l.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{l.message}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(l.channels_sent ?? []).slice(0, 4).map((c: string) => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(l.triggered_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {acked ? (
                        <Badge className="bg-success/20 text-success border-0 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Acked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!acked && (
                        <Button size="sm" variant="outline" onClick={() => acknowledge(l.id)}>
                          Acknowledge
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tint }: { label: string; value: any; icon: any; tint?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4" style={{ color: tint ?? 'hsl(var(--primary))' }} />
      </div>
      <div className="text-2xl font-bold text-foreground mt-2" style={tint ? { color: tint } : undefined}>
        {value}
      </div>
    </Card>
  );
}

function RuleDialog({
  editing, setEditing, onSave, toggleChannel, toggleRole,
}: {
  editing: Partial<AlertRule> | null;
  setEditing: (r: Partial<AlertRule> | null) => void;
  onSave: () => void;
  toggleChannel: (c: string) => void;
  toggleRole: (r: string) => void;
}) {
  if (!editing) return null;
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editing.id ? 'Edit Routing Rule' : 'New Routing Rule'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Name</Label>
            <Input
              value={editing.name ?? ''}
              onChange={e => setEditing({ ...editing, name: e.target.value })}
              placeholder="e.g. Critical risk score escalation"
            />
          </div>
          <div>
            <Label>Trigger Type</Label>
            <Select
              value={editing.trigger_type ?? 'risk_score'}
              onValueChange={v => setEditing({ ...editing, trigger_type: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Severity</Label>
            <Select
              value={editing.severity ?? 'warning'}
              onValueChange={v => setEditing({ ...editing, severity: v as Severity })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEVERITIES.map(s => <SelectItem key={s} value={s}>{SEVERITY_META[s].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Threshold</Label>
            <Input
              type="number"
              value={editing.threshold_value ?? ''}
              onChange={e => setEditing({ ...editing, threshold_value: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div>
            <Label>Cooldown (minutes)</Label>
            <Input
              type="number"
              value={editing.cooldown_minutes ?? 60}
              onChange={e => setEditing({ ...editing, cooldown_minutes: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Daily Cap</Label>
            <Input
              type="number"
              value={editing.max_alerts_per_day ?? 50}
              onChange={e => setEditing({ ...editing, max_alerts_per_day: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Input
            value={editing.description ?? ''}
            onChange={e => setEditing({ ...editing, description: e.target.value })}
            placeholder="Optional context shown in routing matrix"
          />
        </div>
        <div>
          <Label className="mb-2 block">Dissemination Channels</Label>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map(c => {
              const on = (editing.notification_channels ?? []).includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleChannel(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border transition-colors ${
                    on
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  <c.icon className="w-3 h-3" /> {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <Label className="mb-2 block">Recipient Roles</Label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map(r => {
              const on = (editing.recipient_roles ?? []).includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRole(r)}
                  className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                    on
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-background text-muted-foreground border-border hover:border-accent/50'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Switch
            checked={editing.is_active ?? true}
            onCheckedChange={v => setEditing({ ...editing, is_active: v })}
          />
          <Label>Rule is active</Label>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onSave}>{editing.id ? 'Save changes' : 'Create rule'}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
