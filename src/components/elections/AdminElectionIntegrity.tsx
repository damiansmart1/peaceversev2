import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Shield, BarChart3, ClipboardCheck, Target, Navigation, AlertTriangle,
  CheckCircle2, XCircle, Eye
} from 'lucide-react';
import { useElections, type Election } from '@/hooks/useElections';
import { useElectionAnomalies, useReviewAnomaly, useObservationChecklists, useObserverCheckIns, usePVTSamples } from '@/hooks/useElectionAdvanced';
import { format } from 'date-fns';

export default function AdminElectionIntegrity() {
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('anomalies');
  const { data: elections } = useElections();
  const { data: anomalies } = useElectionAnomalies(selectedElectionId || undefined);
  const { data: checklists } = useObservationChecklists(selectedElectionId || undefined);
  const { data: checkIns } = useObserverCheckIns(selectedElectionId || undefined);
  const { data: pvtSamples } = usePVTSamples(selectedElectionId || undefined);
  const reviewAnomaly = useReviewAnomaly();

  const pendingAnomalies = anomalies?.filter(a => a.status === 'detected') || [];
  const confirmedAnomalies = anomalies?.filter(a => a.status === 'confirmed') || [];

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Election Integrity & Advanced Analytics
          </h2>
          <p className="text-sm text-muted-foreground">Anomaly review, checklist oversight, PVT monitoring, GPS tracking</p>
        </div>
      </div>

      {/* Election Selector */}
      <Select value={selectedElectionId} onValueChange={setSelectedElectionId}>
        <SelectTrigger className="w-[400px]">
          <SelectValue placeholder="Select an election to review" />
        </SelectTrigger>
        <SelectContent>
          {elections?.map(e => (
            <SelectItem key={e.id} value={e.id}>{e.name} — {e.country_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!selectedElectionId ? (
        <Card className="p-12 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Select an election above to review integrity data.</p>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3 border-l-4 border-l-red-500">
              <p className="text-2xl font-bold">{pendingAnomalies.length}</p>
              <p className="text-xs text-muted-foreground">Pending Anomalies</p>
            </Card>
            <Card className="p-3 border-l-4 border-l-orange-500">
              <p className="text-2xl font-bold">{confirmedAnomalies.length}</p>
              <p className="text-xs text-muted-foreground">Confirmed Anomalies</p>
            </Card>
            <Card className="p-3 border-l-4 border-l-blue-500">
              <p className="text-2xl font-bold">{checklists?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Checklists Submitted</p>
            </Card>
            <Card className="p-3 border-l-4 border-l-green-500">
              <p className="text-2xl font-bold">{checkIns?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Observer Check-ins</p>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-xl">
              <TabsTrigger value="anomalies" className="gap-1">
                <AlertTriangle className="h-4 w-4" />
                Anomalies
              </TabsTrigger>
              <TabsTrigger value="checklists" className="gap-1">
                <ClipboardCheck className="h-4 w-4" />
                Checklists
              </TabsTrigger>
              <TabsTrigger value="pvt" className="gap-1">
                <Target className="h-4 w-4" />
                PVT
              </TabsTrigger>
              <TabsTrigger value="tracking" className="gap-1">
                <Navigation className="h-4 w-4" />
                GPS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="anomalies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Review Queue ({pendingAnomalies.length} pending)</CardTitle>
                  <CardDescription>Review and confirm or dismiss statistical anomalies</CardDescription>
                </CardHeader>
                <CardContent>
                  {!anomalies?.length ? (
                    <p className="text-center py-8 text-muted-foreground">No anomalies detected for this election.</p>
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
                          {anomalies.map(a => (
                            <TableRow key={a.id}>
                              <TableCell>
                                <Badge variant="outline" className="capitalize text-xs">
                                  {a.anomaly_type.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell><Badge className={getSeverityColor(a.severity)}>{a.severity}</Badge></TableCell>
                              <TableCell className="max-w-xs text-xs">{a.description}</TableCell>
                              <TableCell className="text-xs">{((a.confidence_score || 0) * 100).toFixed(0)}%</TableCell>
                              <TableCell><Badge variant={a.status === 'detected' ? 'destructive' : 'secondary'}>{a.status}</Badge></TableCell>
                              <TableCell>
                                {a.status === 'detected' && (
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="outline" onClick={() => reviewAnomaly.mutate({ id: a.id, status: 'confirmed' })}>
                                      <CheckCircle2 className="h-3 w-3 mr-1" /> Confirm
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => reviewAnomaly.mutate({ id: a.id, status: 'dismissed' })}>
                                      <XCircle className="h-3 w-3 mr-1" /> Dismiss
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
            </TabsContent>

            <TabsContent value="checklists" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Observation Checklists Overview</CardTitle>
                  <CardDescription>Carter Center methodology compliance tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  {!checklists?.length ? (
                    <p className="text-center py-8 text-muted-foreground">No checklists submitted yet.</p>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Phase</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {checklists.map(cl => (
                            <TableRow key={cl.id}>
                              <TableCell><Badge variant="outline" className="capitalize">{cl.phase}</Badge></TableCell>
                              <TableCell>
                                <Badge className={
                                  cl.overall_rating === 'excellent' ? 'bg-green-500/20 text-green-700' :
                                  cl.overall_rating === 'critical' ? 'bg-red-500/20 text-red-700' :
                                  cl.overall_rating === 'poor' ? 'bg-orange-500/20 text-orange-700' :
                                  'bg-yellow-500/20 text-yellow-700'
                                }>
                                  {cl.overall_rating || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">{cl.submitted_at ? format(new Date(cl.submitted_at), 'MMM dd HH:mm') : '—'}</TableCell>
                              <TableCell className="max-w-xs truncate text-xs">{cl.notes || '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pvt" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>PVT Samples ({pvtSamples?.length || 0})</CardTitle>
                  <CardDescription>Parallel Vote Tabulation sample submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  {!pvtSamples?.length ? (
                    <p className="text-center py-8 text-muted-foreground">No PVT samples submitted yet.</p>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sample Group</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead>Margin of Error</TableHead>
                            <TableHead>Submitted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pvtSamples.map(s => (
                            <TableRow key={s.id}>
                              <TableCell>{s.sample_group || 'Default'}</TableCell>
                              <TableCell>{((s.confidence_level || 0.95) * 100).toFixed(0)}%</TableCell>
                              <TableCell>±{(s.margin_of_error || 0).toFixed(1)}%</TableCell>
                              <TableCell className="text-xs">{s.submitted_at ? format(new Date(s.submitted_at), 'MMM dd HH:mm') : '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Observer GPS Check-ins ({checkIns?.length || 0})</CardTitle>
                  <CardDescription>Real-time deployment verification</CardDescription>
                </CardHeader>
                <CardContent>
                  {!checkIns?.length ? (
                    <p className="text-center py-8 text-muted-foreground">No GPS check-ins recorded.</p>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Observer</TableHead>
                            <TableHead>Coordinates</TableHead>
                            <TableHead>Accuracy</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {checkIns.slice(0, 100).map(ci => (
                            <TableRow key={ci.id}>
                              <TableCell>
                                <Badge variant={ci.check_type === 'check_in' ? 'default' : ci.check_type === 'check_out' ? 'secondary' : 'outline'} className="text-xs capitalize">
                                  {ci.check_type.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs font-mono">{ci.observer_id?.slice(0, 8)}</TableCell>
                              <TableCell className="text-xs">{ci.latitude?.toFixed(4)}, {ci.longitude?.toFixed(4)}</TableCell>
                              <TableCell className="text-xs">{ci.accuracy_meters ? `±${ci.accuracy_meters.toFixed(0)}m` : '—'}</TableCell>
                              <TableCell className="text-xs">{ci.checked_at ? format(new Date(ci.checked_at), 'HH:mm:ss') : '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
