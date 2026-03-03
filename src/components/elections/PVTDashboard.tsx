import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  PieChart, Target, TrendingUp, BarChart3, Shield, AlertTriangle 
} from 'lucide-react';
import { type Election, useElectionResults, usePollingStations } from '@/hooks/useElections';
import { usePVTSamples } from '@/hooks/useElectionAdvanced';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ErrorBar, Cell } from 'recharts';

interface Props {
  election: Election;
}

export default function PVTDashboard({ election }: Props) {
  const { data: results } = useElectionResults(election.id);
  const { data: stations } = usePollingStations(election.id);
  const { data: pvtSamples } = usePVTSamples(election.id);

  // Compute PVT projections from actual results
  const pvtProjection = useMemo(() => {
    if (!results || results.length < 3) return null;

    const totalRegistered = results.reduce((sum: number, r: any) => sum + r.total_registered, 0);
    const totalCast = results.reduce((sum: number, r: any) => sum + r.total_votes_cast, 0);
    const totalValid = results.reduce((sum: number, r: any) => sum + r.valid_votes, 0);
    const totalRejected = results.reduce((sum: number, r: any) => sum + r.rejected_votes, 0);
    
    const turnout = totalRegistered > 0 ? (totalCast / totalRegistered * 100) : 0;
    const rejectionRate = totalCast > 0 ? (totalRejected / totalCast * 100) : 0;

    // Aggregate candidate results from results_data
    const candidateTotals: Record<string, number> = {};
    results.forEach((r: any) => {
      const rd = r.results_data || {};
      Object.entries(rd).forEach(([key, val]) => {
        if (typeof val === 'number') {
          candidateTotals[key] = (candidateTotals[key] || 0) + val;
        }
      });
    });

    // Calculate margin of error (95% confidence)
    const n = results.length;
    const totalStations = stations?.length || n;
    const sampleRatio = n / totalStations;
    const marginOfError = sampleRatio >= 1 ? 0 : 1.96 * Math.sqrt(0.25 / n) * 100; // Simple proportion MoE

    const candidateData = Object.entries(candidateTotals).map(([name, votes]) => ({
      name: name.replace(/_/g, ' '),
      votes,
      percentage: totalValid > 0 ? (votes / totalValid * 100) : 0,
      marginOfError,
    })).sort((a, b) => b.votes - a.votes);

    return {
      totalRegistered,
      totalCast,
      totalValid,
      totalRejected,
      turnout,
      rejectionRate,
      candidateData,
      stationsReporting: n,
      totalStations,
      coverage: totalStations > 0 ? (n / totalStations * 100) : 0,
      marginOfError,
      confidenceLevel: 95,
    };
  }, [results, stations]);

  // Geo-fence compliance check
  const geofenceCompliance = useMemo(() => {
    if (!stations) return { compliant: 0, total: 0, percentage: 0 };
    const withGeofence = stations.filter((s: any) => s.geofence_radius_meters && s.geofence_radius_meters > 0);
    return {
      compliant: withGeofence.length,
      total: stations.length,
      percentage: stations.length > 0 ? (withGeofence.length / stations.length * 100) : 0,
    };
  }, [stations]);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Parallel Vote Tabulation (PVT) Dashboard
        </h3>
        <p className="text-sm text-muted-foreground">Statistical projection engine with confidence intervals</p>
      </div>

      {!pvtProjection ? (
        <Card className="p-8 text-center">
          <PieChart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">Insufficient data for PVT projection. Need at least 3 polling station results.</p>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xl font-bold">{pvtProjection.coverage.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Coverage ({pvtProjection.stationsReporting}/{pvtProjection.totalStations})</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xl font-bold">{pvtProjection.turnout.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Turnout</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xl font-bold">±{pvtProjection.marginOfError.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Margin of Error</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xl font-bold">{pvtProjection.rejectionRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Rejection Rate</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Candidate Projections Chart */}
          {pvtProjection.candidateData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Projected Results (95% Confidence Interval)</CardTitle>
                <CardDescription>
                  Based on {pvtProjection.stationsReporting} of {pvtProjection.totalStations} stations reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pvtProjection.candidateData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="percentage" name="Vote Share">
                      {pvtProjection.candidateData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Results Table */}
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate/Party</TableHead>
                      <TableHead className="text-right">Votes</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead className="text-right">Range (95% CI)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pvtProjection.candidateData.map((c, i) => (
                      <TableRow key={c.name}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            {c.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{c.votes.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold">{c.percentage.toFixed(1)}%</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {Math.max(0, c.percentage - pvtProjection.marginOfError).toFixed(1)}% — {Math.min(100, c.percentage + pvtProjection.marginOfError).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Geo-fence Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Geo-Fence Compliance
              </CardTitle>
              <CardDescription>Polling stations with geo-fence boundaries configured</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress value={geofenceCompliance.percentage} className="flex-1 h-3" />
                <span className="font-bold">{geofenceCompliance.percentage.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {geofenceCompliance.compliant} of {geofenceCompliance.total} stations have geo-fence boundaries.
                Results submitted outside boundaries will be flagged for review.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
