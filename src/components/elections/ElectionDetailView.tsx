import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  CheckCircle2,
  Clock,
  Vote,
  Shield,
  FileText,
  Plus,
  RefreshCw,
  Download,
  Activity,
  Eye,
  Lock,
  PieChart,
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

interface ElectionDetailViewProps {
  election: Election;
  onBack: () => void;
}

export default function ElectionDetailView({ election, onBack }: ElectionDetailViewProps) {
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
              <h2 className="text-2xl font-bold">{election.name}</h2>
              <Badge className={`${getStatusColor(election.status)} text-white`}>
                {election.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {election.country_name}
              </span>
              <span className="capitalize">{election.election_type.replace('_', ' ')}</span>
              <span>
                {format(new Date(election.voting_date), 'MMMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          {isElectionDay ? (
            <Badge className="bg-amber-500 text-white text-lg px-4 py-2 animate-pulse">
              🗳️ ELECTION DAY
            </Badge>
          ) : isPastElection ? (
            <Badge variant="outline" className="text-lg px-4 py-2">
              {Math.abs(daysToElection)} days ago
            </Badge>
          ) : (
            <div>
              <p className="text-3xl font-bold text-primary">{daysToElection}</p>
              <p className="text-xs text-muted-foreground">days until election</p>
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
              <p className="text-xs text-muted-foreground">Polling Stations</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xl font-bold">{stats?.totalObservers || observers?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Observers</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xl font-bold">{stats?.totalIncidents || incidents?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Incidents</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xl font-bold">{stats?.totalResults || results?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Results</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-xl font-bold">{stats?.verifiedResults || 0}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xl font-bold">{stats?.criticalIncidents || 0}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full max-w-5xl">
          <TabsTrigger value="overview" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="realtime" className="gap-1">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Live</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="stations" className="gap-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Stations</span>
          </TabsTrigger>
          <TabsTrigger value="observers" className="gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Observers</span>
          </TabsTrigger>
          <TabsTrigger value="accreditation" className="gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Accredit</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Incidents</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Verify</span>
          </TabsTrigger>
          <TabsTrigger value="collation" className="gap-1">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Results</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Election Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Election Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {election.registration_start && (
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${new Date() >= new Date(election.registration_start) ? 'bg-green-500' : 'bg-muted'}`} />
                    <div className="flex-1">
                      <p className="font-medium">Registration Period</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(election.registration_start), 'MMM dd')} - {election.registration_end ? format(new Date(election.registration_end), 'MMM dd, yyyy') : 'TBD'}
                      </p>
                    </div>
                  </div>
                )}
                {election.campaign_start && (
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${new Date() >= new Date(election.campaign_start) ? 'bg-green-500' : 'bg-muted'}`} />
                    <div className="flex-1">
                      <p className="font-medium">Campaign Period</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(election.campaign_start), 'MMM dd')} - {election.campaign_end ? format(new Date(election.campaign_end), 'MMM dd, yyyy') : 'TBD'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isElectionDay || isPastElection ? 'bg-green-500' : 'bg-muted'}`} />
                  <div className="flex-1">
                    <p className="font-medium">Voting Day</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(election.voting_date), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Verification Required</span>
                  <Badge variant={election.verification_required ? 'default' : 'secondary'}>
                    {election.verification_required ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Multi-Signature Verification</span>
                  <Badge variant={election.multi_signature_required ? 'default' : 'secondary'}>
                    {election.multi_signature_required ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                {election.multi_signature_required && (
                  <div className="flex items-center justify-between">
                    <span>Minimum Signatures</span>
                    <Badge variant="outline">{election.min_signatures_required}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Verification Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Progress</CardTitle>
              <CardDescription>
                Station setup and result verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Stations Verified</span>
                  <span>{stats?.verifiedStations || 0} / {stats?.totalStations || 0}</span>
                </div>
                <Progress 
                  value={stats?.totalStations ? ((stats.verifiedStations || 0) / stats.totalStations) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Observers Deployed</span>
                  <span>{stats?.deployedObservers || 0} / {stats?.accreditedObservers || 0}</span>
                </div>
                <Progress 
                  value={stats?.accreditedObservers ? ((stats.deployedObservers || 0) / stats.accreditedObservers) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Results Verified</span>
                  <span>{stats?.verifiedResults || 0} / {stats?.totalResults || 0}</span>
                </div>
                <Progress 
                  value={stats?.totalResults ? ((stats.verifiedResults || 0) / stats.totalResults) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Incidents Resolved</span>
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
      </Tabs>
    </div>
  );
}
