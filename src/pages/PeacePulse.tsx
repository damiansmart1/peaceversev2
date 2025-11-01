import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, TrendingUp, AlertTriangle, BarChart3, Globe, MapPin } from 'lucide-react';
import { usePeacePulseMetrics, useAccountabilityMetrics } from '@/hooks/usePeaceMetrics';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PeacePulseCharts } from '@/components/PeacePulseCharts';

const COMESA_COUNTRIES = [
  { code: 'all', name: 'All COMESA' },
  { code: 'KE', name: 'Kenya' },
  { code: 'UG', name: 'Uganda' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'MW', name: 'Malawi' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SD', name: 'Sudan' },
];

const PeacePulse = () => {
  const [selectedCountry, setSelectedCountry] = useState('all');
  
  const { data: pulseMetrics, isLoading: pulseLoading } = usePeacePulseMetrics(
    selectedCountry === 'all' ? undefined : selectedCountry
  );
  
  const { data: accountabilityMetrics, isLoading: accountabilityLoading } = useAccountabilityMetrics(
    selectedCountry === 'all' ? undefined : selectedCountry
  );

  const latestMetrics = pulseMetrics?.[0];
  const latestAccountability = accountabilityMetrics?.[0];

  const getTensionColor = (level: string | null) => {
    switch (level) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge="Live Insights"
          title="PeacePulse Dashboard"
          subtitle="Real-time peace intelligence across COMESA region"
          icon={<Activity className="w-4 h-4" />}
        />

        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-64">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMESA_COUNTRIES.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {pulseLoading || accountabilityLoading ? (
            <LoadingSpinner />
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="accountability">Accountability</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Activity Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{latestMetrics?.activity_count || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">Reports today</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Sentiment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {latestMetrics?.sentiment_average ? 
                          (latestMetrics.sentiment_average * 100).toFixed(0) : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Peace index score</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Tension Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold capitalize ${getTensionColor(latestMetrics?.tension_level)}`}>
                        {latestMetrics?.tension_level || 'Unknown'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Current status</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Risk Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {latestMetrics?.risk_score ? 
                          (latestMetrics.risk_score * 100).toFixed(0) : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Conflict probability</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Trending Topics</CardTitle>
                    <CardDescription>Most discussed peace themes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {latestMetrics?.trending_topics && Array.isArray(latestMetrics.trending_topics) ? (
                        latestMetrics.trending_topics.map((topic: string, i: number) => (
                          <div key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {topic}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No trending topics available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Hotspot Locations
                    </CardTitle>
                    <CardDescription>Areas requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {latestMetrics?.hotspot_locations && Array.isArray(latestMetrics.hotspot_locations) ? (
                      <div className="space-y-2">
                        {latestMetrics.hotspot_locations.map((location: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 border rounded">
                            <span>{location.name || location}</span>
                            <span className="text-sm text-muted-foreground">
                              {location.risk || 'Unknown'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hotspots identified</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accountability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Peace Accountability Index</CardTitle>
                    <CardDescription>Institutional response performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-3xl font-bold text-primary">
                          {latestAccountability?.accountability_index ? 
                            (latestAccountability.accountability_index * 100).toFixed(0) : 'N/A'}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Accountability Score</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">
                          {latestAccountability?.incidents_reported || 0}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Incidents Reported</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-500">
                          {latestAccountability?.incidents_resolved || 0}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Incidents Resolved</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Average Response Time:</strong>{' '}
                        {latestAccountability?.avg_response_time || 'N/A'}
                      </p>
                      <p className="text-sm mt-2">
                        <strong>Average Resolution Time:</strong>{' '}
                        {latestAccountability?.avg_resolution_time || 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sentiment" className="space-y-6">
                <PeacePulseCharts 
                  pulseMetrics={pulseMetrics} 
                  accountabilityMetrics={accountabilityMetrics}
                />
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <PeacePulseCharts 
                  pulseMetrics={pulseMetrics} 
                  accountabilityMetrics={accountabilityMetrics}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeacePulse;