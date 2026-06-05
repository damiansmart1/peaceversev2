import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionShell from '@/components/layout/SectionShell';
import StatStrip from '@/components/layout/StatStrip';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Globe,
  Brain,
  Radio,
  BarChart3,
  Zap,
  Users,
  Target,
  HeartHandshake,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  FileText,
  MapPin,
  Sparkles,
  BookOpen,
  Mail,
  ExternalLink,
} from 'lucide-react';

const platformCapabilities = [
  {
    icon: BarChart3,
    title: 'Analytics Hub',
    description: 'Real-time incident dashboards, trend analysis, and predictive hotspot mapping across 47 African nations.',
    cta: 'Explore Analytics',
    route: '/dashboard/partner',
    tab: 'analytics',
  },
  {
    icon: Brain,
    title: 'NuruAI Intelligence',
    description: 'IFCN-standard fact-checking, AI-generated SITREPs, Flash Updates, and 3W coordination matrices.',
    cta: 'Launch NuruAI',
    route: '/nuru-ai',
  },
  {
    icon: MapPin,
    title: 'Interactive Heatmaps',
    description: 'Geospatial incident visualization with risk-layer overlays, cross-border analysis, and proximity alerts.',
    cta: 'View Heatmap',
    route: '/dashboard/partner',
    tab: 'heatmap',
  },
  {
    icon: HeartHandshake,
    title: 'Impact Tracking',
    description: 'Monitor intervention outcomes, beneficiary reach, budget utilization, and programme effectiveness.',
    cta: 'Track Impact',
    route: '/dashboard/partner',
    tab: 'impact',
  },
  {
    icon: FileText,
    title: 'Intelligence Briefings',
    description: 'OCHA-aligned briefings generated from live data — Executive Summaries, SITREPs, and 3W matrices.',
    cta: 'View Briefings',
    route: '/dashboard/partner',
    tab: 'briefings',
  },
  {
    icon: MessageSquare,
    title: 'Collaboration Workspace',
    description: 'Shared notes, task management, and team coordination with real-time sync across your organization.',
    cta: 'Open Workspace',
    route: '/dashboard/partner',
    tab: 'workspace',
  },
];

const quickStartSteps = [
  {
    step: '01',
    title: 'Set Your Filters',
    description: 'Use the filters bar above to narrow by date range, country, or search terms.',
  },
  {
    step: '02',
    title: 'Explore Live Data',
    description: 'Switch to the Live tab for real-time incident streaming and the Heatmap for geospatial views.',
  },
  {
    step: '03',
    title: 'Generate Briefings',
    description: 'Head to Briefings for AI-powered situational reports aligned with OCHA standards.',
  },
  {
    step: '04',
    title: 'Track Your Impact',
    description: 'Record interventions, monitor beneficiaries, and measure programme outcomes in the Impact tab.',
  },
];

const frameworkAlignments = [
  { name: 'UNSCR 2250', description: 'Youth, Peace & Security agenda' },
  { name: 'AU Agenda 2063', description: 'Silencing the Guns by 2030' },
  { name: 'SDG 16', description: 'Peace, Justice & Strong Institutions' },
  { name: 'OCHA', description: 'Coordination & humanitarian response' },
];

export default function PartnerAboutSection() {
  const navigate = useNavigate();

  const handleNavigate = (route: string, tab?: string) => {
    if (tab) {
      navigate(route, { state: { activeTab: tab } });
    } else {
      navigate(route);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Welcome Hero */}
      <SectionShell
        eyebrow="Partner Portal"
        title="Welcome to Peaceverse"
        description="Africa's premier continental early warning and response platform. As a partner, you have access to real-time intelligence, predictive analytics, and collaboration tools designed to help you prevent conflicts and protect communities."
      >
        <StatStrip
          items={[
            { label: 'Countries', value: '47', hint: 'Active coverage', icon: <Globe className="w-4 h-4" />, tone: 'primary' },
            { label: 'Incidents Tracked', value: '12,450+', hint: 'Continental database', icon: <Target className="w-4 h-4" />, tone: 'default' },
            { label: 'Verification Rate', value: '71.6%', hint: 'Community-verified', icon: <CheckCircle2 className="w-4 h-4" />, tone: 'success' },
            { label: 'Avg Response', value: '< 4 hrs', hint: 'Report to action', icon: <Zap className="w-4 h-4" />, tone: 'warning' },
            { label: 'Conflicts Prevented', value: '340+', hint: 'Through early intervention', icon: <Shield className="w-4 h-4" />, tone: 'primary' },
          ]}
        />
      </SectionShell>

      {/* Capabilities Grid */}
      <SectionShell
        eyebrow="Your Toolkit"
        title="Partner Capabilities"
        description="Everything you need to monitor, analyze, and respond to emerging threats across the continent."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platformCapabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="h-full surface-quiet hover:surface-quiet-active transition-colors group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 gap-1 text-xs"
                        onClick={() => handleNavigate(cap.route, cap.tab)}
                      >
                        {cap.cta}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <CardTitle className="text-base sm:text-lg mt-3">{cap.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {cap.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 text-xs mt-2"
                      onClick={() => handleNavigate(cap.route, cap.tab)}
                    >
                      {cap.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </SectionShell>

      {/* Quick Start + Frameworks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Start */}
        <SectionShell
          eyebrow="Getting Started"
          title="Four Steps to Impact"
          description="Start using the dashboard effectively in minutes."
          contained={false}
        >
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-4">
                {quickStartSteps.map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{item.step}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </SectionShell>

        {/* Framework Alignment */}
        <SectionShell
          eyebrow="Alignment"
          title="International Frameworks"
          description="Peaceverse is built in alignment with global peace and security commitments."
          contained={false}
        >
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {frameworkAlignments.map((fw) => (
                  <div
                    key={fw.name}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/40"
                  >
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{fw.name}</p>
                      <p className="text-xs text-muted-foreground">{fw.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border/40">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-gold/10 text-gold mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Mission Statement</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      Detect. Verify. Prevent. We combine community-driven reporting, AI intelligence,
                      and institutional coordination to stop conflicts before they escalate.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SectionShell>
      </div>

      {/* Support & Resources */}
      <SectionShell
        eyebrow="Support"
        title="Need Help?"
        description="Resources and contacts to get the most out of your partner dashboard."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="surface-quiet">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Documentation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  API reference, data dictionaries, and integration guides.
                </p>
                <Button variant="link" size="sm" className="h-7 p-0 text-xs gap-1 mt-2">
                  View Docs <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-quiet">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Partner Support</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dedicated support channel for partners and institutional users.
                </p>
                <Button variant="link" size="sm" className="h-7 p-0 text-xs gap-1 mt-2">
                  Contact Us <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-quiet">
            <CardContent className="p-4 sm:p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Community</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Join the partner network to share insights and coordinate responses.
                </p>
                <Button variant="link" size="sm" className="h-7 p-0 text-xs gap-1 mt-2">
                  Join Network <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      {/* Live Status Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Platform Status: Operational
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All systems normal. Real-time sync active across 47 countries.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                  <Radio className="w-3 h-3 mr-1" />
                  Live
                </Badge>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Secured
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
