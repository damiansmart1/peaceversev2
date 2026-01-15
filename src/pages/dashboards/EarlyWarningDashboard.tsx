import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Siren, TrendingUp, BellRing, Network, UsersRound, ShieldCheck, Activity, FileDown, MapPinned } from 'lucide-react';
import RiskDashboard from '@/components/early-warning/RiskDashboard';
import PredictiveHotspotMap from '@/components/early-warning/PredictiveHotspotMap';
import AlertSystem from '@/components/early-warning/AlertSystem';
import LiveActivityFeed from '@/components/LiveActivityFeed';
import CountrySelector, { getCountryName } from '@/components/early-warning/CountrySelector';
import ReportingCenter from '@/components/early-warning/ReportingCenter';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { Badge } from '@/components/ui/badge';
import { useTranslationContext } from '@/components/TranslationProvider';

const EarlyWarningDashboard = () => {
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const { activeAlerts } = useRealtimeAlerts();
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      
      {/* Hero Section with Gradient Overlay */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        
        <div className="relative container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-4">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground">{t('earlyWarning.badge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground tracking-tight">
              {t('earlyWarning.title')}
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              {t('earlyWarning.subtitle')}
            </p>

            {/* Country Selector in Hero */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-2 border border-primary-foreground/20">
                <MapPinned className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-primary-foreground">{t('earlyWarning.viewing')}:</span>
                <CountrySelector
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                  className="w-[200px] bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground"
                />
              </div>
              {selectedCountry !== 'ALL' && (
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                  {t('earlyWarning.filtered')}: {getCountryName(selectedCountry)}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <Tabs defaultValue="risk" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/80 backdrop-blur-sm border border-border shadow-lg p-1.5 rounded-xl">
              <TabsTrigger 
                value="risk" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-300 font-medium"
              >
                <Siren className="w-4 h-4 mr-2" />
                {t('earlyWarning.tabs.riskAnalysis')}
              </TabsTrigger>
              <TabsTrigger 
                value="hotspots"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-300 font-medium"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('earlyWarning.tabs.hotspots')}
              </TabsTrigger>
              <TabsTrigger 
                value="alerts"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-300 font-medium"
              >
                <BellRing className="w-4 h-4 mr-2" />
                {t('earlyWarning.tabs.alerts')}
              </TabsTrigger>
              <TabsTrigger 
                value="reports"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-300 font-medium"
              >
                <FileDown className="w-4 h-4 mr-2" />
                {t('earlyWarning.tabs.reports')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="risk" className="animate-fade-in">
              <RiskDashboard selectedCountry={selectedCountry} />
            </TabsContent>

            <TabsContent value="hotspots" className="animate-fade-in">
              <PredictiveHotspotMap selectedCountry={selectedCountry} />
            </TabsContent>

            <TabsContent value="alerts" className="animate-fade-in">
              <AlertSystem selectedCountry={selectedCountry} />
            </TabsContent>

            <TabsContent value="reports" className="animate-fade-in">
              <ReportingCenter selectedCountry={selectedCountry} />
            </TabsContent>
          </Tabs>

          {/* Live Activity Feed & System Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveActivityFeed selectedCountry={selectedCountry} />
            </div>
            
            {/* System Status Card */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-lg overflow-hidden relative h-fit">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{t('earlyWarning.systemStatus')}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <StatusItem
                    icon={Network}
                    title={t('earlyWarning.status.aiAnalysis')}
                    status={t('earlyWarning.status.operational')}
                    color="success"
                  />
                  <StatusItem
                    icon={TrendingUp}
                    title={t('earlyWarning.status.prediction')}
                    status={t('status.active')}
                    color="success"
                  />
                  <StatusItem
                    icon={BellRing}
                    title={t('earlyWarning.tabs.alerts')}
                    status={`${activeAlerts.length} ${t('status.active')}`}
                    color={activeAlerts.length > 0 ? "warning" : "success"}
                  />
                  <StatusItem
                    icon={UsersRound}
                    title={t('earlyWarning.status.response')}
                    status={t('earlyWarning.status.ready')}
                    color="success"
                  />
                </div>

                {/* Current Filter Info */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPinned className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('earlyWarning.currentView')}:</span>
                    <span className="font-medium text-foreground">
                      {getCountryName(selectedCountry)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatusItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  status: string;
  color: 'success' | 'warning' | 'destructive';
}

const StatusItem = ({ icon: Icon, title, status, color }: StatusItemProps) => {
  const colorClasses = {
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };

  const glowClasses = {
    success: 'shadow-[0_0_20px_hsl(var(--success)/0.4)]',
    warning: 'shadow-[0_0_20px_hsl(var(--warning)/0.4)]',
    destructive: 'shadow-[0_0_20px_hsl(var(--destructive)/0.4)]',
  };

  return (
    <div className="text-center group">
      <div className={`w-14 h-14 ${colorClasses[color]} ${glowClasses[color]} rounded-2xl mx-auto mb-3 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300`}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{status}</p>
    </div>
  );
};

export default EarlyWarningDashboard;
