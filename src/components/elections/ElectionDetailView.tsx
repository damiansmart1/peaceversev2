import TranslatableText from '@/components/TranslatableText';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, MapPin, Users, AlertTriangle, BarChart3, CheckCircle2,
  Clock, Vote, Shield, FileText, Plus, RefreshCw, Download, Activity,
  Eye, Lock, PieChart, Zap, ClipboardCheck, Target, Navigation,
} from 'lucide-react';
import { 
  type Election,
  useElectionStats,
  usePollingStations,
  useElectionObservers,
  useElectionIncidents,
  useElectionResults
} from '@/hooks/useElections';
import { format, differenceInDays } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import ElectionPollingStations from './ElectionPollingStations';
import ElectionObserversPanel from './ElectionObserversPanel';
import ElectionIncidentsList from './ElectionIncidentsList';
import ElectionResultsPanel from './ElectionResultsPanel';
import ElectionRealTimeDashboard from './ElectionRealTimeDashboard';
import ElectionVerificationQueue from './ElectionVerificationQueue';
import ElectionAdvancedExport from './ElectionAdvancedExport';
import ElectionAuditLog from './ElectionAuditLog';
import ElectionResultCollation from './ElectionResultCollation';
import ElectionDayTimeline from './ElectionDayTimeline';
import ElectionObserverAccreditation from './ElectionObserverAccreditation';
import StatisticalAnomalyDetector from './StatisticalAnomalyDetector';
import ObservationChecklist from './ObservationChecklist';
import PVTDashboard from './PVTDashboard';
import ObserverGPSTracker from './ObserverGPSTracker';
import VoterEducation from './VoterEducation';
import { voterEducationCatalogue } from '@/lib/voterEducationCatalogue';
import { useTranslationContext } from '@/components/TranslationProvider';

interface ElectionDetailViewProps {
  election: Election;
  onBack: () => void;
}

export default function ElectionDetailView({ election, onBack }: ElectionDetailViewProps) {
  const { t, language } = useTranslationContext();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useElectionStats(election.id);
  const { data: stations } = usePollingStations(election.id);
  const { data: observers } = useElectionObservers(election.id);
  const { data: incidents } = useElectionIncidents(election.id);
  const { data: results } = useElectionResults(election.id);

  const daysToElection = differenceInDays(new Date(election.voting_date), new Date());
  const isElectionDay = daysToElection === 0;
  const isPastElection = daysToElection < 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-muted',
      scheduled: 'bg-blue-500',
      registration: 'bg-cyan-500',
      campaigning: 'bg-purple-500',
      voting: 'bg-amber-500',
      counting: 'bg-orange-500',
      verification: 'bg-yellow-500',
      certified: 'bg-green-500',
      disputed: 'bg-red-500',
      completed: 'bg-emerald-500',
    };
    return colors[status] || 'bg-muted';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold"><TranslatableText text={election.name} /></h2>
              <Badge className={`${getStatusColor(election.status)} text-white`}>
                {t(`elections.${election.status}`, election.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {new Intl.DisplayNames([language], { type: 'region' }).of(election.country_code) || election.country_name}
              </span>
              <span className="capitalize">{t(`elections.${election.election_type}`, election.election_type.replaceAll('_', ' '))}</span>
              <span>
                {format(new Date(election.voting_date), 'MMMM dd, yyyy', { locale: language === 'fr' ? fr : enUS })}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          {isElectionDay ? (
            <Badge className="bg-amber-500 text-white text-lg px-4 py-2 animate-pulse">{t('elections.election_day')}</Badge>
          ) : isPastElection ? (
            <Badge variant="outline" className="text-lg px-4 py-2">
              {t('elections.days_ago').replace('{count}', String(Math.abs(daysToElection)))}
            </Badge>
          ) : (
            <div>
              <p className="text-3xl font-bold text-primary">{daysToElection}</p>
              <p className="text-xs text-muted-foreground">{t('elections.days_until_election')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xl font-bold">{stats?.totalStations || stations?.length || 0}</p>
              <p className="text-xs text-muted-foreground">{t('elections.polling_stations')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xl font-bold">{stats?.totalObservers || observers?.length || 0}</p>
              <p className="text-xs text-muted-foreground">{t('elections.observers')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xl font-bold">{stats?.totalIncidents || incidents?.length || 0}</p>
              <p className="text-xs text-muted-foreground">{t('elections.incidents')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xl font-bold">{stats?.totalResults || results?.length || 0}</p>
              <p className="text-xs text-muted-foreground">{t('elections.results')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-xl font-bold">{stats?.verifiedResults || 0}</p>
              <p className="text-xs text-muted-foreground">{t('elections.verified')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xl font-bold">{stats?.criticalIncidents || 0}</p>
              <p className="text-xs text-muted-foreground">{t('elections.critical')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full max-w-5xl">
          <TabsTrigger value="education">{t('voterEducation.title')}</TabsTrigger>
          <TabsTrigger value="overview" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="realtime" className="gap-1">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.live')}</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.timeline')}</span>
          </TabsTrigger>
          <TabsTrigger value="stations" className="gap-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.stations')}</span>
          </TabsTrigger>
          <TabsTrigger value="observers" className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.observers')}</span>
          </TabsTrigger>
          <TabsTrigger value="accreditation" className="gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.accredit')}</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.incidents')}</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.verify')}</span>
          </TabsTrigger>
          <TabsTrigger value="collation" className="gap-1">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.results')}</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.audit')}</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.export')}</span>
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="gap-1">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.anomalies')}</span>
          </TabsTrigger>
          <TabsTrigger value="checklists" className="gap-1">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{t('elections.checklists')}</span>
          </TabsTrigger>
          <TabsTrigger value="pvt" className="gap-1">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">PVT</span>
          </TabsTrigger>
          <TabsTrigger value="gps" className="gap-1">
            <Navigation className="h-4 w-4" />
            <span className="hidden sm:inline">GPS</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="education"><VoterEducation key={election.country_code} catalogue={voterEducationCatalogue} initialCountry={election.country_code} /></TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Election Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>{t('elections.election_timeline')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {election.registration_start && (
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${new Date() >= new Date(election.registration_start) ? 'bg-green-500' : 'bg-muted'}`} />
                    <div className="flex-1">
                      <p className="font-medium">{t('elections.registration_period')}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(election.registration_start), 'MMM dd', { locale: language === 'fr' ? fr : enUS })} - {election.registration_end ? format(new Date(election.registration_end), 'MMM dd, yyyy', { locale: language === 'fr' ? fr : enUS }) : t('elections.tbd')}
                      </p>
                    </div>
                  </div>
                )}
                {election.campaign_start && (
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${new Date() >= new Date(election.campaign_start) ? 'bg-green-500' : 'bg-muted'}`} />
                    <div className="flex-1">
                      <p className="font-medium">{t('elections.campaign_period')}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(election.campaign_start), 'MMM dd', { locale: language === 'fr' ? fr : enUS })} - {election.campaign_end ? format(new Date(election.campaign_end), 'MMM dd, yyyy', { locale: language === 'fr' ? fr : enUS }) : t('elections.tbd')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isElectionDay || isPastElection ? 'bg-green-500' : 'bg-muted'}`} />
                  <div className="flex-1">
                    <p className="font-medium">{t('elections.voting_day')}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(election.voting_date), 'MMMM dd, yyyy', { locale: language === 'fr' ? fr : enUS })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />{t('elections.security_configuration')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>{t('elections.verification_required')}</span>
                  <Badge variant={election.verification_required ? 'default' : 'secondary'}>
                    {election.verification_required ? t('elections.enabled') : t('elections.disabled')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('elections.multi_signature_verification')}</span>
                  <Badge variant={election.multi_signature_required ? 'default' : 'secondary'}>
                    {election.multi_signature_required ? t('elections.enabled') : t('elections.disabled')}
                  </Badge>
                </div>
                {election.multi_signature_required && (
                  <div className="flex items-center justify-between">
                    <span>{t('elections.minimum_signatures')}</span>
                    <Badge variant="outline">{election.min_signatures_required}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verification Progress */}
          <Card>
            <CardHeader>
              <CardTitle>{t('elections.verification_progress')}</CardTitle>
              <CardDescription>{t('elections.station_setup_and_result_verification_status')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('elections.stations_verified')}</span>
                  <span>{stats?.verifiedStations || 0} / {stats?.totalStations || 0}</span>
                </div>
                <Progress 
                  value={stats?.totalStations ? ((stats.verifiedStations || 0) / stats.totalStations) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('elections.observers_deployed')}</span>
                  <span>{stats?.deployedObservers || 0} / {stats?.accreditedObservers || 0}</span>
                </div>
                <Progress 
                  value={stats?.accreditedObservers ? ((stats.deployedObservers || 0) / stats.accreditedObservers) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('elections.results_verified')}</span>
                  <span>{stats?.verifiedResults || 0} / {stats?.totalResults || 0}</span>
                </div>
                <Progress 
                  value={stats?.totalResults ? ((stats.verifiedResults || 0) / stats.totalResults) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{t('elections.incidents_resolved')}</span>
                  <span>{stats?.resolvedIncidents || 0} / {stats?.totalIncidents || 0}</span>
                </div>
                <Progress 
                  value={stats?.totalIncidents ? ((stats.resolvedIncidents || 0) / stats.totalIncidents) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime">
          <ElectionRealTimeDashboard election={election} />
        </TabsContent>

        <TabsContent value="timeline">
          <ElectionDayTimeline election={election} />
        </TabsContent>

        <TabsContent value="stations">
          <ElectionPollingStations electionId={election.id} countryCode={election.country_code} />
        </TabsContent>

        <TabsContent value="observers">
          <ElectionObserversPanel electionId={election.id} />
        </TabsContent>

        <TabsContent value="accreditation">
          <ElectionObserverAccreditation electionId={election.id} />
        </TabsContent>

        <TabsContent value="incidents">
          <ElectionIncidentsList electionId={election.id} />
        </TabsContent>

        <TabsContent value="verification">
          <ElectionVerificationQueue election={election} />
        </TabsContent>

        <TabsContent value="collation">
          <ElectionResultCollation election={election} />
        </TabsContent>

        <TabsContent value="audit">
          <ElectionAuditLog electionId={election.id} />
        </TabsContent>

        <TabsContent value="export">
          <ElectionAdvancedExport election={election} />
        </TabsContent>

        <TabsContent value="anomalies">
          <StatisticalAnomalyDetector election={election} />
        </TabsContent>

        <TabsContent value="checklists">
          <ObservationChecklist election={election} />
        </TabsContent>

        <TabsContent value="pvt">
          <PVTDashboard election={election} />
        </TabsContent>

        <TabsContent value="gps">
          <ObserverGPSTracker election={election} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
