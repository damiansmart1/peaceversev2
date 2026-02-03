import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import Navigation from '@/components/Navigation';
import { 
  Vote, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  Shield, 
  Search,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  Globe,
  BarChart3,
  Users,
  FileText,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Activity,
  Zap,
} from 'lucide-react';
import { useElections, useAllElectionIncidents, useElectionStats, type Election, type ElectionStatus } from '@/hooks/useElections';
import { useElectionDemo } from '@/hooks/useElectionDemo';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ElectionIncidentReportForm from '@/components/elections/ElectionIncidentReportForm';
import ElectionRealTimeDashboard from '@/components/elections/ElectionRealTimeDashboard';
import ElectionVerificationQueue from '@/components/elections/ElectionVerificationQueue';
import ElectionAdvancedExport from '@/components/elections/ElectionAdvancedExport';
import ElectionDetailView from '@/components/elections/ElectionDetailView';
import { useUserRoles } from '@/hooks/useRoleCheck';

const STATUS_COLORS: Record<ElectionStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  registration: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
  campaigning: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  voting: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse',
  counting: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  verification: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  certified: 'bg-green-500/20 text-green-700 dark:text-green-300',
  disputed: 'bg-red-500/20 text-red-700 dark:text-red-300',
  completed: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
};

const FEATURE_HIGHLIGHTS = [
  { icon: Shield, title: 'Multi-Signature Verification', desc: 'Cryptographic signing for result integrity' },
  { icon: Globe, title: 'International Standards', desc: 'UN, EU, AU observation formats' },
  { icon: Wifi, title: 'Offline-First', desc: 'Works in low-bandwidth regions' },
  { icon: Activity, title: 'Real-Time Monitoring', desc: 'Live incident tracking dashboard' },
];

export default function Elections() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [isOnline] = useState(navigator.onLine);

  const { data: elections, isLoading, refetch } = useElections();
  const { data: recentIncidents } = useAllElectionIncidents();
  const { data: isAdmin } = useAdminCheck();
  const { data: userRoles } = useUserRoles();
  const { seedDemoData, clearDemoData, isLoading: isDemoLoading } = useElectionDemo();

  const roleStrings = userRoles?.map((r: any) => r.role) || [];
  const hasElevatedAccess = roleStrings.includes('admin') || roleStrings.includes('government') || roleStrings.includes('verifier') || roleStrings.includes('partner');

  const filteredElections = elections?.filter(election => {
    const matchesSearch = election.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === 'all' || election.country_code === countryFilter;
    const matchesStatus = statusFilter === 'all' || election.status === statusFilter;
    return matchesSearch && matchesCountry && matchesStatus && election.status !== 'draft';
  });

  const activeElections = elections?.filter(e => ['voting', 'counting', 'verification'].includes(e.status)) || [];
  const upcomingElections = elections?.filter(e => ['scheduled', 'registration', 'campaigning'].includes(e.status)) || [];
  
  const countries = [...new Set(elections?.map(e => ({ code: e.country_code, name: e.country_name })) || [])];

  // Calculate aggregate stats
  const totalIncidents = recentIncidents?.length || 0;
  const criticalIncidents = recentIncidents?.filter((i: any) => i.severity === 'critical' || i.severity === 'emergency').length || 0;
  const verifiedIncidents = recentIncidents?.filter((i: any) => i.verification_status === 'verified').length || 0;

  if (selectedElection) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 md:py-24">
          <ElectionDetailView 
            election={selectedElection} 
            onBack={() => setSelectedElection(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20 md:py-24">
        {/* Hero Banner */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary to-primary/80 p-6 md:p-8 mb-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Vote className="h-8 md:h-10 w-8 md:w-10 text-gold" />
                  <h1 className="text-2xl md:text-4xl font-bold text-white">
                    Election Monitoring Center
                  </h1>
                </div>
                <p className="text-base md:text-lg text-white/80 max-w-2xl">
                  International-standard election observation, incident reporting, and verification 
                  system. Ensuring transparency, credibility, and security in democratic processes across Africa.
                </p>
                
                {/* Feature highlights */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {FEATURE_HIGHLIGHTS.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                      <feature.icon className="h-3 w-3 text-gold" />
                      <span className="text-xs text-white">{feature.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {/* Connection status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {isOnline ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
                  <span className="text-xs text-white">{isOnline ? 'Online' : 'Offline Mode'}</span>
                </div>
                
                <Button className="bg-gold text-primary-dark hover:bg-gold/90" onClick={() => setActiveTab('report')}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Incident
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Demo Controls */}
        {isAdmin && (
          <Card className="mb-6 border-dashed border-2">
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Demo Data Controls</p>
                    <p className="text-xs text-muted-foreground">Seed realistic election data for testing</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearDemoData} disabled={isDemoLoading}>
                    Clear Demo
                  </Button>
                  <Button size="sm" onClick={seedDemoData} disabled={isDemoLoading}>
                    {isDemoLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Seeding...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Seed Demo Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activeElections.length}</p>
                </div>
                <Vote className="h-6 w-6 text-amber-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingElections.length}</p>
                </div>
                <Calendar className="h-6 w-6 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Incidents</p>
                  <p className="text-2xl font-bold">{totalIncidents}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{criticalIncidents}</p>
                </div>
                <Zap className="h-6 w-6 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{verifiedIncidents}</p>
                </div>
                <CheckCircle2 className="h-6 w-6 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Countries</p>
                  <p className="text-2xl font-bold">{countries.length}</p>
                </div>
                <Globe className="h-6 w-6 text-purple-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="overview" className="gap-1">
              <Vote className="h-4 w-4" />
              <span className="hidden sm:inline">Elections</span>
            </TabsTrigger>
            <TabsTrigger value="incidents" className="gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Incidents</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Report</span>
            </TabsTrigger>
            {hasElevatedAccess && (
              <>
                <TabsTrigger value="verification" className="gap-1">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Verify</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search elections..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map((c: any) => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="voting">Voting</SelectItem>
                      <SelectItem value="counting">Counting</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Elections Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredElections?.length === 0 ? (
              <Card className="p-12 text-center">
                <Vote className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No Elections Found</h3>
                <p className="text-muted-foreground mb-4">No elections match your current filters</p>
                {isAdmin && (
                  <Button onClick={seedDemoData} disabled={isDemoLoading}>
                    <Zap className="h-4 w-4 mr-2" />
                    Seed Demo Elections
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredElections?.map((election) => {
                  const daysToElection = differenceInDays(new Date(election.voting_date), new Date());
                  const isElectionDay = daysToElection === 0;
                  const isPast = daysToElection < 0;

                  return (
                    <Card 
                      key={election.id} 
                      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setSelectedElection(election)}
                    >
                      <div className={`h-2 ${election.status === 'voting' ? 'bg-amber-500' : election.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`} />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="line-clamp-1 text-base">{election.name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <Globe className="h-3 w-3" />
                              {election.country_name}
                            </CardDescription>
                          </div>
                          <Badge className={STATUS_COLORS[election.status]}>
                            {election.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="outline" className="capitalize text-xs">
                              {election.election_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium text-xs">
                              {format(new Date(election.voting_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Countdown</span>
                            {isElectionDay ? (
                              <Badge className="bg-amber-500 text-white animate-pulse text-xs">TODAY</Badge>
                            ) : isPast ? (
                              <span className="text-muted-foreground text-xs">{Math.abs(daysToElection)}d ago</span>
                            ) : (
                              <span className="font-medium text-primary text-xs">{daysToElection}d</span>
                            )}
                          </div>
                          
                          {/* Security indicators */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            {election.verification_required && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Shield className="h-3 w-3" />
                                Verified
                              </div>
                            )}
                            {election.multi_signature_required && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                Multi-Sig
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElection(election);
                          }}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="flex-1" onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab('report');
                          }}>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="incidents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Election Incidents</CardTitle>
                <CardDescription>
                  Latest reported incidents across all monitored elections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!recentIncidents || recentIncidents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No incidents reported</p>
                    {isAdmin && (
                      <Button className="mt-4" onClick={seedDemoData} disabled={isDemoLoading}>
                        Seed Demo Data
                      </Button>
                    )}
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {recentIncidents.slice(0, 30).map((incident: any) => (
                        <div 
                          key={incident.id} 
                          className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                            incident.severity === 'critical' || incident.severity === 'emergency' 
                              ? 'border-l-4 border-l-red-500' 
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge 
                                  className={`text-xs ${
                                    incident.severity === 'critical' || incident.severity === 'emergency' 
                                      ? 'bg-red-500' 
                                      : incident.severity === 'serious' 
                                        ? 'bg-orange-500' 
                                        : 'bg-yellow-500'
                                  } text-white`}
                                >
                                  {incident.severity}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {incident.incident_code}
                                </span>
                                {incident.requires_immediate_action && (
                                  <Badge className="bg-red-600 text-white text-xs animate-pulse">
                                    URGENT
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium">{incident.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {incident.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {incident.region || incident.elections?.country_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(incident.incident_datetime), 'MMM dd, HH:mm')}
                                </span>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={incident.verification_status === 'verified' ? 'text-green-600 border-green-600' : 'text-amber-600 border-amber-600'}
                            >
                              {incident.verification_status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report">
            <ElectionIncidentReportForm elections={elections || []} />
          </TabsContent>

          {hasElevatedAccess && (
            <>
              <TabsContent value="verification">
                {activeElections.length > 0 ? (
                  <ElectionVerificationQueue election={activeElections[0]} />
                ) : elections && elections.length > 0 ? (
                  <ElectionVerificationQueue election={elections[0]} />
                ) : (
                  <Card className="p-12 text-center">
                    <Shield className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No Elections Available</h3>
                    <p className="text-muted-foreground">Create or seed elections to access verification queue</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                {activeElections.length > 0 ? (
                  <ElectionRealTimeDashboard election={activeElections[0]} />
                ) : elections && elections.length > 0 ? (
                  <ElectionRealTimeDashboard election={elections[0]} />
                ) : (
                  <Card className="p-12 text-center">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No Analytics Available</h3>
                    <p className="text-muted-foreground">Create or seed elections to view analytics</p>
                  </Card>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}