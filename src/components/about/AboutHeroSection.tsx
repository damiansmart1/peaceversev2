import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Shield, Globe, AlertTriangle, Users, Eye, Target, Zap, Radio } from 'lucide-react';

const platformCapabilities = [
  { icon: AlertTriangle, label: 'Early Warning', value: '12,450+ incidents tracked' },
  { icon: Shield, label: 'Verification', value: '71.6% verification rate' },
  { icon: Globe, label: 'Coverage', value: '47 African nations' },
  { icon: Users, label: 'Community', value: '156,000+ registered users' },
  { icon: Eye, label: 'Election Monitoring', value: 'Carter Center standards' },
  { icon: Zap, label: 'Response Time', value: '< 4 hrs avg.' },
  { icon: Radio, label: 'Communication', value: 'Multi-channel broadcast' },
  { icon: Target, label: 'Prevention', value: '340+ conflicts averted' },
];

export default function AboutHeroSection() {
  return (
    <div className="space-y-10">
      {/* Hero Statement */}
      <div className="text-center max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-4 px-4 py-1.5 rounded-sm font-medium uppercase text-xs tracking-wider">
          About Peaceverse
        </Badge>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
          <span className="bg-peace-gradient bg-clip-text text-transparent">
            Africa's Premier Continental Early Warning & Response Platform
          </span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Peaceverse is a technology-driven early warning and rapid response system designed to detect 
          emerging threats, verify incidents through community-driven processes, and prevent conflicts 
          before they escalate — aligned with international frameworks including UNSCR 2250, AU Agenda 2063, 
          and SDG 16.
        </p>
      </div>

      {/* Platform Capabilities Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {platformCapabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <Card key={i} className="p-4 text-center border hover:border-primary/20 hover:shadow-soft transition-all duration-300">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">{cap.label}</div>
              <div className="text-xs text-muted-foreground">{cap.value}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
