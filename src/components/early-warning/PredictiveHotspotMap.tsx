import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PredictiveHotspotMap = () => {
  const { toast } = useToast();

  const { data: hotspots, isLoading, refetch } = useQuery({
    queryKey: ['predictive-hotspots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictive_hotspots')
        .select('*')
        .eq('status', 'active')
        .gte('valid_until', new Date().toISOString())
        .order('hotspot_score', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleRunPrediction = async () => {
    toast({
      title: 'Running Hotspot Analysis',
      description: 'Analyzing historical patterns to predict future conflict hotspots...',
    });

    try {
      const { error } = await supabase.functions.invoke('predict-hotspots', {
        body: { predictionDays: 14 }
      });

      if (error) throw error;

      toast({
        title: 'Analysis Complete',
        description: 'Hotspot predictions have been updated.',
      });

      refetch();
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to run hotspot prediction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'severe': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Hotspot Predictions...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Predictive Conflict Hotspots</CardTitle>
              <CardDescription>
                AI-powered predictions of areas with elevated risk of conflict escalation
              </CardDescription>
            </div>
            <Button onClick={handleRunPrediction}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hotspots || hotspots.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">No Active Hotspots Detected</h3>
                <p className="text-muted-foreground">
                  Click "Run Analysis" to generate new predictions based on recent incident data
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {hotspots.map((hotspot: any) => (
                <Card key={hotspot.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4" />
                          <CardTitle className="text-lg">
                            {hotspot.region_name}, {hotspot.country}
                          </CardTitle>
                        </div>
                        <CardDescription>
                          Radius: {hotspot.radius_km}km | Coverage: {hotspot.prediction_window.replace('_', ' ')}
                        </CardDescription>
                      </div>
                      <Badge className={getRiskColor(hotspot.risk_level)}>
                        {hotspot.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-muted p-3 rounded">
                        <p className="text-muted-foreground">Hotspot Score</p>
                        <p className="text-2xl font-bold">{hotspot.hotspot_score}%</p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="text-2xl font-bold">{hotspot.confidence_level}%</p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-muted-foreground">Incidents (30d)</p>
                        <p className="text-2xl font-bold">{hotspot.incident_count_30d}</p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-muted-foreground">Trend</p>
                        <p className="text-xl font-bold capitalize">{hotspot.incident_trend}</p>
                      </div>
                    </div>

                    {hotspot.prediction_factors && (
                      <div className="bg-muted/50 p-4 rounded space-y-2">
                        <p className="font-semibold text-sm">Prediction Factors:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(hotspot.prediction_factors).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                              <span className="font-semibold">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hotspot.recommended_interventions && hotspot.recommended_interventions.length > 0 && (
                      <div className="bg-primary/10 p-4 rounded space-y-2">
                        <p className="font-semibold text-sm">Recommended Interventions:</p>
                        <ul className="space-y-1">
                          {hotspot.recommended_interventions.map((intervention: any, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                                {intervention.priority}
                              </Badge>
                              <div>
                                <p className="font-medium">{intervention.intervention}</p>
                                <p className="text-xs text-muted-foreground">Timing: {intervention.timing}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Valid until: {new Date(hotspot.valid_until).toLocaleDateString()}</span>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {hotspot.monitoring_priority} Priority
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveHotspotMap;