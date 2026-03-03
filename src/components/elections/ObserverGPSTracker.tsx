import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, Clock, CheckCircle2, Users, Navigation, LogIn, LogOut, Radio 
} from 'lucide-react';
import { type Election, useElectionObservers } from '@/hooks/useElections';
import { useObserverCheckIns } from '@/hooks/useElectionAdvanced';
import { format } from 'date-fns';

interface Props {
  election: Election;
}

export default function ObserverGPSTracker({ election }: Props) {
  const { data: observers } = useElectionObservers(election.id);
  const { data: checkIns } = useObserverCheckIns(election.id);

  // Gender-disaggregated stats
  const genderStats = useMemo(() => {
    if (!observers) return { male: 0, female: 0, other: 0, unspecified: 0 };
    return {
      male: observers.filter((o: any) => o.gender === 'male').length,
      female: observers.filter((o: any) => o.gender === 'female').length,
      other: observers.filter((o: any) => o.gender === 'other').length,
      unspecified: observers.filter((o: any) => !o.gender).length,
    };
  }, [observers]);

  const totalObservers = observers?.length || 0;
  const genderParity = totalObservers > 0 ? Math.min(genderStats.male, genderStats.female) / Math.max(genderStats.male || 1, genderStats.female || 1) * 100 : 0;

  // Check-in analytics
  const checkInAnalytics = useMemo(() => {
    if (!checkIns) return { totalCheckIns: 0, checkInCount: 0, checkOutCount: 0, activeObservers: 0 };
    const checkedIn = new Set<string>();
    const checkedOut = new Set<string>();
    checkIns.forEach((ci: any) => {
      if (ci.check_type === 'check_in') checkedIn.add(ci.observer_id);
      if (ci.check_type === 'check_out') checkedOut.add(ci.observer_id);
    });
    const activeObservers = [...checkedIn].filter(id => !checkedOut.has(id)).length;
    return {
      totalCheckIns: checkIns.length,
      checkInCount: checkIns.filter((c: any) => c.check_type === 'check_in').length,
      checkOutCount: checkIns.filter((c: any) => c.check_type === 'check_out').length,
      activeObservers,
    };
  }, [checkIns]);

  // Role distribution
  const roleDistribution = useMemo(() => {
    if (!observers) return {};
    const dist: Record<string, number> = {};
    observers.forEach((o: any) => {
      const role = o.observer_role?.replace(/_/g, ' ') || 'unassigned';
      dist[role] = (dist[role] || 0) + 1;
    });
    return dist;
  }, [observers]);

  const getCheckTypeIcon = (type: string) => {
    switch (type) {
      case 'check_in': return <LogIn className="h-3 w-3 text-green-500" />;
      case 'check_out': return <LogOut className="h-3 w-3 text-red-500" />;
      case 'periodic': return <Radio className="h-3 w-3 text-blue-500" />;
      default: return <MapPin className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Navigation className="h-5 w-5 text-primary" />
          Observer GPS Tracking & Gender Analytics
        </h3>
        <p className="text-sm text-muted-foreground">Real-time deployment monitoring and gender-disaggregated data</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xl font-bold">{totalObservers}</p>
              <p className="text-xs text-muted-foreground">Total Observers</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xl font-bold">{checkInAnalytics.activeObservers}</p>
              <p className="text-xs text-muted-foreground">Currently Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xl font-bold">{checkInAnalytics.totalCheckIns}</p>
              <p className="text-xs text-muted-foreground">Total Check-ins</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xl font-bold">{genderParity.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Gender Parity</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gender Disaggregation */}
      <Card>
        <CardHeader>
          <CardTitle>Gender-Disaggregated Observer Deployment</CardTitle>
          <CardDescription>AU African Charter on Democracy compliance metric</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Male', count: genderStats.male, color: 'bg-blue-500' },
              { label: 'Female', count: genderStats.female, color: 'bg-pink-500' },
              { label: 'Other', count: genderStats.other, color: 'bg-purple-500' },
              { label: 'Unspecified', count: genderStats.unspecified, color: 'bg-muted' },
            ].map(g => (
              <div key={g.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${g.color}`} />
                  <span className="text-sm font-medium">{g.label}</span>
                </div>
                <p className="text-2xl font-bold">{g.count}</p>
                <p className="text-xs text-muted-foreground">
                  {totalObservers > 0 ? ((g.count / totalObservers) * 100).toFixed(1) : 0}%
                </p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Gender Parity Index</span>
              <span className={genderParity >= 40 ? 'text-green-600' : 'text-orange-600'}>
                {genderParity.toFixed(0)}%
              </span>
            </div>
            <Progress value={genderParity} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {genderParity >= 40 ? '✓ Meets AU minimum 40% gender threshold' : '⚠ Below AU minimum 40% gender threshold'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Observer Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(roleDistribution).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm capitalize">{role}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Check-ins ({checkIns?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!checkIns?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No check-ins recorded yet.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Observer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkIns.slice(0, 50).map((ci) => (
                    <TableRow key={ci.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getCheckTypeIcon(ci.check_type)}
                          <span className="text-xs capitalize">{ci.check_type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{ci.observer_id?.slice(0, 8)}...</TableCell>
                      <TableCell className="text-xs">
                        {ci.latitude?.toFixed(4)}, {ci.longitude?.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {ci.accuracy_meters ? `±${ci.accuracy_meters.toFixed(0)}m` : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {ci.checked_at ? format(new Date(ci.checked_at), 'HH:mm:ss') : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
