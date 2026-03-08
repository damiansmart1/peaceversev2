import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, AlertTriangle, Globe, Shield, TrendingUp, Clock, 
  CheckCircle2, MapPin, Activity, Zap, Brain, Radio 
} from 'lucide-react';

const metrics = [
  {
    icon: AlertTriangle, value: '12,450+', label: 'Incidents Reported',
    description: 'Citizen reports from across Africa', change: '+34% this quarter',
    color: 'text-destructive', bgColor: 'bg-destructive/10',
  },
  {
    icon: CheckCircle2, value: '8,920', label: 'Verified Incidents',
    description: 'Community-verified reports', change: '71.6% verification rate',
    color: 'text-success', bgColor: 'bg-success/10',
  },
  {
    icon: Globe, value: '47', label: 'Countries Active',
    description: 'Across all African regions', change: '+5 this year',
    color: 'text-primary', bgColor: 'bg-primary/10',
  },
  {
    icon: Users, value: '156,000+', label: 'Registered Users',
    description: 'Citizens, verifiers & partners', change: '+28% growth',
    color: 'text-accent', bgColor: 'bg-accent/10',
  },
  {
    icon: Clock, value: '< 4 hrs', label: 'Avg. Response Time',
    description: 'From report to verification', change: '67% faster than last year',
    color: 'text-warning', bgColor: 'bg-warning/10',
  },
  {
    icon: Shield, value: '340+', label: 'Conflicts Prevented',
    description: 'Through early intervention', change: 'Est. 50,000+ lives protected',
    color: 'text-success', bgColor: 'bg-success/10',
  },
  {
    icon: Brain, value: '24,600+', label: 'AI Fact-Checks',
    description: 'NuruAI claim verifications', change: 'IFCN-standard ClaimReview',
    color: 'text-primary', bgColor: 'bg-primary/10',
  },
  {
    icon: Radio, value: '1,200+', label: 'Radio Hours Broadcast',
    description: 'Peace Radio content delivered', change: '15 community stations',
    color: 'text-accent', bgColor: 'bg-accent/10',
  },
];

const regionalStats = [
  { region: 'East Africa', incidents: 3420, countries: 12, status: 'Active' },
  { region: 'West Africa', incidents: 4180, countries: 15, status: 'Active' },
  { region: 'Southern Africa', incidents: 2140, countries: 10, status: 'Active' },
  { region: 'Central Africa', incidents: 1890, countries: 8, status: 'Expanding' },
  { region: 'North Africa', incidents: 820, countries: 5, status: 'Pilot' },
];

export const AboutImpactMetrics = () => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-4">Platform Impact</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-peace-gradient bg-clip-text text-transparent">
            Real-Time Continental Impact
          </span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Measuring our progress in building Africa's most comprehensive early warning and AI intelligence system
        </p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="p-5 hover:shadow-elevated transition-all duration-300 border hover:border-primary/20">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${metric.bgColor} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold text-foreground mb-0.5">{metric.value}</div>
                  <div className="text-xs font-medium text-foreground mb-0.5">{metric.label}</div>
                  <div className="text-[11px] text-muted-foreground mb-2">{metric.description}</div>
                  <Badge variant="outline" className="text-[10px] bg-success/5 text-success border-success/20">
                    {metric.change}
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Regional Coverage */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Regional Coverage</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Region</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Incidents</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Countries</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {regionalStats.map((stat, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{stat.region}</td>
                  <td className="py-3 px-4 text-foreground">{stat.incidents.toLocaleString()}</td>
                  <td className="py-3 px-4 text-foreground">{stat.countries}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={
                      stat.status === 'Active' ? 'bg-success/10 text-success border-success/20' :
                      stat.status === 'Expanding' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-primary/10 text-primary border-primary/20'
                    }>
                      {stat.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Achievements & Goals */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-success" />
            <h3 className="text-lg font-bold text-foreground">2025 Achievements</h3>
          </div>
          <ul className="space-y-3">
            {[
              'Launched NuruAI with IFCN-standard fact-checking & ClaimReview schema',
              'Deployed predictive hotspot mapping with 78% accuracy',
              'Integrated with 23 national early warning systems',
              'Launched Peace Radio with live streaming & podcast library',
              'Partnered with African Union for continental coverage',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold text-foreground">2026 Goals</h3>
          </div>
          <ul className="space-y-3">
            {[
              'Expand to all 54 African countries with full module coverage',
              'Launch mobile-first offline reporting with background sync',
              'Integrate satellite imagery for remote area monitoring',
              'Train 10,000+ community verifiers across the continent',
              'Deploy NuruAI multilingual fact-checking in 12 languages',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
