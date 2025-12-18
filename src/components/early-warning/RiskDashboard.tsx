import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Users, MapPin, Brain, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import RecommendedActionsPanel from './RecommendedActionsPanel';

interface RiskDashboardProps {
  selectedCountry?: string;
}

const RiskDashboard = ({ selectedCountry = 'ALL' }: RiskDashboardProps) => {
  const { data: highRiskIncidents, isLoading } = useQuery({
    queryKey: ['high-risk-incidents', selectedCountry],
    queryFn: async () => {
      // First get incident IDs filtered by country using secure view
      let incidentQuery = supabase
        .from('citizen_reports_safe' as any)
        .select('id');
      
      if (selectedCountry !== 'ALL') {
        incidentQuery = incidentQuery.eq('location_country', selectedCountry);
      }
      
      const { data: incidents } = await incidentQuery;
      const incidentIds = ((incidents || []) as any[]).map((i: any) => i.id);
      
      if (incidentIds.length === 0 && selectedCountry !== 'ALL') {
        return [];
      }

      let query = supabase
        .from('incident_risk_scores')
        .select(`
          *,
          incident:citizen_reports(*)
        `)
        .gte('overall_risk_score', 60)
        .order('overall_risk_score', { ascending: false })
        .limit(10);
      
      if (selectedCountry !== 'ALL' && incidentIds.length > 0) {
        query = query.in('incident_id', incidentIds);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: statistics } = useQuery({
    queryKey: ['risk-statistics', selectedCountry],
    queryFn: async () => {
      // First get incident IDs filtered by country using secure view
      let incidentQuery = supabase
        .from('citizen_reports_safe' as any)
        .select('id');
      
      if (selectedCountry !== 'ALL') {
        incidentQuery = incidentQuery.eq('location_country', selectedCountry);
      }
      
      const { data: incidents } = await incidentQuery;
      const incidentIds = ((incidents || []) as any[]).map((i: any) => i.id);

      let query = supabase
        .from('incident_risk_scores')
        .select('threat_level, overall_risk_score');
      
      if (selectedCountry !== 'ALL' && incidentIds.length > 0) {
        query = query.in('incident_id', incidentIds);
      } else if (selectedCountry !== 'ALL') {
        return { critical: 0, high: 0, medium: 0, avgRisk: '0.0' };
      }

      const { data, error } = await query;
      if (error) throw error;

      const critical = data?.filter(r => r.threat_level === 'critical' || r.threat_level === 'imminent').length || 0;
      const high = data?.filter(r => r.threat_level === 'high').length || 0;
      const medium = data?.filter(r => r.threat_level === 'medium').length || 0;
      const avgRisk = data?.length ? (data.reduce((sum, r) => sum + r.overall_risk_score, 0) / data.length) : 0;

      return { critical, high, medium, avgRisk: avgRisk.toFixed(1) };
    },
  });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'imminent': return 'bg-red-600 text-white';
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Risk Analysis...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold">{statistics?.critical || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <span className="text-3xl font-bold">{statistics?.high || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold">{statistics?.medium || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{statistics?.avgRisk || '0'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>High Risk Incidents Requiring Attention</CardTitle>
          <CardDescription>
            Incidents with risk scores above 60% require immediate monitoring and potential intervention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!highRiskIncidents || highRiskIncidents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No high-risk incidents detected. System monitoring continues.
            </p>
          ) : (
            <div className="space-y-4">
              {highRiskIncidents.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.incident?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.incident?.location_city}, {item.incident?.location_country}
                      </p>
                    </div>
                    <Badge className={getThreatColor(item.threat_level)}>
                      {item.threat_level.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Overall Risk Score</span>
                      <span className="font-semibold">{item.overall_risk_score}%</span>
                    </div>
                    <Progress value={item.overall_risk_score} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Severity</p>
                      <p className="font-semibold">{item.severity_score}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Urgency</p>
                      <p className="font-semibold">{item.urgency_score}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Impact</p>
                      <p className="font-semibold">{item.impact_score}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Escalation Risk</p>
                      <p className="font-semibold">{item.escalation_probability}%</p>
                    </div>
                  </div>

                  {item.ai_reasoning && (
                    <div className="bg-muted/50 p-3 rounded space-y-2 text-sm">
                      {item.ai_reasoning.primary_concerns && (
                        <div>
                          <p className="font-semibold">Primary Concerns:</p>
                          <ul className="list-disc list-inside">
                            {item.ai_reasoning.primary_concerns.map((concern: string, i: number) => (
                              <li key={i}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.escalation_timeline && (
                        <p>
                          <span className="font-semibold">Escalation Timeline:</span> {item.escalation_timeline}
                        </p>
                      )}
                    </div>
                  )}

                  {item.recommended_actions && item.recommended_actions.length > 0 && (
                    <RecommendedActionsPanel 
                      actions={item.recommended_actions}
                      threatLevel={item.threat_level}
                      incidentCategory={item.incident?.category}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskDashboard;