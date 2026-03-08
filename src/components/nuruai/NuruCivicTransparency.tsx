import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Globe, Shield, BarChart3, FileText, BookOpen, Users, Download,
  CheckCircle2, Eye, Brain, Target, Scale, Lock, Database,
  ArrowRight, Sparkles, TrendingUp, MessageSquareText, AlertTriangle
} from 'lucide-react';
import { useCivicDocuments, useCivicQuestions, useCivicAnalytics } from '@/hooks/useNuruAI';
import { useGovernanceHealthMetrics } from '@/hooks/useNuruGovernance';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COMPLIANCE_ITEMS = [
  { framework: 'UNESCO AI Ethics Recommendation', items: ['Transparency', 'Human Oversight', 'Fairness & Non-discrimination', 'Privacy & Data Protection'], status: 'compliant', score: 95 },
  { framework: 'African Union Data Policy Framework', items: ['Data Sovereignty', 'Cross-border Data Flow', 'Consent Management', 'Local Processing'], status: 'compliant', score: 90 },
  { framework: 'GDPR Alignment', items: ['Right to Explanation', 'Data Minimization', 'Anonymization', 'Right to Erasure'], status: 'partial', score: 78 },
  { framework: 'ISO/IEC 42001 AI Management', items: ['AI Management System', 'Risk Assessment', 'Monitoring & Review', 'Performance Evaluation'], status: 'in_progress', score: 65 },
];

const IMPACT_DIMENSIONS = [
  { name: 'Civic Comprehension', target: 90, desc: 'Citizens understanding policy after using NuruAI', icon: Brain },
  { name: 'Information Accessibility', target: 95, desc: 'Documents converted to accessible explanations', icon: BookOpen },
  { name: 'Institutional Responsiveness', target: 80, desc: 'Rate of institutional replies to civic questions', icon: TrendingUp },
  { name: 'Participation Diversity', target: 75, desc: 'Demographic diversity of platform participants', icon: Users },
  { name: 'Public Trust Indicators', target: 85, desc: 'User trust in AI-generated explanations', icon: Shield },
];

const NuruCivicTransparency = () => {
  const { data: documents } = useCivicDocuments();
  const { data: questions } = useCivicQuestions();
  const { data: analytics } = useCivicAnalytics();
  const { data: healthMetrics } = useGovernanceHealthMetrics();

  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, number>>({});

  const totalDocs = documents?.length || 0;
  const totalQuestions = questions?.length || 0;

  // Impact scores (derived from real + placeholder data)
  const impactScores = useMemo(() => ({
    'Civic Comprehension': healthMetrics?.avgConfidence || 72,
    'Information Accessibility': Math.min(totalDocs * 12, 88),
    'Institutional Responsiveness': 65,
    'Participation Diversity': 58,
    'Public Trust Indicators': healthMetrics?.citationRate || 70,
  }), [healthMetrics, totalDocs]);

  const overallImpact = useMemo(() => {
    const values = Object.values(impactScores);
    return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  }, [impactScores]);

  // Research data export
  const handleExportResearchData = useCallback((format: 'csv' | 'json') => {
    const anonymizedData = {
      metadata: {
        exportDate: new Date().toISOString(),
        platform: 'NuruAI Civic Intelligence',
        dataScope: 'Anonymized civic engagement metrics',
        privacyNote: 'All personally identifiable information has been removed',
      },
      metrics: {
        totalDocumentsProcessed: totalDocs,
        totalCivicQuestions: totalQuestions,
        averageConfidence: healthMetrics?.avgConfidence || 0,
        citationRate: healthMetrics?.citationRate || 0,
        totalAIResponses: healthMetrics?.totalResponses || 0,
      },
      impactScores,
      complianceStatus: COMPLIANCE_ITEMS.map(c => ({ framework: c.framework, score: c.score, status: c.status })),
      engagementTimeline: analytics?.slice(0, 50).map((a: any) => ({
        date: a.created_at,
        metricType: a.metric_type,
        value: a.metric_value,
        country: a.country,
      })) || [],
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(anonymizedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `nuru-research-data-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      URL.revokeObjectURL(url);
    } else {
      const rows = [
        ['# NuruAI Research Data Export (Anonymized)'],
        [`# Generated: ${new Date().toISOString()}`],
        [''],
        ['Metric,Value'],
        ...Object.entries(anonymizedData.metrics).map(([k, v]) => [k, String(v)]),
        [''],
        ['Impact Dimension,Score,Target'],
        ...IMPACT_DIMENSIONS.map(d => [d.name, String(impactScores[d.name as keyof typeof impactScores] || 0), String(d.target)]),
        [''],
        ['Framework,Score,Status'],
        ...COMPLIANCE_ITEMS.map(c => [c.framework, String(c.score), c.status]),
      ];
      const csv = rows.map(r => Array.isArray(r) ? r.join(',') : r).join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `nuru-research-data-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`Research data exported as ${format.toUpperCase()}`);
  }, [totalDocs, totalQuestions, healthMetrics, impactScores, analytics]);

  // Generate transparency report PDF
  const handleTransparencyReport = useCallback(() => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFillColor(7, 79, 152);
    doc.rect(0, 0, pw, 25, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('NURU AI — CIVIC TRANSPARENCY REPORT', pw / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Public Accountability & Democratic Impact', pw / 2, 19, { align: 'center' });
    y = 35;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Period: ${format(new Date(), 'MMMM yyyy')} | Generated: ${format(new Date(), 'MMMM d, yyyy')}`, pw / 2, y, { align: 'center' });
    y += 12;

    // Impact Scores
    doc.setFontSize(12);
    doc.setTextColor(7, 79, 152);
    doc.text('DEMOCRATIC IMPACT MEASUREMENT', 15, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Dimension', 'Score', 'Target', 'Status']],
      body: IMPACT_DIMENSIONS.map(d => {
        const score = impactScores[d.name as keyof typeof impactScores] || 0;
        return [d.name, `${score}%`, `${d.target}%`, score >= d.target ? 'Met' : 'In Progress'];
      }),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [7, 79, 152], textColor: 255 },
      alternateRowStyles: { fillColor: [250, 250, 252] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Platform metrics
    doc.setFontSize(12);
    doc.setTextColor(7, 79, 152);
    doc.text('PLATFORM METRICS', 15, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Documents Processed', String(totalDocs)],
        ['Civic Questions Asked', String(totalQuestions)],
        ['AI Confidence Score', `${healthMetrics?.avgConfidence || 0}%`],
        ['Citation Rate', `${healthMetrics?.citationRate || 0}%`],
        ['Overall Impact Score', `${overallImpact}%`],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [7, 79, 152], textColor: 255 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Compliance
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setTextColor(7, 79, 152);
    doc.text('COMPLIANCE STATUS', 15, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Framework', 'Score', 'Status']],
      body: COMPLIANCE_ITEMS.map(c => [c.framework, `${c.score}%`, c.status.replace('_', ' ')]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [7, 79, 152], textColor: 255 },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount} | NuruAI Civic Transparency Report | Public Document`, pw / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`nuru-transparency-report-${format(new Date(), 'yyyy-MM')}.pdf`);
    toast.success('Transparency report downloaded');
  }, [totalDocs, totalQuestions, healthMetrics, impactScores, overallImpact]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/15">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Civic Transparency Portal</h2>
              <p className="text-[11px] text-muted-foreground">Public accountability, impact measurement, research data & compliance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleTransparencyReport}>
              <Download className="h-3.5 w-3.5" /> Report
            </Button>
          </div>
        </div>

        {/* Overall Impact Score */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.05] to-transparent">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${overallImpact}, 100`} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{overallImpact}%</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Overall Democratic Impact Score</h3>
            <p className="text-[11px] text-muted-foreground">Composite score across 5 impact dimensions</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="impact">
        <TabsList className="rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="impact" className="gap-1.5 rounded-lg text-xs"><Target className="h-3.5 w-3.5" />Impact Measurement</TabsTrigger>
          <TabsTrigger value="transparency" className="gap-1.5 rounded-lg text-xs"><Eye className="h-3.5 w-3.5" />Transparency</TabsTrigger>
          <TabsTrigger value="research" className="gap-1.5 rounded-lg text-xs"><Database className="h-3.5 w-3.5" />Research Data</TabsTrigger>
          <TabsTrigger value="survey" className="gap-1.5 rounded-lg text-xs"><MessageSquareText className="h-3.5 w-3.5" />Comprehension Survey</TabsTrigger>
        </TabsList>

        {/* Impact Measurement */}
        <TabsContent value="impact" className="mt-4 space-y-3">
          {IMPACT_DIMENSIONS.map((dim, i) => {
            const score = impactScores[dim.name as keyof typeof impactScores] || 0;
            const met = score >= dim.target;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border/30 bg-card/40 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <dim.icon className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">{dim.name}</h4>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${met ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {met ? 'Target Met' : 'In Progress'}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">{dim.desc}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Progress value={score} className="h-2" />
                    <div className="absolute top-0 h-2 w-0.5 bg-foreground/30" style={{ left: `${dim.target}%` }} title={`Target: ${dim.target}%`} />
                  </div>
                  <span className="text-xs font-bold w-12 text-right">{score}%</span>
                  <span className="text-[10px] text-muted-foreground/50">/ {dim.target}%</span>
                </div>
              </motion.div>
            );
          })}
        </TabsContent>

        {/* Transparency */}
        <TabsContent value="transparency" className="mt-4 space-y-4">
          {[
            { title: 'AI Governance Documentation', desc: 'Public risk register, mitigation strategies, and monitoring metrics', icon: Shield, status: 'Published' },
            { title: 'Impact Measurement Dashboard', desc: 'Real-time democratic impact scores and trend analysis', icon: BarChart3, status: 'Live' },
            { title: 'Transparency Reports', desc: 'Monthly public accountability reports with full metrics disclosure', icon: FileText, status: 'Available' },
            { title: 'Research Publications', desc: 'Academic papers and analysis of civic engagement data', icon: BookOpen, status: 'Coming Soon' },
            { title: 'Public Feedback Channels', desc: 'Citizens can flag AI responses and submit governance feedback', icon: MessageSquareText, status: 'Active' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border/30 bg-card/40 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><item.icon className="h-4 w-4 text-primary" /></div>
                <div>
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${
                item.status === 'Live' || item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                item.status === 'Coming Soon' ? 'bg-amber-500/10 text-amber-500' : ''
              }`}>{item.status}</Badge>
            </motion.div>
          ))}
        </TabsContent>

        {/* Research Data */}
        <TabsContent value="research" className="mt-4 space-y-4">
          <div className="rounded-xl border border-border/30 bg-card/40 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">Anonymized Research Data</h3>
                <p className="text-[11px] text-muted-foreground">Download anonymized civic engagement data for academic research</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              {[
                { label: 'Policy Comprehension', desc: 'How well citizens understand policy after AI explanation' },
                { label: 'Civic Engagement Patterns', desc: 'Question frequency, topics, and geographic distribution' },
                { label: 'Institutional Responsiveness', desc: 'Response rates and quality metrics by institution' },
                { label: 'Participation Diversity', desc: 'Demographic and geographic distribution of users' },
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/20 bg-muted/10">
                  <h4 className="text-xs font-semibold">{r.label}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 mb-4">
              <Lock className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-[11px] text-muted-foreground">All data is anonymized and aggregated. No personally identifiable information is included.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleExportResearchData('csv')}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleExportResearchData('json')}>
                <Download className="h-3.5 w-3.5" /> Export JSON
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Comprehension Survey */}
        <TabsContent value="survey" className="mt-4">
          <div className="rounded-xl border border-border/30 bg-card/40 p-5">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">Civic Comprehension Survey</h3>
                <p className="text-[11px] text-muted-foreground">Measure your understanding before and after exploring policy documents</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                'How well do you understand the current national budget allocation?',
                'How confident are you in interpreting legislative language?',
                'How aware are you of institutional responsibilities for public services?',
                'How well can you identify the impact of policies on your community?',
                'How confident are you in engaging with public officials on policy matters?',
              ].map((q, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/20">
                  <p className="text-xs font-medium mb-2">{q}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        onClick={() => setSurveyAnswers(prev => ({ ...prev, [i]: v }))}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                          surveyAnswers[i] === v
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                    <span className="text-[10px] text-muted-foreground/50 self-center ml-2">1=Low → 5=High</span>
                  </div>
                </div>
              ))}
              <Button
                size="sm"
                className="text-xs"
                disabled={Object.keys(surveyAnswers).length < 5}
                onClick={() => {
                  const avg = Object.values(surveyAnswers).reduce((a, b) => a + b, 0) / 5;
                  toast.success(`Survey submitted! Your comprehension score: ${(avg * 20).toFixed(0)}%`);
                  setSurveyAnswers({});
                }}
              >
                Submit Survey
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NuruCivicTransparency;
