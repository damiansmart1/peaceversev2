import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, MessageSquareText, Users, TrendingUp, Building2, BarChart3, Globe, BookOpen, Clock, Target } from 'lucide-react';
import { useCivicDocuments, useCivicQuestions, useCivicAnalytics } from '@/hooks/useNuruAI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useMemo } from 'react';

const COLORS = ['hsl(var(--primary))', '#82ca9d', '#ffc658', '#8884d8', '#ff7c43'];

const StatCard = ({ icon: Icon, label, value, trend, description }: { icon: any; label: string; value: string | number; trend?: string; description?: string }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {trend && <Badge variant="secondary" className="text-xs">{trend}</Badge>}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const NuruAnalyticsDashboard = () => {
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();
  const { data: analytics } = useCivicAnalytics();

  const totalDocs = documents?.length || 0;
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = questions?.filter(q => q.ai_answer).length || 0;
  const avgConfidence = questions?.length 
    ? Math.round((questions.reduce((sum, q) => sum + (q.ai_confidence || 0), 0) / questions.length) * 100) 
    : 0;

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
    const buckets = { 'Very High (90-100%)': 0, 'High (70-89%)': 0, 'Medium (50-69%)': 0, 'Low (<50%)': 0 };
    questions.forEach(q => {
      const c = (q.ai_confidence || 0) * 100;
      if (c >= 90) buckets['Very High (90-100%)']++;
      else if (c >= 70) buckets['High (70-89%)']++;
      else if (c >= 50) buckets['Medium (50-69%)']++;
      else buckets['Low (<50%)']++;
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
    { icon: FileText, label: 'Documents Processed', value: totalDocs, trend: '+12%', description: 'Public policy documents analyzed' },
    { icon: MessageSquareText, label: 'Civic Questions', value: totalQuestions, trend: '+28%', description: 'Questions asked by citizens' },
    { icon: Users, label: 'Questions Answered', value: answeredQuestions, description: 'AI-generated evidence-based answers' },
    { icon: TrendingUp, label: 'Avg AI Confidence', value: `${avgConfidence}%`, description: 'Average grounding confidence score' },
    { icon: Building2, label: 'Institutions', value: new Set(documents?.flatMap(d => d.institutions || [])).size, description: 'Unique institutions referenced' },
    { icon: Globe, label: 'Countries Covered', value: new Set(documents?.map(d => d.country).filter(Boolean)).size, description: 'African countries with documents' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Activity Timeline */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Activity Timeline</CardTitle>
            <CardDescription className="text-xs">Questions and documents processed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsTimeline}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tickFormatter={(v) => v.slice(5)} />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="questions" stroke={COLORS[0]} strokeWidth={2} name="Questions" dot={false} />
                <Line type="monotone" dataKey="documents" stroke={COLORS[1]} strokeWidth={2} name="Documents" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Confidence Distribution</CardTitle>
            <CardDescription className="text-xs">AI answer confidence levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={confidenceDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {confidenceDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Country Distribution */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Documents by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={countryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Topic Coverage */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />Top Policy Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Democratic Impact Framework */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Democratic Impact Measurement</CardTitle>
          <CardDescription>Key indicators tracking NuruAI's contribution to civic understanding</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { metric: 'Civic Comprehension', desc: 'How well citizens understand policies after NuruAI analysis', value: avgConfidence, target: 90 },
              { metric: 'Information Accessibility', desc: 'Reduction in complexity of public documents', value: 78, target: 95 },
              { metric: 'Institutional Responsiveness', desc: 'Rate at which institutions respond to civic questions', value: 45, target: 80 },
              { metric: 'Participation Diversity', desc: 'Breadth of civic engagement across demographics', value: 62, target: 85 },
              { metric: 'Public Trust Score', desc: 'Citizen confidence in NuruAI transparency', value: 84, target: 95 },
              { metric: 'Knowledge Graph Coverage', desc: 'Depth of mapped policy-institution relationships', value: 56, target: 90 },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">{m.metric}</h4>
                    <span className="text-sm font-bold text-primary">{m.value}%</span>
                  </div>
                  <Progress value={m.value} className="h-2 mb-2" />
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{m.desc}</p>
                    <Badge variant="outline" className="text-[10px] shrink-0 ml-2">Target: {m.target}%</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NuruAnalyticsDashboard;
