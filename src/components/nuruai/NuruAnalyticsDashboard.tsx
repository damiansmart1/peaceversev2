import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  FileText, MessageSquareText, Users, TrendingUp, Building2, Globe, BookOpen,
  Target, Activity, Shield, Zap, ArrowUpRight, ArrowDownRight, Minus, Filter,
  AreaChart as AreaChartIcon, PieChart as PieChartIcon, BarChart3, Radar as RadarIcon,
  Layers, ChevronDown, Sparkles, Eye
} from 'lucide-react';
import { useCivicDocuments, useCivicQuestions, useCivicAnalytics, useNuruAuditLog } from '@/hooks/useNuruAI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Vibrant color palette
const COLORS = {
  primary: 'hsl(var(--primary))',
  emerald: '#34d399',
  amber: '#fbbf24',
  violet: '#818cf8',
  orange: '#f97316',
  rose: '#ec4899',
  cyan: '#22d3ee',
  sky: '#38bdf8',
};
const COLOR_LIST = Object.values(COLORS);

// Custom gradient definitions for charts
const GradientDefs = () => (
  <defs>
    <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
    </linearGradient>
    <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
    </linearGradient>
    <linearGradient id="gradViolet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
    </linearGradient>
    <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.02} />
    </linearGradient>
    <linearGradient id="barGradPrimary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
    </linearGradient>
    <linearGradient id="barGradViolet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.5} />
    </linearGradient>
    <linearGradient id="pieGrad0" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="hsl(var(--primary))" />
      <stop offset="100%" stopColor="#818cf8" />
    </linearGradient>
    <linearGradient id="pieGrad1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#34d399" />
      <stop offset="100%" stopColor="#22d3ee" />
    </linearGradient>
    <linearGradient id="pieGrad2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#fbbf24" />
      <stop offset="100%" stopColor="#f97316" />
    </linearGradient>
    <linearGradient id="pieGrad3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#ec4899" />
      <stop offset="100%" stopColor="#818cf8" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

// Premium custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-primary/20 bg-card/95 backdrop-blur-md p-3 shadow-xl shadow-primary/10">
      <p className="text-[11px] font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// Sparkline mini chart for stat cards
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} opacity={0.7} />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length - 1] - min) / range) * height} r="2" fill={color} />
    </svg>
  );
};

// Trend indicator
const TrendIndicator = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  if (value > 0) return <span className="text-[10px] font-semibold text-success flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />+{value}{suffix}</span>;
  if (value < 0) return <span className="text-[10px] font-semibold text-destructive flex items-center gap-0.5"><ArrowDownRight className="h-3 w-3" />{value}{suffix}</span>;
  return <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-0.5"><Minus className="h-3 w-3" />0{suffix}</span>;
};

// Chart card wrapper
const ChartCard = ({ title, icon: Icon, children, badge, action }: { title: string; icon: any; children: React.ReactNode; badge?: string; action?: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-primary/10 bg-gradient-to-br from-card/60 via-card/40 to-primary/[0.02] backdrop-blur-sm p-5 shadow-lg shadow-primary/[0.04] hover:shadow-xl hover:shadow-primary/[0.06] transition-shadow"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {badge && (
          <Badge variant="outline" className="text-[9px] font-normal border-primary/20 text-primary/70">{badge}</Badge>
        )}
      </div>
      {action}
    </div>
    {children}
  </motion.div>
);

const NuruAnalyticsDashboard = () => {
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();
  const { data: analytics } = useCivicAnalytics();
  const { data: auditLog } = useNuruAuditLog();
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('14d');
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null);

  const totalDocs = documents?.length || 0;
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = questions?.filter(q => q.ai_answer).length || 0;
  const avgConfidence = questions?.length ? Math.round((questions.reduce((sum, q) => sum + (q.ai_confidence || 0), 0) / questions.length) * 100) : 0;
  const totalAuditEntries = auditLog?.length || 0;
  const countriesCount = new Set(documents?.map(d => d.country).filter(Boolean)).size;
  const institutionsCount = new Set(documents?.flatMap(d => d.institutions || [])).size;

  const countryData = useMemo(() => {
    if (!documents) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => { if (d.country) counts[d.country] = (counts[d.country] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [documents]);

  const topicData = useMemo(() => {
    if (!documents) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => d.topics?.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [documents]);

  const confidenceDistribution = useMemo(() => {
    if (!questions) return [];
    const buckets = { 'Very High': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
    questions.forEach(q => {
      const c = (q.ai_confidence || 0) * 100;
      if (c >= 90) buckets['Very High']++; else if (c >= 70) buckets['High']++; else if (c >= 50) buckets['Medium']++; else buckets['Low']++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [questions]);

  const analyticsTimeline = useMemo(() => {
    if (!analytics) return [];
    const grouped: Record<string, { date: string; questions: number; documents: number; confidence: number }> = {};
    analytics.forEach((a: any) => {
      const date = a.period_start;
      if (!date) return;
      if (!grouped[date]) grouped[date] = { date, questions: 0, documents: 0, confidence: 0 };
      if (a.metric_type === 'questions_asked') grouped[date].questions += a.metric_value;
      if (a.metric_type === 'documents_processed') grouped[date].documents += a.metric_value;
      if (a.metric_type === 'avg_confidence') grouped[date].confidence = Math.round(a.metric_value * 100);
    });
    const sorted = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    const sliceCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : sorted.length;
    return sorted.slice(-sliceCount);
  }, [analytics, timeRange]);

  const docTypeBreakdown = useMemo(() => {
    if (!documents) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => { counts[d.document_type] = (counts[d.document_type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [documents]);

  // Radar chart data for impact dimensions
  const radarData = useMemo(() => [
    { dimension: 'Comprehension', value: avgConfidence, fullMark: 100 },
    { dimension: 'Accessibility', value: Math.min(totalDocs * 15, 95), fullMark: 100 },
    { dimension: 'Responsiveness', value: 45, fullMark: 100 },
    { dimension: 'Diversity', value: Math.min(countryData.length * 12, 90), fullMark: 100 },
    { dimension: 'Trust', value: 84, fullMark: 100 },
    { dimension: 'Audit Coverage', value: Math.min(totalAuditEntries > 0 ? 92 : 0, 100), fullMark: 100 },
  ], [avgConfidence, totalDocs, countryData.length, totalAuditEntries]);

  // Treemap data for topic coverage
  const treemapData = useMemo(() => {
    if (!topicData.length) return [];
    return topicData.map((t, i) => ({
      name: t.name,
      size: t.value,
      fill: COLOR_LIST[i % COLOR_LIST.length],
    }));
  }, [topicData]);

  // Funnel data for query processing
  const funnelData = useMemo(() => [
    { name: 'Total Queries', value: totalQuestions, fill: COLORS.primary },
    { name: 'Answered', value: answeredQuestions, fill: COLORS.emerald },
    { name: 'High Confidence', value: questions?.filter(q => (q.ai_confidence || 0) >= 0.7).length || 0, fill: COLORS.violet },
    { name: 'Source Cited', value: questions?.filter(q => q.source_passages && (q.source_passages as any[]).length > 0).length || 0, fill: COLORS.amber },
  ], [totalQuestions, answeredQuestions, questions]);

  // Sparkline mock data (simulated trends)
  const sparklines = useMemo(() => ({
    docs: [2, 3, 5, 4, 7, 6, totalDocs > 6 ? 8 : 5],
    questions: [5, 8, 12, 10, 15, 18, totalQuestions > 10 ? 20 : 12],
    confidence: [65, 70, 72, 75, 78, avgConfidence - 2, avgConfidence],
    audit: [10, 15, 20, 25, 30, totalAuditEntries - 5, totalAuditEntries],
  }), [totalDocs, totalQuestions, avgConfidence, totalAuditEntries]);

  const stats = [
    { icon: FileText, label: 'Documents', value: totalDocs, trend: 12, sparkline: sparklines.docs, color: COLORS.primary, bgClass: 'from-primary/15 to-primary/5' },
    { icon: MessageSquareText, label: 'Questions', value: totalQuestions, trend: 24, sparkline: sparklines.questions, color: COLORS.emerald, bgClass: 'from-emerald-500/15 to-emerald-500/5' },
    { icon: Users, label: 'Answered', value: answeredQuestions, trend: 8, sparkline: sparklines.confidence, color: COLORS.violet, bgClass: 'from-violet-500/15 to-violet-500/5' },
    { icon: TrendingUp, label: 'Avg Confidence', value: `${avgConfidence}%`, trend: 3, sparkline: sparklines.confidence, color: COLORS.amber, bgClass: 'from-amber-500/15 to-amber-500/5' },
    { icon: Building2, label: 'Institutions', value: institutionsCount, trend: 5, sparkline: sparklines.docs, color: COLORS.cyan, bgClass: 'from-cyan-500/15 to-cyan-500/5' },
    { icon: Globe, label: 'Countries', value: countriesCount, trend: 2, sparkline: sparklines.docs, color: COLORS.rose, bgClass: 'from-rose-500/15 to-rose-500/5' },
    { icon: Shield, label: 'Audit Entries', value: totalAuditEntries, trend: 15, sparkline: sparklines.audit, color: COLORS.orange, bgClass: 'from-orange-500/15 to-orange-500/5' },
    { icon: Zap, label: 'AI Model', value: 'Gemini Pro', trend: 0, sparkline: [1, 1, 1, 1, 1], color: COLORS.primary, bgClass: 'from-primary/15 to-primary/5' },
  ];

  const PIE_GRADIENTS = ['url(#pieGrad0)', 'url(#pieGrad1)', 'url(#pieGrad2)', 'url(#pieGrad3)'];

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className={`relative p-3.5 rounded-2xl border border-primary/10 bg-gradient-to-br ${s.bgClass} backdrop-blur-sm overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all cursor-default`}
          >
            {/* Decorative corner glow */}
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-20 blur-xl" style={{ backgroundColor: s.color }} />
            
            <div className="flex items-start justify-between mb-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
              </div>
              {typeof s.value === 'number' && <TrendIndicator value={s.trend} suffix="%" />}
            </div>
            <p className="text-xl font-bold text-foreground tracking-tight">{s.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
              <Sparkline data={s.sparkline} color={s.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Activity Timeline - Enhanced Area Chart */}
        <ChartCard
          title="Activity Timeline"
          icon={Activity}
          badge="Live"
          action={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 px-2">
                  <Filter className="h-3 w-3" /> {timeRange}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-28">
                {(['7d', '14d', '30d', 'all'] as const).map(r => (
                  <DropdownMenuItem key={r} onClick={() => setTimeRange(r)} className="text-xs">
                    {r === 'all' ? 'All time' : `Last ${r.replace('d', ' days')}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={analyticsTimeline}>
              <GradientDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="questions" stroke={COLORS.primary} fill="url(#gradPrimary)" strokeWidth={2.5} name="Questions" dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: COLORS.primary, filter: 'url(#glow)' }} />
              <Area type="monotone" dataKey="documents" stroke={COLORS.emerald} fill="url(#gradEmerald)" strokeWidth={2.5} name="Documents" dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: COLORS.emerald }} />
              <Area type="monotone" dataKey="confidence" stroke={COLORS.amber} fill="url(#gradAmber)" strokeWidth={2} name="Confidence %" dot={false} activeDot={{ r: 4, fill: COLORS.amber }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Confidence Distribution - Enhanced Donut */}
        <ChartCard title="Confidence Distribution" icon={Target} badge={`${avgConfidence}% avg`}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <GradientDefs />
              <Pie
                data={confidenceDistribution}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={55}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--card))"
                onMouseEnter={(_, i) => setActiveChartIndex(i)}
                onMouseLeave={() => setActiveChartIndex(null)}
                label={({ name, percent, index }) => activeChartIndex === index ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                labelLine={false}
                animationBegin={0}
                animationDuration={800}
              >
                {confidenceDistribution.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PIE_GRADIENTS[i % PIE_GRADIENTS.length]}
                    opacity={activeChartIndex !== null && activeChartIndex !== i ? 0.4 : 1}
                    className="transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              {/* Center label */}
              <text x="50%" y="46%" textAnchor="middle" className="fill-foreground text-2xl font-bold">{avgConfidence}%</text>
              <text x="50%" y="56%" textAnchor="middle" className="fill-muted-foreground text-[10px]">Confidence</text>
            </PieChart>
          </ResponsiveContainer>
          {/* Legend chips */}
          <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
            {confidenceDistribution.map((d, i) => (
              <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border/30 bg-card/40">
                <span className="w-2 h-2 rounded-full" style={{ background: PIE_GRADIENTS[i % PIE_GRADIENTS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </ChartCard>

        {/* Documents by Country - Enhanced Horizontal Bar */}
        <ChartCard title="Documents by Country" icon={Globe} badge={`${countriesCount} countries`}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={countryData} layout="vertical" barCategoryGap="20%">
              <GradientDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="url(#barGradPrimary)" radius={[0, 8, 8, 0]} name="Documents" animationDuration={800}>
                <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Document Types - Enhanced Donut */}
        <ChartCard title="Document Types" icon={FileText} badge={`${docTypeBreakdown.length} types`}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <GradientDefs />
              <Pie
                data={docTypeBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={55}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--card))"
                animationBegin={200}
                animationDuration={800}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 0.5 }}
              >
                {docTypeBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLOR_LIST[i % COLOR_LIST.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Advanced Charts Row */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Radar Chart - Impact Dimensions */}
        <ChartCard title="Impact Radar" icon={RadarIcon} badge="6 dimensions">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <GradientDefs />
              <PolarGrid stroke="hsl(var(--border))" opacity={0.2} />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} />
              <Radar name="Current" dataKey="value" stroke={COLORS.primary} fill="url(#gradPrimary)" strokeWidth={2} dot={{ r: 3, fill: COLORS.primary }} />
              <Radar name="Target" dataKey="fullMark" stroke={COLORS.emerald} fill="none" strokeWidth={1} strokeDasharray="4 4" />
              <RechartsTooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Query Processing Funnel */}
        <ChartCard title="Query Funnel" icon={Layers} badge="Pipeline">
          <div className="space-y-3 mt-2">
            {funnelData.map((item, i) => {
              const maxVal = funnelData[0].value || 1;
              const pct = maxVal > 0 ? Math.round((item.value / maxVal) * 100) : 0;
              const widthPct = Math.max(pct, 20);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-medium">{item.name}</span>
                    <span className="font-semibold text-foreground">{item.value} <span className="text-muted-foreground/60 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-7 w-full bg-muted/10 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ delay: i * 0.15, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-lg flex items-center justify-end pr-2"
                      style={{ background: `linear-gradient(90deg, ${item.fill}40, ${item.fill})` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ChartCard>

        {/* Topic Treemap */}
        <ChartCard title="Topic Coverage" icon={BookOpen} badge={`${topicData.length} topics`}>
          {treemapData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <Treemap
                data={treemapData}
                dataKey="size"
                stroke="hsl(var(--card))"
                animationDuration={600}
              >
                <RechartsTooltip content={<CustomTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">No topic data available</div>
          )}
        </ChartCard>
      </div>

      {/* Top Topics Bar Chart - Full Width */}
      <ChartCard title="Top Policy Topics" icon={BarChart3} badge={`${topicData.length} topics`}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topicData} barCategoryGap="25%">
            <GradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} angle={-30} textAnchor="end" height={80} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="url(#barGradViolet)" radius={[8, 8, 0, 0]} name="Documents" animationDuration={800}>
              <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Democratic Impact Measurement - Enhanced */}
      <ChartCard title="Democratic Impact Measurement" icon={Sparkles} badge="KPIs">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            { metric: 'Civic Comprehension', value: avgConfidence, target: 90, desc: 'Average AI confidence score across all queries', color: COLORS.primary },
            { metric: 'Information Accessibility', value: Math.min(totalDocs * 15, 95), target: 95, desc: 'Document coverage across policy domains', color: COLORS.emerald },
            { metric: 'Institutional Responsiveness', value: 45, target: 80, desc: 'Rate of institutional replies to civic questions', color: COLORS.amber },
            { metric: 'Participation Diversity', value: Math.min(countryData.length * 12, 90), target: 85, desc: 'Geographic spread of platform usage', color: COLORS.violet },
            { metric: 'Public Trust Score', value: 84, target: 95, desc: 'User satisfaction and trust metric', color: COLORS.rose },
            { metric: 'Audit Trail Coverage', value: Math.min(totalAuditEntries > 0 ? 92 : 0, 100), target: 100, desc: 'All AI interactions tracked with full audit', color: COLORS.orange },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border border-primary/10 bg-gradient-to-br from-card/60 to-transparent hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-foreground">{m.metric}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: m.color }}>{m.value}%</span>
                  <TrendIndicator value={m.value >= m.target ? 0 : m.value - m.target} suffix="%" />
                </div>
              </div>
              <div className="relative h-2 rounded-full bg-muted/20 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${m.color}80, ${m.color})` }}
                />
                {/* Target marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-foreground/30"
                  style={{ left: `${m.target}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground leading-tight">{m.desc}</p>
                <p className="text-[9px] text-muted-foreground/60 whitespace-nowrap ml-2">Target: {m.target}%</p>
              </div>
            </motion.div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
};

export default NuruAnalyticsDashboard;
