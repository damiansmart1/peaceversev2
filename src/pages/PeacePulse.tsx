import { useState } from 'react';
import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, TrendingUp, AlertTriangle, BarChart3, Globe, MapPin } from 'lucide-react';
import { usePeacePulseMetrics, useAccountabilityMetrics, useCountriesByBlock } from '@/hooks/usePeaceMetrics';
import { useTranslationContext } from '@/components/TranslationProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PeacePulseCharts } from '@/components/PeacePulseCharts';
import InteractiveHeatmap from '@/components/InteractiveHeatmap';

const PeacePulse = () => {
  const { t } = useTranslationContext();
  const [selectedCountry, setSelectedCountry] = useState('all');
  
  const { data: countriesByBlock, isLoading: countriesLoading } = useCountriesByBlock();
  
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
      case 'critical': return 'text-destructive';
      case 'high': return 'text-destructive';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSelectedCountryName = () => {
    if (selectedCountry === 'all') return t('peacePulse.allCountries');
    for (const group of countriesByBlock || []) {
      const country = group.countries.find(c => c.code === selectedCountry);
      if (country) return country.name;
    }
    return selectedCountry;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge={t('peacePulse.badge')}
          title={t('peacePulse.title')}
          subtitle={t('peacePulse.subtitle')}
          icon={<Activity className="w-4 h-4" />}
        />

        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-80 bg-card border-border">
                <Globe className="w-4 h-4 mr-2 text-primary" />
                <SelectValue placeholder="Select a country">{getSelectedCountryName()}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[400px]">
                <SelectItem value="all" className="font-semibold">
                  {t('peacePulse.allCountries')}
                </SelectItem>
                
                {countriesLoading ? (
                  <SelectItem value="loading" disabled>{t('common.loading')}</SelectItem>
                ) : (
                  countriesByBlock?.map(({ block, countries }) => (
                    <SelectGroup key={block.id}>
                      <SelectLabel className="text-xs font-bold text-primary uppercase tracking-wider py-2 px-2 bg-muted/50">
                        {block.name} - {block.full_name}
                      </SelectLabel>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.code} className="pl-4">
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {pulseLoading || accountabilityLoading ? (
            <LoadingSpinner />
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">{t('peacePulse.tabs.overview')}</TabsTrigger>
                <TabsTrigger value="heatmap">{t('peacePulse.tabs.heatmap')}</TabsTrigger>
                <TabsTrigger value="sentiment">{t('peacePulse.tabs.sentiment')}</TabsTrigger>
                <TabsTrigger value="accountability">{t('peacePulse.tabs.accountability')}</TabsTrigger>
                <TabsTrigger value="trends">{t('peacePulse.tabs.trends')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {t('peacePulse.activityLevel')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{latestMetrics?.activity_count || 0}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t('peacePulse.reportsToday')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {t('peacePulse.sentiment')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {latestMetrics?.sentiment_average ? 
                          (Number(latestMetrics.sentiment_average) * 100).toFixed(0) : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t('peacePulse.peaceIndex')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {t('peacePulse.tensionLevel')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold capitalize ${getTensionColor(latestMetrics?.tension_level)}`}>
                        {latestMetrics?.tension_level || t('common.unknown')}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t('peacePulse.currentStatus')}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        {t('peacePulse.riskScore')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {latestMetrics?.risk_score ? 
                          (Number(latestMetrics.risk_score) * 100).toFixed(0) : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{t('peacePulse.conflictProbability')}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('peacePulse.trendingTopics')}</CardTitle>
                    <CardDescription>{t('peacePulse.trendingDescription')}</CardDescription>
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
                        <p className="text-muted-foreground">{t('peacePulse.noTrendingTopics')}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {t('peacePulse.hotspotLocations')}
                    </CardTitle>
                    <CardDescription>{t('peacePulse.hotspotDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {latestMetrics?.hotspot_locations && Array.isArray(latestMetrics.hotspot_locations) && latestMetrics.hotspot_locations.length > 0 ? (
                      <div className="space-y-2">
                        {latestMetrics.hotspot_locations.map((location: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 border rounded">
                            <span>{location.name || location}</span>
                            <span className={`text-sm font-medium ${getTensionColor(location.risk)}`}>
                              {location.risk || t('common.unknown')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">{t('peacePulse.noHotspots')}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="heatmap" className="space-y-6">
                <InteractiveHeatmap />
              </TabsContent>

              <TabsContent value="accountability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('peacePulse.accountabilityIndex')}</CardTitle>
                    <CardDescription>{t('peacePulse.accountabilityDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-3xl font-bold text-primary">
                          {latestAccountability?.accountability_index ? 
                            (Number(latestAccountability.accountability_index) * 100).toFixed(0) : 'N/A'}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{t('peacePulse.accountabilityScore')}</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">
                          {latestAccountability?.incidents_reported || 0}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{t('peacePulse.incidentsReported')}</p>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-green-500">
                          {latestAccountability?.incidents_resolved || 0}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{t('peacePulse.incidentsResolved')}</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>{t('peacePulse.avgResponseTime')}:</strong>{' '}
                        {latestAccountability?.avg_response_time || 'N/A'}
                      </p>
                      <p className="text-sm mt-2">
                        <strong>{t('peacePulse.avgResolutionTime')}:</strong>{' '}
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
