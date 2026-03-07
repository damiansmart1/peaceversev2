import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquareText, Users, Clock, TrendingUp, Building2, BarChart3 } from 'lucide-react';
import { useCivicDocuments, useCivicQuestions } from '@/hooks/useNuruAI';

const StatCard = ({ icon: Icon, label, value, trend, color }: { icon: any; label: string; value: string | number; trend?: string; color: string }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl bg-${color}/10`}>
            <Icon className={`h-5 w-5 text-${color}`} />
          </div>
          {trend && <Badge variant="secondary" className="text-xs">{trend}</Badge>}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const NuruAnalyticsDashboard = () => {
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();

  const totalDocs = documents?.length || 0;
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = questions?.filter(q => q.ai_answer).length || 0;
  const avgConfidence = questions?.length 
    ? Math.round((questions.reduce((sum, q) => sum + (q.ai_confidence || 0), 0) / questions.length) * 100) 
    : 0;

  const stats = [
    { icon: FileText, label: 'Documents Processed', value: totalDocs, color: 'primary' },
    { icon: MessageSquareText, label: 'Civic Questions Asked', value: totalQuestions, color: 'primary' },
    { icon: Users, label: 'Questions Answered', value: answeredQuestions, color: 'primary' },
    { icon: TrendingUp, label: 'Avg AI Confidence', value: `${avgConfidence}%`, color: 'primary' },
    { icon: Building2, label: 'Institutions Engaged', value: new Set(documents?.flatMap(d => d.institutions || [])).size, color: 'primary' },
    { icon: BarChart3, label: 'Topics Covered', value: new Set(documents?.flatMap(d => d.topics || [])).size, color: 'primary' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Impact Framework */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Democratic Impact Measurement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { metric: 'Civic Comprehension', desc: 'How well citizens understand policies after NuruAI analysis', value: 'Tracking' },
              { metric: 'Information Accessibility', desc: 'Reduction in complexity of public documents', value: 'Active' },
              { metric: 'Institutional Responsiveness', desc: 'Rate at which institutions respond to civic questions', value: 'Monitoring' },
              { metric: 'Participation Diversity', desc: 'Breadth of civic engagement across demographics', value: 'Growing' },
              { metric: 'Public Trust Indicators', desc: 'Citizen confidence in institutional transparency', value: 'Measuring' },
              { metric: 'Knowledge Graph Density', desc: 'Depth of mapped policy-institution relationships', value: 'Building' },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold">{m.metric}</h4>
                    <Badge variant="outline" className="text-xs">{m.value}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
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
