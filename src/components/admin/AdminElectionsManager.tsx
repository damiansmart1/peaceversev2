import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ElectionBulkActions from '@/components/elections/ElectionBulkActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Vote, 
  Plus, 
  MapPin, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  Shield, 
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Settings,
  Download,
  RefreshCw,
  Calendar,
  Globe,
  Lock,
  Tag,
  UserCheck,
} from 'lucide-react';
import { 
  useElections, 
  useCreateElection, 
  useUpdateElection,
  useAllElectionIncidents,
  useIncidentCategories,
  useUpdateIncidentStatus,
  type Election,
  type ElectionStatus,
  type ElectionType
} from '@/hooks/useElections';
import { format } from 'date-fns';
import ElectionDetailView from '@/components/elections/ElectionDetailView';
import ElectionIncidentsManager from '@/components/elections/ElectionIncidentsManager';
import ElectionReportsExport from '@/components/elections/ElectionReportsExport';
import ElectionAuditLog from '@/components/elections/ElectionAuditLog';
import ElectionCategoriesManager from '@/components/elections/ElectionCategoriesManager';
import { useElectionDemo } from '@/hooks/useElectionDemo';

const ELECTION_TYPES: { value: ElectionType; label: string }[] = [
  { value: 'presidential', label: 'Presidential' },
  { value: 'parliamentary', label: 'Parliamentary' },
  { value: 'gubernatorial', label: 'Gubernatorial' },
  { value: 'local', label: 'Local Government' },
  { value: 'referendum', label: 'Referendum' },
  { value: 'by_election', label: 'By-Election' },
  { value: 'primary', label: 'Primary' },
];

const AFRICAN_COUNTRIES = [
  { code: 'KE', name: 'Kenya' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'GH', name: 'Ghana' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'MA', name: 'Morocco' },
  { code: 'SN', name: 'Senegal' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'CM', name: 'Cameroon' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'AO', name: 'Angola' },
  { code: 'CD', name: 'DR Congo' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'LY', name: 'Libya' },
  { code: 'TN', name: 'Tunisia' },
];

const STATUS_COLORS: Record<ElectionStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  registration: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
  campaigning: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  voting: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  counting: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
  verification: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  certified: 'bg-green-500/20 text-green-700 dark:text-green-300',
  disputed: 'bg-red-500/20 text-red-700 dark:text-red-300',
  completed: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
};

export default function AdminElectionsManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newElection, setNewElection] = useState({
    name: '',
    description: '',
    election_type: 'presidential' as ElectionType,
    country_code: '',
    country_name: '',
    voting_date: '',
    registration_start: '',
    registration_end: '',
    campaign_start: '',
    campaign_end: '',
    verification_required: true,
    multi_signature_required: true,
    min_signatures_required: 2,
  });

  const { data: elections, isLoading, refetch } = useElections();
  const { data: allIncidents } = useAllElectionIncidents();
  const createElection = useCreateElection();
  const updateElection = useUpdateElection();
  const { seedDemoData, clearDemoData, isLoading: isDemoLoading } = useElectionDemo();

  const handleCreateElection = async () => {
    const country = AFRICAN_COUNTRIES.find(c => c.code === newElection.country_code);
    await createElection.mutateAsync({
      ...newElection,
      country_name: country?.name || newElection.country_code,
    });
    setShowCreateDialog(false);
    setNewElection({
      name: '',
      description: '',
      election_type: 'presidential',
      country_code: '',
      country_name: '',
      voting_date: '',
      registration_start: '',
      registration_end: '',
      campaign_start: '',
      campaign_end: '',
      verification_required: true,
      multi_signature_required: true,
      min_signatures_required: 2,
    });
  };

  const handleStatusChange = async (electionId: string, newStatus: ElectionStatus) => {
    await updateElection.mutateAsync({ id: electionId, status: newStatus });
  };

  // Summary stats
  const stats = {
    totalElections: elections?.length || 0,
    activeElections: elections?.filter(e => ['voting', 'counting', 'verification'].includes(e.status)).length || 0,
    upcomingElections: elections?.filter(e => ['scheduled', 'registration', 'campaigning'].includes(e.status)).length || 0,
    totalIncidents: allIncidents?.length || 0,
    criticalIncidents: allIncidents?.filter((i: any) => i.severity === 'critical' || i.severity === 'emergency').length || 0,
  };

  if (selectedElection) {
    return (
      <ElectionDetailView 
        election={selectedElection} 
        onBack={() => setSelectedElection(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" />
            Election Management
          </h2>
          <p className="text-muted-foreground">
            Comprehensive election reporting and monitoring system (International Standards)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={clearDemoData} disabled={isDemoLoading}>
            Clear Demo
          </Button>
          <Button variant="outline" size="sm" onClick={seedDemoData} disabled={isDemoLoading}>
            {isDemoLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Seed Demo Data
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Election
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Election</DialogTitle>
                <DialogDescription>
                  Set up a new election for monitoring and reporting
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Election Name *</Label>
                  <Input
                    id="name"
                    value={newElection.name}
                    onChange={(e) => setNewElection({ ...newElection, name: e.target.value })}
                    placeholder="e.g., Kenya Presidential Election 2027"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newElection.description}
                    onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                    placeholder="Brief description of the election"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Election Type *</Label>
                    <Select
                      value={newElection.election_type}
                      onValueChange={(value: ElectionType) => setNewElection({ ...newElection, election_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ELECTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Country *</Label>
                    <Select
                      value={newElection.country_code}
                      onValueChange={(value) => setNewElection({ ...newElection, country_code: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {AFRICAN_COUNTRIES.map(country => (
                          <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Voting Date *</Label>
                  <Input
                    type="date"
                    value={newElection.voting_date}
                    onChange={(e) => setNewElection({ ...newElection, voting_date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Registration Start</Label>
                    <Input
                      type="date"
                      value={newElection.registration_start}
                      onChange={(e) => setNewElection({ ...newElection, registration_start: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Registration End</Label>
                    <Input
                      type="date"
                      value={newElection.registration_end}
                      onChange={(e) => setNewElection({ ...newElection, registration_end: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Campaign Start</Label>
                    <Input
                      type="date"
                      value={newElection.campaign_start}
                      onChange={(e) => setNewElection({ ...newElection, campaign_start: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Campaign End</Label>
                    <Input
                      type="date"
                      value={newElection.campaign_end}
                      onChange={(e) => setNewElection({ ...newElection, campaign_end: e.target.value })}
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Verification</Label>
                        <p className="text-xs text-muted-foreground">All results must be verified</p>
                      </div>
                      <Switch
                        checked={newElection.verification_required}
                        onCheckedChange={(checked) => setNewElection({ ...newElection, verification_required: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Multi-Signature Verification</Label>
                        <p className="text-xs text-muted-foreground">Multiple parties must sign results</p>
                      </div>
                      <Switch
                        checked={newElection.multi_signature_required}
                        onCheckedChange={(checked) => setNewElection({ ...newElection, multi_signature_required: checked })}
                      />
                    </div>
                    {newElection.multi_signature_required && (
                      <div className="grid gap-2">
                        <Label>Minimum Signatures Required</Label>
                        <Input
                          type="number"
                          min={2}
                          max={10}
                          value={newElection.min_signatures_required}
                          onChange={(e) => setNewElection({ ...newElection, min_signatures_required: parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateElection}
                  disabled={!newElection.name || !newElection.country_code || !newElection.voting_date || createElection.isPending}
                >
                  {createElection.isPending ? 'Creating...' : 'Create Election'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalElections}</p>
                <p className="text-xs text-muted-foreground">Total Elections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeElections}</p>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.upcomingElections}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalIncidents}</p>
                <p className="text-xs text-muted-foreground">Total Incidents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.criticalIncidents}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full max-w-3xl">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Incidents</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Audit Log</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Bulk Actions</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Elections</CardTitle>
              <CardDescription>Manage and monitor all elections</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : elections?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No elections configured yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Election
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Election</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Voting Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {elections?.map((election) => (
                        <TableRow key={election.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{election.name}</p>
                              <p className="text-xs text-muted-foreground">{election.description?.slice(0, 50)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              {election.country_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {election.election_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(election.voting_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[election.status]}>
                              {election.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedElection(election)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Select
                                value={election.status}
                                onValueChange={(value: ElectionStatus) => handleStatusChange(election.id, value)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="registration">Registration</SelectItem>
                                  <SelectItem value="campaigning">Campaigning</SelectItem>
                                  <SelectItem value="voting">Voting</SelectItem>
                                  <SelectItem value="counting">Counting</SelectItem>
                                  <SelectItem value="verification">Verification</SelectItem>
                                  <SelectItem value="certified">Certified</SelectItem>
                                  <SelectItem value="disputed">Disputed</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <ElectionIncidentsManager />
        </TabsContent>

        <TabsContent value="categories">
          <ElectionCategoriesManager />
        </TabsContent>

        <TabsContent value="audit">
          <ElectionAuditLog />
        </TabsContent>

        <TabsContent value="bulk">
          {elections && elections.length > 0 ? (
            <div className="space-y-4">
              <Select
                onValueChange={(id) => {
                  const el = elections.find(e => e.id === id);
                  if (el) setSelectedElection(el);
                }}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select election for bulk actions" />
                </SelectTrigger>
                <SelectContent>
                  {elections.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedElection && (
                <ElectionBulkActions electionId={selectedElection.id} />
              )}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">No elections available</p>
          )}
        </TabsContent>

        <TabsContent value="reports">
          <ElectionReportsExport elections={elections || []} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Election System Settings</CardTitle>
              <CardDescription>Configure global election reporting settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <Label>Default Verification Requirement</Label>
                  <p className="text-xs text-muted-foreground">
                    Require verification for all new elections by default
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <Label>Multi-Party Signature Verification</Label>
                  <p className="text-xs text-muted-foreground">
                    Require multiple party representatives to sign results
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <Label>Real-time Incident Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Send immediate notifications for critical incidents
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit Log Retention</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep immutable audit logs for compliance
                  </p>
                </div>
                <Badge variant="outline">Enabled (Permanent)</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
