import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import Navigation from '@/components/Navigation';
import SectionImageBanner from '@/components/SectionImageBanner';
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
  Globe
} from 'lucide-react';
import { useElections, useAllElectionIncidents, type Election, type ElectionStatus } from '@/hooks/useElections';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import ElectionIncidentReportForm from '@/components/elections/ElectionIncidentReportForm';

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

export default function Elections() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: elections, isLoading } = useElections();
  const { data: recentIncidents } = useAllElectionIncidents();

  const filteredElections = elections?.filter(election => {
    const matchesSearch = election.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === 'all' || election.country_code === countryFilter;
    const matchesStatus = statusFilter === 'all' || election.status === statusFilter;
    return matchesSearch && matchesCountry && matchesStatus && election.status !== 'draft';
  });

  const activeElections = elections?.filter(e => ['voting', 'counting', 'verification'].includes(e.status)) || [];
  const upcomingElections = elections?.filter(e => ['scheduled', 'registration', 'campaigning'].includes(e.status)) || [];
  
  const countries = [...new Set(elections?.map(e => ({ code: e.country_code, name: e.country_name })) || [])];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20 md:py-24">
        {/* Hero Banner */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary to-primary-dark p-8 mb-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Vote className="h-10 w-10 text-gold" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Election Monitoring Center
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-2xl">
              Real-time election reporting, monitoring, and verification across Africa. 
              Ensuring transparency, credibility, and security in democratic processes.
            </p>
            <div className="flex gap-3 mt-6">
              <Button className="bg-gold text-primary-dark hover:bg-gold-light" onClick={() => setActiveTab('report')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <Eye className="h-4 w-4 mr-2" />
                View All Elections
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Elections</p>
                  <p className="text-2xl font-bold">{activeElections.length}</p>
                </div>
                <Vote className="h-8 w-8 text-amber-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingElections.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recent Incidents</p>
                  <p className="text-2xl font-bold">{recentIncidents?.length || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Countries</p>
                  <p className="text-2xl font-bold">{countries.length}</p>
                </div>
                <Globe className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="overview">
              <Vote className="h-4 w-4 mr-2" />
              Elections
            </TabsTrigger>
            <TabsTrigger value="incidents">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="report">
              <Plus className="h-4 w-4 mr-2" />
              Report
            </TabsTrigger>
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
                <p className="text-muted-foreground">No elections match your current filters</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredElections?.map((election) => {
                  const daysToElection = differenceInDays(new Date(election.voting_date), new Date());
                  const isElectionDay = daysToElection === 0;
                  const isPast = daysToElection < 0;

                  return (
                    <Card key={election.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className={`h-2 ${election.status === 'voting' ? 'bg-amber-500' : election.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`} />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="line-clamp-1">{election.name}</CardTitle>
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
                            <Badge variant="outline" className="capitalize">
                              {election.election_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Voting Date</span>
                            <span className="font-medium">
                              {format(new Date(election.voting_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Countdown</span>
                            {isElectionDay ? (
                              <Badge className="bg-amber-500 text-white animate-pulse">TODAY</Badge>
                            ) : isPast ? (
                              <span className="text-muted-foreground">{Math.abs(daysToElection)} days ago</span>
                            ) : (
                              <span className="font-medium text-primary">{daysToElection} days</span>
                            )}
                          </div>
                          {election.verification_required && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Shield className="h-3 w-3" />
                              Verification Required
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={() => setActiveTab('report')}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Report Incident
                        </Button>
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
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {recentIncidents.slice(0, 20).map((incident: any) => (
                        <div 
                          key={incident.id} 
                          className={`p-4 border rounded-lg ${incident.severity === 'critical' || incident.severity === 'emergency' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
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
                              className={incident.verification_status === 'verified' ? 'text-green-600' : 'text-amber-600'}
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
        </Tabs>
      </div>
    </div>
  );
}
