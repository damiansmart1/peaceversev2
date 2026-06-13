import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Activity, AlertTriangle, Bell, CheckCircle2, Clock, Flame,
  Globe2, MapPin, Radio, Shield, TrendingUp, Zap, Users, FileDown,
  ArrowUpRight, Eye, Layers, Gauge,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadialBarChart, RadialBar,
} from 'recharts';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay } from 'date-fns';

interface Props {
  selectedCountry?: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  emergency: 'hsl(0 84% 50%)',
  critical: 'hsl(0 75% 55%)',
  high: 'hsl(20 90% 55%)',
  alert: 'hsl(30 95% 55%)',
  warning: 'hsl(45 95% 55%)',
  medium: 'hsl(45 95% 55%)',
  info: 'hsl(210 85% 55%)',
  low: 'hsl(160 70% 45%)',
};

const sevColor = (s?: string) => SEVERITY_COLOR[(s || 'info').toLowerCase()] || SEVERITY_COLOR.info;

const AlertsCommandCenter = ({ selectedCountry = 'ALL' }: Props) => {
  const [windowDays, setWindowDays] = useState<7 | 14 | 30>(7);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['ew-cmd-alerts', windowDays],
    queryFn: async () => {
      const since = subDays(new Date(), windowDays).toISOString();
      const { data, error } = await supabase
        .from('alert_logs')
        .select('*')
        .gte('triggered_at', since)
        .order('triggered_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  const { data: hotspots = [] } = useQuery({
    queryKey: ['ew-cmd-hotspots', selectedCountry],
    queryFn: async () => {
      let q = supabase.from('predictive_hotspots').select('*').eq('status', 'active');
      if (selectedCountry !== 'ALL') q = q.eq('country', selectedCountry);
      const { data, error } = await q.order('hotspot_score', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000,
  });

  const { data: risks = [] } = useQuery({
    queryKey: ['ew-cmd-risks', windowDays],
    queryFn: async () => {
      const since = subDays(new Date(), windowDays).toISOString();
      const { data, error } = await supabase
        .from('incident_risk_scores')
        .select('overall_risk_score, threat_level, escalation_probability, contagion_risk, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000,
  });

  const filteredAlerts = useMemo(
    () => alerts.filter((a: any) => severityFilter === 'all' || a.severity === severityFilter),
    [alerts, severityFilter]
  );

  // KPIs
  const kpis = useMemo(() => {
    const active = alerts.filter((a: any) => a.status === 'active').length;
    const ack = alerts.filter((a: any) => a.status === 'acknowledged').length;
    const resolved = alerts.filter((a: any) => a.status === 'resolved').length;
    const critical = alerts.filter((a: any) =>
      ['emergency', 'critical'].includes((a.severity || '').toLowerCase())
    ).length;
    const avgRisk =
      risks.length > 0
        ? Math.round(risks.reduce((s: number, r: any) => s + Number(r.overall_risk_score || 0), 0) / risks.length)
        : 0;
    const ackRate = alerts.length ? Math.round(((ack + resolved) / alerts.length) * 100) : 0;
    const mttaMs =
      alerts
        .filter((a: any) => a.acknowledged_at && a.triggered_at)
        .reduce(
          (acc: number, a: any) =>
            acc + (new Date(a.acknowledged_at).getTime() - new Date(a.triggered_at).getTime()),
          0
        ) / Math.max(1, alerts.filter((a: any) => a.acknowledged_at).length);
    const mttaMin = Math.round((mttaMs || 0) / 60000);
    return { active, ack, resolved, critical, avgRisk, ackRate, mttaMin, total: alerts.length };
  }, [alerts, risks]);

  // Time series
  const timeline = useMemo(() => {
    const buckets = new Map<string, any>();
    for (let i = windowDays - 1; i >= 0; i--) {
      const d = format(startOfDay(subDays(new Date(), i)), 'MMM dd');
      buckets.set(d, { date: d, emergency: 0, critical: 0, high: 0, warning: 0, info: 0, total: 0 });
    }
    alerts.forEach((a: any) => {
      const d = format(startOfDay(new Date(a.triggered_at)), 'MMM dd');
      const b = buckets.get(d);
      if (!b) return;
      const s = (a.severity || 'info').toLowerCase();
      const key = ['emergency', 'critical', 'high', 'warning'].includes(s) ? s : 'info';
      b[key] = (b[key] || 0) + 1;
      b.total += 1;
    });
    return Array.from(buckets.values());
  }, [alerts, windowDays]);

  // Severity distribution
  const severityDist = useMemo(() => {
    const m = new Map<string, number>();
    alerts.forEach((a: any) => {
      const s = (a.severity || 'info').toLowerCase();
      m.set(s, (m.get(s) || 0) + 1);
    });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value, fill: sevColor(name) }));
  }, [alerts]);

  // Type distribution
  const typeDist = useMemo(() => {
    const m = new Map<string, number>();
    alerts.forEach((a: any) => {
      const t = a.alert_type || 'unspecified';
      m.set(t, (m.get(t) || 0) + 1);
    });
    return Array.from(m.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [alerts]);

  // Top hotspots by country
  const countryHotspots = useMemo(() => {
    const m = new Map<string, { country: string; score: number; count: number }>();
    hotspots.forEach((h: any) => {
      const c = h.country || 'Unknown';
      const e = m.get(c) || { country: c, score: 0, count: 0 };
      e.score += Number(h.hotspot_score || 0);
      e.count += 1;
      m.set(c, e);
    });
    return Array.from(m.values())
      .map((e) => ({ ...e, score: Math.round(e.score / Math.max(1, e.count)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [hotspots]);

  const gaugeData = [{ name: 'risk', value: kpis.avgRisk, fill: kpis.avgRisk >= 70 ? sevColor('critical') : kpis.avgRisk >= 40 ? sevColor('warning') : sevColor('low') }];

  return (
    <div className="space-y-6">
      {/* Header / Controls */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="relative">
                  <Shield className="w-7 h-7 text-primary" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                </div>
                Alerts Command Center
              </CardTitle>
              <CardDescription className="mt-1">
                Unified situational picture for all stakeholders — operations, coordination & decision support
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Tabs value={String(windowDays)} onValueChange={(v) => setWindowDays(Number(v) as any)}>
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="7">7d</TabsTrigger>
                  <TabsTrigger value="14">14d</TabsTrigger>
                  <TabsTrigger value="30">30d</TabsTrigger>
                </TabsList>
              </Tabs>
              <Badge variant="outline" className="gap-1 border-success/40 text-success">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard icon={Bell} label="Total Alerts" value={kpis.total} accent="primary" loading={isLoading} />
        <KpiCard icon={Flame} label="Critical" value={kpis.critical} accent="destructive" pulse={kpis.critical > 0} />
        <KpiCard icon={AlertTriangle} label="Active" value={kpis.active} accent="warning" pulse={kpis.active > 0} />
        <KpiCard icon={Clock} label="Acknowledged" value={kpis.ack} accent="info" />
        <KpiCard icon={CheckCircle2} label="Resolved" value={kpis.resolved} accent="success" />
        <KpiCard icon={Gauge} label="Avg Risk" value={`${kpis.avgRisk}%`} accent="warning" />
        <KpiCard icon={Zap} label="MTTA (min)" value={kpis.mttaMin || '—'} accent="info" />
      </div>

      {/* Risk Gauge + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-primary" /> Alert Trend by Severity
            </CardTitle>
            <CardDescription>Daily alert volume over the last {windowDays} days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timeline} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  {(['emergency', 'critical', 'high', 'warning', 'info'] as const).map((k) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sevColor(k)} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={sevColor(k)} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {(['info', 'warning', 'high', 'critical', 'emergency'] as const).map((k) => (
                  <Area
                    key={k}
                    type="monotone"
                    dataKey={k}
                    stackId="1"
                    stroke={sevColor(k)}
                    fill={`url(#g-${k})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="w-4 h-4 text-primary" /> Aggregate Risk Index
            </CardTitle>
            <CardDescription>AI-weighted risk across active incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="55%"
                innerRadius="60%"
                outerRadius="100%"
                data={gaugeData}
                startAngle={210}
                endAngle={-30}
              >
                <RadialBar background dataKey="value" cornerRadius={12} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-20 mb-6">
              <div className="text-4xl font-bold text-foreground">{kpis.avgRisk}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Risk Score</div>
            </div>
            <div className="space-y-2 mt-4">
              <RiskBar label="Acknowledgment Rate" value={kpis.ackRate} />
              <RiskBar label="Active Pressure" value={Math.min(100, kpis.active * 10)} />
              <RiskBar label="Critical Density" value={Math.min(100, kpis.critical * 15)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="w-4 h-4 text-primary" /> Severity Mix
            </CardTitle>
          </CardHeader>
          <CardContent>
            {severityDist.length === 0 ? (
              <EmptyMini label="No severity data" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={severityDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {severityDist.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-primary" /> Alert Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeDist.length === 0 ? (
              <EmptyMini label="No alert types" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={typeDist} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe2 className="w-4 h-4 text-primary" /> Hotspot Pressure by Country
            </CardTitle>
            <CardDescription>Top predictive hotspot regions</CardDescription>
          </CardHeader>
          <CardContent>
            {countryHotspots.length === 0 ? (
              <EmptyMini label="No active hotspots" />
            ) : (
              <div className="space-y-2">
                {countryHotspots.map((c) => (
                  <div key={c.country} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3 h-3 text-muted-foreground" /> {c.country}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.count} zones · score {c.score}
                      </span>
                    </div>
                    <Progress value={Math.min(100, c.score)} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Funnel + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-primary" /> Response Funnel
            </CardTitle>
            <CardDescription>Alert lifecycle progression</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FunnelStep label="Triggered" value={kpis.total} total={kpis.total} color="hsl(0 75% 55%)" icon={Bell} />
            <FunnelStep
              label="Acknowledged"
              value={kpis.ack + kpis.resolved}
              total={kpis.total}
              color="hsl(30 95% 55%)"
              icon={Eye}
            />
            <FunnelStep label="Resolved" value={kpis.resolved} total={kpis.total} color="hsl(160 70% 45%)" icon={CheckCircle2} />
            <div className="pt-3 border-t mt-3 text-xs text-muted-foreground flex items-center justify-between">
              <span>Acknowledgment rate</span>
              <span className="font-semibold text-foreground">{kpis.ackRate}%</span>
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Mean time to acknowledge</span>
              <span className="font-semibold text-foreground">{kpis.mttaMin || '—'} min</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Radio className="w-4 h-4 text-primary animate-pulse" /> Live Alert Stream
                </CardTitle>
                <CardDescription>Most recent alerts across the system</CardDescription>
              </div>
              <div className="flex gap-1 flex-wrap">
                {(['all', 'emergency', 'critical', 'high', 'warning', 'info'] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={severityFilter === s ? 'default' : 'outline'}
                    className="h-7 px-2 text-xs capitalize"
                    onClick={() => setSeverityFilter(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[360px] pr-3">
              {filteredAlerts.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mb-2 text-success/60" />
                  <p className="text-sm">No alerts match this filter</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAlerts.slice(0, 50).map((a: any, i: number) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className="border rounded-lg p-3 hover:bg-muted/40 transition-colors"
                      style={{ borderLeft: `3px solid ${sevColor(a.severity)}` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge
                              className="capitalize text-white"
                              style={{ background: sevColor(a.severity) }}
                            >
                              {a.severity}
                            </Badge>
                            {a.alert_type && (
                              <Badge variant="outline" className="text-xs">
                                {a.alert_type}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs capitalize">
                              {a.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                              <Clock className="w-3 h-3" />
                              {format(new Date(a.triggered_at), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm truncate">{a.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.message}</p>
                          {a.context_data?.risk_score && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${a.context_data.risk_score}%`,
                                    background: sevColor(a.severity),
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium">{a.context_data.risk_score}</span>
                            </div>
                          )}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Stakeholder strip */}
      <Card className="bg-gradient-to-r from-primary/5 via-card to-secondary/5">
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
            <StakeholderTag icon={Shield} label="Government" desc="Coordinate response" />
            <StakeholderTag icon={Users} label="Partners & NGOs" desc="Field operations" />
            <StakeholderTag icon={Globe2} label="Citizens" desc="Public awareness" />
            <StakeholderTag icon={FileDown} label="Media & Observers" desc="Verified reporting" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const KpiCard = ({
  icon: Icon,
  label,
  value,
  accent,
  loading,
  pulse,
}: {
  icon: any;
  label: string;
  value: any;
  accent: 'primary' | 'destructive' | 'warning' | 'success' | 'info';
  loading?: boolean;
  pulse?: boolean;
}) => {
  const accentMap: Record<string, string> = {
    primary: 'from-primary/15 to-primary/5 text-primary',
    destructive: 'from-destructive/15 to-destructive/5 text-destructive',
    warning: 'from-warning/15 to-warning/5 text-warning',
    success: 'from-success/15 to-success/5 text-success',
    info: 'from-blue-500/15 to-blue-500/5 text-blue-500',
  };
  return (
    <Card className={`bg-gradient-to-br ${accentMap[accent]} border-border/50 relative overflow-hidden`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <Icon className={`w-4 h-4 ${pulse ? 'animate-pulse' : ''}`} />
          {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
        </div>
        <div className="text-2xl font-bold text-foreground">{loading ? '…' : value}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
};

const RiskBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}%</span>
    </div>
    <Progress value={value} className="h-1.5" />
  </div>
);

const FunnelStep = ({
  label, value, total, color, icon: Icon,
}: { label: string; value: number; total: number; color: string; icon: any }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color }} /> {label}
        </span>
        <span className="font-semibold">{value} <span className="text-xs text-muted-foreground">({pct}%)</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

const StakeholderTag = ({ icon: Icon, label, desc }: { icon: any; label: string; desc: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="font-semibold text-foreground text-sm">{label}</div>
    <div className="text-muted-foreground">{desc}</div>
  </div>
);

const EmptyMini = ({ label }: { label: string }) => (
  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">{label}</div>
);

export default AlertsCommandCenter;
