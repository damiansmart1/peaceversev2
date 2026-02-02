import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  FileText, 
  Search, 
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Download,
  Eye,
  PenLine
} from 'lucide-react';
import { 
  useElectionResults,
  usePollingStations,
  useSubmitElectionResult,
  type Election
} from '@/hooks/useElections';
import { format } from 'date-fns';

interface ElectionResultsPanelProps {
  electionId: string;
  election: Election;
}

export default function ElectionResultsPanel({ electionId, election }: ElectionResultsPanelProps) {
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [newResult, setNewResult] = useState({
    total_registered: 0,
    total_votes_cast: 0,
    valid_votes: 0,
    rejected_votes: 0,
    results_data: {} as Record<string, number>,
  });

  const { data: results, isLoading } = useElectionResults(electionId);
  const { data: stations } = usePollingStations(electionId);
  const submitResult = useSubmitElectionResult();

  const filteredResults = results?.filter((result: any) =>
    result.polling_stations?.station_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.polling_stations?.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitResult = async () => {
    const turnout = newResult.total_registered > 0 
      ? (newResult.total_votes_cast / newResult.total_registered) * 100 
      : 0;

    await submitResult.mutateAsync({
      election_id: electionId,
      polling_station_id: selectedStationId,
      ...newResult,
      turnout_percentage: parseFloat(turnout.toFixed(2)),
    });
    
    setShowSubmitDialog(false);
    setSelectedStationId('');
    setNewResult({
      total_registered: 0,
      total_votes_cast: 0,
      valid_votes: 0,
      rejected_votes: 0,
      results_data: {},
    });
  };

  const stats = {
    total: results?.length || 0,
    verified: results?.filter((r: any) => r.fully_verified).length || 0,
    contested: results?.filter((r: any) => r.contested).length || 0,
    pending: results?.filter((r: any) => !r.fully_verified && r.status !== 'contested').length || 0,
  };

  const candidates = election.candidates || [];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Results Submitted</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
          <p className="text-xs text-muted-foreground">Fully Verified</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending Verification</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xl font-bold text-red-600">{stats.contested}</p>
          <p className="text-xs text-muted-foreground">Contested</p>
        </Card>
      </div>

      {/* Verification Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Results Verification Progress</span>
            <span className="text-sm text-muted-foreground">
              {stats.verified} / {stations?.length || 0} stations
            </span>
          </div>
          <Progress 
            value={stations?.length ? (stats.verified / stations.length) * 100 : 0} 
            className="h-3"
          />
          {election.multi_signature_required && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Multi-signature verification required ({election.min_signatures_required} signatures)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Submit Result
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Submit Polling Station Result</DialogTitle>
                <DialogDescription>
                  Enter the official results from a polling station
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Polling Station *</Label>
                  <Select value={selectedStationId} onValueChange={setSelectedStationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select polling station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations?.map(station => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.station_code} - {station.station_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Registered Voters *</Label>
                    <Input
                      type="number"
                      value={newResult.total_registered}
                      onChange={(e) => setNewResult({ ...newResult, total_registered: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Total Votes Cast *</Label>
                    <Input
                      type="number"
                      value={newResult.total_votes_cast}
                      onChange={(e) => setNewResult({ ...newResult, total_votes_cast: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valid Votes *</Label>
                    <Input
                      type="number"
                      value={newResult.valid_votes}
                      onChange={(e) => setNewResult({ ...newResult, valid_votes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Rejected Votes *</Label>
                    <Input
                      type="number"
                      value={newResult.rejected_votes}
                      onChange={(e) => setNewResult({ ...newResult, rejected_votes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                {candidates.length > 0 && (
                  <div className="border-t pt-4">
                    <Label className="mb-3 block">Votes by Candidate</Label>
                    <div className="space-y-2">
                      {candidates.map((candidate: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="flex-1 text-sm">{candidate.name}</span>
                          <Input
                            type="number"
                            className="w-24"
                            value={newResult.results_data[candidate.id] || 0}
                            onChange={(e) => setNewResult({
                              ...newResult,
                              results_data: {
                                ...newResult.results_data,
                                [candidate.id]: parseInt(e.target.value) || 0
                              }
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newResult.total_registered > 0 && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium">Calculated Turnout</p>
                    <p className="text-2xl font-bold">
                      {((newResult.total_votes_cast / newResult.total_registered) * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleSubmitResult}
                  disabled={!selectedStationId || !newResult.total_registered || submitResult.isPending}
                >
                  {submitResult.isPending ? 'Submitting...' : 'Submit Result'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredResults?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No results submitted yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowSubmitDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit First Result
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Votes Cast</TableHead>
                    <TableHead>Turnout</TableHead>
                    <TableHead>Signatures</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults?.map((result: any) => (
                    <TableRow key={result.id} className={result.contested ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell className="font-medium">
                        {result.polling_stations?.station_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {result.polling_stations?.region || '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{result.total_votes_cast.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            Valid: {result.valid_votes.toLocaleString()} | Rejected: {result.rejected_votes.toLocaleString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={result.turnout_percentage || 0} className="w-16 h-2" />
                          <span className="text-sm">{result.turnout_percentage?.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <PenLine className="h-4 w-4" />
                          <span>{result.signature_count || 0}/{election.min_signatures_required}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.fully_verified ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : result.contested ? (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Contested
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(result.submitted_at), 'MMM dd, HH:mm')}
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
