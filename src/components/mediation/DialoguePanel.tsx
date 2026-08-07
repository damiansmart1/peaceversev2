import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessagesSquare, Send, Lock } from 'lucide-react';
import { useMediationDialogue, useAddDialogueEntry, useMediationParties } from '@/hooks/useMediation';
import EmptyState from '@/components/EmptyState';

const ENTRY_TYPES = ['statement', 'question', 'proposal', 'clarification', 'concern', 'commitment', 'decision', 'caucus_note'];

const typeTone: Record<string, string> = {
  proposal: 'pill-primary', commitment: 'pill-success', decision: 'pill-success',
  concern: 'pill-warning', caucus_note: 'pill-destructive',
};

interface Props { caseId: string; canPost: boolean; isFacilitator: boolean; }

const DialoguePanel = ({ caseId, canPost, isFacilitator }: Props) => {
  const { data: entries = [], isLoading } = useMediationDialogue(caseId);
  const { data: parties = [] } = useMediationParties(caseId);
  const addEntry = useAddDialogueEntry(caseId);
  const [content, setContent] = useState('');
  const [entryType, setEntryType] = useState('statement');
  const [partyId, setPartyId] = useState<string>('none');
  const [visibility, setVisibility] = useState('all_members');

  const post = () => {
    if (!content.trim()) return;
    addEntry.mutate({
      content: content.trim(),
      entry_type: entryType,
      party_id: partyId === 'none' ? null : partyId,
      visibility,
    }, { onSuccess: () => setContent('') });
  };

  const partyName = (id: string | null) => parties.find((p: any) => p.id === id)?.party_name;

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Structured dialogue</p>
        <p className="text-sm text-muted-foreground">Every contribution is typed, attributed and timestamped — creating a defensible process record.</p>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading dialogue…</p>
        : entries.length === 0 ? <EmptyState icon={MessagesSquare} title="No contributions yet" description="Open the floor — statements, proposals and commitments are recorded here." />
        : (
          <div className="space-y-3">
            {entries.map((e: any) => (
              <Card key={e.id} className={`surface-quiet ${e.visibility === 'mediators_only' ? 'border-destructive/40' : ''}`}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className={`pill ${typeTone[e.entry_type] || 'pill-primary'}`}>{String(e.entry_type).replace(/_/g, ' ')}</span>
                    {e.party_id && <Badge variant="secondary">{partyName(e.party_id) || 'Party'}</Badge>}
                    {e.visibility === 'mediators_only' && (
                      <span className="inline-flex items-center gap-1 text-destructive"><Lock className="w-3 h-3" /> mediators only</span>
                    )}
                    <span className="text-muted-foreground ml-auto">{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{e.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      {canPost && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Label>Add a contribution</Label>
            <Textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Record a statement, proposal, concern or commitment…" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ENTRY_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={partyId} onValueChange={setPartyId}>
                <SelectTrigger><SelectValue placeholder="Attribute to party" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No party attribution</SelectItem>
                  {parties.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.party_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_members">Visible to all members</SelectItem>
                  <SelectItem value="parties_only">Parties only</SelectItem>
                  {isFacilitator && <SelectItem value="mediators_only">Mediators only (caucus)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={post} disabled={addEntry.isPending || !content.trim()} className="gap-2">
              <Send className="w-4 h-4" /> Post contribution
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DialoguePanel;
