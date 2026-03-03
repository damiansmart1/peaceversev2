import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, BarChart3, TrendingUp, Shield, RefreshCw, 
  CheckCircle2, XCircle, Eye, Zap 
} from 'lucide-react';
import { useElectionResults, usePollingStations, type Election } from '@/hooks/useElections';
import { useElectionAnomalies, useCreateAnomaly, useReviewAnomaly } from '@/hooks/useElectionAdvanced';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';

interface Props {
  election: Election;
}

// Benford's Law expected distribution for first digit
const BENFORD_EXPECTED = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];

function getBenfordDistribution(values: number[]): number[] {
  const counts = new Array(10).fill(0);
  let total = 0;
  values.forEach(v => {
    if (v > 0) {
      const firstDigit = parseInt(String(v).charAt(0));
      if (firstDigit >= 1 && firstDigit <= 9) {
        counts[firstDigit]++;
        total++;
      }
    }
  });
  return counts.map(c => total > 0 ? c / total : 0);
}

function chiSquaredTest(observed: number[], expected: number[], n: number): number {
  let chiSq = 0;
  for (let d = 1; d <= 9; d++) {
    const exp = expected[d] * n;
    if (exp > 0) {
      chiSq += Math.pow((observed[d] * n) - exp, 2) / exp;
    }
  }
  return chiSq;
}

export default function StatisticalAnomalyDetector({ election }: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { data: results } = useElectionResults(election.id);
  const { data: stations } = usePollingStations(election.id);
  const { data: anomalies, refetch: refetchAnomalies } = useElectionAnomalies(election.id);
  const createAnomaly = useCreateAnomaly();
  const reviewAnomaly = useReviewAnomaly();

  const stationsMap = useMemo(() => {
    const map = new Map<string, string>();
    stations?.forEach(s => map.set(s.id, s.station_name));
    return map;
  }, [stations]);

  // Calculate turnout data
  const turnoutData = useMemo(() => {
    if (!results) return [];
    return results.map((r: any) => ({
      station: stationsMap.get(r.polling_station_id) || r.polling_station_id?.slice(0, 8),
      turnout: r.total_registered > 0 ? (r.total_votes_cast / r.total_registered * 100) : 0,
      registered: r.total_registered,
      cast: r.total_votes_cast,
      rejected: r.rejected_votes,
      stationId: r.polling_station_id,
    }));
  }, [results, stationsMap]);

  const avgTurnout = useMemo(() => {
    if (!turnoutData.length) return 0;
    return turnoutData.reduce((sum: number, d: any) => sum + d.turnout, 0) / turnoutData.length;
  }, [turnoutData]);

  const stdDevTurnout = useMemo(() => {
    if (turnoutData.length < 2) return 0;
    const variance = turnoutData.reduce((sum: number, d: any) => sum + Math.pow(d.turnout - avgTurnout, 2), 0) / turnoutData.length;
    return Math.sqrt(variance);
  }, [turnoutData, avgTurnout]);

  // Benford's analysis on vote counts
  const benfordAnalysis = useMemo(() => {
    if (!results) return null;
    const voteCounts = results.map((r: any) => r.total_votes_cast).filter((v: number) => v > 0);
    if (voteCounts.length < 10) return null;
    const observed = getBenfordDistribution(voteCounts);
    const chiSq = chiSquaredTest(observed, BENFORD_EXPECTED, voteCounts.length);
    // Critical value for chi-squared with 8 df at p=0.05 is 15.507
    const isAnomalous = chiSq > 15.507;
    const chartData = Array.from({ length: 9 }, (_, i) => ({
      digit: i + 1,
      observed: +(observed[i + 1] * 100).toFixed(1),
      expected: +(BENFORD_EXPECTED[i + 1] * 100).toFixed(1),
    }));
    return { chartData, chiSquared: chiSq, isAnomalous, sampleSize: voteCounts.length };
  }, [results]);

  // Detect turnout spikes (>2 standard deviations)
  const turnoutAnomalies = useMemo(() => {
    if (stdDevTurnout === 0) return [];
    return turnoutData.filter((d: any) => Math.abs(d.turnout - avgTurnout) > 2 * stdDevTurnout);
  }, [turnoutData, avgTurnout, stdDevTurnout]);

  // Run full analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Create anomalies for turnout spikes
      for (const spike of turnoutAnomalies) {
        await createAnomaly.mutateAsync({
          election_id: election.id,
          polling_station_id: spike.stationId,
          anomaly_type: 'turnout_spike',
          severity: Math.abs(spike.turnout - avgTurnout) > 3 * stdDevTurnout ? 'critical' : 'high',
          description: `Turnout of ${spike.turnout.toFixed(1)}% deviates significantly from average ${avgTurnout.toFixed(1)}% (±${stdDevTurnout.toFixed(1)}%)`,
          statistical_data: { turnout: spike.turnout, average: avgTurnout, stdDev: stdDevTurnout, zScore: (spike.turnout - avgTurnout) / stdDevTurnout },
          confidence_score: Math.min(0.99, 0.95 + (Math.abs(spike.turnout - avgTurnout) / stdDevTurnout - 2) * 0.02),
        });
      }
      // Create anomaly for Benford's law violation
      if (benfordAnalysis?.isAnomalous) {
        await createAnomaly.mutateAsync({
          election_id: election.id,
          anomaly_type: 'benfords_law_violation',
          severity: benfordAnalysis.chiSquared > 26.125 ? 'critical' : 'high',
          description: `Vote count distribution fails Benford's Law test (χ²=${benfordAnalysis.chiSquared.toFixed(2)}, critical=15.51)`,
          statistical_data: { chiSquared: benfordAnalysis.chiSquared, sampleSize: benfordAnalysis.sampleSize, chartData: benfordAnalysis.chartData },
          confidence_score: Math.min(0.99, 1 - (15.507 / benfordAnalysis.chiSquared)),
        });
      }
      await refetchAnomalies();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-700 dark:text-red-300';
      case 'high': return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      default: return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Statistical Anomaly Detection
          </h3>
          <p className="text-sm text-muted-foreground">Benford's Law analysis, turnout spike detection, and fraud indicators</p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing || !results?.length}>
          {isAnalyzing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <BarChart3 className="h-4 w-4 mr-2" />}
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* Benford's Law Chart */}
      {benfordAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Benford's Law Analysis
              {benfordAnalysis.isAnomalous ? (
                <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 ml-2">⚠ Anomaly Detected</Badge>
              ) : (
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 ml-2">✓ Normal Distribution</Badge>
              )}
            </CardTitle>
            <CardDescription>
              First-digit distribution of vote counts vs expected Benford's distribution (n={benfordAnalysis.sampleSize}, χ²={benfordAnalysis.chiSquared.toFixed(2)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={benfordAnalysis.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="digit" label={{ value: 'First Digit', position: 'bottom' }} />
                <YAxis label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="expected" fill="hsl(var(--muted-foreground))" opacity={0.4} name="Expected (Benford)" />
                <Bar dataKey="observed" fill="hsl(var(--primary))" name="Observed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Turnout Distribution */}
      {turnoutData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Turnout Distribution Analysis
              {turnoutAnomalies.length > 0 && (
                <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 ml-2">
                  {turnoutAnomalies.length} spike(s) detected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Average turnout: {avgTurnout.toFixed(1)}% ± {stdDevTurnout.toFixed(1)}% | Stations flagged if &gt;2σ from mean
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={turnoutData.sort((a: any, b: any) => a.turnout - b.turnout)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="station" tick={false} />
                <YAxis domain={[0, 100]} label={{ value: 'Turnout %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <ReferenceLine y={avgTurnout} stroke="hsl(var(--primary))" strokeDasharray="5 5" label="Mean" />
                <ReferenceLine y={avgTurnout + 2 * stdDevTurnout} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label="+2σ" />
                <ReferenceLine y={Math.max(0, avgTurnout - 2 * stdDevTurnout)} stroke="hsl(var(--destructive))" strokeDasharray="3 3" label="-2σ" />
                <Line type="monotone" dataKey="turnout" stroke="hsl(var(--primary))" dot={{ r: 3 }} name="Turnout %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detected Anomalies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Detected Anomalies ({anomalies?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!anomalies?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No anomalies detected. Run analysis to scan for statistical irregularities.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anomalies?.map((anomaly) => (
                    <TableRow key={anomaly.id}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {anomaly.anomaly_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{anomaly.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={(anomaly.confidence_score || 0) * 100} className="w-16 h-2" />
                          <span className="text-xs">{((anomaly.confidence_score || 0) * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={anomaly.status === 'detected' ? 'destructive' : anomaly.status === 'confirmed' ? 'default' : 'secondary'}>
                          {anomaly.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {anomaly.status === 'detected' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => reviewAnomaly.mutate({ id: anomaly.id, status: 'confirmed' })}>
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => reviewAnomaly.mutate({ id: anomaly.id, status: 'dismissed' })}>
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* No data state */}
      {!results?.length && (
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No election results data available for analysis.</p>
          <p className="text-xs text-muted-foreground mt-1">Submit polling station results to enable statistical analysis.</p>
        </Card>
      )}
    </div>
  );
}
