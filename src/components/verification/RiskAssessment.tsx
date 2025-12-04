import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, Shield, TrendingUp, Users, MapPin, 
  Clock, Zap, Target, Activity
} from 'lucide-react';

interface RiskFactor {
  id: string;
  name: string;
  score: number;
  weight: number;
  description: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface RiskAssessmentProps {
  overallRisk: number;
  threatLevel: 'critical' | 'high' | 'medium' | 'low';
  escalationProbability: number;
  factors?: RiskFactor[];
  recommendations?: string[];
}

const MOCK_RISK_FACTORS: RiskFactor[] = [
  {
    id: 'severity',
    name: 'Incident Severity',
    score: 75,
    weight: 0.25,
    description: 'Based on reported casualties, infrastructure damage, and community impact',
    trend: 'stable',
  },
  {
    id: 'escalation',
    name: 'Escalation Potential',
    score: 68,
    weight: 0.20,
    description: 'Historical patterns suggest moderate risk of incident spreading',
    trend: 'increasing',
  },
  {
    id: 'geographic',
    name: 'Geographic Risk',
    score: 82,
    weight: 0.15,
    description: 'Location has high incident density in past 30 days',
    trend: 'increasing',
  },
  {
    id: 'actors',
    name: 'Actor Involvement',
    score: 55,
    weight: 0.15,
    description: 'Known groups in the area with history of conflict',
    trend: 'stable',
  },
  {
    id: 'timing',
    name: 'Temporal Risk',
    score: 60,
    weight: 0.10,
    description: 'Incident timing coincides with sensitive period',
    trend: 'decreasing',
  },
  {
    id: 'contagion',
    name: 'Contagion Risk',
    score: 45,
    weight: 0.15,
    description: 'Likelihood of similar incidents in nearby areas',
    trend: 'stable',
  },
];

const MOCK_RECOMMENDATIONS = [
  'Alert local community leaders and peace ambassadors in Kibera area',
  'Coordinate with Kenya Red Cross for potential humanitarian response',
  'Monitor social media for escalation indicators over next 48 hours',
  'Consider deploying mobile peace teams if situation deteriorates',
  'Notify government early warning focal point for Nairobi County',
];

const THREAT_LEVEL_CONFIG = {
  critical: { color: 'bg-red-600', textColor: 'text-red-600', label: 'CRITICAL', icon: '🚨' },
  high: { color: 'bg-orange-500', textColor: 'text-orange-500', label: 'HIGH', icon: '⚠️' },
  medium: { color: 'bg-yellow-500', textColor: 'text-yellow-500', label: 'MEDIUM', icon: '⚡' },
  low: { color: 'bg-green-500', textColor: 'text-green-500', label: 'LOW', icon: '✓' },
};

const TREND_ICONS = {
  increasing: <TrendingUp className="w-3 h-3 text-red-500" />,
  stable: <Activity className="w-3 h-3 text-yellow-500" />,
  decreasing: <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />,
};

export const RiskAssessment = ({
  overallRisk = 72,
  threatLevel = 'high',
  escalationProbability = 45,
  factors = MOCK_RISK_FACTORS,
  recommendations = MOCK_RECOMMENDATIONS,
}: RiskAssessmentProps) => {
  const threatConfig = THREAT_LEVEL_CONFIG[threatLevel];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          AI Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Score */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Risk Score</span>
              <Badge className={threatConfig.color}>
                {threatConfig.icon} {threatConfig.label}
              </Badge>
            </div>
            <div className="flex items-end gap-3">
              <span className={`text-4xl font-bold ${threatConfig.textColor}`}>
                {overallRisk}
              </span>
              <span className="text-muted-foreground text-sm mb-1">/100</span>
              <Progress value={overallRisk} className="flex-1 h-3" />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-sm text-muted-foreground mb-1">Escalation Risk</div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold">{escalationProbability}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Next 48 hours</p>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Risk Factor Breakdown
          </h4>
          <div className="space-y-3">
            {factors.map((factor) => (
              <div key={factor.id} className="p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{factor.name}</span>
                    {TREND_ICONS[factor.trend]}
                    <Badge variant="outline" className="text-xs">
                      Weight: {(factor.weight * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <span className="font-bold text-sm">{factor.score}/100</span>
                </div>
                <Progress value={factor.score} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Recommended Actions
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20"
              >
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Context Indicators */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border text-center">
            <MapPin className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-sm font-medium">High-Risk Zone</div>
            <div className="text-xs text-muted-foreground">12 incidents/month</div>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-sm font-medium">Pop. Affected</div>
            <div className="text-xs text-muted-foreground">~5,000 people</div>
          </div>
          <div className="p-3 rounded-lg border text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-sm font-medium">Response Window</div>
            <div className="text-xs text-muted-foreground">24-48 hours</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
