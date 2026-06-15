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
  ArrowUpRight, Eye, Layers, Gauge, Send, Network, Timer, Siren,
  HeartPulse, BarChart3, Brain, Building2, Megaphone, Satellite,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadialBarChart, RadialBar,
  LineChart, Line, ComposedChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, formatDistanceToNowStrict, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';

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

const POSTURE_LEVELS = [
  { key: 'GREEN', label: 'Steady State', color: 'hsl(160 70% 40%)', desc: 'Routine monitoring · no immediate escalation' },
  { key: 'BLUE', label: 'Elevated Watch', color: 'hsl(210 85% 50%)', desc: 'Increased signal volume · partners on standby' },
  { key: 'YELLOW', label: 'Heightened Alert', color: 'hsl(45 95% 50%)', desc: 'Active incidents · coordination cell engaged' },
  { key: 'ORANGE', label: 'High Tempo', color: 'hsl(20 90% 55%)', desc: 'Multi-zone pressure · rapid response posture' },
  { key: 'RED', label: 'Crisis Posture', color: 'hsl(0 80% 50%)', desc: 'Emergency operations · full inter-agency activation' },
];

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

  const { data: incidents = [] } = useQuery({
    queryKey: ['ew-cmd-incidents', windowDays, selectedCountry],
    queryFn: async () => {
      const since = subDays(new Date(), windowDays).toISOString();
      let q = supabase
        .from('citizen_reports')
        .select('id,title,category,severity_level,location_country,location_city,estimated_people_affected,casualties_reported,injuries_reported,created_at,status')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(300);
      if (selectedCountry !== 'ALL') q = q.eq('location_country', selectedCountry);
      const { data, error } = await q;
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
    const ackedAlerts = alerts.filter((a: any) => a.acknowledged_at);
    const mttaMs =
      ackedAlerts.reduce(
        (acc: number, a: any) =>
          acc + (new Date(a.acknowledged_at).getTime() - new Date(a.triggered_at).getTime()),
        0
      ) / Math.max(1, ackedAlerts.length);
    const mttaMin = Math.round((mttaMs || 0) / 60000);

    // MTTR proxy from resolved citizen reports w/ resolution_date if present (using updated_at proxy unavailable here)
    // Oldest unresolved
    const oldestActive = alerts
      .filter((a: any) => a.status === 'active')
      .reduce((oldest: any, a: any) =>
        !oldest || new Date(a.triggered_at) < new Date(oldest.triggered_at) ? a : oldest, null);
    const oldestActiveMin = oldestActive
      ? differenceInMinutes(new Date(), new Date(oldestActive.triggered_at))
      : 0;

    const peopleAffected = incidents.reduce((s: number, i: any) => s + (i.estimated_people_affected || 0), 0);
    const casualties = incidents.reduce((s: number, i: any) => s + (i.casualties_reported || 0), 0);
    const injuries = incidents.reduce((s: number, i: any) => s + (i.injuries_reported || 0), 0);

    const avgEscalation = risks.length
      ? Math.round((risks.reduce((s: number, r: any) => s + Number(r.escalation_probability || 0), 0) / risks.length) * 100) / 100
      : 0;
    const avgContagion = risks.length
      ? Math.round((risks.reduce((s: number, r: any) => s + Number(r.contagion_risk || 0), 0) / risks.length) * 100) / 100
      : 0;

    return {
      active, ack, resolved, critical, avgRisk, ackRate, mttaMin,
      total: alerts.length, oldestActiveMin, peopleAffected, casualties, injuries,
      avgEscalation, avgContagion,
    };
  }, [alerts, risks, incidents]);

  // Posture
  const posture = useMemo(() => {
    const score =
      kpis.critical * 25 +
      kpis.active * 5 +
      (kpis.avgRisk >= 70 ? 30 : kpis.avgRisk >= 40 ? 15 : 0) +
      (kpis.avgEscalation > 0.6 ? 15 : 0);
    if (score >= 100) return POSTURE_LEVELS[4];
    if (score >= 60) return POSTURE_LEVELS[3];
    if (score >= 35) return POSTURE_LEVELS[2];
    if (score >= 15) return POSTURE_LEVELS[1];
    return POSTURE_LEVELS[0];
  }, [kpis]);

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

  // Hourly heatmap (last 24h)
  const hourlyTempo = useMemo(() => {
    const buckets: Array<{ hour: string; alerts: number; critical: number }> = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const h = new Date(now.getTime() - i * 3600_000);
      buckets.push({ hour: format(h, 'HH:00'), alerts: 0, critical: 0 });
    }
    alerts.forEach((a: any) => {
      const t = new Date(a.triggered_at);
      const diffH = Math.floor((now.getTime() - t.getTime()) / 3600_000);
      if (diffH >= 0 && diffH < 24) {
        const idx = 23 - diffH;
        buckets[idx].alerts += 1;
        if (['emergency', 'critical'].includes((a.severity || '').toLowerCase())) buckets[idx].critical += 1;
      }
    });
    return buckets;
  }, [alerts]);

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

  // Dissemination channel mix
  const channelMix = useMemo(() => {
    const m = new Map<string, number>();
    alerts.forEach((a: any) => {
      (a.channels_sent || []).forEach((c: string) => m.set(c, (m.get(c) || 0) + 1));
    });
    if (m.size === 0) return [];
    return Array.from(m.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [alerts]);

  // Top affected locations
  const affectedLocations = useMemo(() => {
    const m = new Map<string, { key: string; country: string; city: string; affected: number; casualties: number; count: number }>();
    incidents.forEach((i: any) => {
      const country = i.location_country || 'Unknown';
      const city = i.location_city || '—';
      const key = `${country}|${city}`;
      const e = m.get(key) || { key, country, city, affected: 0, casualties: 0, count: 0 };
      e.affected += i.estimated_people_affected || 0;
      e.casualties += (i.casualties_reported || 0) + (i.injuries_reported || 0);
      e.count += 1;
      m.set(key, e);
    });
    return Array.from(m.values()).sort((a, b) => b.affected - a.affected).slice(0, 6);
  }, [incidents]);

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

  // Threat level mix from risk scores
  const threatMix = useMemo(() => {
    const m = new Map<string, number>();
    risks.forEach((r: any) => {
      const t = (r.threat_level || 'unknown').toLowerCase();
      m.set(t, (m.get(t) || 0) + 1);
    });
    return Array.from(m.entries()).map(([name, value]) => ({ name, value, fill: sevColor(name) }));
  }, [risks]);

  const gaugeData = [{ name: 'risk', value: kpis.avgRisk, fill: kpis.avgRisk >= 70 ? sevColor('critical') : kpis.avgRisk >= 40 ? sevColor('warning') : sevColor('low') }];

  const exportCsv = () => {
    if (!alerts.length) {
      toast.error('No alerts to export');
      return;
    }
    const rows = [
      ['id', 'triggered_at', 'severity', 'status', 'alert_type', 'title', 'message', 'channels'],
      ...alerts.map((a: any) => [
        a.id,
        a.triggered_at,
        a.severity || '',
        a.status || '',
        a.alert_type || '',
        (a.title || '').replace(/"/g, "'"),
        (a.message || '').replace(/"/g, "'"),
        (a.channels_sent || []).join('|'),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `command-center-alerts-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${alerts.length} alerts`);
  };

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
                Unified situational picture for all stakeholders — operations, coordination &amp; decision support
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
              <Button size="sm" variant="outline" onClick={exportCsv} className="h-8">
                <FileDown className="w-3.5 h-3.5 mr-1" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Situational Posture Banner */}
      <Card
        className="border-0 overflow-hidden relative"
        style={{
          background: `linear-gradient(90deg, ${posture.color}22 0%, hsl(var(--card)) 60%)`,
          borderLeft: `5px solid ${posture.color}`,
        }}
      >
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center relative"
                style={{ background: `${posture.color}22`, color: posture.color }}
              >
                <Siren className="w-6 h-6" />
                <span
                  className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ background: posture.color }}
                />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Operational Posture</div>
                <div className="text-xl font-bold flex items-center gap-2" style={{ color: posture.color }}>
                  {posture.key}
                  <Badge variant="outline" className="text-[10px]" style={{ borderColor: posture.color, color: posture.color }}>
                    {posture.label}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{posture.desc}</div>
              </div>
            </div>
            <PostureMini icon={Flame} label="Critical" value={kpis.critical} color={sevColor('critical')} />
            <PostureMini icon={HeartPulse} label="People Affected" value={kpis.peopleAffected.toLocaleString()} color="hsl(var(--primary))" />
            <PostureMini
              icon={Timer}
              label="Oldest Active"
              value={kpis.oldestActiveMin ? formatDuration(kpis.oldestActiveMin) : '—'}
              color={kpis.oldestActiveMin > 120 ? sevColor('warning') : sevColor('low')}
            />
          </div>
        </CardContent>
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
              <RiskBar label="Escalation Probability" value={Math.round(kpis.avgEscalation * 100)} />
              <RiskBar label="Contagion Risk" value={Math.round(kpis.avgContagion * 100)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Tempo (24h) */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-primary" /> Operational Tempo · Last 24 Hours
              </CardTitle>
              <CardDescription>Hour-by-hour alert volume with critical overlay</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Peak hour: {hourlyTempo.reduce((p, c) => (c.alerts > p.alerts ? c : p), hourlyTempo[0])?.hour || '—'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={hourlyTempo} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="alerts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="critical"
                stroke={sevColor('critical')}
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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

      {/* Channel mix + Threat mix + Affected communities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="w-4 h-4 text-primary" /> Dissemination Channels
            </CardTitle>
            <CardDescription>Where alerts are reaching audiences</CardDescription>
          </CardHeader>
          <CardContent>
            {channelMix.length === 0 ? (
              <EmptyMini label="No channel activity yet" />
            ) : (
              <div className="space-y-2">
                {channelMix.map((c) => {
                  const pct = Math.round((c.value / Math.max(1, kpis.total)) * 100);
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="capitalize flex items-center gap-1.5">
                          <ChannelIcon name={c.name} /> {c.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.value} sends · {pct}%
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-4 h-4 text-primary" /> AI Threat Classification
            </CardTitle>
            <CardDescription>Risk-engine threat-level mix</CardDescription>
          </CardHeader>
          <CardContent>
            {threatMix.length === 0 ? (
              <EmptyMini label="No risk scoring data" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={threatMix} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {threatMix.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-primary" /> Most Affected Communities
            </CardTitle>
            <CardDescription>Estimated people affected · this window</CardDescription>
          </CardHeader>
          <CardContent>
            {affectedLocations.length === 0 ? (
              <EmptyMini label="No reported impact yet" />
            ) : (
              <div className="space-y-2">
                {affectedLocations.map((l) => (
                  <div key={l.key} className="flex items-center justify-between gap-3 p-2 rounded-md border border-border/60 hover:bg-muted/40 transition-colors">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" /> {l.city}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l.country} · {l.count} incidents</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">{l.affected.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">{l.casualties} casualties</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SLA + Coordination + Decision Brief */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="w-4 h-4 text-primary" /> Response SLA
            </CardTitle>
            <CardDescription>Operational performance targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <SlaRow
              label="MTTA — target ≤ 30 min"
              value={kpis.mttaMin}
              target={30}
              unit="min"
            />
            <SlaRow
              label="Acknowledgment rate — target ≥ 80%"
              value={kpis.ackRate}
              target={80}
              unit="%"
              higherIsBetter
            />
            <SlaRow
              label="Resolution share — target ≥ 60%"
              value={kpis.total ? Math.round((kpis.resolved / kpis.total) * 100) : 0}
              target={60}
              unit="%"
              higherIsBetter
            />
            <SlaRow
              label="Oldest active — target ≤ 120 min"
              value={kpis.oldestActiveMin}
              target={120}
              unit="min"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Network className="w-4 h-4 text-primary" /> Coordination Cell
            </CardTitle>
            <CardDescription>Stakeholder activation per posture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <CoordRow icon={Building2} label="Government Ops Centre" active={posture.key !== 'GREEN'} note="Coordinate response, mobilise resources" />
            <CoordRow icon={Users} label="Partners &amp; NGOs" active={['YELLOW', 'ORANGE', 'RED'].includes(posture.key)} note="Field deployments, humanitarian aid" />
            <CoordRow icon={Megaphone} label="Public Communications" active={['ORANGE', 'RED'].includes(posture.key)} note="Verified advisories, counter-misinformation" />
            <CoordRow icon={Satellite} label="Regional Bodies (AU/RECs)" active={posture.key === 'RED'} note="Cross-border mediation &amp; support" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 via-card to-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-primary" /> Decision Brief
            </CardTitle>
            <CardDescription>Auto-generated situational summary</CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed space-y-2">
            <p>
              Across the last <strong>{windowDays} days</strong> the system processed{' '}
              <strong>{kpis.total}</strong> alerts, of which <strong>{kpis.critical}</strong> were critical-grade and{' '}
              <strong>{kpis.active}</strong> remain active.
            </p>
            <p>
              Aggregate AI risk index sits at <strong style={{ color: gaugeData[0].fill }}>{kpis.avgRisk}/100</strong>{' '}
              with mean escalation probability <strong>{Math.round(kpis.avgEscalation * 100)}%</strong> and contagion risk{' '}
              <strong>{Math.round(kpis.avgContagion * 100)}%</strong>.
            </p>
            <p>
              Reported impact: <strong>{kpis.peopleAffected.toLocaleString()}</strong> people affected,{' '}
              <strong>{kpis.casualties}</strong> casualties, <strong>{kpis.injuries}</strong> injuries.
            </p>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Recommendation: maintain <strong style={{ color: posture.color }}>{posture.label}</strong> posture and prioritise the top{' '}
              {Math.min(3, countryHotspots.length)} hotspot{countryHotspots.length === 1 ? '' : 's'} for coordinated response.
            </p>
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
            <div className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Oldest unresolved</span>
              <span className="font-semibold text-foreground">
                {kpis.oldestActiveMin ? formatDuration(kpis.oldestActiveMin) : '—'}
              </span>
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
                              {formatDistanceToNowStrict(new Date(a.triggered_at), { addSuffix: true })}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm truncate">{a.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.message}</p>
                          <div className="mt-2 flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
                            {a.channels_sent?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3" /> {a.channels_sent.join(', ')}
                              </span>
                            )}
                            {a.recipients?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {a.recipients.length} recipients
                              </span>
                            )}
                            {a.context_data?.risk_score != null && (
                              <span className="flex items-center gap-1">
                                <Gauge className="w-3 h-3" /> risk {a.context_data.risk_score}
                              </span>
                            )}
                          </div>
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
            <StakeholderTag icon={Users} label="Partners &amp; NGOs" desc="Field operations" />
            <StakeholderTag icon={Globe2} label="Citizens" desc="Public awareness" />
            <StakeholderTag icon={FileDown} label="Media &amp; Observers" desc="Verified reporting" />
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

const PostureMini = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) => (
  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/40 border border-border/40">
    <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: `${color}22`, color }}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-bold leading-tight">{value}</div>
    </div>
  </div>
);

const SlaRow = ({
  label, value, target, unit, higherIsBetter,
}: { label: string; value: number; target: number; unit: string; higherIsBetter?: boolean }) => {
  const meets = higherIsBetter ? value >= target : value <= target && value > 0;
  const color = meets ? 'hsl(160 70% 40%)' : value === 0 ? 'hsl(var(--muted-foreground))' : 'hsl(20 90% 55%)';
  const pct = higherIsBetter
    ? Math.min(100, Math.round((value / target) * 100))
    : value === 0 ? 0 : Math.min(100, Math.round((target / Math.max(value, 1)) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold flex items-center gap-1" style={{ color }}>
          {value || '—'}{value ? ` ${unit}` : ''}
          {meets ? <CheckCircle2 className="w-3 h-3" /> : value ? <AlertTriangle className="w-3 h-3" /> : null}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

const CoordRow = ({ icon: Icon, label, active, note }: { icon: any; label: string; active: boolean; note: string }) => (
  <div className={`flex items-start gap-3 p-2 rounded-md border ${active ? 'border-primary/40 bg-primary/5' : 'border-border/40'}`}>
    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-sm font-medium flex items-center gap-2">
        {label}
        <Badge variant={active ? 'default' : 'outline'} className="text-[9px] h-4 px-1.5">
          {active ? 'ACTIVE' : 'STANDBY'}
        </Badge>
      </div>
      <div className="text-[11px] text-muted-foreground">{note}</div>
    </div>
  </div>
);

const ChannelIcon = ({ name }: { name: string }) => {
  const n = (name || '').toLowerCase();
  if (n.includes('sms')) return <Send className="w-3 h-3" />;
  if (n.includes('email')) return <Send className="w-3 h-3" />;
  if (n.includes('push')) return <Bell className="w-3 h-3" />;
  if (n.includes('radio')) return <Radio className="w-3 h-3" />;
  if (n.includes('ussd')) return <Megaphone className="w-3 h-3" />;
  return <Send className="w-3 h-3" />;
};

const formatDuration = (mins: number) => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return `${h}h ${m}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
};

export default AlertsCommandCenter;
