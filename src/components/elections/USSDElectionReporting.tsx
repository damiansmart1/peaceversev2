import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Smartphone, 
  MessageSquare, 
  Signal, 
  Globe, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Activity,
  Users,
  MapPin,
  Clock,
  Zap,
  Shield,
  Settings,
  TrendingUp
} from 'lucide-react';

interface USSDSession {
  id: string;
  phoneNumber: string;
  sessionCode: string;
  country: string;
  carrier: string;
  stage: string;
  language: string;
  startedAt: string;
  lastActivity: string;
  isComplete: boolean;
}

interface SMSReport {
  id: string;
  phoneNumber: string;
  message: string;
  parsedData: {
    stationCode?: string;
    incidentType?: string;
    severity?: string;
    description?: string;
  };
  status: 'pending' | 'processed' | 'verified' | 'escalated';
  receivedAt: string;
  processedAt?: string;
}

interface ShortCode {
  code: string;
  country: string;
  carrier: string;
  type: 'ussd' | 'sms' | 'both';
  isActive: boolean;
  messageCount: number;
}

const USSDElectionReporting: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [testMode, setTestMode] = useState(false);

  // Mock data - would come from real-time subscriptions
  const [sessions] = useState<USSDSession[]>([
    {
      id: '1',
      phoneNumber: '+254712***890',
      sessionCode: '*384*1#',
      country: 'KE',
      carrier: 'Safaricom',
      stage: 'incident_details',
      language: 'sw',
      startedAt: new Date(Date.now() - 120000).toISOString(),
      lastActivity: new Date(Date.now() - 30000).toISOString(),
      isComplete: false
    },
    {
      id: '2',
      phoneNumber: '+256771***234',
      sessionCode: '*384*1#',
      country: 'UG',
      carrier: 'MTN',
      stage: 'completed',
      language: 'en',
      startedAt: new Date(Date.now() - 300000).toISOString(),
      lastActivity: new Date(Date.now() - 240000).toISOString(),
      isComplete: true
    }
  ]);

  const [smsReports] = useState<SMSReport[]>([
    {
      id: '1',
      phoneNumber: '+255712***567',
      message: 'INCIDENT PS-1234 INTIMIDATION HIGH Voters being threatened at entrance',
      parsedData: {
        stationCode: 'PS-1234',
        incidentType: 'INTIMIDATION',
        severity: 'HIGH',
        description: 'Voters being threatened at entrance'
      },
      status: 'escalated',
      receivedAt: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: '2',
      phoneNumber: '+254722***890',
      message: 'RESULT PS-5678 ABC=456 XYZ=389 IND=23 REJ=12 TOTAL=880',
      parsedData: {
        stationCode: 'PS-5678',
        incidentType: 'RESULT',
        description: 'Vote tally submission'
      },
      status: 'processed',
      receivedAt: new Date(Date.now() - 180000).toISOString(),
      processedAt: new Date(Date.now() - 120000).toISOString()
    }
  ]);

  const [shortCodes] = useState<ShortCode[]>([
    { code: '*384*1#', country: 'KE', carrier: 'Safaricom', type: 'ussd', isActive: true, messageCount: 1234 },
    { code: '*384*1#', country: 'KE', carrier: 'Airtel', type: 'ussd', isActive: true, messageCount: 567 },
    { code: '20384', country: 'KE', carrier: 'All', type: 'sms', isActive: true, messageCount: 2341 },
    { code: '*170*1#', country: 'UG', carrier: 'MTN', type: 'ussd', isActive: true, messageCount: 890 },
    { code: '8384', country: 'UG', carrier: 'All', type: 'sms', isActive: true, messageCount: 456 },
    { code: '*150*1#', country: 'TZ', carrier: 'Vodacom', type: 'ussd', isActive: false, messageCount: 0 }
  ]);

  const stats = {
    activeUSSDSessions: sessions.filter(s => !s.isComplete).length,
    totalUSSDToday: 1847,
    smsReceived: 3421,
    smsProcessed: 3398,
    avgResponseTime: '2.3s',
    escalatedIncidents: 23,
    countriesCovered: 12,
    carriersIntegrated: 28
  };

  const languages = [
    { code: 'en', name: 'English', percentage: 45 },
    { code: 'sw', name: 'Swahili', percentage: 28 },
    { code: 'fr', name: 'French', percentage: 15 },
    { code: 'ar', name: 'Arabic', percentage: 8 },
    { code: 'am', name: 'Amharic', percentage: 4 }
  ];

  const ussdFlow = [
    { stage: 'welcome', label: 'Welcome Screen', completion: 100 },
    { stage: 'language', label: 'Language Selection', completion: 98 },
    { stage: 'action_type', label: 'Action Type', completion: 95 },
    { stage: 'station_code', label: 'Station Code', completion: 88 },
    { stage: 'incident_details', label: 'Incident Details', completion: 72 },
    { stage: 'confirmation', label: 'Confirmation', completion: 68 },
    { stage: 'completed', label: 'Submitted', completion: 65 }
  ];

  const smsCommands = [
    { command: 'INCIDENT', description: 'Report election incident', format: 'INCIDENT [STATION] [TYPE] [SEVERITY] [DETAILS]' },
    { command: 'RESULT', description: 'Submit polling station results', format: 'RESULT [STATION] [CANDIDATE1=VOTES] [CANDIDATE2=VOTES]...' },
    { command: 'ALERT', description: 'Emergency alert', format: 'ALERT [STATION] [MESSAGE]' },
    { command: 'STATUS', description: 'Check station status', format: 'STATUS [STATION]' },
    { command: 'HELP', description: 'Get command help', format: 'HELP [COMMAND]' }
  ];

  const handleTestUSSD = () => {
    toast({
      title: 'USSD Test Initiated',
      description: 'Simulating USSD session flow...'
    });
  };

  const handleTestSMS = () => {
    toast({
      title: 'SMS Test Sent',
      description: 'Test message dispatched to gateway'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      pending: { variant: 'outline', icon: <Clock className="h-3 w-3" /> },
      processed: { variant: 'secondary', icon: <CheckCircle2 className="h-3 w-3" /> },
      verified: { variant: 'default', icon: <Shield className="h-3 w-3" /> },
      escalated: { variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> }
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">USSD/SMS Election Reporting</h2>
          <p className="text-muted-foreground">
            Offline-first election monitoring for low-connectivity regions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="test-mode" className="text-sm">Test Mode</Label>
            <Switch id="test-mode" checked={testMode} onCheckedChange={setTestMode} />
          </div>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="KE">Kenya</SelectItem>
              <SelectItem value="UG">Uganda</SelectItem>
              <SelectItem value="TZ">Tanzania</SelectItem>
              <SelectItem value="NG">Nigeria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeUSSDSessions}</p>
                <p className="text-xs text-muted-foreground">Active USSD Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.smsReceived.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">SMS Reports Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.escalatedIncidents}</p>
                <p className="text-xs text-muted-foreground">Auto-Escalated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Zap className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
                <p className="text-xs text-muted-foreground">Avg Processing Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ussd">USSD Sessions</TabsTrigger>
          <TabsTrigger value="sms">SMS Reports</TabsTrigger>
          <TabsTrigger value="shortcodes">Short Codes</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* USSD Flow Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  USSD Session Funnel
                </CardTitle>
                <CardDescription>Completion rates by stage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ussdFlow.map((stage, index) => (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{stage.label}</span>
                      <span className="text-muted-foreground">{stage.completion}%</span>
                    </div>
                    <Progress value={stage.completion} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language Distribution
                </CardTitle>
                <CardDescription>Multi-language support usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {languages.map(lang => (
                  <div key={lang.code} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-muted-foreground">{lang.percentage}%</span>
                    </div>
                    <Progress value={lang.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SMS Command Reference */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  SMS Command Reference
                </CardTitle>
                <CardDescription>Supported SMS reporting commands</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {smsCommands.map(cmd => (
                    <div key={cmd.command} className="p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono">{cmd.command}</Badge>
                        <span className="text-sm font-medium">{cmd.description}</span>
                      </div>
                      <code className="text-xs text-muted-foreground block bg-background/50 p-2 rounded mt-2">
                        {cmd.format}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ussd" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Active USSD Sessions</CardTitle>
                  <CardDescription>Real-time session monitoring</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleTestUSSD}>
                  <Radio className="h-4 w-4 mr-2" />
                  Test USSD Flow
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {sessions.map(session => (
                    <div key={session.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${session.isComplete ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                            <Smartphone className={`h-4 w-4 ${session.isComplete ? 'text-green-500' : 'text-blue-500'}`} />
                          </div>
                          <div>
                            <p className="font-medium">{session.phoneNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.carrier} • {session.country}
                            </p>
                          </div>
                        </div>
                        <Badge variant={session.isComplete ? 'default' : 'secondary'}>
                          {session.isComplete ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Session Code</p>
                          <p className="font-mono">{session.sessionCode}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Stage</p>
                          <p className="capitalize">{session.stage.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Language</p>
                          <p className="uppercase">{session.language}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p>{Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)}s</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">SMS Reports Queue</CardTitle>
                  <CardDescription>Parsed and processed SMS reports</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleTestSMS}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Test SMS
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {smsReports.map(report => (
                    <div key={report.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{report.phoneNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              Received {new Date(report.receivedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg mb-3">
                        <p className="font-mono text-sm">{report.message}</p>
                      </div>
                      {report.parsedData && (
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          {report.parsedData.stationCode && (
                            <div>
                              <p className="text-muted-foreground">Station</p>
                              <p className="font-mono">{report.parsedData.stationCode}</p>
                            </div>
                          )}
                          {report.parsedData.incidentType && (
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p>{report.parsedData.incidentType}</p>
                            </div>
                          )}
                          {report.parsedData.severity && (
                            <div>
                              <p className="text-muted-foreground">Severity</p>
                              <Badge variant={report.parsedData.severity === 'HIGH' ? 'destructive' : 'secondary'}>
                                {report.parsedData.severity}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcodes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Short Code Registry</CardTitle>
              <CardDescription>Registered USSD and SMS short codes by country and carrier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shortCodes.map((sc, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {sc.type === 'ussd' ? (
                          <Smartphone className="h-4 w-4 text-primary" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                        )}
                        <code className="font-bold">{sc.code}</code>
                      </div>
                      <Badge variant={sc.isActive ? 'default' : 'secondary'}>
                        {sc.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country</span>
                        <span className="font-medium">{sc.country}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carrier</span>
                        <span>{sc.carrier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline" className="uppercase text-xs">{sc.type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Messages</span>
                        <span className="font-medium">{sc.messageCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Processing Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Escalate Critical Incidents</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically escalate high-severity reports
                    </p>
                  </div>
                  <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>AI-Powered Parsing</Label>
                    <p className="text-xs text-muted-foreground">
                      Use NLP to extract data from unstructured messages
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Duplicate Detection</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically detect and merge duplicate reports
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Keyword Escalation</Label>
                    <p className="text-xs text-muted-foreground">
                      Trigger alerts on predefined keywords
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Allowed Phone Prefixes</Label>
                  <Input 
                    placeholder="+254, +255, +256, +234" 
                    defaultValue="+254, +255, +256, +234, +233"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated country codes
                  </p>
                </div>
                <div>
                  <Label>Rate Limit (per phone/hour)</Label>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    defaultValue="10"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Session Timeout (seconds)</Label>
                  <Input 
                    type="number" 
                    placeholder="180" 
                    defaultValue="180"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default USSDElectionReporting;
