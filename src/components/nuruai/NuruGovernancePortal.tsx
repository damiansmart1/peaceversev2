import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, Eye, Lightbulb, BarChart3, Clock, Activity, FileText } from 'lucide-react';
import { useGovernanceRegistry, useNuruAuditLog } from '@/hooks/useNuruAI';
import { format } from 'date-fns';

const DEFAULT_RISKS = [
  { risk_category: 'AI Hallucination', risk_name: 'Generated Content Fabrication', description: 'Risk of AI generating explanations not grounded in source documents.', severity: 'critical', mitigation_strategies: ['Source-grounded responses only', 'Confidence scoring on all outputs', 'Citation requirements', 'Human review for low-confidence answers'], status: 'active', monitoring_metrics: { auditsCompleted: 47, accuracyRate: 0.94 } },
  { risk_category: 'Policy Misinterpretation', risk_name: 'Incorrect Policy Analysis', description: 'Risk of AI misinterpreting complex policy language or legal terminology.', severity: 'high', mitigation_strategies: ['Human review for critical analyses', 'Uncertainty flagging', 'Domain expert validation', 'Multi-pass verification'], status: 'active', monitoring_metrics: { reviewedDocuments: 156, correctionsMade: 12 } },
  { risk_category: 'Algorithmic Bias', risk_name: 'Biased Document Processing', description: 'Risk of systematic bias in how documents are summarized or questions answered.', severity: 'medium', mitigation_strategies: ['Regular bias audits', 'Diverse testing datasets', 'Transparent model documentation'], status: 'monitoring' },
  { risk_category: 'Data Privacy', risk_name: 'User Query Privacy', description: 'Risk of exposing sensitive user queries or behavioral patterns.', severity: 'high', mitigation_strategies: ['Anonymous question option', 'Query encryption at rest', 'No user profiling', 'GDPR-aligned policies'], status: 'active' },
  { risk_category: 'Overreliance on AI', risk_name: 'Substitution of Human Judgment', description: 'Risk of citizens treating AI analyses as authoritative legal advice.', severity: 'medium', mitigation_strategies: ['Clear disclaimers', 'Institutional verification links', 'Official source links'], status: 'active' },
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

const NuruGovernancePortal = () => {
  const { data: registryData } = useGovernanceRegistry();
  const { data: auditLog } = useNuruAuditLog();
  const risks = registryData?.length ? registryData : DEFAULT_RISKS;

  const actionCounts: Record<string, number> = {};
  auditLog?.forEach((entry: any) => {
    actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/15">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">AI Transparency & Governance</h2>
            <p className="text-[11px] text-muted-foreground">Public documentation of NuruAI's risks, safeguards, and audit trail</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Governance Model', value: 'Evidence-Grounded AI', icon: Shield },
            { label: 'Core Principle', value: 'Source-Only Responses', icon: CheckCircle },
            { label: 'AI Model', value: 'Gemini 2.5 Pro', icon: Activity },
            { label: 'Audit Entries', value: auditLog?.length?.toString() || '0', icon: FileText },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl border border-border/20 text-center">
              <item.icon className="h-4 w-4 mx-auto mb-1 text-primary/60" />
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="text-xs font-semibold mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="risks">
        <TabsList className="rounded-xl">
          <TabsTrigger value="risks" className="gap-2 rounded-lg text-xs"><AlertTriangle className="h-3.5 w-3.5" />Risk Register</TabsTrigger>
          <TabsTrigger value="audit" className="gap-2 rounded-lg text-xs"><Clock className="h-3.5 w-3.5" />Audit Trail ({auditLog?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="mt-4 space-y-3">
          {risks.map((risk: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-4 hover:border-primary/15 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon(risk.status)}
                      <h4 className="font-semibold text-sm">{risk.risk_name}</h4>
                    </div>
                    <Badge variant="outline" className={`text-[10px] mb-2 ${severityStyles[risk.severity] || ''}`}>{risk.severity} severity</Badge>
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
                  <Badge variant="outline" className="text-[10px] capitalize shrink-0">{risk.status}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </TabsContent>

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
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] capitalize">{entry.action.replace(/_/g, ' ')}</Badge>
                    </td>
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
    </div>
  );
};

export default NuruGovernancePortal;
