import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Eye, Lightbulb } from 'lucide-react';
import { useGovernanceRegistry } from '@/hooks/useNuruAI';

const DEFAULT_RISKS = [
  { risk_category: 'AI Hallucination', risk_name: 'Generated Content Fabrication', description: 'Risk of AI generating explanations not grounded in source documents.', severity: 'high', mitigation_strategies: ['Source-grounded responses only', 'Confidence scoring on all outputs', 'Citation requirements'], status: 'active' },
  { risk_category: 'Policy Misinterpretation', risk_name: 'Incorrect Policy Analysis', description: 'Risk of AI misinterpreting complex policy language or legal terminology.', severity: 'high', mitigation_strategies: ['Human review for critical analyses', 'Uncertainty flagging', 'Domain expert validation'], status: 'active' },
  { risk_category: 'Algorithmic Bias', risk_name: 'Biased Document Processing', description: 'Risk of systematic bias in how documents are summarized or questions answered.', severity: 'medium', mitigation_strategies: ['Regular bias audits', 'Diverse testing datasets', 'Transparent model documentation'], status: 'monitoring' },
  { risk_category: 'Coordinated Manipulation', risk_name: 'Platform Gaming', description: 'Risk of coordinated efforts to manipulate civic question rankings or claim reviews.', severity: 'medium', mitigation_strategies: ['Rate limiting', 'Anomaly detection', 'Account verification'], status: 'monitoring' },
  { risk_category: 'Overreliance on AI', risk_name: 'Substitution of Human Judgment', description: 'Risk of citizens treating AI analyses as authoritative legal or policy advice.', severity: 'medium', mitigation_strategies: ['Clear disclaimer labels', 'Institutional verification links', 'Official source links'], status: 'active' },
];

const severityStyles: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

const statusIcon = (s: string) => {
  switch (s) {
    case 'mitigated': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'monitoring': return <Eye className="h-4 w-4 text-amber-500" />;
    default: return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  }
};

const NuruGovernancePortal = () => {
  const { data: registryData } = useGovernanceRegistry();
  const risks = registryData?.length ? registryData : DEFAULT_RISKS;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/15">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">AI Transparency & Governance</h2>
            <p className="text-xs text-muted-foreground">Public documentation of NuruAI's risks, safeguards, and governance measures</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Governance Model', value: 'Evidence-Grounded AI', icon: Shield },
            { label: 'Core Principle', value: 'Source-Only Responses', icon: CheckCircle },
            { label: 'Audit Frequency', value: 'Continuous Monitoring', icon: Eye },
          ].map((item, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-border/20 text-center">
              <item.icon className="h-4 w-4 mx-auto mb-1.5 text-primary/60" />
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="text-xs font-semibold mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Register */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2 px-1">
          <AlertTriangle className="h-4 w-4 text-primary" />AI Risk Register
        </h3>
        {risks.map((risk: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div className="rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-5 hover:border-primary/15 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    {statusIcon(risk.status)}
                    <h4 className="font-semibold text-sm">{risk.risk_name}</h4>
                  </div>
                  <Badge variant="outline" className={`text-[10px] mb-2 ${severityStyles[risk.severity] || ''}`}>{risk.severity} severity</Badge>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{risk.description}</p>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1"><Lightbulb className="h-3 w-3" />Mitigations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(risk.mitigation_strategies || []).map((s: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-2.5 py-1 rounded-full bg-muted/40 text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize shrink-0">{risk.status}</Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NuruGovernancePortal;
