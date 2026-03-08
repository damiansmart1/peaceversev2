import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleCheckBig, ShieldHalf, UsersRound, Handshake, Ban, Target } from 'lucide-react';

const frameworks = [
  {
    name: 'UNSCR 2250',
    subtitle: 'Youth, Peace & Security',
    description: 'Peaceverse operationalises all five pillars of UNSCR 2250, empowering youth as agents of peace across the continent.',
    pillars: [
      { icon: UsersRound, name: 'Participation', detail: 'Citizen reporting & democratic proposals' },
      { icon: ShieldHalf, name: 'Prevention', detail: 'AI-powered predictive hotspot mapping' },
      { icon: Target, name: 'Protection', detail: 'Anonymous reporting & safety resources' },
      { icon: Handshake, name: 'Partnerships', detail: 'Multi-stakeholder coordination channels' },
      { icon: Ban, name: 'Disengagement', detail: 'Community peacebuilding challenges' },
    ],
    color: 'border-primary/30 bg-primary/5',
  },
  {
    name: 'AU Agenda 2063',
    subtitle: 'Aspiration 4 — A Peaceful & Secure Africa',
    description: 'Contributing to the African Union\'s vision of silencing the guns by providing continental-scale conflict monitoring and early intervention capabilities.',
    stats: [
      '54-country coverage roadmap',
      '8 Regional Economic Community integrations',
      'Gender-disaggregated analytics (40% AU parity threshold)',
      'Cross-border incident correlation analysis',
    ],
    color: 'border-success/30 bg-success/5',
  },
  {
    name: 'SDG 16',
    subtitle: 'Peace, Justice & Strong Institutions',
    description: 'Directly advancing Sustainable Development Goal 16 by promoting peaceful, just, and inclusive societies with transparent, accountable institutions.',
    stats: [
      '16.1 — Reducing all forms of violence (incident tracking)',
      '16.2 — Protecting children (vulnerability tagging)',
      '16.6 — Transparent institutions (open data & audit logs)',
      '16.7 — Participatory decision-making (community proposals)',
    ],
    color: 'border-accent/30 bg-accent/5',
  },
];

export default function InternationalFrameworksSection() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3">International Alignment</Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Built on Global Peace & Security Frameworks
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          Every feature maps to internationally recognized standards for conflict prevention and peacebuilding.
        </p>
      </div>

      <div className="space-y-6">
        {frameworks.map((fw, i) => (
          <Card key={i} className={`p-6 md:p-8 border-2 ${fw.color}`}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <Badge variant="outline" className="mb-2 text-xs font-bold">{fw.name}</Badge>
                <h3 className="text-lg font-bold text-foreground mb-2">{fw.subtitle}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{fw.description}</p>
              </div>
              <div className="md:w-2/3">
                {fw.pillars ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fw.pillars.map((p, j) => {
                      const Icon = p.icon;
                      return (
                        <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-background border">
                          <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-foreground">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.detail}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {fw.stats?.map((s, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CircleCheckBig className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
