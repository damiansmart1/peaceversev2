import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Eye, Lightbulb } from 'lucide-react';
import { useGovernanceRegistry } from '@/hooks/useNuruAI';

const DEFAULT_RISKS = [
  {
    risk_category: 'AI Hallucination',
    risk_name: 'Generated Content Fabrication',
    description: 'Risk of AI generating explanations not grounded in source documents.',
    severity: 'high',
    mitigation_strategies: ['Source-grounded responses only', 'Confidence scoring on all outputs', 'Citation requirements'],
    status: 'active',
  },
  {
    risk_category: 'Policy Misinterpretation',
    risk_name: 'Incorrect Policy Analysis',
    description: 'Risk of AI misinterpreting complex policy language or legal terminology.',
    severity: 'high',
    mitigation_strategies: ['Human review for critical analyses', 'Uncertainty flagging', 'Domain expert validation'],
    status: 'active',
  },
  {
    risk_category: 'Algorithmic Bias',
    risk_name: 'Biased Document Processing',
    description: 'Risk of systematic bias in how documents are summarized or questions answered.',
    severity: 'medium',
    mitigation_strategies: ['Regular bias audits', 'Diverse testing datasets', 'Transparent model documentation'],
    status: 'monitoring',
  },
  {
    risk_category: 'Coordinated Manipulation',
    risk_name: 'Platform Gaming',
    description: 'Risk of coordinated efforts to manipulate civic question rankings or claim reviews.',
    severity: 'medium',
    mitigation_strategies: ['Rate limiting', 'Anomaly detection', 'Account verification requirements'],
    status: 'monitoring',
  },
  {
    risk_category: 'Overreliance on AI',
    risk_name: 'Substitution of Human Judgment',
    description: 'Risk of citizens treating AI analyses as authoritative legal or policy advice.',
    severity: 'medium',
    mitigation_strategies: ['Clear disclaimer labels', 'Encourage institutional verification', 'Link to official sources'],
    status: 'active',
  },
];

const severityColor = (s: string) => {
  switch (s) {
    case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    default: return 'bg-green-500/10 text-green-500 border-green-500/20';
  }
};

const statusIcon = (s: string) => {
  switch (s) {
    case 'mitigated': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'monitoring': return <Eye className="h-4 w-4 text-yellow-500" />;
    default: return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  }
};

const NuruGovernancePortal = () => {
  const { data: registryData } = useGovernanceRegistry();
  const risks = registryData?.length ? registryData : DEFAULT_RISKS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />AI Transparency & Governance
          </CardTitle>
          <CardDescription>
            NuruAI operates under strict transparency principles. This portal documents all known risks,
            mitigation strategies, and governance measures in our AI-powered civic intelligence system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Governance Model', value: 'Evidence-Grounded AI', icon: Shield },
              { label: 'Core Principle', value: 'Source-Only Responses', icon: CheckCircle },
              { label: 'Audit Frequency', value: 'Continuous Monitoring', icon: Eye },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 text-center">
                <item.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-semibold mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Register */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />AI Risk Register
        </h3>
        {risks.map((risk: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/20 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {statusIcon(risk.status)}
                      <h4 className="font-semibold text-sm">{risk.risk_name}</h4>
                    </div>
                    <Badge variant="outline" className={`text-xs mb-2 ${severityColor(risk.severity)}`}>{risk.severity} severity</Badge>
                    <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><Lightbulb className="h-3 w-3" />Mitigation Strategies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(risk.mitigation_strategies || []).map((s: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">{risk.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NuruGovernancePortal;
