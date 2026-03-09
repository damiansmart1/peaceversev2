import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Radio, 
  Activity, 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Zap,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Maximize2,
  Bell,
  BellOff
} from 'lucide-react';

interface LiveResult {
  id: string;
  stationCode: string;
  stationName: string;
  region: string;
  results: {
    candidate: string;
    party: string;
    votes: number;
    percentage: number;
    color: string;
  }[];
  totalVotes: number;
  registeredVoters: number;
  turnout: number;
  reportedAt: string;
  verificationStatus: 'pending' | 'verified' | 'disputed';
}

interface StreamEvent {
  id: string;
  type: 'result' | 'incident' | 'verification' | 'alert';
  message: string;
  timestamp: string;
  stationCode?: string;
  severity?: 'info' | 'warning' | 'critical';
}

interface AggregatedResult {
  candidate: string;
  party: string;
  votes: number;
  percentage: number;
  color: string;
  stationsReporting: number;
}

const RealTimeResultsStream: React.FC = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulated real-time data
  const [aggregatedResults, setAggregatedResults] = useState<AggregatedResult[]>([
    { candidate: 'John Mukasa', party: 'Democratic Alliance', votes: 2847392, percentage: 48.2, color: '#3b82f6', stationsReporting: 8234 },
    { candidate: 'Sarah Ochieng', party: 'Progressive Movement', votes: 2156847, percentage: 36.5, color: '#22c55e', stationsReporting: 8234 },
    { candidate: 'Peter Kamau', party: 'Unity Front', votes: 623451, percentage: 10.6, color: '#f59e0b', stationsReporting: 8234 },
    { candidate: 'Others', party: 'Independent', votes: 278430, percentage: 4.7, color: '#6b7280', stationsReporting: 8234 }
  ]);

  const [liveResults] = useState<LiveResult[]>([
    {
      id: '1',
      stationCode: 'PS-NAI-001',
      stationName: 'Kibera Primary School',
      region: 'Nairobi',
      results: [
        { candidate: 'John Mukasa', party: 'DA', votes: 456, percentage: 52.1, color: '#3b82f6' },
        { candidate: 'Sarah Ochieng', party: 'PM', votes: 312, percentage: 35.6, color: '#22c55e' },
        { candidate: 'Peter Kamau', party: 'UF', votes: 108, percentage: 12.3, color: '#f59e0b' }
      ],
      totalVotes: 876,
      registeredVoters: 1200,
      turnout: 73,
      reportedAt: new Date(Date.now() - 30000).toISOString(),
      verificationStatus: 'verified'
    },
    {
      id: '2',
      stationCode: 'PS-MOM-023',
      stationName: 'Mombasa Central Hall',
      region: 'Coast',
      results: [
        { candidate: 'Sarah Ochieng', party: 'PM', votes: 534, percentage: 48.7, color: '#22c55e' },
        { candidate: 'John Mukasa', party: 'DA', votes: 423, percentage: 38.6, color: '#3b82f6' },
        { candidate: 'Peter Kamau', party: 'UF', votes: 139, percentage: 12.7, color: '#f59e0b' }
      ],
      totalVotes: 1096,
      registeredVoters: 1450,
      turnout: 75.6,
      reportedAt: new Date(Date.now() - 60000).toISOString(),
      verificationStatus: 'pending'
    }
  ]);

  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([
    {
      id: '1',
      type: 'result',
      message: 'New results from PS-NAI-001 (Kibera Primary School)',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      stationCode: 'PS-NAI-001'
    },
    {
      id: '2',
      type: 'verification',
      message: 'Results verified for PS-KIS-045 (Kisumu County Hall)',
      timestamp: new Date(Date.now() - 45000).toISOString(),
      stationCode: 'PS-KIS-045'
    },
    {
      id: '3',
      type: 'alert',
      message: 'High turnout anomaly detected in Western Region',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      severity: 'warning'
    }
  ]);

  const stats = {
    totalStations: 12450,
    stationsReporting: 8234,
    reportingPercentage: 66.1,
    totalVotesCast: 5906120,
    estimatedTurnout: 68.4,
    verifiedResults: 7892,
    pendingVerification: 342,
    disputedResults: 12
  };

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In production, this would be Supabase realtime subscription
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'result':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'verification':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'incident':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'alert':
        return <Bell className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getVerificationBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      verified: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      disputed: { variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> }
    };
    const c = config[status] || config.pending;
    return (
      <Badge variant={c.variant} className="gap-1">
        {c.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Radio className="h-6 w-6" />
            Real-Time Results Stream
            {isLive && (
              <Badge variant="destructive" className="animate-pulse ml-2">
                LIVE
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Live election results with WebSocket updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            {isConnected ? (
              <Badge variant="outline" className="gap-1 text-green-500 border-green-500">
                <Wifi className="h-3 w-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-red-500 border-red-500">
                <WifiOff className="h-3 w-3" />
                Disconnected
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={isLive ? 'destructive' : 'default'}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pause' : 'Resume'} Stream
          </Button>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="nairobi">Nairobi</SelectItem>
              <SelectItem value="coast">Coast</SelectItem>
              <SelectItem value="western">Western</SelectItem>
              <SelectItem value="central">Central</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.reportingPercentage}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.stationsReporting.toLocaleString()} / {stats.totalStations.toLocaleString()} Stations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalVotesCast.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Votes Cast</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.estimatedTurnout}%</p>
                <p className="text-xs text-muted-foreground">Est. Turnout</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verifiedResults.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Verified Results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Results Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Aggregated Results</CardTitle>
                <CardDescription>
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const el = document.documentElement;
                  if (!document.fullscreenElement) {
                    el.requestFullscreen?.().catch(() => {
                      toast({ title: 'Fullscreen not available', description: 'Your browser may not support fullscreen mode' });
                    });
                  } else {
                    document.exitFullscreen?.();
                  }
                }}>
                  <Maximize2 className="h-4 w-4 mr-1" />
                  Fullscreen
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const csvRows = [
                    ['Candidate', 'Party', 'Votes', 'Percentage', 'Stations Reporting'].join(','),
                    ...aggregatedResults.map(r => [r.candidate, r.party, r.votes, r.percentage.toFixed(1), r.stationsReporting].join(','))
                  ];
                  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `election-results-live-${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast({ title: 'Results exported', description: 'CSV file downloaded successfully' });
                }}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {aggregatedResults.map((result, index) => (
                <div key={result.candidate} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: result.color }}
                      />
                      <div>
                        <p className="font-medium">{result.candidate}</p>
                        <p className="text-xs text-muted-foreground">{result.party}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{result.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">
                        {result.votes.toLocaleString()} votes
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={result.percentage} 
                      className="h-8"
                      style={{ 
                        '--progress-background': result.color 
                      } as React.CSSProperties}
                    />
                    {index === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Badge variant="secondary" className="bg-background/80">
                          Leading
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Summary Stats */}
              <div className="pt-4 border-t grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-green-500">{stats.verifiedResults.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-500">{stats.pendingVerification}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-500">{stats.disputedResults}</p>
                  <p className="text-xs text-muted-foreground">Disputed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Event Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Stream
              {isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </CardTitle>
            <CardDescription>Real-time updates from polling stations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {streamEvents.map(event => (
                  <div key={event.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-2">
                      {getEventIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{event.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Station Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Station Results</CardTitle>
          <CardDescription>Latest results from individual polling stations</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {liveResults.map(result => (
                <div key={result.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{result.stationName}</p>
                        <Badge variant="outline" className="font-mono text-xs">
                          {result.stationCode}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.region} • Reported {new Date(result.reportedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {result.turnout.toFixed(1)}% Turnout
                      </Badge>
                      {getVerificationBadge(result.verificationStatus)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {result.results.map(r => (
                      <div key={r.candidate} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: r.color }}
                        />
                        <span className="text-sm flex-1">{r.candidate} ({r.party})</span>
                        <span className="text-sm font-medium">{r.votes.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground w-16 text-right">
                          {r.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeResultsStream;
