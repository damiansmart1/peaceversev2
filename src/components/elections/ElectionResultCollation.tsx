import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  MapPin,
  Users,
  Vote,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useElectionResults, usePollingStations, type Election } from '@/hooks/useElections';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ElectionResultCollationProps {
  election: Election;
}

const REGION_COLORS = [
  'hsl(var(--primary))',
  '#22c55e',
  '#f97316',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#eab308',
  '#ef4444',
];

export default function ElectionResultCollation({ election }: ElectionResultCollationProps) {
  const { data: results } = useElectionResults(election.id);
  const { data: stations } = usePollingStations(election.id);

  const collation = useMemo(() => {
    if (!results || !stations) return null;

    const totalRegistered = stations.reduce((sum, s) => sum + s.registered_voters, 0);
    const totalVotesCast = results.reduce((sum, r: any) => sum + (r.total_votes_cast || 0), 0);
    const totalValid = results.reduce((sum, r: any) => sum + (r.valid_votes || 0), 0);
    const totalRejected = results.reduce((sum, r: any) => sum + (r.rejected_votes || 0), 0);
    const turnout = totalRegistered > 0 ? (totalVotesCast / totalRegistered) * 100 : 0;
    const stationsReported = results.length;
    const coveragePercent = stations.length > 0 ? (stationsReported / stations.length) * 100 : 0;

    // Regional breakdown
    const regionMap = new Map<string, { registered: number; cast: number; valid: number; rejected: number; stations: number; reported: number }>();
    
    stations.forEach(s => {
      const region = s.region || 'Unknown';
      const existing = regionMap.get(region) || { registered: 0, cast: 0, valid: 0, rejected: 0, stations: 0, reported: 0 };
      existing.registered += s.registered_voters;
      existing.stations += 1;
      regionMap.set(region, existing);
    });

    results.forEach((r: any) => {
      const station = stations.find(s => s.id === r.polling_station_id);
      const region = station?.region || 'Unknown';
      const existing = regionMap.get(region) || { registered: 0, cast: 0, valid: 0, rejected: 0, stations: 0, reported: 0 };
      existing.cast += r.total_votes_cast || 0;
      existing.valid += r.valid_votes || 0;
      existing.rejected += r.rejected_votes || 0;
      existing.reported += 1;
      regionMap.set(region, existing);
    });

    const regionalData = Array.from(regionMap.entries()).map(([region, data]) => ({
      region,
      ...data,
      turnout: data.registered > 0 ? ((data.cast / data.registered) * 100).toFixed(1) : '0',
      coverage: data.stations > 0 ? ((data.reported / data.stations) * 100).toFixed(0) : '0',
    }));

    // Candidate aggregation from results_data
    const candidateMap = new Map<string, number>();
    results.forEach((r: any) => {
      if (r.results_data && typeof r.results_data === 'object') {
        Object.entries(r.results_data).forEach(([candidate, votes]) => {
          if (typeof votes === 'number') {
            candidateMap.set(candidate, (candidateMap.get(candidate) || 0) + votes);
          }
        });
      }
    });

    const candidateData = Array.from(candidateMap.entries())
      .map(([name, votes]) => ({ name, votes }))
      .sort((a, b) => b.votes - a.votes);

    return {
      totalRegistered,
      totalVotesCast,
      totalValid,
      totalRejected,
      turnout,
      stationsReported,
      totalStations: stations.length,
      coveragePercent,
      verifiedResults: results.filter((r: any) => r.fully_verified).length,
      contestedResults: results.filter((r: any) => r.contested).length,
      regionalData,
      candidateData,
    };
  }, [results, stations]);

  if (!collation) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No Results Data</h3>
        <p className="text-muted-foreground">Result collation will appear as stations submit results</p>
      </Card>
    );
  }

  const voteBreakdownData = [
    { name: 'Valid Votes', value: collation.totalValid, color: '#22c55e' },
    { name: 'Rejected', value: collation.totalRejected, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">Turnout</span>
          </div>
          <p className="text-3xl font-bold">{collation.turnout.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">{collation.totalVotesCast.toLocaleString()} of {collation.totalRegistered.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span className="text-xs text-muted-foreground">Coverage</span>
          </div>
          <p className="text-3xl font-bold">{collation.coveragePercent.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">{collation.stationsReported} / {collation.totalStations} stations</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-xs text-muted-foreground">Verified</span>
          </div>
          <p className="text-3xl font-bold">{collation.verifiedResults}</p>
          <p className="text-xs text-muted-foreground">of {collation.stationsReported} reported</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-xs text-muted-foreground">Contested</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{collation.contestedResults}</p>
          <p className="text-xs text-muted-foreground">results flagged</p>
        </Card>
      </div>

      {/* Coverage Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Results Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Stations Reporting</span>
            <span>{collation.stationsReported} / {collation.totalStations}</span>
          </div>
          <Progress value={collation.coveragePercent} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Vote Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Vote Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={voteBreakdownData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value.toLocaleString()}`}>
                    {voteBreakdownData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Candidate Results */}
        {collation.candidateData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Candidate Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collation.candidateData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => v.toLocaleString()} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                      {collation.candidateData.map((_, idx) => (
                        <Cell key={idx} fill={REGION_COLORS[idx % REGION_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Regional Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Regional Collation
          </CardTitle>
          <CardDescription>Results breakdown by administrative region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Region</th>
                  <th className="text-right py-2">Registered</th>
                  <th className="text-right py-2">Votes Cast</th>
                  <th className="text-right py-2">Valid</th>
                  <th className="text-right py-2">Rejected</th>
                  <th className="text-right py-2">Turnout</th>
                  <th className="text-right py-2">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {collation.regionalData.map((region, idx) => (
                  <tr key={region.region} className="border-b hover:bg-muted/50">
                    <td className="py-2 font-medium">{region.region}</td>
                    <td className="text-right">{region.registered.toLocaleString()}</td>
                    <td className="text-right">{region.cast.toLocaleString()}</td>
                    <td className="text-right text-green-600">{region.valid.toLocaleString()}</td>
                    <td className="text-right text-red-600">{region.rejected.toLocaleString()}</td>
                    <td className="text-right">
                      <Badge variant="outline">{region.turnout}%</Badge>
                    </td>
                    <td className="text-right">
                      <Badge variant={Number(region.coverage) === 100 ? 'default' : 'secondary'}>
                        {region.coverage}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2">
                  <td className="py-2">TOTAL</td>
                  <td className="text-right">{collation.totalRegistered.toLocaleString()}</td>
                  <td className="text-right">{collation.totalVotesCast.toLocaleString()}</td>
                  <td className="text-right text-green-600">{collation.totalValid.toLocaleString()}</td>
                  <td className="text-right text-red-600">{collation.totalRejected.toLocaleString()}</td>
                  <td className="text-right">{collation.turnout.toFixed(1)}%</td>
                  <td className="text-right">{collation.coveragePercent.toFixed(0)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
