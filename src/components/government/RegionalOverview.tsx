import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Globe, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RegionalStat } from '@/hooks/useGovernmentDashboard';
import { motion } from 'framer-motion';

interface RegionalOverviewProps {
  stats: RegionalStat[] | undefined;
  isLoading: boolean;
}

export const RegionalOverview = ({ stats, isLoading }: RegionalOverviewProps) => {
  const getPeaceScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-500';
    if (score >= 5) return 'text-amber-500';
    return 'text-red-500';
  };

  const getPeaceScoreBg = (score: number) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 5) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (score: number) => {
    if (score >= 7) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score >= 5) return <Minus className="h-4 w-4 text-amber-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Regional Overview</CardTitle>
            <CardDescription>Peace metrics and report distribution by country</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !stats || stats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Globe className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No regional data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.map((region, index) => (
              <motion.div
                key={region.country}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border rounded-lg hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{region.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(region.peaceScore)}
                    <span className={`font-bold ${getPeaceScoreColor(region.peaceScore)}`}>
                      {region.peaceScore.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-muted-foreground">Reports:</span>{' '}
                    <span className="font-medium">{region.reportCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Critical:</span>{' '}
                    <span className="font-medium text-red-500">{region.criticalCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peace Score:</span>{' '}
                    <Badge variant="outline" className={getPeaceScoreColor(region.peaceScore)}>
                      {region.peaceScore >= 7 ? 'Good' : region.peaceScore >= 5 ? 'Moderate' : 'At Risk'}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={region.peaceScore * 10} 
                  className="h-2"
                />
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
