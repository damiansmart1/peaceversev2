import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Activity, 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  Clock,
  Globe,
  Map,
  MessageSquare,
  Phone,
  Radio,
  RefreshCw,
  Send,
  Shield,
  Users,
  Wifi,
  WifiOff,
  Zap,
  Eye,
  Settings,
  Volume2,
  MapPin,
  TrendingUp,
  AlertCircle,
  PhoneCall,
  Headphones,
  Terminal,
  Layers,
  Target,
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  location: string;
  timestamp: string;
  acknowledged: boolean;
  assignedTo?: string;
}

interface Observer {
  id: string;
  name: string;
  station: string;
  status: 'online' | 'offline' | 'busy' | 'emergency';
  lastSeen: string;
  batteryLevel: number;
  reportsSubmitted: number;
}

interface Broadcast {
  id: string;
  message: string;
  channel: 'all' | 'observers' | 'partners' | 'government';
  sentAt: string;
  deliveredCount: number;
  totalRecipients: number;
}

// Mock data
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Violence Reported',
    message: 'Physical altercation at polling station entrance. Security forces requested.',
    location: 'PS-001 Nairobi Central',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    acknowledged: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Equipment Failure',
    message: 'Biometric verification device not functioning. Manual backup activated.',
    location: 'PS-045 Mombasa Harbor',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    acknowledged: true,
    assignedTo: 'Tech Support Team',
  },
  {
    id: '3',
    type: 'info',
    title: 'High Turnout Notice',
    message: 'Queue exceeds 200 voters. Additional staff deployment recommended.',
    location: 'PS-023 Kisumu Lake',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    acknowledged: true,
  },
];

const MOCK_OBSERVERS: Observer[] = [
  { id: '1', name: 'John K.', station: 'PS-001', status: 'online', lastSeen: new Date().toISOString(), batteryLevel: 85, reportsSubmitted: 12 },
  { id: '2', name: 'Sarah M.', station: 'PS-023', status: 'busy', lastSeen: new Date().toISOString(), batteryLevel: 45, reportsSubmitted: 8 },
  { id: '3', name: 'David O.', station: 'PS-045', status: 'emergency', lastSeen: new Date(Date.now() - 300000).toISOString(), batteryLevel: 12, reportsSubmitted: 15 },
  { id: '4', name: 'Grace W.', station: 'PS-067', status: 'offline', lastSeen: new Date(Date.now() - 1800000).toISOString(), batteryLevel: 0, reportsSubmitted: 6 },
];

const ALERT_COLORS = {
  critical: 'border-l-red-500 bg-red-500/5',
  warning: 'border-l-amber-500 bg-amber-500/5',
  info: 'border-l-blue-500 bg-blue-500/5',
};

const STATUS_COLORS = {
  online: 'bg-green-500',
  busy: 'bg-amber-500',
  emergency: 'bg-red-500 animate-pulse',
  offline: 'bg-muted-foreground',
};

export default function ElectionCommandCenter() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [observers, setObservers] = useState<Observer[]>(MOCK_OBSERVERS);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [activeTab, setActiveTab] = useState('situation');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newBroadcast, setNewBroadcast] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState<'all' | 'observers' | 'partners' | 'government'>('all');
  const [isLive, setIsLive] = useState(true);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      // Randomly update observer statuses
      setObservers(prev => prev.map(obs => ({
        ...obs,
        lastSeen: obs.status === 'online' || obs.status === 'busy' ? new Date().toISOString() : obs.lastSeen,
        batteryLevel: Math.max(0, obs.batteryLevel - (obs.status === 'offline' ? 0 : Math.random() * 2)),
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true, assignedTo: 'Current User' } : a
    ));
    toast.success('Alert acknowledged');
  };

  const handleSendBroadcast = () => {
    if (!newBroadcast.trim()) return;
    
    const broadcast: Broadcast = {
      id: Date.now().toString(),
      message: newBroadcast,
      channel: broadcastChannel,
      sentAt: new Date().toISOString(),
      deliveredCount: 0,
      totalRecipients: broadcastChannel === 'all' ? 150 : broadcastChannel === 'observers' ? 80 : 35,
    };
    
    setBroadcasts(prev => [broadcast, ...prev]);
    setNewBroadcast('');
    toast.success('Broadcast sent successfully');
    
    // Simulate delivery progress
    setTimeout(() => {
      setBroadcasts(prev => prev.map(b => 
        b.id === broadcast.id ? { ...b, deliveredCount: Math.floor(b.totalRecipients * 0.95) } : b
      ));
    }, 2000);
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;
  const onlineObservers = observers.filter(o => o.status === 'online' || o.status === 'busy').length;
  const emergencyObservers = observers.filter(o => o.status === 'emergency').length;

  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Target className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Election Command Center</h2>
            <p className="text-sm text-muted-foreground">Real-time situational awareness & coordination</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Live Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isLive ? 'bg-green-500/20' : 'bg-muted'}`}>
            <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-sm font-medium">{isLive ? 'LIVE' : 'Paused'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            <Volume2 className={`h-4 w-4 ${soundEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          
          <Button variant="outline" size="sm" onClick={() => setIsLive(!isLive)}>
            {isLive ? <Eye className="h-4 w-4 mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalCount > 0 && (
        <Alert variant="destructive" className="border-2 animate-pulse">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical Alerts Require Attention</AlertTitle>
          <AlertDescription>
            {criticalCount} critical alert(s) need immediate acknowledgment
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className={criticalCount > 0 ? 'border-red-500' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{unacknowledgedCount}</p>
              </div>
              <Bell className={`h-6 w-6 ${criticalCount > 0 ? 'text-red-500 animate-bounce' : 'text-amber-500'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Observers Online</p>
                <p className="text-2xl font-bold text-green-600">{onlineObservers}/{observers.length}</p>
              </div>
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        {emergencyObservers > 0 && (
          <Card className="border-red-500 bg-red-500/5">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Emergency</p>
                  <p className="text-2xl font-bold text-red-600">{emergencyObservers}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-500 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Stations Active</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <MapPin className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Reports Today</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Broadcasts Sent</p>
                <p className="text-2xl font-bold">{broadcasts.length}</p>
              </div>
              <Radio className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="situation" className="gap-2">
            <Activity className="h-4 w-4" />
            Situation Room
          </TabsTrigger>
          <TabsTrigger value="observers" className="gap-2">
            <Users className="h-4 w-4" />
            Observer Tracking
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="gap-2">
            <Radio className="h-4 w-4" />
            Broadcast Center
          </TabsTrigger>
          <TabsTrigger value="comms" className="gap-2">
            <Headphones className="h-4 w-4" />
            Communications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="situation" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Alert Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Alert Feed
                  </span>
                  <Badge variant={unacknowledgedCount > 0 ? 'destructive' : 'secondary'}>
                    {unacknowledgedCount} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div 
                        key={alert.id} 
                        className={`p-3 border-l-4 rounded-lg ${ALERT_COLORS[alert.type]} ${!alert.acknowledged ? 'ring-2 ring-primary/50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={alert.type === 'critical' ? 'destructive' : alert.type === 'warning' ? 'default' : 'secondary'}>
                                {alert.type.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium">{alert.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alert.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          {!alert.acknowledged ? (
                            <Button size="sm" onClick={() => handleAcknowledge(alert.id)}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              ✓ {alert.assignedTo}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Live Map Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Live Incident Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <div className="text-center">
                    <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Interactive Map</p>
                    <p className="text-xs text-muted-foreground">Real-time incident visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="observers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Observer Status Board
                </span>
                <div className="flex gap-2">
                  {emergencyObservers > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {emergencyObservers} Emergency
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {onlineObservers} Online
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {observers.map(obs => (
                    <Card key={obs.id} className={obs.status === 'emergency' ? 'border-red-500 bg-red-500/5' : ''}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[obs.status]}`} />
                            <span className="font-medium">{obs.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{obs.station}</Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge className={obs.status === 'emergency' ? 'bg-red-500' : obs.status === 'online' ? 'bg-green-500' : ''}>
                              {obs.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Seen</span>
                            <span>{new Date(obs.lastSeen).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Battery</span>
                            <div className="flex items-center gap-2">
                              <Progress value={obs.batteryLevel} className="w-16 h-2" />
                              <span className={obs.batteryLevel < 20 ? 'text-red-500' : ''}>{Math.round(obs.batteryLevel)}%</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reports</span>
                            <span>{obs.reportsSubmitted}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                            toast.success(`Message channel opened for ${obs.name}`, { description: `Station: ${obs.station}` });
                          }}>
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            toast.success(`Calling ${obs.name}...`, { description: 'Initiating secure voice connection' });
                          }}>
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Send Broadcast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Broadcast
                </CardTitle>
                <CardDescription>
                  Send urgent communications to field personnel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Channel</Label>
                  <Select value={broadcastChannel} onValueChange={(v: any) => setBroadcastChannel(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Personnel (150)</SelectItem>
                      <SelectItem value="observers">Observers Only (80)</SelectItem>
                      <SelectItem value="partners">Partners (35)</SelectItem>
                      <SelectItem value="government">Government (35)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Message</Label>
                  <textarea 
                    className="w-full min-h-[120px] p-3 border rounded-md bg-background"
                    placeholder="Enter broadcast message..."
                    value={newBroadcast}
                    onChange={(e) => setNewBroadcast(e.target.value)}
                  />
                </div>
                
                <Button className="w-full" onClick={handleSendBroadcast} disabled={!newBroadcast.trim()}>
                  <Radio className="h-4 w-4 mr-2" />
                  Send Broadcast
                </Button>
              </CardContent>
            </Card>

            {/* Broadcast History */}
            <Card>
              <CardHeader>
                <CardTitle>Broadcast History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {broadcasts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No broadcasts sent yet</p>
                      </div>
                    ) : broadcasts.map(b => (
                      <div key={b.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{b.channel}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(b.sentAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{b.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={(b.deliveredCount / b.totalRecipients) * 100} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {b.deliveredCount}/{b.totalRecipients}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Communication Channels
              </CardTitle>
              <CardDescription>
                Integrated voice, SMS, and data communication hub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <PhoneCall className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-medium mb-2">Voice Hotline</h3>
                    <p className="text-sm text-muted-foreground mb-4">24/7 emergency voice support</p>
                    <Button className="w-full" onClick={() => {
                      toast.success('Emergency Hotline Active', { description: 'Secure voice channel initialized. Connecting to coordination center...' });
                    }}>
                      <Phone className="h-4 w-4 mr-2" />
                      Open Hotline
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-medium mb-2">SMS Gateway</h3>
                    <p className="text-sm text-muted-foreground mb-4">Bulk SMS & USSD management</p>
                    <Button variant="outline" className="w-full" onClick={() => {
                      toast.success('SMS Console Ready', { description: 'Connected to gateway. 28 carriers active across 12 countries.' });
                    }}>
                      <Terminal className="h-4 w-4 mr-2" />
                      SMS Console
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-dashed">
                  <CardContent className="pt-6 text-center">
                    <Layers className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                    <h3 className="font-medium mb-2">Data Sync</h3>
                    <p className="text-sm text-muted-foreground mb-4">Offline data synchronization</p>
                    <Button variant="outline" className="w-full" onClick={() => {
                      toast.success('Sync Complete', { description: 'All offline data synchronized. 0 pending items.' });
                    }}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Status
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
