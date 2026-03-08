import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield, AlertTriangle, CheckCircle, Eye, Lightbulb, BarChart3, Clock, Activity,
  FileText, Plus, Edit3, TrendingUp, TrendingDown, Target, Cpu, Users,
  Flag, MessageSquareWarning, ArrowUpRight, Download, ChevronDown, Brain,
  Scale, Globe, BookOpen, Fingerprint, Lock, CheckCircle2, XCircle, Search
} from 'lucide-react';
import {
  useGovernanceRegistryExtended, useUpdateGovernanceRisk, useCreateGovernanceRisk,
  useAIFeedbackList, useReviewAIFeedback, useGovernanceHealthMetrics
} from '@/hooks/useNuruGovernance';
import { useNuruAuditLog } from '@/hooks/useNuruAI';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { format, parseISO, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType, WidthType, HeadingLevel, ShadingType, PageBreak } from 'docx';

const COLORS = {
  primary: 'hsl(var(--primary))',
  emerald: '#34d399',
  amber: '#fbbf24',
  violet: '#818cf8',
  rose: '#ec4899',
  cyan: '#22d3ee',
  red: '#ef4444',
  orange: '#f97316',
};
const COLOR_LIST = Object.values(COLORS);

const DEFAULT_RISKS = [
  { id: 'dr-1', risk_category: 'AI Hallucination', risk_name: 'Generated Content Fabrication', description: 'Risk of AI generating explanations not grounded in source documents.', severity: 'critical', mitigation_strategies: ['Source-grounded responses only', 'Confidence scoring', 'Citation requirements', 'Human review for low-confidence'], status: 'active', monitoring_metrics: { auditsCompleted: 47, accuracyRate: 0.94 }, priority: 10 },
  { id: 'dr-2', risk_category: 'Policy Misinterpretation', risk_name: 'Incorrect Policy Analysis', description: 'Risk of AI misinterpreting complex policy language or legal terminology.', severity: 'high', mitigation_strategies: ['Human review', 'Uncertainty flagging', 'Domain expert validation'], status: 'active', monitoring_metrics: { reviewedDocuments: 156, correctionsMade: 12 }, priority: 8 },
  { id: 'dr-3', risk_category: 'Algorithmic Bias', risk_name: 'Biased Document Processing', description: 'Risk of systematic bias in document summarization or question answering.', severity: 'medium', mitigation_strategies: ['Regular bias audits', 'Diverse testing datasets', 'Transparent model docs'], status: 'monitoring', priority: 5 },
  { id: 'dr-4', risk_category: 'Data Privacy', risk_name: 'User Query Privacy', description: 'Risk of exposing sensitive user queries or behavioral patterns.', severity: 'high', mitigation_strategies: ['Anonymous mode', 'Encryption at rest', 'No user profiling', 'GDPR alignment'], status: 'active', priority: 9 },
  { id: 'dr-5', risk_category: 'Overreliance on AI', risk_name: 'Substitution of Human Judgment', description: 'Risk of citizens treating AI as authoritative legal advice.', severity: 'medium', mitigation_strategies: ['Clear disclaimers', 'Institutional verification links'], status: 'active', priority: 4 },
];

const COMPLIANCE_ITEMS = [
  { framework: 'UNESCO AI Ethics', items: ['Transparency', 'Fairness', 'Human Oversight', 'Privacy Protection'], status: 'compliant' },
  { framework: 'AU Data Policy', items: ['Data Sovereignty', 'Cross-border Data Flow', 'Consent Management'], status: 'compliant' },
  { framework: 'GDPR', items: ['Right to Explanation', 'Data Minimization', 'Anonymization', 'Erasure Rights'], status: 'partial' },
  { framework: 'ISO/IEC 42001', items: ['AI Management System', 'Risk Assessment', 'Monitoring & Review'], status: 'in_progress' },
];

const MODEL_VERSIONS = [
  { model: 'Gemini 2.5 Pro', version: '2025.03', deployed: '2025-12-15', status: 'active', notes: 'Primary model for civic document analysis' },
  { model: 'Gemini 2.5 Flash', version: '2025.03', deployed: '2025-12-15', status: 'fallback', notes: 'Used for simple queries and high-load periods' },
  { model: 'GPT-5', version: '2025.02', deployed: '2026-01-10', status: 'active', notes: 'Complex reasoning and multi-document synthesis' },
];

const severityStyles: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const statusIcon = (s: string) => {
  switch (s) {
    case 'mitigated': return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
    case 'monitoring': return <Eye className="h-3.5 w-3.5 text-amber-500" />;
    default: return <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />;
  }
};

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

const SectionCard = ({ title, icon: Icon, children, badge, action, className = '' }: { title: string; icon: any; children: React.ReactNode; badge?: string; action?: React.ReactNode; className?: string }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
    className={`rounded-2xl border border-primary/10 bg-gradient-to-br from-card/60 via-card/40 to-primary/[0.02] backdrop-blur-sm p-5 shadow-lg shadow-primary/[0.04] ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10"><Icon className="h-3.5 w-3.5 text-primary" /></div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {badge && <Badge variant="outline" className="text-[9px] font-normal border-primary/20 text-primary/70">{badge}</Badge>}
      </div>
      {action}
    </div>
    {children}
  </motion.div>
);

const NuruGovernancePortal = () => {
  const { data: registryData } = useGovernanceRegistryExtended();
  const { data: auditLog } = useNuruAuditLog();
  const { data: feedbackList } = useAIFeedbackList();
  const { data: healthMetrics } = useGovernanceHealthMetrics();
  const updateRisk = useUpdateGovernanceRisk();
  const createRisk = useCreateGovernanceRisk();
  const reviewFeedback = useReviewAIFeedback();

  const [editingRisk, setEditingRisk] = useState<any>(null);
  const [showNewRisk, setShowNewRisk] = useState(false);
  const [newRisk, setNewRisk] = useState({ risk_name: '', risk_category: '', description: '', severity: 'medium', status: 'active', mitigation_strategies: '', review_frequency: 'monthly' });
  const [reviewingFeedback, setReviewingFeedback] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('confirmed');

  const risks = registryData?.length ? registryData : DEFAULT_RISKS;

  // Scorecard data
  const scorecards = useMemo(() => [
    { icon: Target, label: 'Confidence Score', value: `${healthMetrics?.avgConfidence || 0}%`, trend: 3, color: COLORS.emerald, target: 85 },
    { icon: BookOpen, label: 'Citation Rate', value: `${healthMetrics?.citationRate || 0}%`, trend: 5, color: COLORS.cyan, target: 90 },
    { icon: Flag, label: 'Total Flags', value: healthMetrics?.totalFlags || 0, trend: -(healthMetrics?.totalFlags || 0), color: COLORS.rose, target: 0 },
    { icon: CheckCircle2, label: 'Pending Reviews', value: healthMetrics?.pendingReviews || 0, trend: 0, color: COLORS.amber, target: 0 },
    { icon: Shield, label: 'Active Risks', value: risks.filter((r: any) => r.status === 'active').length, trend: 0, color: COLORS.violet },
    { icon: Brain, label: 'AI Responses', value: healthMetrics?.totalResponses || 0, trend: 12, color: COLORS.primary },
  ], [healthMetrics, risks]);

  // Feedback type distribution for pie chart
  const feedbackPieData = useMemo(() => {
    const types = healthMetrics?.feedbackByType || {};
    return Object.entries(types).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  }, [healthMetrics]);

  // Radar chart for governance dimensions
  const governanceRadar = useMemo(() => [
    { dimension: 'Transparency', value: 92, target: 95 },
    { dimension: 'Accuracy', value: healthMetrics?.avgConfidence || 75, target: 90 },
    { dimension: 'Citations', value: healthMetrics?.citationRate || 70, target: 90 },
    { dimension: 'Privacy', value: 88, target: 90 },
    { dimension: 'Fairness', value: 82, target: 85 },
    { dimension: 'Accountability', value: 85, target: 90 },
  ], [healthMetrics]);

  // Audit action breakdown
  const auditActionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    auditLog?.forEach((e: any) => { counts[e.action] = (counts[e.action] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [auditLog]);

  const handleSaveRisk = useCallback(async (risk: any, updates: any) => {
    try {
      if (risk.id && !risk.id.startsWith('dr-')) {
        await updateRisk.mutateAsync({ id: risk.id, updates });
        toast.success('Risk updated successfully');
      }
      setEditingRisk(null);
    } catch { toast.error('Failed to update risk'); }
  }, [updateRisk]);

  const handleCreateRisk = useCallback(async () => {
    try {
      await createRisk.mutateAsync({
        risk_name: newRisk.risk_name,
        risk_category: newRisk.risk_category,
        description: newRisk.description,
        severity: newRisk.severity,
        status: newRisk.status,
        mitigation_strategies: newRisk.mitigation_strategies.split(',').map(s => s.trim()).filter(Boolean),
        review_frequency: newRisk.review_frequency,
      });
      toast.success('New risk added');
      setShowNewRisk(false);
      setNewRisk({ risk_name: '', risk_category: '', description: '', severity: 'medium', status: 'active', mitigation_strategies: '', review_frequency: 'monthly' });
    } catch { toast.error('Failed to create risk'); }
  }, [createRisk, newRisk]);

  const handleReviewFeedback = useCallback(async () => {
    if (!reviewingFeedback) return;
    try {
      await reviewFeedback.mutateAsync({ id: reviewingFeedback.id, review_status: reviewStatus, review_notes: reviewNotes });
      toast.success('Feedback reviewed');
      setReviewingFeedback(null);
      setReviewNotes('');
    } catch { toast.error('Failed to review feedback'); }
  }, [reviewFeedback, reviewingFeedback, reviewStatus, reviewNotes]);

  // Export governance report as PDF
  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFillColor(7, 79, 152);
    doc.rect(0, 0, pw, 25, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('NURU AI — GOVERNANCE REPORT', pw / 2, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.text('AI Transparency, Risk Management & Compliance', pw / 2, 19, { align: 'center' });
    y = 35;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`, pw / 2, y, { align: 'center' });
    y += 12;

    // Health Metrics
    doc.setFontSize(12);
    doc.setTextColor(7, 79, 152);
    doc.text('GOVERNANCE HEALTH METRICS', 15, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Average Confidence', `${healthMetrics?.avgConfidence || 0}%`],
        ['Citation Rate', `${healthMetrics?.citationRate || 0}%`],
        ['Total AI Responses', String(healthMetrics?.totalResponses || 0)],
        ['Citizen Flags', String(healthMetrics?.totalFlags || 0)],
        ['Pending Reviews', String(healthMetrics?.pendingReviews || 0)],
        ['Confirmed Issues', String(healthMetrics?.confirmedIssues || 0)],
        ['Hallucination Flags', String(healthMetrics?.hallucinationFlags || 0)],
      ],
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [7, 79, 152], textColor: 255 },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Risk Register
    doc.setFontSize(12);
    doc.setTextColor(7, 79, 152);
    doc.text('RISK REGISTER', 15, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Risk', 'Category', 'Severity', 'Status', 'Mitigations']],
      body: risks.map((r: any) => [r.risk_name, r.risk_category, r.severity, r.status, (r.mitigation_strategies || []).join('; ')]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [7, 79, 152], textColor: 255 },
      alternateRowStyles: { fillColor: [250, 250, 252] },
      columnStyles: { 4: { cellWidth: 50 } },
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
      head: [['Framework', 'Requirements', 'Status']],
      body: COMPLIANCE_ITEMS.map(c => [c.framework, c.items.join(', '), c.status.replace('_', ' ')]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [7, 79, 152], textColor: 255 },
      alternateRowStyles: { fillColor: [250, 250, 252] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Model registry
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setTextColor(7, 79, 152);
    doc.text('MODEL VERSION REGISTRY', 15, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [['Model', 'Version', 'Deployed', 'Status', 'Notes']],
      body: MODEL_VERSIONS.map(m => [m.model, m.version, m.deployed, m.status, m.notes]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [7, 79, 152], textColor: 255 },
      alternateRowStyles: { fillColor: [250, 250, 252] },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount} | Nuru AI Governance Report | Peaceverse`, pw / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`nuru-governance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('Governance PDF report downloaded');
  }, [healthMetrics, risks]);

  // Export as Word
  const handleExportWord = useCallback(async () => {
    const mkHeader = (cells: string[]) => new TableRow({
      children: cells.map(t => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', size: 20 })], alignment: AlignmentType.CENTER })],
        shading: { fill: '074F98', type: ShadingType.SOLID, color: '074F98' },
      })),
    });
    const mkRow = (cells: string[]) => new TableRow({
      children: cells.map((t, i) => new TableCell({
        children: [new Paragraph({ text: t, alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER })],
      })),
    });

    const sections: any[] = [
      new Paragraph({ text: 'NURU AI', heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: 'Governance & Transparency Report', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: `Generated: ${format(new Date(), 'MMMM d, yyyy HH:mm:ss')}`, italics: true })], alignment: AlignmentType.CENTER }),
      new Paragraph({ text: '' }),
      new Paragraph({ children: [new PageBreak()] }),

      // Health Metrics
      new Paragraph({ text: 'GOVERNANCE HEALTH METRICS', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: '' }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          mkHeader(['Metric', 'Value']),
          mkRow(['Average Confidence', `${healthMetrics?.avgConfidence || 0}%`]),
          mkRow(['Citation Rate', `${healthMetrics?.citationRate || 0}%`]),
          mkRow(['Total AI Responses', String(healthMetrics?.totalResponses || 0)]),
          mkRow(['Citizen Flags', String(healthMetrics?.totalFlags || 0)]),
          mkRow(['Pending Reviews', String(healthMetrics?.pendingReviews || 0)]),
          mkRow(['Confirmed Issues', String(healthMetrics?.confirmedIssues || 0)]),
        ],
      }),
      new Paragraph({ text: '' }),

      // Risk Register
      new Paragraph({ text: 'RISK REGISTER', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: '' }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          mkHeader(['Risk', 'Category', 'Severity', 'Status']),
          ...risks.map((r: any) => mkRow([r.risk_name, r.risk_category, r.severity, r.status])),
        ],
      }),
      new Paragraph({ text: '' }),

      // Compliance
      new Paragraph({ text: 'COMPLIANCE STATUS', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: '' }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          mkHeader(['Framework', 'Requirements', 'Status']),
          ...COMPLIANCE_ITEMS.map(c => mkRow([c.framework, c.items.join(', '), c.status.replace('_', ' ')])),
        ],
      }),
      new Paragraph({ text: '' }),

      // Model Registry
      new Paragraph({ text: 'MODEL VERSION REGISTRY', heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: '' }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          mkHeader(['Model', 'Version', 'Deployed', 'Status']),
          ...MODEL_VERSIONS.map(m => mkRow([m.model, m.version, m.deployed, m.status])),
        ],
      }),
    ];

    const wordDoc = new Document({ sections: [{ children: sections }] });
    const blob = await Packer.toBlob(wordDoc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nuru-governance-report-${new Date().toISOString().slice(0, 10)}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Governance Word report downloaded');
  }, [healthMetrics, risks]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/15">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">AI Transparency & Governance</h2>
              <p className="text-[11px] text-muted-foreground">Risk management, compliance tracking, citizen feedback & audit trail</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExportPDF}>
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExportWord}>
              <FileText className="h-3.5 w-3.5" /> Word
            </Button>
          </div>
        </div>

        {/* Scorecards */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {scorecards.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl border border-border/20 bg-gradient-to-br from-card/80 to-muted/10 text-center relative overflow-hidden"
            >
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full opacity-10 blur-lg" style={{ backgroundColor: s.color }} />
              <s.icon className="h-4 w-4 mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-base font-bold mt-0.5">{s.value}</p>
              {s.target !== undefined && typeof s.value === 'string' && (
                <Progress value={parseInt(s.value)} className="h-1 mt-1.5" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="scorecards">
        <TabsList className="rounded-xl flex-wrap h-auto gap-1">
          <TabsTrigger value="scorecards" className="gap-1.5 rounded-lg text-xs"><BarChart3 className="h-3.5 w-3.5" />Scorecards</TabsTrigger>
          <TabsTrigger value="risks" className="gap-1.5 rounded-lg text-xs"><AlertTriangle className="h-3.5 w-3.5" />Risk Register</TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1.5 rounded-lg text-xs"><MessageSquareWarning className="h-3.5 w-3.5" />Citizen Feedback ({feedbackList?.length || 0})</TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1.5 rounded-lg text-xs"><Scale className="h-3.5 w-3.5" />Compliance</TabsTrigger>
          <TabsTrigger value="models" className="gap-1.5 rounded-lg text-xs"><Cpu className="h-3.5 w-3.5" />Model Registry</TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 rounded-lg text-xs"><Clock className="h-3.5 w-3.5" />Audit Trail</TabsTrigger>
        </TabsList>

        {/* SCORECARDS & TRENDS TAB */}
        <TabsContent value="scorecards" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Weekly Trends */}
            <SectionCard title="Governance Health Trends" icon={TrendingUp} badge="8 weeks">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={healthMetrics?.weeklyTrends || []}>
                  <defs>
                    <linearGradient id="govGradConf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="govGradCit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="confidence" name="Confidence %" stroke={COLORS.emerald} fill="url(#govGradConf)" strokeWidth={2} />
                  <Area type="monotone" dataKey="citations" name="Citations" stroke={COLORS.cyan} fill="url(#govGradCit)" strokeWidth={2} />
                  <Area type="monotone" dataKey="flags" name="Flags" stroke={COLORS.rose} fill="none" strokeWidth={2} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>

            {/* Governance Radar */}
            <SectionCard title="Governance Dimensions" icon={Shield} badge="6 pillars">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={governanceRadar}>
                  <PolarGrid strokeOpacity={0.15} />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                  <Radar name="Current" dataKey="value" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Target" dataKey="target" stroke={COLORS.amber} fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </SectionCard>

            {/* Feedback Distribution */}
            <SectionCard title="Feedback Type Distribution" icon={Flag}>
              {feedbackPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={feedbackPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3} strokeWidth={0}>
                      {feedbackPieData.map((_, i) => <Cell key={i} fill={COLOR_LIST[i % COLOR_LIST.length]} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-xs"><Flag className="h-6 w-6 mx-auto mb-2 opacity-20" />No feedback data yet</div>
              )}
            </SectionCard>

            {/* Audit Action Breakdown */}
            <SectionCard title="Audit Action Distribution" icon={Activity} badge={`${auditLog?.length || 0} entries`}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={auditActionCounts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={100} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Count" fill={COLORS.violet} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>
        </TabsContent>

        {/* RISK REGISTER TAB */}
        <TabsContent value="risks" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowNewRisk(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Risk
            </Button>
          </div>
          {risks.map((risk: any, i: number) => (
            <motion.div key={risk.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-4 hover:border-primary/15 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon(risk.status)}
                      <h4 className="font-semibold text-sm">{risk.risk_name}</h4>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={`text-[10px] ${severityStyles[risk.severity] || ''}`}>{risk.severity}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{risk.status}</Badge>
                      {risk.review_frequency && <span className="text-[10px] text-muted-foreground/50">Review: {risk.review_frequency}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{risk.description}</p>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><Lightbulb className="h-3 w-3" />Mitigations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(risk.mitigation_strategies || []).map((s: string, idx: number) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    </div>
                    {risk.monitoring_metrics && (
                      <div className="flex gap-3 mt-3">
                        {Object.entries(risk.monitoring_metrics).map(([key, val]: [string, any]) => (
                          <span key={key} className="text-[10px] text-muted-foreground/60">
                            {key.replace(/([A-Z])/g, ' $1').trim()}: <strong>{typeof val === 'number' && val < 1 ? `${Math.round(val * 100)}%` : val}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setEditingRisk(risk)}>
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        {/* CITIZEN FEEDBACK TAB */}
        <TabsContent value="feedback" className="mt-4 space-y-3">
          {(!feedbackList || feedbackList.length === 0) ? (
            <div className="text-center py-12 text-muted-foreground rounded-xl border border-border/20 bg-card/30">
              <MessageSquareWarning className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No citizen feedback submitted yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Feedback appears when users flag AI responses from the chat</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-3">
                {feedbackList.map((fb: any) => (
                  <div key={fb.id} className="rounded-xl border border-border/30 bg-card/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={`text-[10px] ${severityStyles[fb.severity] || ''}`}>{fb.severity}</Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">{fb.feedback_type.replace(/_/g, ' ')}</Badge>
                          <Badge variant={fb.review_status === 'pending' ? 'default' : 'outline'} className="text-[10px] capitalize">{fb.review_status}</Badge>
                        </div>
                        {fb.description && <p className="text-xs text-muted-foreground mt-2">{fb.description}</p>}
                        {fb.ai_response_snippet && (
                          <div className="mt-2 p-2 rounded-lg bg-muted/30 text-[11px] text-muted-foreground/70 italic border-l-2 border-primary/20">
                            "{fb.ai_response_snippet.substring(0, 200)}..."
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground/50 mt-2">{format(parseISO(fb.created_at), 'MMM d, yyyy HH:mm')}</p>
                        {fb.review_notes && (
                          <div className="mt-2 text-[11px] text-muted-foreground/80">
                            <strong>Review notes:</strong> {fb.review_notes}
                          </div>
                        )}
                      </div>
                      {fb.review_status === 'pending' && (
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { setReviewingFeedback(fb); setReviewStatus('confirmed'); }}>
                          <Search className="h-3 w-3" /> Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* COMPLIANCE TAB */}
        <TabsContent value="compliance" className="mt-4 space-y-4">
          {COMPLIANCE_ITEMS.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="rounded-xl border border-border/30 bg-card/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">{c.framework}</h4>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${
                    c.status === 'compliant' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    c.status === 'partial' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-sky-500/10 text-sky-500 border-sky-500/20'
                  }`}>{c.status.replace('_', ' ')}</Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {c.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${c.status === 'compliant' ? 'text-emerald-500' : c.status === 'partial' && idx < c.items.length - 1 ? 'text-emerald-500' : 'text-amber-500'}`} />
                      {item}
                    </div>
                  ))}
                </div>
                <Progress value={c.status === 'compliant' ? 100 : c.status === 'partial' ? 75 : 50} className="h-1 mt-3" />
              </div>
            </motion.div>
          ))}
        </TabsContent>

        {/* MODEL REGISTRY TAB */}
        <TabsContent value="models" className="mt-4 space-y-3">
          {MODEL_VERSIONS.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="rounded-xl border border-border/30 bg-card/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10"><Cpu className="h-4 w-4 text-primary" /></div>
                    <div>
                      <h4 className="text-sm font-semibold">{m.model}</h4>
                      <p className="text-[10px] text-muted-foreground">v{m.version} · Deployed {m.deployed}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${m.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                    {m.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{m.notes}</p>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        {/* AUDIT TRAIL TAB */}
        <TabsContent value="audit" className="mt-4">
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-left p-3 font-medium">Entity</th>
                  <th className="text-left p-3 font-medium">Details</th>
                  <th className="text-left p-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {(auditLog || []).slice(0, 50).map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3"><Badge variant="outline" className="text-[10px] capitalize">{entry.action.replace(/_/g, ' ')}</Badge></td>
                    <td className="p-3 text-muted-foreground">{entry.entity_type}</td>
                    <td className="p-3 text-muted-foreground max-w-xs truncate">
                      {entry.details?.processingTime ? `${entry.details.processingTime}ms` : ''}
                      {entry.details?.confidence ? ` · ${Math.round(entry.details.confidence * 100)}% conf` : ''}
                    </td>
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{format(new Date(entry.created_at), 'MMM d, HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!auditLog || auditLog.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Audit logs are recorded when users interact with NuruAI</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Risk Dialog */}
      <Dialog open={!!editingRisk} onOpenChange={() => setEditingRisk(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-sm">Edit Risk: {editingRisk?.risk_name}</DialogTitle></DialogHeader>
          {editingRisk && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={editingRisk.status} onValueChange={v => setEditingRisk({ ...editingRisk, status: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Severity</label>
                <Select value={editingRisk.severity} onValueChange={v => setEditingRisk({ ...editingRisk, severity: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Resolution Notes</label>
                <Textarea className="text-xs" placeholder="Add resolution notes..." value={editingRisk.resolution_notes || ''} onChange={e => setEditingRisk({ ...editingRisk, resolution_notes: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Review Frequency</label>
                <Select value={editingRisk.review_frequency || 'monthly'} onValueChange={v => setEditingRisk({ ...editingRisk, review_frequency: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditingRisk(null)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={() => handleSaveRisk(editingRisk, { status: editingRisk.status, severity: editingRisk.severity, resolution_notes: editingRisk.resolution_notes, review_frequency: editingRisk.review_frequency })}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Risk Dialog */}
      <Dialog open={showNewRisk} onOpenChange={setShowNewRisk}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-sm">Add New Governance Risk</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-muted-foreground">Risk Name</label><Input className="h-9 text-xs" placeholder="e.g., Model Drift" value={newRisk.risk_name} onChange={e => setNewRisk({ ...newRisk, risk_name: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-muted-foreground">Category</label><Input className="h-9 text-xs" placeholder="e.g., AI Quality" value={newRisk.risk_category} onChange={e => setNewRisk({ ...newRisk, risk_category: e.target.value })} /></div>
            <div><label className="text-xs font-medium text-muted-foreground">Description</label><Textarea className="text-xs" value={newRisk.description} onChange={e => setNewRisk({ ...newRisk, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground">Severity</label>
                <Select value={newRisk.severity} onValueChange={v => setNewRisk({ ...newRisk, severity: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground">Review Freq</label>
                <Select value={newRisk.review_frequency} onValueChange={v => setNewRisk({ ...newRisk, review_frequency: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground">Mitigations (comma-separated)</label><Textarea className="text-xs" placeholder="Strategy 1, Strategy 2" value={newRisk.mitigation_strategies} onChange={e => setNewRisk({ ...newRisk, mitigation_strategies: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowNewRisk(false)}>Cancel</Button>
            <Button size="sm" className="text-xs" disabled={!newRisk.risk_name || !newRisk.description} onClick={handleCreateRisk}>Add Risk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Feedback Dialog */}
      <Dialog open={!!reviewingFeedback} onOpenChange={() => setReviewingFeedback(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-sm">Review Citizen Feedback</DialogTitle></DialogHeader>
          {reviewingFeedback && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/30 text-xs space-y-1">
                <p><strong>Type:</strong> {reviewingFeedback.feedback_type}</p>
                <p><strong>Severity:</strong> {reviewingFeedback.severity}</p>
                {reviewingFeedback.description && <p><strong>Description:</strong> {reviewingFeedback.description}</p>}
                {reviewingFeedback.ai_response_snippet && <p className="italic text-muted-foreground">"{reviewingFeedback.ai_response_snippet.substring(0, 200)}"</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Review Decision</label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed — Issue Valid</SelectItem>
                    <SelectItem value="dismissed">Dismissed — Not an Issue</SelectItem>
                    <SelectItem value="reviewing">Keep Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Review Notes</label>
                <Textarea className="text-xs" placeholder="Add review notes..." value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setReviewingFeedback(null)}>Cancel</Button>
            <Button size="sm" className="text-xs" onClick={handleReviewFeedback}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NuruGovernancePortal;
