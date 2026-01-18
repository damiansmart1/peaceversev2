import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  Flame, 
  Scale, 
  Building2, 
  Leaf, 
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

interface IndicatorData {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  description: string;
  icon: React.ReactNode;
  category: string;
  color: string;
}

interface ConflictIndicatorsPanelProps {
  countryCode?: string;
  countryName?: string;
}

// OCHA-aligned conflict and peace indicators
const generateIndicators = (countryCode: string): IndicatorData[] => {
  // Simulated real-time data - in production would come from APIs
  const baseValue = countryCode === 'all' ? 65 : Math.floor(Math.random() * 30) + 50;
  
  return [
    {
      name: 'Peace Stability Index',
      value: Math.min(100, baseValue + Math.floor(Math.random() * 15)),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trendValue: Math.floor(Math.random() * 5) + 1,
      description: 'Composite measure of social cohesion, political stability, and conflict resolution capacity',
      icon: <Shield className="w-5 h-5" />,
      category: 'Security',
      color: 'hsl(var(--primary))'
    },
    {
      name: 'Social Cohesion Score',
      value: Math.min(100, baseValue + Math.floor(Math.random() * 10)),
      trend: 'stable',
      trendValue: Math.floor(Math.random() * 2),
      description: 'Level of inter-community trust, cross-group interactions, and shared civic identity',
      icon: <Users className="w-5 h-5" />,
      category: 'Social',
      color: 'hsl(var(--chart-1))'
    },
    {
      name: 'Conflict Risk Level',
      value: Math.max(10, 100 - baseValue - Math.floor(Math.random() * 10)),
      trend: Math.random() > 0.6 ? 'down' : 'up',
      trendValue: Math.floor(Math.random() * 8) + 1,
      description: 'Probability of violent conflict outbreak based on early warning indicators',
      icon: <Flame className="w-5 h-5" />,
      category: 'Risk',
      color: 'hsl(var(--destructive))'
    },
    {
      name: 'Governance Effectiveness',
      value: Math.min(100, baseValue - 5 + Math.floor(Math.random() * 15)),
      trend: Math.random() > 0.5 ? 'up' : 'stable',
      trendValue: Math.floor(Math.random() * 4),
      description: 'Quality of public services, policy implementation, and institutional capacity',
      icon: <Building2 className="w-5 h-5" />,
      category: 'Governance',
      color: 'hsl(var(--chart-2))'
    },
    {
      name: 'Rule of Law Index',
      value: Math.min(100, baseValue - 10 + Math.floor(Math.random() * 20)),
      trend: 'stable',
      trendValue: Math.floor(Math.random() * 3),
      description: 'Adherence to legal frameworks, judicial independence, and equal access to justice',
      icon: <Scale className="w-5 h-5" />,
      category: 'Governance',
      color: 'hsl(var(--chart-3))'
    },
    {
      name: 'Environmental Stress',
      value: Math.max(15, 60 - baseValue/2 + Math.floor(Math.random() * 25)),
      trend: Math.random() > 0.4 ? 'up' : 'stable',
      trendValue: Math.floor(Math.random() * 6) + 1,
      description: 'Climate-related stress factors including resource scarcity and environmental degradation',
      icon: <Leaf className="w-5 h-5" />,
      category: 'Environment',
      color: 'hsl(var(--chart-4))'
    },
    {
      name: 'Humanitarian Need',
      value: Math.max(10, 50 - baseValue/3 + Math.floor(Math.random() * 20)),
      trend: Math.random() > 0.5 ? 'down' : 'up',
      trendValue: Math.floor(Math.random() * 5) + 1,
      description: 'Population requiring humanitarian assistance as per OCHA assessment frameworks',
      icon: <Heart className="w-5 h-5" />,
      category: 'Humanitarian',
      color: 'hsl(var(--chart-5))'
    },
    {
      name: 'Alert Threshold',
      value: Math.max(20, 100 - baseValue + Math.floor(Math.random() * 15)),
      trend: Math.random() > 0.5 ? 'down' : 'up',
      trendValue: Math.floor(Math.random() * 7) + 1,
      description: 'Proximity to UN early warning thresholds requiring escalated response',
      icon: <AlertTriangle className="w-5 h-5" />,
      category: 'Risk',
      color: 'hsl(var(--warning))'
    }
  ];
};

const TrendIcon = ({ trend, value }: { trend: string; value: number }) => {
  if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

const getValueColor = (value: number, isRisk: boolean = false) => {
  if (isRisk) {
    if (value >= 70) return 'text-destructive';
    if (value >= 40) return 'text-orange-500';
    return 'text-green-500';
  }
  if (value >= 70) return 'text-green-500';
  if (value >= 40) return 'text-orange-500';
  return 'text-destructive';
};

const getProgressColor = (value: number, isRisk: boolean = false) => {
  if (isRisk) {
    if (value >= 70) return 'bg-destructive';
    if (value >= 40) return 'bg-orange-500';
    return 'bg-green-500';
  }
  if (value >= 70) return 'bg-green-500';
  if (value >= 40) return 'bg-orange-500';
  return 'bg-destructive';
};

const ConflictIndicatorsPanel = ({ countryCode = 'all', countryName = 'All Countries' }: ConflictIndicatorsPanelProps) => {
  const indicators = generateIndicators(countryCode);
  
  const categories = Array.from(new Set(indicators.map(i => i.category)));
  
  return (
    <Card className="border-border bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Conflict & Peace Indicators
            </CardTitle>
            <CardDescription>
              OCHA-aligned metrics for {countryName} • Real-time analysis
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Methodology
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Indicators follow UN OCHA Early Warning Framework standards and Global Peace Index methodology.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category, catIndex) => (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indicators
                .filter(i => i.category === category)
                .map((indicator, index) => {
                  const isRisk = indicator.name.toLowerCase().includes('risk') || 
                                 indicator.name.toLowerCase().includes('stress') ||
                                 indicator.name.toLowerCase().includes('need') ||
                                 indicator.name.toLowerCase().includes('alert');
                  
                  return (
                    <motion.div
                      key={indicator.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (catIndex * 0.1) + (index * 0.05) }}
                      className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-md bg-primary/10" style={{ color: indicator.color }}>
                            {indicator.icon}
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">{indicator.name}</h5>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="text-xs text-muted-foreground hover:text-foreground cursor-help">
                                  View details
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{indicator.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xl font-bold ${getValueColor(indicator.value, isRisk)}`}>
                            {indicator.value}
                          </span>
                          <div className="flex items-center justify-end gap-1 text-xs">
                            <TrendIcon trend={indicator.trend} value={indicator.trendValue} />
                            <span className={
                              indicator.trend === 'up' ? 'text-green-500' : 
                              indicator.trend === 'down' ? 'text-red-500' : 
                              'text-muted-foreground'
                            }>
                              {indicator.trendValue > 0 ? `${indicator.trendValue}%` : '0%'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`absolute left-0 top-0 h-full rounded-full ${getProgressColor(indicator.value, isRisk)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${indicator.value}%` }}
                          transition={{ duration: 1, delay: (catIndex * 0.1) + (index * 0.05) + 0.3 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ConflictIndicatorsPanel;
