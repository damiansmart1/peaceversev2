import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShieldHalf, Earth, OctagonAlert, UsersRound, ScanSearch, Target, 
  Zap, Antenna, Brain, Radio, Vote, MessageCircleMore, ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const platformCapabilities = [
  { icon: OctagonAlert, label: 'Early Warning', value: '12,450+ incidents tracked' },
  { icon: ShieldHalf, label: 'Verification', value: '71.6% verification rate' },
  { icon: Brain, label: 'NuruAI', value: 'IFCN-standard fact-checking' },
  { icon: Earth, label: 'Coverage', value: '47 African nations' },
  { icon: UsersRound, label: 'Community', value: '156,000+ users' },
  { icon: ScanSearch, label: 'Elections', value: 'Carter Center standards' },
  { icon: Zap, label: 'Response Time', value: '< 4 hrs avg.' },
  { icon: Vote, label: 'Democracy', value: 'Proposals & polls' },
  { icon: Antenna, label: 'Communication', value: 'Multi-channel broadcast' },
  { icon: Radio, label: 'Peace Radio', value: 'Live streams & podcasts' },
  { icon: Target, label: 'Prevention', value: '340+ conflicts averted' },
  { icon: MessageCircleMore, label: 'Social Hub', value: 'Feeds, chats & DMs' },
];

export default function AboutHeroSection() {
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
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
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
          Peaceverse is a technology-driven early warning and rapid response system designed to detect 
          emerging threats, verify incidents through community-driven processes, and prevent conflicts 
          before they escalate — powered by NuruAI intelligence and aligned with UNSCR 2250, AU Agenda 2063, 
          and SDG 16.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="peace" size="lg" onClick={() => navigate('/incidents')}>
            Report Incident
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/nuru-ai')}>
            <Brain className="w-4 h-4 mr-2" />
            Explore NuruAI
          </Button>
        </div>
      </div>

      {/* Platform Capabilities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {platformCapabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <Card key={i} className="p-3 text-center border hover:border-primary/20 hover:shadow-soft transition-all duration-300">
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-[11px] font-semibold text-foreground uppercase tracking-wider mb-0.5">{cap.label}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{cap.value}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
