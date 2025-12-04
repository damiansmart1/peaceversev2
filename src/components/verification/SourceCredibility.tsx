import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Shield, CheckCircle, AlertTriangle, Clock, 
  FileText, Star, TrendingUp, History, Award
} from 'lucide-react';

interface SourceCredibilityProps {
  reporter: {
    id: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    isAnonymous: boolean;
    joinedAt?: string;
    verifiedReports: number;
    totalReports: number;
    rejectedReports: number;
    accuracyScore: number;
    trustLevel: 'new' | 'trusted' | 'verified' | 'expert' | 'anonymous';
    badges: string[];
    recentActivity: {
      type: string;
      date: string;
      outcome: string;
    }[];
  };
}

const TRUST_LEVEL_CONFIG = {
  new: { color: 'bg-gray-500', label: 'New Reporter', description: 'Less than 3 verified reports' },
  trusted: { color: 'bg-blue-500', label: 'Trusted', description: 'Consistent accurate reporting' },
  verified: { color: 'bg-green-500', label: 'Verified', description: 'Identity verified, high accuracy' },
  expert: { color: 'bg-purple-500', label: 'Expert', description: 'Domain expert, highest credibility' },
  anonymous: { color: 'bg-gray-400', label: 'Anonymous', description: 'Identity not disclosed' },
};

// Mock reporter data
const MOCK_REPORTER = {
  id: 'reporter-123',
  username: 'peace_advocate_ke',
  displayName: 'Peace Advocate',
  avatarUrl: undefined,
  isAnonymous: false,
  joinedAt: '2023-06-15T00:00:00Z',
  verifiedReports: 12,
  totalReports: 15,
  rejectedReports: 1,
  accuracyScore: 85,
  trustLevel: 'trusted' as const,
  badges: ['First Report', 'Accurate Reporter', 'Community Voice'],
  recentActivity: [
    { type: 'Report Verified', date: '2024-11-28', outcome: 'Verified - High Accuracy' },
    { type: 'Report Submitted', date: '2024-11-20', outcome: 'Pending Review' },
    { type: 'Report Verified', date: '2024-11-15', outcome: 'Verified - Corroborated' },
    { type: 'Report Rejected', date: '2024-10-30', outcome: 'Insufficient Evidence' },
  ],
};

export const SourceCredibility = ({ reporter = MOCK_REPORTER }: SourceCredibilityProps) => {
  const trustConfig = TRUST_LEVEL_CONFIG[reporter.trustLevel];
  const verificationRate = reporter.totalReports > 0 
    ? Math.round((reporter.verifiedReports / reporter.totalReports) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Source Credibility Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reporter Profile */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={reporter.avatarUrl} />
            <AvatarFallback className="text-lg">
              {reporter.isAnonymous ? '?' : reporter.displayName?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">
                {reporter.isAnonymous ? 'Anonymous Reporter' : reporter.displayName || reporter.username}
              </h3>
              <Badge className={trustConfig.color}>
                {trustConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {trustConfig.description}
            </p>
            {!reporter.isAnonymous && reporter.joinedAt && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Member since {new Date(reporter.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Credibility Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              Accuracy Score
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{reporter.accuracyScore}%</span>
              <Progress value={reporter.accuracyScore} className="flex-1 h-2" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              Verification Rate
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{verificationRate}%</span>
              <Progress value={verificationRate} className="flex-1 h-2" />
            </div>
          </div>
        </div>

        {/* Report Statistics */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg border">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-xl font-bold">{reporter.verifiedReports}</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
          <div className="p-3 rounded-lg border">
            <FileText className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-xl font-bold">{reporter.totalReports}</div>
            <div className="text-xs text-muted-foreground">Total Reports</div>
          </div>
          <div className="p-3 rounded-lg border">
            <AlertTriangle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <div className="text-xl font-bold">{reporter.rejectedReports}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>

        {/* Badges */}
        {reporter.badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Earned Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {reporter.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent Reporting Activity
          </h4>
          <div className="space-y-2">
            {reporter.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  {activity.outcome.includes('Verified') ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : activity.outcome.includes('Rejected') ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                  <span>{activity.type}</span>
                </div>
                <div className="text-xs text-muted-foreground">{activity.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="p-4 rounded-lg border-2 border-dashed">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h4 className="font-medium">Credibility Assessment</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {reporter.isAnonymous ? (
              "Anonymous source - apply standard verification protocols. Cannot verify reporter identity or history."
            ) : reporter.trustLevel === 'expert' ? (
              "High-credibility source with domain expertise. Reports typically accurate and well-documented."
            ) : reporter.trustLevel === 'verified' ? (
              "Verified identity with strong reporting track record. Consider with high confidence."
            ) : reporter.trustLevel === 'trusted' ? (
              "Consistent reporter with good accuracy. Apply standard verification but with moderate confidence."
            ) : (
              "New reporter with limited history. Apply thorough verification protocols before accepting."
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
