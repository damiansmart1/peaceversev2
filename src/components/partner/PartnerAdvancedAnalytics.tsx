import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  GitCompare, 
  Brain,
  AlertTriangle,
  Network,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { PartnerAnalyticsData, TimeSeriesData } from '@/hooks/usePartnerAnalytics';

interface PartnerAdvancedAnalyticsProps {
  currentData: PartnerAnalyticsData;
  previousData?: PartnerAnalyticsData;
  correlations: any[];
}

const FUNNEL_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#06b6d4'];

export const PartnerAdvancedAnalytics = ({ 
  currentData, 
  previousData,
  correlations 
}: PartnerAdvancedAnalyticsProps) => {
  
  // Period comparison calculations
  const periodComparison = useMemo(() => {
    if (!previousData) return null;
    
    const current = currentData.overview;
    const previous = previousData.overview;
    
    const calcChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      totalIncidents: {
        current: current.totalIncidents,
        previous: previous.totalIncidents,
        change: calcChange(current.totalIncidents, previous.totalIncidents),
      },
      criticalIncidents: {
        current: current.criticalIncidents,
        previous: previous.criticalIncidents,
        change: calcChange(current.criticalIncidents, previous.criticalIncidents),
      },
      verificationRate: {
        current: current.verificationRate,
        previous: previous.verificationRate,
        change: current.verificationRate - previous.verificationRate,
      },
      resolutionRate: {
        current: current.resolutionRate,
        previous: previous.resolutionRate,
        change: current.resolutionRate - previous.resolutionRate,
      },
    };
  }, [currentData, previousData]);

  // Status funnel data
  const funnelData = useMemo(() => {
    const { overview } = currentData;
    return [
      { name: 'Reported', value: overview.totalIncidents, fill: '#3b82f6' },
      { name: 'Verified', value: overview.verifiedIncidents, fill: '#8b5cf6' },
      { name: 'Resolved', value: overview.resolvedIncidents, fill: '#22c55e' },
    ].filter(d => d.value > 0);
  }, [currentData]);

  // Weekly trend comparison
  const weeklyTrend = useMemo(() => {
    const { timeSeriesData } = currentData;
    if (timeSeriesData.length < 14) return [];

    const thisWeek = timeSeriesData.slice(-7);
    const lastWeek = timeSeriesData.slice(-14, -7);

    return thisWeek.map((day, i) => ({
      day: format(new Date(day.date), 'EEE'),
      thisWeek: day.incidents,
      lastWeek: lastWeek[i]?.incidents || 0,
    }));
  }, [currentData]);

  // Correlation network summary
  const correlationSummary = useMemo(() => {
    if (!correlations.length) return null;

    const crossBorder = correlations.filter(c => c.cross_border).length;
    const escalationChains = correlations.filter(c => c.escalation_chain).length;
    const avgStrength = correlations.reduce((sum, c) => sum + (c.correlation_strength || 0), 0) / correlations.length;

    return {
      total: correlations.length,
      crossBorder,
      escalationChains,
      avgStrength: Math.round(avgStrength * 100),
    };
  }, [correlations]);

  // AI-powered insights
  const aiInsights = useMemo(() => {
    const { overview, categoryBreakdown, geographicDistribution } = currentData;
    const insights: string[] = [];

    // Trend insights
    if (overview.criticalIncidents > overview.totalIncidents * 0.15) {
      insights.push('⚠️ Critical incident ratio is above threshold (15%). Immediate attention recommended.');
    }

    if (overview.verificationRate < 50) {
      insights.push('📋 Verification backlog detected. Consider increasing verification team capacity.');
    }

    if (overview.resolutionRate > 70) {
      insights.push('✅ Strong resolution performance. Current response protocols are effective.');
    }

    // Category insights
    const topCategory = categoryBreakdown[0];
    if (topCategory && topCategory.percentage > 30) {
      insights.push(`📊 ${topCategory.category} accounts for ${topCategory.percentage}% of incidents. Consider specialized response protocols.`);
    }

    // Geographic insights
    const highRiskRegions = geographicDistribution.filter(g => g.riskLevel === 'critical' || g.riskLevel === 'high');
    if (highRiskRegions.length > 3) {
      insights.push(`🗺️ ${highRiskRegions.length} high-risk regions identified. Cross-regional coordination recommended.`);
    }

    // Correlation insights
    if (correlationSummary && correlationSummary.crossBorder > 2) {
      insights.push(`🌍 ${correlationSummary.crossBorder} cross-border incident correlations detected. Regional monitoring advised.`);
    }

    return insights.length > 0 ? insights : ['🔍 No significant anomalies detected. Continue standard monitoring.'];
  }, [currentData, correlationSummary]);

  const getChangeIndicator = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getChangeColor = (change: number, inverse: boolean = false) => {
    if (inverse) {
      return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground';
    }
    return change > 0 ? 'text-red-500' : change < 0 ? 'text-green-500' : 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Period Comparison */}
      {periodComparison && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-primary" />
              Period-over-Period Comparison
            </CardTitle>
            <CardDescription className="text-xs">
              Current period vs. previous period metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(periodComparison).map(([key, data]) => (
                <div key={key} className="p-3 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground capitalize mb-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {typeof data.current === 'number' && key.includes('Rate') 
                        ? `${data.current}%` 
                        : data.current}
                    </span>
                    <div className={`flex items-center gap-1 text-sm ${getChangeColor(data.change, key.includes('Rate'))}`}>
                      {getChangeIndicator(data.change)}
                      <span>{data.change > 0 ? '+' : ''}{data.change}{key.includes('Rate') ? 'pp' : '%'}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Previous: {typeof data.previous === 'number' && key.includes('Rate') 
                      ? `${data.previous}%` 
                      : data.previous}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Comparison */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Week-over-Week Trend</CardTitle>
            <CardDescription className="text-xs">This week vs. last week daily incidents</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="thisWeek" name="This Week" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="lastWeek"
                  name="Last Week"
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Resolution Pipeline
            </CardTitle>
            <CardDescription className="text-xs">Incident flow from reported to resolved</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    position="right"
                    fill="hsl(var(--foreground))"
                    stroke="none"
                    fontSize={12}
                    dataKey="name"
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Correlation Analysis */}
      {correlationSummary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" />
              Incident Correlation Analysis
            </CardTitle>
            <CardDescription className="text-xs">
              AI-detected relationships between incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{correlationSummary.total}</p>
                <p className="text-xs text-muted-foreground">Total Correlations</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-500">{correlationSummary.crossBorder}</p>
                <p className="text-xs text-muted-foreground">Cross-Border</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-orange-500">{correlationSummary.escalationChains}</p>
                <p className="text-xs text-muted-foreground">Escalation Chains</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-500">{correlationSummary.avgStrength}%</p>
                <p className="text-xs text-muted-foreground">Avg Strength</p>
              </div>
            </div>

            {correlations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Recent Correlations</p>
                {correlations.slice(0, 3).map((corr, i) => (
                  <div key={corr.id || i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm">
                    <Badge variant="outline" className="text-[10px]">
                      {corr.correlation_type}
                    </Badge>
                    <span className="text-muted-foreground">
                      {corr.countries_involved?.join(' ↔ ') || 'Related incidents'}
                    </span>
                    {corr.cross_border && (
                      <Badge variant="secondary" className="text-[10px] ml-auto">
                        Cross-border
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            AI-Powered Insights & Recommendations
          </CardTitle>
          <CardDescription className="text-xs">
            Automated analysis based on current data patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {aiInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-background/60">
                <ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
