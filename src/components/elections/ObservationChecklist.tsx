import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ClipboardCheck, CheckCircle2, Clock, Send, Eye, MapPin, AlertTriangle 
} from 'lucide-react';
import { type Election } from '@/hooks/useElections';
import { useObservationChecklists, useSubmitChecklist } from '@/hooks/useElectionAdvanced';
import { format } from 'date-fns';

interface Props {
  election: Election;
}

// Carter Center systematic observation checklists
const CHECKLIST_ITEMS: Record<string, { label: string; items: { id: string; text: string; critical?: boolean }[] }> = {
  opening: {
    label: 'Opening Procedures',
    items: [
      { id: 'op_1', text: 'Polling station opened on time', critical: true },
      { id: 'op_2', text: 'All required election materials present' },
      { id: 'op_3', text: 'Ballot box shown empty and sealed', critical: true },
      { id: 'op_4', text: 'Party agents/observers present and allowed access' },
      { id: 'op_5', text: 'Voter register available and accessible' },
      { id: 'op_6', text: 'Polling station layout ensures ballot secrecy', critical: true },
      { id: 'op_7', text: 'Station accessible to persons with disabilities' },
      { id: 'op_8', text: 'Security presence appropriate (not intimidating)' },
      { id: 'op_9', text: 'Polling officials properly trained and impartial' },
      { id: 'op_10', text: 'Official stamp/ink/indelible marker available' },
    ],
  },
  voting: {
    label: 'Voting Process',
    items: [
      { id: 'vp_1', text: 'Voter identity properly verified', critical: true },
      { id: 'vp_2', text: 'Voters marked with indelible ink after voting' },
      { id: 'vp_3', text: 'Ballot secrecy maintained', critical: true },
      { id: 'vp_4', text: 'No campaigning within or near polling station', critical: true },
      { id: 'vp_5', text: 'No intimidation or pressure observed' },
      { id: 'vp_6', text: 'Assisted voting conducted properly when needed' },
      { id: 'vp_7', text: 'Queue management orderly and efficient' },
      { id: 'vp_8', text: 'No unauthorized persons in polling area' },
      { id: 'vp_9', text: 'No evidence of multiple voting' },
      { id: 'vp_10', text: 'Complaints handled according to procedures' },
      { id: 'vp_11', text: 'Gender-balanced election officials present' },
      { id: 'vp_12', text: 'Youth and first-time voter assistance available' },
    ],
  },
  counting: {
    label: 'Counting Process',
    items: [
      { id: 'ct_1', text: 'Counting conducted at polling station (not relocated)', critical: true },
      { id: 'ct_2', text: 'All observers able to witness counting', critical: true },
      { id: 'ct_3', text: 'Ballot box seals intact before opening', critical: true },
      { id: 'ct_4', text: 'Unused ballots counted and secured' },
      { id: 'ct_5', text: 'Spoilt/rejected ballots handled correctly' },
      { id: 'ct_6', text: 'Vote tallying transparent and verifiable' },
      { id: 'ct_7', text: 'Results form completed accurately' },
      { id: 'ct_8', text: 'Party agents received copies of results', critical: true },
      { id: 'ct_9', text: 'Reconciliation of ballots performed' },
      { id: 'ct_10', text: 'Results posted publicly at polling station' },
    ],
  },
  closing: {
    label: 'Closing Procedures',
    items: [
      { id: 'cl_1', text: 'Station closed at designated time', critical: true },
      { id: 'cl_2', text: 'All voters in queue at closing time allowed to vote' },
      { id: 'cl_3', text: 'Materials packed and sealed properly' },
      { id: 'cl_4', text: 'Results transmitted securely', critical: true },
      { id: 'cl_5', text: 'All election materials accounted for' },
      { id: 'cl_6', text: 'Incident reports documented if any' },
      { id: 'cl_7', text: 'Observer access maintained throughout closing' },
      { id: 'cl_8', text: 'Chain of custody for ballot materials maintained', critical: true },
    ],
  },
};

export default function ObservationChecklist({ election }: Props) {
  const [phase, setPhase] = useState<string>('voting');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [overallRating, setOverallRating] = useState('');
  const { data: checklists } = useObservationChecklists(election.id);
  const submitChecklist = useSubmitChecklist();

  const currentItems = CHECKLIST_ITEMS[phase]?.items || [];
  const completedCount = currentItems.filter(item => checklistState[item.id]).length;
  const criticalItems = currentItems.filter(item => item.critical);
  const criticalCompleted = criticalItems.filter(item => checklistState[item.id]).length;

  const handleSubmit = async () => {
    await submitChecklist.mutateAsync({
      election_id: election.id,
      phase: phase as any,
      checklist_data: checklistState,
      notes,
      overall_rating: overallRating,
    });
    setChecklistState({});
    setNotes('');
    setOverallRating('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Systematic Observation Checklists
        </h3>
        <p className="text-sm text-muted-foreground">Carter Center methodology — opening, voting, counting, closing</p>
      </div>

      <Tabs value={phase} onValueChange={setPhase}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="opening">Opening</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="counting">Counting</TabsTrigger>
          <TabsTrigger value="closing">Closing</TabsTrigger>
        </TabsList>

        {Object.entries(CHECKLIST_ITEMS).map(([key, section]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{section.label}</span>
                  <Badge variant="outline">{completedCount}/{currentItems.length} completed</Badge>
                </CardTitle>
                <CardDescription>
                  Critical items: {criticalCompleted}/{criticalItems.length} | 
                  {criticalCompleted < criticalItems.length && (
                    <span className="text-destructive ml-1">⚠ Critical items pending</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.items.map(item => (
                  <div key={item.id} className={`flex items-start gap-3 p-2 rounded-lg ${item.critical ? 'bg-amber-500/5 border border-amber-500/20' : ''}`}>
                    <Checkbox
                      id={item.id}
                      checked={checklistState[item.id] || false}
                      onCheckedChange={(checked) => setChecklistState(prev => ({ ...prev, [item.id]: !!checked }))}
                    />
                    <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                      <span>{item.text}</span>
                      {item.critical && <Badge variant="outline" className="ml-2 text-[10px] text-amber-600">CRITICAL</Badge>}
                    </Label>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4 space-y-3">
                  <div>
                    <Label>Overall Rating</Label>
                    <Select value={overallRating} onValueChange={setOverallRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rate this phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent — Full compliance</SelectItem>
                        <SelectItem value="good">Good — Minor issues</SelectItem>
                        <SelectItem value="fair">Fair — Some concerns</SelectItem>
                        <SelectItem value="poor">Poor — Significant issues</SelectItem>
                        <SelectItem value="critical">Critical — Integrity compromised</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Observer Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Document any observations, irregularities, or commendable practices..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleSubmit} disabled={submitChecklist.isPending} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Submit {section.label} Checklist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Submitted Checklists */}
      {checklists && checklists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Submitted Checklists ({checklists.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Items Checked</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklists.map((cl) => {
                    const data = cl.checklist_data || {};
                    const checked = Object.values(data).filter(Boolean).length;
                    const total = CHECKLIST_ITEMS[cl.phase]?.items.length || 0;
                    return (
                      <TableRow key={cl.id}>
                        <TableCell><Badge variant="outline" className="capitalize">{cl.phase}</Badge></TableCell>
                        <TableCell>
                          <Badge className={
                            cl.overall_rating === 'excellent' ? 'bg-green-500/20 text-green-700' :
                            cl.overall_rating === 'critical' ? 'bg-red-500/20 text-red-700' :
                            'bg-yellow-500/20 text-yellow-700'
                          }>
                            {cl.overall_rating || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{checked}/{total}</TableCell>
                        <TableCell className="text-xs">{cl.submitted_at ? format(new Date(cl.submitted_at), 'MMM dd HH:mm') : 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs">{cl.notes || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
