import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShieldCheck, BarChart3, MapPin, Users, FileCheck, Lock, Eye } from 'lucide-react';

const standards = [
  {
    category: 'Statistical Integrity',
    icon: BarChart3,
    items: [
      "Benford's Law first-digit analysis with chi-squared testing",
      'Turnout spike detection (>2σ deviation from regional mean)',
      'Parallel Vote Tabulation (PVT) with 95% confidence intervals',
      'Margin of error calculation per polling station sample',
    ],
  },
  {
    category: 'Observer Management',
    icon: Users,
    items: [
      'Accreditation workflow with credential verification',
      'Real-time GPS tracking of observer deployment',
      'Gender-disaggregated analytics (AU 40% parity threshold)',
      'Observer check-in/check-out with geofencing validation',
    ],
  },
  {
    category: 'Systematic Observation',
    icon: FileCheck,
    items: [
      'Carter Center methodology checklists (opening, voting, counting, closing)',
      'Critical procedure tracking with compliance scoring',
      'Incident reporting linked to specific polling stations',
      'Real-time aggregated compliance dashboards',
    ],
  },
  {
    category: 'Security & Auditability',
    icon: Lock,
    items: [
      'Immutable cryptographic audit log for all data modifications',
      'Row-level security policies on all election tables',
      'Geo-fenced result submissions from verified coordinates',
      'Multi-signature result verification workflow',
    ],
  },
];

const complianceFrameworks = [
  { name: 'EU Election Observation Methodology', status: 'Aligned' },
  { name: 'OSCE/ODIHR Guidelines', status: 'Aligned' },
  { name: 'Carter Center Observation Standards', status: 'Implemented' },
  { name: 'AU Election Observation Framework', status: 'Aligned' },
  { name: 'Declaration of Principles (DoP)', status: 'Compliant' },
  { name: 'ECOWAS Protocol on Democracy', status: 'Integrated' },
];

export default function ElectionStandardsSection() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3">Election Monitoring</Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          International-Standard Election Integrity
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          Our election monitoring module meets the highest international standards for statistical rigour, 
          observer management, and data integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {standards.map((std, i) => {
          const Icon = std.icon;
          return (
            <Card key={i} className="p-6 border-2 hover:border-primary/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{std.category}</h3>
              </div>
              <ul className="space-y-2.5">
                {std.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Compliance Frameworks */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-success/5 border-primary/10">
        <div className="flex items-center gap-3 mb-5">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Framework Compliance</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {complianceFrameworks.map((fw, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <span className="text-sm text-foreground font-medium">{fw.name}</span>
              <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                {fw.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
