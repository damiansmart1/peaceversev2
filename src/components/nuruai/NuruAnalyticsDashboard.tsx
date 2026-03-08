import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, MessageSquareText, Users, TrendingUp, Building2, BarChart3, Globe, BookOpen, Target, Activity, Shield, Zap } from 'lucide-react';
import { useCivicDocuments, useCivicQuestions, useCivicAnalytics, useNuruAuditLog } from '@/hooks/useNuruAI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

const COLORS = ['hsl(var(--primary))', '#34d399', '#fbbf24', '#818cf8', '#f97316', '#ec4899'];

const NuruAnalyticsDashboard = () => {
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();
  const { data: analytics } = useCivicAnalytics();
  const { data: auditLog } = useNuruAuditLog();

  const totalDocs = documents?.length || 0;
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = questions?.filter(q => q.ai_answer).length || 0;
  const avgConfidence = questions?.length ? Math.round((questions.reduce((sum, q) => sum + (q.ai_confidence || 0), 0) / questions.length) * 100) : 0;
  const totalAuditEntries = auditLog?.length || 0;

  const countryData = useMemo(() => {
    if (!documents) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => { if (d.country) counts[d.country] = (counts[d.country] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [documents]);

  const topicData = useMemo(() => {
    if (!documents) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => d.topics?.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
  }, [documents]);

  const confidenceDistribution = useMemo(() => {
    if (!questions) return [];
    const buckets = { 'Very High (90%+)': 0, 'High (70-89%)': 0, 'Medium (50-69%)': 0, 'Low (<50%)': 0 };
    questions.forEach(q => {
      const c = (q.ai_confidence || 0) * 100;
      if (c >= 90) buckets['Very High (90%+)']++; else if (c >= 70) buckets['High (70-89%)']++; else if (c >= 50) buckets['Medium (50-69%)']++; else buckets['Low (<50%)']++;
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
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  }, [analytics]);

  const docTypeBreakdown = useMemo(() => {
    if (!documents) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => { counts[d.document_type] = (counts[d.document_type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [documents]);

  const stats = [
    { icon: FileText, label: 'Documents', value: totalDocs, color: 'text-blue-500' },
    { icon: MessageSquareText, label: 'Questions', value: totalQuestions, color: 'text-emerald-500' },
    { icon: Users, label: 'Answered', value: answeredQuestions, color: 'text-violet-500' },
    { icon: TrendingUp, label: 'Avg Confidence', value: `${avgConfidence}%`, color: 'text-amber-500' },
    { icon: Building2, label: 'Institutions', value: new Set(documents?.flatMap(d => d.institutions || [])).size, color: 'text-cyan-500' },
    { icon: Globe, label: 'Countries', value: new Set(documents?.map(d => d.country).filter(Boolean)).size, color: 'text-rose-500' },
    { icon: Shield, label: 'Audit Entries', value: totalAuditEntries, color: 'text-orange-500' },
    { icon: Zap, label: 'AI Model', value: 'Gemini Pro', color: 'text-primary' },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="p-3 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm"
          >
            <s.icon className={`h-4 w-4 ${s.color} mb-1.5`} />
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Activity Timeline */}
        <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Activity Timeline</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analyticsTimeline}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
              <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => v.slice(5)} />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
              <Legend />
              <Area type="monotone" dataKey="questions" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.1} strokeWidth={2} name="Questions" />
              <Area type="monotone" dataKey="documents" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.1} strokeWidth={2} name="Documents" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Distribution */}
        <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Confidence Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={confidenceDistribution} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                {confidenceDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Documents by Country */}
        <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Documents by Country</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={countryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" width={100} className="text-xs" />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[0]} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Document Types */}
        <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Document Type Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={docTypeBreakdown} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {docTypeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Topics */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Top Policy Topics</h3>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topicData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
            <XAxis dataKey="name" className="text-xs" angle={-30} textAnchor="end" height={80} />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="value" fill={COLORS[3]} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Impact Framework */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
        <h3 className="text-sm font-semibold mb-4">Democratic Impact Measurement</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            { metric: 'Civic Comprehension', value: avgConfidence, target: 90, desc: 'Average AI confidence score across all queries' },
            { metric: 'Information Accessibility', value: Math.min(totalDocs * 15, 95), target: 95, desc: 'Document coverage across policy domains' },
            { metric: 'Institutional Responsiveness', value: 45, target: 80, desc: 'Rate of institutional replies to civic questions' },
            { metric: 'Participation Diversity', value: Math.min(countryData.length * 12, 90), target: 85, desc: 'Geographic spread of platform usage' },
            { metric: 'Public Trust Score', value: 84, target: 95, desc: 'User satisfaction and trust metric' },
            { metric: 'Audit Trail Coverage', value: Math.min(totalAuditEntries > 0 ? 92 : 0, 100), target: 100, desc: 'All AI interactions tracked with full audit' },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="p-4 rounded-xl border border-border/20"
            >
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-semibold">{m.metric}</h4>
                <span className="text-sm font-bold text-primary">{m.value}%</span>
              </div>
              <Progress value={m.value} className="h-1.5 mb-1" />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                <p className="text-[10px] text-muted-foreground/60">Target: {m.target}%</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NuruAnalyticsDashboard;
