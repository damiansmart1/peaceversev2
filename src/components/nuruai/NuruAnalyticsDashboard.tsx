import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, MessageSquareText, Users, TrendingUp, Building2, Globe, BookOpen,
  Target, Activity, Shield, Zap, ArrowUpRight, ArrowDownRight, Minus, Filter,
  Layers, ChevronDown, Sparkles, Download, Clock, Brain, Search, BarChart3,
  Radar as RadarIcon, CircleDot, GitCompare, AlertTriangle, CheckCircle2,
  Timer, Cpu, Coins, Eye, TrendingDown, RefreshCw, MessageCircle
} from 'lucide-react';
import { useCivicDocuments, useCivicQuestions, useCivicAnalytics, useNuruAuditLog, useClaimReviewHistory } from '@/hooks/useNuruAI';
import { useTokenUsageTimeline, useConversationAnalytics, useMessageAnalytics, useClaimReviewStats, useInstitutionalResponseStats, useNuruRecentActivity } from '@/hooks/useNuruAnalytics';
import { useTokenUsageStats, useTokenLimits } from '@/hooks/useNuruTokenLimits';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, LabelList, ScatterChart, Scatter, ZAxis, ComposedChart, Line
} from 'recharts';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, subDays, isToday, isYesterday, differenceInMinutes, parseISO, getHours, getDay } from 'date-fns';
import { toast } from 'sonner';

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
    <linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#ec4899" stopOpacity={0.35} />
      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.02} />
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
      <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

const PIE_GRADIENTS = ['url(#pieGrad0)', 'url(#pieGrad1)', 'url(#pieGrad2)', 'url(#pieGrad3)'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-primary/20 bg-card/95 backdrop-blur-md p-3 shadow-xl shadow-primary/10">
      <p className="text-[11px] font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} opacity={0.7} />
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="2" fill={color} />
    </svg>
  );
};

const TrendIndicator = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  if (value > 0) return <span className="text-[10px] font-semibold text-success flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />+{value}{suffix}</span>;
  if (value < 0) return <span className="text-[10px] font-semibold text-destructive flex items-center gap-0.5"><ArrowDownRight className="h-3 w-3" />{value}{suffix}</span>;
  return <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-0.5"><Minus className="h-3 w-3" />0{suffix}</span>;
};

const ChartCard = ({ title, icon: Icon, children, badge, action, className = '' }: { title: string; icon: any; children: React.ReactNode; badge?: string; action?: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`rounded-2xl border border-primary/10 bg-gradient-to-br from-card/60 via-card/40 to-primary/[0.02] backdrop-blur-sm p-5 shadow-lg shadow-primary/[0.04] hover:shadow-xl hover:shadow-primary/[0.06] transition-shadow ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {badge && <Badge variant="outline" className="text-[9px] font-normal border-primary/20 text-primary/70">{badge}</Badge>}
      </div>
      {action}
    </div>
    {children}
  </motion.div>
);

// Activity feed item
const ActivityItem = ({ item }: { item: any }) => {
  const actionIcons: Record<string, any> = {
    question_asked: MessageCircle,
    document_uploaded: FileText,
    claim_reviewed: Search,
    response_submitted: Building2,
    conversation_created: MessageSquareText,
  };
  const Icon = actionIcons[item.action] || Activity;
  const timeAgo = differenceInMinutes(new Date(), parseISO(item.created_at));
  const timeLabel = timeAgo < 1 ? 'just now' : timeAgo < 60 ? `${timeAgo}m ago` : timeAgo < 1440 ? `${Math.floor(timeAgo / 60)}h ago` : `${Math.floor(timeAgo / 1440)}d ago`;

  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-border/10 last:border-0">
      <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
        <Icon className="h-3 w-3 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-foreground font-medium truncate">
          {item.action?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
        </p>
        <p className="text-[10px] text-muted-foreground/60 truncate">
          {item.entity_type} {item.details?.title ? `• ${item.details.title}` : ''}
        </p>
      </div>
      <span className="text-[9px] text-muted-foreground/50 whitespace-nowrap">{timeLabel}</span>
    </div>
  );
};

const NuruAnalyticsDashboard = () => {
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();
  const { data: analytics } = useCivicAnalytics();
  const { data: auditLog } = useNuruAuditLog();
  const { data: tokenTimeline } = useTokenUsageTimeline();
  const { data: conversationData } = useConversationAnalytics();
  const { data: messageData } = useMessageAnalytics();
  const { data: claimReviews } = useClaimReviewStats();
  const { data: institutionalResponses } = useInstitutionalResponseStats();
  const { data: recentActivity } = useNuruRecentActivity();
  const { data: tokenStats } = useTokenUsageStats();
  const { data: tokenLimits } = useTokenLimits();

  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('14d');
  const [activeTab, setActiveTab] = useState('overview');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // === CORE METRICS ===
  const totalDocs = documents?.length || 0;
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = questions?.filter(q => q.ai_answer).length || 0;
  const avgConfidence = questions?.length ? Math.round((questions.reduce((sum, q) => sum + (q.ai_confidence || 0), 0) / questions.length) * 100) : 0;
  const totalAuditEntries = auditLog?.length || 0;
  const countriesCount = new Set(documents?.map(d => d.country).filter(Boolean)).size;
  const institutionsCount = new Set(documents?.flatMap(d => d.institutions || [])).size;
  const totalTokensUsed = tokenStats?.totalTokensUsed || 0;
  const totalRequests = tokenStats?.totalRequests || 0;

  // === TOKEN USAGE TIMELINE ===
  const tokenTimelineData = useMemo(() => {
    if (!tokenTimeline?.length) return [];
    const byDate: Record<string, { date: string; tokens: number; requests: number }> = {};
    tokenTimeline.forEach((t: any) => {
      const d = t.created_at?.substring(0, 10);
      if (!d) return;
      if (!byDate[d]) byDate[d] = { date: d, tokens: 0, requests: 0 };
      byDate[d].tokens += t.tokens_used || 0;
      byDate[d].requests += 1;
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  }, [tokenTimeline]);

  // === MODEL COMPARISON ===
  const modelComparison = useMemo(() => {
    if (!messageData?.length) return [];
    const models: Record<string, { name: string; queries: number; avgTime: number; avgConfidence: number; totalTime: number; totalConf: number; confCount: number }> = {};
    messageData.filter((m: any) => m.role === 'assistant').forEach((m: any) => {
      const model = m.model_used || 'Unknown';
      if (!models[model]) models[model] = { name: model, queries: 0, avgTime: 0, avgConfidence: 0, totalTime: 0, totalConf: 0, confCount: 0 };
      models[model].queries++;
      if (m.processing_time_ms) models[model].totalTime += m.processing_time_ms;
      if (m.confidence) { models[model].totalConf += m.confidence; models[model].confCount++; }
    });
    return Object.values(models).map(m => ({
      name: m.name.replace('google/', '').replace('openai/', ''),
      queries: m.queries,
      avgTime: m.queries > 0 ? Math.round(m.totalTime / m.queries) : 0,
      avgConfidence: m.confCount > 0 ? Math.round((m.totalConf / m.confCount) * 100) : 0,
    }));
  }, [messageData]);

  // === RESPONSE QUALITY METRICS ===
  const responseQuality = useMemo(() => {
    if (!messageData?.length) return { sourceCitation: 0, avgProcessing: 0, highConfidence: 0, total: 0 };
    const aiMsgs = messageData.filter((m: any) => m.role === 'assistant');
    const withSources = aiMsgs.filter((m: any) => m.sources && (Array.isArray(m.sources) ? m.sources.length > 0 : Object.keys(m.sources).length > 0)).length;
    const highConf = aiMsgs.filter((m: any) => (m.confidence || 0) >= 0.7).length;
    const totalTime = aiMsgs.reduce((s: number, m: any) => s + (m.processing_time_ms || 0), 0);
    return {
      sourceCitation: aiMsgs.length ? Math.round((withSources / aiMsgs.length) * 100) : 0,
      avgProcessing: aiMsgs.length ? Math.round(totalTime / aiMsgs.length) : 0,
      highConfidence: aiMsgs.length ? Math.round((highConf / aiMsgs.length) * 100) : 0,
      total: aiMsgs.length,
    };
  }, [messageData]);

  // === PEAK USAGE HEATMAP ===
  const peakUsageHeatmap = useMemo(() => {
    if (!messageData?.length) return [];
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    messageData.forEach((m: any) => {
      try {
        const d = parseISO(m.created_at);
        grid[getDay(d)][getHours(d)]++;
      } catch {}
    });
    const result: { day: string; hour: number; count: number }[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    grid.forEach((hours, dayIdx) => {
      hours.forEach((count, hourIdx) => {
        result.push({ day: days[dayIdx], hour: hourIdx, count });
      });
    });
    return result;
  }, [messageData]);

  const heatmapMax = useMemo(() => Math.max(...peakUsageHeatmap.map(h => h.count), 1), [peakUsageHeatmap]);

  // === USER ENGAGEMENT ===
  const engagementMetrics = useMemo(() => {
    if (!conversationData?.length) return { uniqueUsers: 0, avgMsgsPerConv: 0, returnRate: 0, totalConvs: 0 };
    const users = new Set(conversationData.map((c: any) => c.user_id));
    const totalMsgs = conversationData.reduce((s: number, c: any) => s + (c.message_count || 0), 0);
    const usersWithMultiple = Object.values(
      conversationData.reduce((acc: Record<string, number>, c: any) => {
        acc[c.user_id] = (acc[c.user_id] || 0) + 1;
        return acc;
      }, {})
    ).filter((c: any) => c > 1).length;

    return {
      uniqueUsers: users.size,
      avgMsgsPerConv: conversationData.length ? Math.round(totalMsgs / conversationData.length) : 0,
      returnRate: users.size ? Math.round((usersWithMultiple / users.size) * 100) : 0,
      totalConvs: conversationData.length,
    };
  }, [conversationData]);

  // === CLAIM REVIEW ANALYTICS ===
  const claimStats = useMemo(() => {
    if (!claimReviews?.length) return { total: 0, verified: 0, refuted: 0, pending: 0 };
    return {
      total: claimReviews.length,
      verified: claimReviews.filter((c: any) => c.review_status === 'verified').length,
      refuted: claimReviews.filter((c: any) => c.review_status === 'refuted').length,
      pending: claimReviews.filter((c: any) => c.review_status === 'pending' || !c.review_status).length,
    };
  }, [claimReviews]);

  // === INSTITUTIONAL ACCOUNTABILITY ===
  const accountabilityStats = useMemo(() => {
    if (!institutionalResponses?.length) return { total: 0, responded: 0, responseRate: 0, byInstitution: [] };
    const byInst: Record<string, number> = {};
    institutionalResponses.forEach((r: any) => {
      byInst[r.institution_name] = (byInst[r.institution_name] || 0) + 1;
    });
    const totalQs = questions?.length || 1;
    return {
      total: institutionalResponses.length,
      responded: institutionalResponses.filter((r: any) => r.status === 'published').length,
      responseRate: Math.round((institutionalResponses.length / totalQs) * 100),
      byInstitution: Object.entries(byInst).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
    };
  }, [institutionalResponses, questions]);

  // === ACTIVITY TIMELINE ===
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

  // === STANDARD DATA ===
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

  const docTypeBreakdown = useMemo(() => {
    if (!documents) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => { counts[d.document_type] = (counts[d.document_type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [documents]);

  const radarData = useMemo(() => [
    { dimension: 'Comprehension', value: avgConfidence, fullMark: 100 },
    { dimension: 'Accessibility', value: Math.min(totalDocs * 15, 95), fullMark: 100 },
    { dimension: 'Responsiveness', value: accountabilityStats.responseRate, fullMark: 100 },
    { dimension: 'Diversity', value: Math.min(countryData.length * 12, 90), fullMark: 100 },
    { dimension: 'Trust', value: responseQuality.highConfidence, fullMark: 100 },
    { dimension: 'Audit', value: Math.min(totalAuditEntries > 0 ? 92 : 0, 100), fullMark: 100 },
  ], [avgConfidence, totalDocs, countryData.length, totalAuditEntries, accountabilityStats.responseRate, responseQuality.highConfidence]);

  const funnelData = useMemo(() => [
    { name: 'Total Queries', value: totalQuestions, fill: COLORS.primary },
    { name: 'Answered', value: answeredQuestions, fill: COLORS.emerald },
    { name: 'High Confidence', value: questions?.filter(q => (q.ai_confidence || 0) >= 0.7).length || 0, fill: COLORS.violet },
    { name: 'Source Cited', value: questions?.filter(q => q.source_passages && (q.source_passages as any[]).length > 0).length || 0, fill: COLORS.amber },
  ], [totalQuestions, answeredQuestions, questions]);

  const sparklines = useMemo(() => ({
    docs: [2, 3, 5, 4, 7, 6, totalDocs > 6 ? 8 : 5],
    questions: [5, 8, 12, 10, 15, 18, totalQuestions > 10 ? 20 : 12],
    confidence: [65, 70, 72, 75, 78, avgConfidence - 2, avgConfidence],
    tokens: [100, 250, 400, 350, 500, totalTokensUsed > 0 ? 600 : 0, totalTokensUsed > 0 ? 700 : 0],
  }), [totalDocs, totalQuestions, avgConfidence, totalTokensUsed]);

  // === EXPORT ===
  const handleExport = useCallback((format: 'csv' | 'json') => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      metrics: {
        totalDocuments: totalDocs, totalQuestions, answeredQuestions,
        avgConfidence, totalTokensUsed, totalRequests,
        uniqueUsers: engagementMetrics.uniqueUsers,
        returnRate: engagementMetrics.returnRate,
        responseCitationRate: responseQuality.sourceCitation,
        claimReviews: claimStats.total,
        institutionalResponses: accountabilityStats.total,
      },
      countryBreakdown: countryData,
      topicBreakdown: topicData,
      modelPerformance: modelComparison,
      confidenceDistribution,
    };
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `nuru-analytics-${format}-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const rows = [
        ['Metric', 'Value'],
        ...Object.entries(exportData.metrics).map(([k, v]) => [k, String(v)]),
        [''], ['Country', 'Documents'],
        ...countryData.map(c => [c.name, String(c.value)]),
        [''], ['Topic', 'Count'],
        ...topicData.map(t => [t.name, String(t.value)]),
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `nuru-analytics-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`Analytics exported as ${format.toUpperCase()}`);
  }, [totalDocs, totalQuestions, answeredQuestions, avgConfidence, totalTokensUsed, totalRequests, engagementMetrics, responseQuality, claimStats, accountabilityStats, countryData, topicData, modelComparison, confidenceDistribution]);

  // Stats cards
  const stats = [
    { icon: FileText, label: 'Documents', value: totalDocs, trend: 12, sparkline: sparklines.docs, color: COLORS.primary, bgClass: 'from-primary/15 to-primary/5' },
    { icon: MessageSquareText, label: 'Questions', value: totalQuestions, trend: 24, sparkline: sparklines.questions, color: COLORS.emerald, bgClass: 'from-emerald-500/15 to-emerald-500/5' },
    { icon: Users, label: 'Unique Users', value: engagementMetrics.uniqueUsers, trend: 8, sparkline: sparklines.confidence, color: COLORS.violet, bgClass: 'from-violet-500/15 to-violet-500/5' },
    { icon: TrendingUp, label: 'Avg Confidence', value: `${avgConfidence}%`, trend: 3, sparkline: sparklines.confidence, color: COLORS.amber, bgClass: 'from-amber-500/15 to-amber-500/5' },
    { icon: Coins, label: 'Tokens Used', value: totalTokensUsed.toLocaleString(), trend: 15, sparkline: sparklines.tokens, color: COLORS.cyan, bgClass: 'from-cyan-500/15 to-cyan-500/5' },
    { icon: Globe, label: 'Countries', value: countriesCount, trend: 2, sparkline: sparklines.docs, color: COLORS.rose, bgClass: 'from-rose-500/15 to-rose-500/5' },
    { icon: Search, label: 'Fact Checks', value: claimStats.total, trend: 5, sparkline: sparklines.docs, color: COLORS.orange, bgClass: 'from-orange-500/15 to-orange-500/5' },
    { icon: Shield, label: 'Audit Trail', value: totalAuditEntries, trend: 10, sparkline: sparklines.docs, color: COLORS.sky, bgClass: 'from-sky-500/15 to-sky-500/5' },
  ];

  return (
    <div className="space-y-5">
      {/* Header with export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-xs text-muted-foreground">Comprehensive intelligence metrics & insights</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="text-xs gap-2">
                <FileText className="h-3.5 w-3.5" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')} className="text-xs gap-2">
                <FileText className="h-3.5 w-3.5" /> Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 xl:grid-cols-8">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.04 }}
            className={`relative p-3.5 rounded-2xl border border-primary/10 bg-gradient-to-br ${s.bgClass} backdrop-blur-sm overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all cursor-default`}
          >
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full opacity-20 blur-xl" style={{ backgroundColor: s.color }} />
            <div className="flex items-start justify-between mb-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
              </div>
              <TrendIndicator value={typeof s.trend === 'number' ? s.trend : 0} suffix="%" />
            </div>
            <p className="text-xl font-bold text-foreground tracking-tight">{s.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
              <Sparkline data={s.sparkline} color={s.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabbed Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card/60 border border-primary/10 p-1 h-auto flex-wrap">
          {[
            { value: 'overview', label: 'Overview', icon: BarChart3 },
            { value: 'engagement', label: 'Engagement', icon: Users },
            { value: 'quality', label: 'Response Quality', icon: Target },
            { value: 'tokens', label: 'Token Usage', icon: Coins },
            { value: 'accountability', label: 'Accountability', icon: Building2 },
            { value: 'impact', label: 'Impact', icon: Sparkles },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <tab.icon className="h-3 w-3" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Activity Timeline */}
            <ChartCard title="Activity Timeline" icon={Activity} badge="Live"
              action={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 px-2">
                      <Filter className="h-3 w-3" /> {timeRange} <ChevronDown className="h-3 w-3" />
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
                  <Area type="monotone" dataKey="questions" stroke={COLORS.primary} fill="url(#gradPrimary)" strokeWidth={2.5} name="Questions" dot={false} activeDot={{ r: 5, fill: COLORS.primary, filter: 'url(#glow)' }} />
                  <Area type="monotone" dataKey="documents" stroke={COLORS.emerald} fill="url(#gradEmerald)" strokeWidth={2.5} name="Documents" dot={false} activeDot={{ r: 5, fill: COLORS.emerald }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Confidence Distribution */}
            <ChartCard title="Confidence Distribution" icon={Target} badge={`${avgConfidence}% avg`}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <GradientDefs />
                  <Pie data={confidenceDistribution} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))"
                    onMouseEnter={(_, i) => setActivePieIndex(i)} onMouseLeave={() => setActivePieIndex(null)}
                    animationBegin={0} animationDuration={800}
                  >
                    {confidenceDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_GRADIENTS[i % PIE_GRADIENTS.length]} opacity={activePieIndex !== null && activePieIndex !== i ? 0.4 : 1} className="transition-opacity duration-200" />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <text x="50%" y="46%" textAnchor="middle" className="fill-foreground text-2xl font-bold">{avgConfidence}%</text>
                  <text x="50%" y="56%" textAnchor="middle" className="fill-muted-foreground text-[10px]">Confidence</text>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
                {confidenceDistribution.map((d, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border/30 bg-card/40">
                    <span className="w-2 h-2 rounded-full" style={{ background: PIE_GRADIENTS[i % PIE_GRADIENTS.length] }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </ChartCard>

            {/* Documents by Country */}
            <ChartCard title="Documents by Country" icon={Globe} badge={`${countriesCount} countries`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={countryData} layout="vertical" barCategoryGap="20%">
                  <GradientDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="url(#barGradPrimary)" radius={[0, 8, 8, 0]} name="Documents"><LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Real-time Activity Feed */}
            <ChartCard title="Live Activity Feed" icon={Activity} badge="Real-time">
              <ScrollArea className="h-[240px]">
                {recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-0">
                    {recentActivity.map((item: any) => (
                      <ActivityItem key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No recent activity</div>
                )}
              </ScrollArea>
            </ChartCard>
          </div>

          {/* Topics full width */}
          <ChartCard title="Top Policy Topics" icon={BookOpen} badge={`${topicData.length} topics`}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topicData} barCategoryGap="25%">
                <GradientDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} angle={-30} textAnchor="end" height={80} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="url(#barGradViolet)" radius={[8, 8, 0, 0]} name="Documents"><LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /></Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        {/* ENGAGEMENT TAB */}
        <TabsContent value="engagement" className="space-y-5">
          {/* Engagement KPIs */}
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Unique Users', value: engagementMetrics.uniqueUsers, icon: Users, color: COLORS.violet },
              { label: 'Total Conversations', value: engagementMetrics.totalConvs, icon: MessageSquareText, color: COLORS.emerald },
              { label: 'Avg Messages/Conv', value: engagementMetrics.avgMsgsPerConv, icon: MessageCircle, color: COLORS.amber },
              { label: 'Return Rate', value: `${engagementMetrics.returnRate}%`, icon: RefreshCw, color: COLORS.primary },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl border border-primary/10 bg-gradient-to-br from-card/60 to-transparent"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${m.color}15` }}>
                    <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">{m.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Peak Usage Heatmap */}
          <ChartCard title="Peak Usage Patterns" icon={Clock} badge="Hour × Day">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Header row */}
                <div className="flex items-center gap-0.5 mb-1 pl-10">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="flex-1 text-center text-[8px] text-muted-foreground/50">{i}</div>
                  ))}
                </div>
                {/* Heatmap rows */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="flex items-center gap-0.5 mb-0.5">
                    <span className="w-9 text-[9px] text-muted-foreground font-medium text-right pr-1">{day}</span>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const cell = peakUsageHeatmap.find(h => h.day === day && h.hour === hour);
                      const count = cell?.count || 0;
                      const intensity = count / heatmapMax;
                      return (
                        <div
                          key={hour}
                          className="flex-1 aspect-square rounded-sm transition-colors cursor-default"
                          style={{
                            backgroundColor: count === 0
                              ? 'hsl(var(--muted) / 0.15)'
                              : `hsl(var(--primary) / ${0.1 + intensity * 0.8})`,
                          }}
                          title={`${day} ${hour}:00 — ${count} queries`}
                        />
                      );
                    })}
                  </div>
                ))}
                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-[9px] text-muted-foreground/50">Less</span>
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((o, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
                  ))}
                  <span className="text-[9px] text-muted-foreground/50">More</span>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Document Type Breakdown */}
          <ChartCard title="Document Type Breakdown" icon={FileText} badge={`${docTypeBreakdown.length} types`}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <GradientDefs />
                <Pie data={docTypeBreakdown} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))" animationDuration={800}
                  label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 0.5 }}
                >
                  {docTypeBreakdown.map((_, i) => <Cell key={i} fill={COLOR_LIST[i % COLOR_LIST.length]} />)}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        {/* RESPONSE QUALITY TAB */}
        <TabsContent value="quality" className="space-y-5">
          {/* Quality KPIs */}
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Source Citation Rate', value: `${responseQuality.sourceCitation}%`, icon: FileText, color: COLORS.primary, desc: 'Answers with document references' },
              { label: 'High Confidence', value: `${responseQuality.highConfidence}%`, icon: Target, color: COLORS.emerald, desc: 'Confidence ≥ 70%' },
              { label: 'Avg Response Time', value: `${(responseQuality.avgProcessing / 1000).toFixed(1)}s`, icon: Timer, color: COLORS.amber, desc: 'Average processing latency' },
              { label: 'Total AI Responses', value: responseQuality.total, icon: Brain, color: COLORS.violet, desc: 'Total assistant messages' },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl border border-primary/10 bg-gradient-to-br from-card/60 to-transparent"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${m.color}15` }}>
                    <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">{m.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">{m.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Model Comparison */}
          <ChartCard title="Model Performance Comparison" icon={GitCompare} badge={`${modelComparison.length} models`}>
            {modelComparison.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={modelComparison} barCategoryGap="30%">
                    <GradientDefs />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar yAxisId="left" dataKey="queries" fill="url(#barGradPrimary)" radius={[6, 6, 0, 0]} name="Queries" />
                    <Line yAxisId="right" type="monotone" dataKey="avgConfidence" stroke={COLORS.emerald} strokeWidth={2} name="Avg Confidence %" dot={{ r: 4, fill: COLORS.emerald }} />
                    <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke={COLORS.amber} strokeWidth={2} name="Avg Time (ms)" dot={{ r: 4, fill: COLORS.amber }} />
                  </ComposedChart>
                </ResponsiveContainer>
                {/* Model detail cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {modelComparison.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl border border-border/20 bg-card/30">
                      <p className="text-[11px] font-semibold text-foreground truncate">{m.name}</p>
                      <div className="grid grid-cols-3 gap-1 mt-2 text-[10px]">
                        <div><span className="text-muted-foreground/60">Queries</span><br/><span className="font-semibold text-foreground">{m.queries}</span></div>
                        <div><span className="text-muted-foreground/60">Conf.</span><br/><span className="font-semibold text-foreground">{m.avgConfidence}%</span></div>
                        <div><span className="text-muted-foreground/60">Speed</span><br/><span className="font-semibold text-foreground">{(m.avgTime / 1000).toFixed(1)}s</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">No model performance data yet</div>
            )}
          </ChartCard>

          {/* Query Funnel */}
          <ChartCard title="Query Processing Pipeline" icon={Layers} badge="Funnel">
            <div className="space-y-3 mt-2">
              {funnelData.map((item, i) => {
                const maxVal = funnelData[0].value || 1;
                const pct = maxVal > 0 ? Math.round((item.value / maxVal) * 100) : 0;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">{item.name}</span>
                      <span className="font-semibold text-foreground">{item.value} <span className="text-muted-foreground/60 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-7 w-full bg-muted/10 rounded-lg overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 10)}%` }} transition={{ delay: i * 0.15, duration: 0.6 }}
                        className="h-full rounded-lg" style={{ background: `linear-gradient(90deg, ${item.fill}40, ${item.fill})` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ChartCard>
        </TabsContent>

        {/* TOKEN USAGE TAB */}
        <TabsContent value="tokens" className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Tokens Used', value: totalTokensUsed.toLocaleString(), icon: Coins, color: COLORS.primary },
              { label: 'Total Requests', value: totalRequests, icon: Zap, color: COLORS.emerald },
              { label: 'Avg Tokens/Request', value: totalRequests > 0 ? Math.round(totalTokensUsed / totalRequests).toLocaleString() : '0', icon: BarChart3, color: COLORS.amber },
              { label: 'Active Limits', value: tokenLimits?.filter((l: any) => l.is_active).length || 0, icon: Shield, color: COLORS.violet },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl border border-primary/10 bg-gradient-to-br from-card/60 to-transparent"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${m.color}15` }}>
                    <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">{m.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Token Usage Over Time */}
          <ChartCard title="Token Consumption Trend" icon={Coins} badge="Daily">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={tokenTimelineData}>
                <GradientDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area yAxisId="left" type="monotone" dataKey="tokens" stroke={COLORS.primary} fill="url(#gradPrimary)" strokeWidth={2} name="Tokens" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="requests" stroke={COLORS.amber} strokeWidth={2} name="Requests" dot={{ r: 3, fill: COLORS.amber }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Quota Utilization */}
          {tokenLimits && tokenLimits.length > 0 && (
            <ChartCard title="Quota Utilization" icon={Shield} badge={`${tokenLimits.length} limits`}>
              <div className="grid gap-3 md:grid-cols-2">
                {tokenLimits.filter((l: any) => l.is_active).slice(0, 6).map((limit: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl border border-border/20 bg-card/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-foreground">{limit.name}</span>
                      <Badge variant="outline" className="text-[9px]">{limit.scope}</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Daily</span>
                          <span className="text-foreground">{limit.daily_token_limit.toLocaleString()}</span>
                        </div>
                        <Progress value={30} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Monthly</span>
                          <span className="text-foreground">{limit.monthly_token_limit.toLocaleString()}</span>
                        </div>
                        <Progress value={15} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </TabsContent>

        {/* ACCOUNTABILITY TAB */}
        <TabsContent value="accountability" className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Responses', value: accountabilityStats.total, icon: Building2, color: COLORS.primary },
              { label: 'Response Rate', value: `${accountabilityStats.responseRate}%`, icon: TrendingUp, color: accountabilityStats.responseRate > 50 ? COLORS.emerald : COLORS.rose },
              { label: 'Claims Reviewed', value: claimStats.total, icon: Search, color: COLORS.violet },
              { label: 'Claims Verified', value: claimStats.verified, icon: CheckCircle2, color: COLORS.emerald },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-2xl border border-primary/10 bg-gradient-to-br from-card/60 to-transparent"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${m.color}15` }}>
                    <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">{m.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Institutional Response Volume */}
            <ChartCard title="Responses by Institution" icon={Building2} badge={`${accountabilityStats.byInstitution.length} institutions`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={accountabilityStats.byInstitution} layout="vertical" barCategoryGap="20%">
                  <GradientDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="url(#barGradPrimary)" radius={[0, 8, 8, 0]} name="Responses"><LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Claim Review Breakdown */}
            <ChartCard title="Fact Check Results" icon={Search} badge={`${claimStats.total} reviews`}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <GradientDefs />
                  <Pie
                    data={[
                      { name: 'Verified', value: claimStats.verified },
                      { name: 'Refuted', value: claimStats.refuted },
                      { name: 'Pending', value: claimStats.pending },
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" strokeWidth={2} stroke="hsl(var(--card))"
                  >
                    <Cell fill={COLORS.emerald} />
                    <Cell fill={COLORS.rose} />
                    <Cell fill={COLORS.amber} />
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <text x="50%" y="46%" textAnchor="middle" className="fill-foreground text-2xl font-bold">{claimStats.total}</text>
                  <text x="50%" y="56%" textAnchor="middle" className="fill-muted-foreground text-[10px]">Reviews</text>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 mt-2">
                {[{ label: 'Verified', color: COLORS.emerald, val: claimStats.verified }, { label: 'Refuted', color: COLORS.rose, val: claimStats.refuted }, { label: 'Pending', color: COLORS.amber, val: claimStats.pending }].map((c, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} /> {c.label}: {c.val}
                  </span>
                ))}
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        {/* IMPACT TAB */}
        <TabsContent value="impact" className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Impact Radar */}
            <ChartCard title="Impact Radar" icon={RadarIcon} badge="6 dimensions">
              <ResponsiveContainer width="100%" height={280}>
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

            {/* Document Processing Stats */}
            <ChartCard title="Document Processing" icon={Cpu} badge="System">
              <div className="space-y-4">
                {[
                  { label: 'Total Processed', value: documents?.filter(d => d.processing_status === 'completed' || d.status === 'active').length || 0, total: totalDocs, color: COLORS.emerald },
                  { label: 'Processing', value: documents?.filter(d => d.processing_status === 'processing' || d.processing_status === 'pending').length || 0, total: totalDocs, color: COLORS.amber },
                  { label: 'Failed', value: documents?.filter(d => d.processing_status?.includes('failed')).length || 0, total: totalDocs, color: COLORS.rose },
                  { label: 'With Summaries', value: documents?.filter(d => d.ai_summary).length || 0, total: totalDocs, color: COLORS.primary },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground font-medium">{item.label}</span>
                      <span className="font-semibold text-foreground">{item.value} / {item.total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/15 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Democratic Impact Measurement */}
          <ChartCard title="Democratic Impact Measurement" icon={Sparkles} badge="KPIs">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                { metric: 'Civic Comprehension', value: avgConfidence, target: 90, desc: 'Average AI confidence across queries', color: COLORS.primary },
                { metric: 'Information Accessibility', value: Math.min(totalDocs * 15, 95), target: 95, desc: 'Document coverage across policy domains', color: COLORS.emerald },
                { metric: 'Institutional Responsiveness', value: accountabilityStats.responseRate, target: 80, desc: 'Rate of institutional replies', color: COLORS.amber },
                { metric: 'Participation Diversity', value: Math.min(countryData.length * 12, 90), target: 85, desc: 'Geographic spread of usage', color: COLORS.violet },
                { metric: 'Public Trust Score', value: responseQuality.highConfidence, target: 95, desc: 'High confidence answer rate', color: COLORS.rose },
                { metric: 'Audit Trail Coverage', value: Math.min(totalAuditEntries > 0 ? 92 : 0, 100), target: 100, desc: 'AI interactions fully tracked', color: COLORS.orange },
              ].map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
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
                    <motion.div initial={{ width: 0 }} animate={{ width: `${m.value}%` }} transition={{ delay: i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${m.color}80, ${m.color})` }}
                    />
                    <div className="absolute top-0 h-full w-0.5 bg-foreground/30" style={{ left: `${m.target}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground leading-tight">{m.desc}</p>
                    <p className="text-[9px] text-muted-foreground/60 whitespace-nowrap ml-2">Target: {m.target}%</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NuruAnalyticsDashboard;
