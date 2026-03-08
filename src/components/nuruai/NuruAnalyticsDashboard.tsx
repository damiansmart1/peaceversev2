import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, MessageSquareText, Users, TrendingUp, Building2, BarChart3, Globe, BookOpen, Target } from 'lucide-react';
import { useCivicDocuments, useCivicQuestions, useCivicAnalytics } from '@/hooks/useNuruAI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['hsl(var(--primary))', '#34d399', '#fbbf24', '#818cf8', '#f97316'];

const NuruAnalyticsDashboard = () => {
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();
  const { data: analytics } = useCivicAnalytics();

  const totalDocs = documents?.length || 0;
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = questions?.filter(q => q.ai_answer).length || 0;
  const avgConfidence = questions?.length ? Math.round((questions.reduce((sum, q) => sum + (q.ai_confidence || 0), 0) / questions.length) * 100) : 0;

  const countryData = useMemo(() => {
    if (!documents) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => { if (d.country) counts[d.country] = (counts[d.country] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [documents]);

  const topicData = useMemo(() => {
    if (!documents) return [];
    const counts: Record<string, number> = {};
    documents.forEach(d => d.topics?.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
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
    const grouped: Record<string, { date: string; questions: number; documents: number }> = {};
    analytics.forEach((a: any) => {
      const date = a.period_start;
      if (!date) return;
      if (!grouped[date]) grouped[date] = { date, questions: 0, documents: 0 };
      if (a.metric_type === 'questions_asked') grouped[date].questions += a.metric_value;
      if (a.metric_type === 'documents_processed') grouped[date].documents += a.metric_value;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  }, [analytics]);

  const stats = [
    { icon: FileText, label: 'Documents', value: totalDocs, trend: '+12%' },
    { icon: MessageSquareText, label: 'Questions', value: totalQuestions, trend: '+28%' },
    { icon: Users, label: 'Answered', value: answeredQuestions },
    { icon: TrendingUp, label: 'Avg Confidence', value: `${avgConfidence}%` },
    { icon: Building2, label: 'Institutions', value: new Set(documents?.flatMap(d => d.institutions || [])).size },
    { icon: Globe, label: 'Countries', value: new Set(documents?.map(d => d.country).filter(Boolean)).size },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="p-4 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon className="h-4 w-4 text-primary/60" />
              {s.trend && <span className="text-[10px] text-emerald-500 font-medium">{s.trend}</span>}
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Timeline */}
        <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Activity Timeline</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analyticsTimeline}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => v.slice(5)} />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Line type="monotone" dataKey="questions" stroke={COLORS[0]} strokeWidth={2} name="Questions" dot={false} />
              <Line type="monotone" dataKey="documents" stroke={COLORS[1]} strokeWidth={2} name="Documents" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence */}
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

        {/* Countries */}
        <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Documents by Country</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={countryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" width={90} className="text-xs" />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[0]} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Topics */}
        <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Top Policy Topics</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
              <YAxis className="text-xs" />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS[3]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Impact Framework */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-6">
        <h3 className="text-base font-semibold mb-4">Democratic Impact Measurement</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            { metric: 'Civic Comprehension', value: avgConfidence, target: 90 },
            { metric: 'Information Accessibility', value: 78, target: 95 },
            { metric: 'Institutional Responsiveness', value: 45, target: 80 },
            { metric: 'Participation Diversity', value: 62, target: 85 },
            { metric: 'Public Trust Score', value: 84, target: 95 },
            { metric: 'Knowledge Graph Coverage', value: 56, target: 90 },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="p-4 rounded-xl border border-border/20"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold">{m.metric}</h4>
                <span className="text-sm font-bold text-primary">{m.value}%</span>
              </div>
              <Progress value={m.value} className="h-1.5 mb-1.5" />
              <p className="text-[10px] text-muted-foreground">Target: {m.target}%</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NuruAnalyticsDashboard;
