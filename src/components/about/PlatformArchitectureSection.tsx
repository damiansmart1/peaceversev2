import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle, Shield, Eye, BarChart3, Radio, Vote,
  MessageSquare, Gamepad2, Globe, Smartphone, Lock, Wifi
} from 'lucide-react';

const modules = [
  {
    icon: AlertTriangle,
    name: 'Incident Reporting',
    description: 'Multi-channel citizen reporting with AI-powered threat classification, sentiment analysis, and geographic clustering.',
    standards: ['OCHA ReliefWeb taxonomy', 'ACLED methodology'],
  },
  {
    icon: Shield,
    name: 'Verification Engine',
    description: 'Multi-layer verification with source credibility scoring, cross-referencing, risk assessment, and evidence review.',
    standards: ['Carter Center verification protocol', 'Bellingcat OSINT'],
  },
  {
    icon: Eye,
    name: 'Early Warning System',
    description: 'Predictive hotspot mapping with 78% accuracy, real-time alert feeds, and recommended intervention actions.',
    standards: ['UN Framework for Early Warning', 'AU CEWS'],
  },
  {
    icon: Vote,
    name: 'Election Monitoring',
    description: 'Statistical anomaly detection (Benford\'s Law), PVT with 95% confidence intervals, systematic observation checklists.',
    standards: ['EU EOM methodology', 'OSCE/ODIHR guidelines'],
  },
  {
    icon: BarChart3,
    name: 'Peace Pulse Analytics',
    description: 'Continental conflict indicators, regional comparison charts, cross-border analysis, and advanced trend reporting.',
    standards: ['Global Peace Index metrics', 'Fragile States Index'],
  },
  {
    icon: Radio,
    name: 'Communication Hub',
    description: 'Coordination channels, broadcast center, escalation management, and field reporting for multi-stakeholder coordination.',
    standards: ['Humanitarian cluster system', 'IASC protocols'],
  },
  {
    icon: MessageSquare,
    name: 'Community Platform',
    description: 'Social feeds, chatrooms, direct messaging, content creation tools, and community-driven proposals system.',
    standards: ['Do No Harm principle', 'Conflict-sensitive design'],
  },
  {
    icon: Gamepad2,
    name: 'Gamification & Engagement',
    description: 'Points, badges, weekly challenges, leaderboards, and reward store to sustain citizen participation.',
    standards: ['Behavioral science frameworks'],
  },
];

const techSpecs = [
  { icon: Globe, label: 'Multi-language', detail: 'English, French, Swahili, Arabic, Portuguese + more' },
  { icon: Smartphone, label: 'Mobile-first PWA', detail: 'Offline capable with local caching & sync' },
  { icon: Lock, label: 'Security', detail: 'RLS policies, encrypted reports, anonymous submissions' },
  { icon: Wifi, label: 'Low-bandwidth', detail: 'Optimised for connectivity-constrained regions' },
];

export default function PlatformArchitectureSection() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3">Platform Architecture</Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Integrated Modules for Comprehensive Coverage
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          Eight interconnected modules providing end-to-end conflict monitoring, prevention, and response capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <Card key={i} className="p-5 hover:shadow-soft transition-all duration-300 border hover:border-primary/20">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm mb-1">{mod.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{mod.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.standards.map((s, j) => (
                      <Badge key={j} variant="outline" className="text-[10px] px-2 py-0.5">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Technical Specifications */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {techSpecs.map((spec, i) => {
          const Icon = spec.icon;
          return (
            <Card key={i} className="p-4 bg-muted/50 border-0">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <div className="text-xs font-bold text-foreground mb-0.5">{spec.label}</div>
              <div className="text-[11px] text-muted-foreground">{spec.detail}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
