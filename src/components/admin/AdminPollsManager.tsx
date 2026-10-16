import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3, Lock, Users, Clock, Star, Trash2, Download, Settings2, Search, Gavel, Power, CalendarPlus, Vote,
} from 'lucide-react';
import type { Poll } from '@/hooks/usePolls';
import { downloadPollResults } from '@/components/polls/PollExtras';
import { parseDomains, parseInviteEmails } from '@/lib/participation';
import { BannerPicker, uploadPollBanner } from '@/components/polls/PollBanner';
import ConfirmDialog from '@/components/ConfirmDialog';

const isClosed = (p: Poll) => !p.is_active || (!!p.ends_at && new Date(p.ends_at) < new Date());
const VIS_RANK = { live: 0, after_vote: 1, after_close: 2 } as const;

const useAllPolls = () =>
  useQuery({
    queryKey: ['admin-polls'],
    queryFn: async () => {
      const { data, error } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Poll[];
    },
  });

const useProposalStats = () =>
  useQuery({
    queryKey: ['admin-proposal-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('proposals').select('id,status,response_status');
      if (error) throw error;
      const rows = (data || []) as { status: string; response_status: string | null }[];
      return {
        total: rows.length,
        pending: rows.filter((r) => r.status === 'pending_approval').length,
        awaiting: rows.filter((r) => r.status === 'published' && !r.response_status).length,
      };
    },
  });

const useUpdatePoll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Poll> }) => {
      const { error } = await supabase.from('polls').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-polls'] });
      qc.invalidateQueries({ queryKey: ['polls'] });
      qc.invalidateQueries({ queryKey: ['featured-polls'] });
      toast.success('Poll updated');
    },
    onError: (e: Error) => toast.error(`Couldn't update poll: ${e.message}`),
  });
};

async function getCounts(p: Poll): Promise<number[]> {
  if (p.results_visibility === 'after_close') {
    const { data, error } = await supabase.rpc('poll_results', { _poll_id: p.id });
    if (error) throw error;
    if (data) return data as number[];
  }
  return (p.options || []).map((o: any) => o.votes || 0);
}

export const AdminPollsManager = () => {
  const { data: polls = [], isLoading } = useAllPolls();
  const { data: pStats } = useProposalStats();
  const update = useUpdatePoll();
  const qc = useQueryClient();
  const [tab, setTab] = useState('live');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Poll | null>(null);
  const [deleting, setDeleting] = useState<Poll | null>(null);

  const stats = useMemo(() => ({
    live: polls.filter((p) => !isClosed(p)).length,
    closed: polls.filter(isClosed).length,
    needsDecision: polls.filter((p) => isClosed(p) && !p.outcome_text).length,
    voices: polls.reduce((a, p) => a + (p.total_participants || 0), 0),
  }), [polls]);

  const list = polls.filter((p) => {
    const text = `${p.title} ${p.group_title || ''} ${p.category}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (tab === 'live') return !isClosed(p);
    if (tab === 'decision') return isClosed(p) && !p.outcome_text;
    if (tab === 'closed') return isClosed(p);
    return true;
  });

  const remove = async () => {
    if (!deleting) return;
    const { error } = await supabase.from('polls').delete().eq('id', deleting.id);
    if (error) toast.error(`Couldn't delete poll: ${error.message}`);
    else { toast.success('Poll deleted'); qc.invalidateQueries({ queryKey: ['admin-polls'] }); }
    setDeleting(null);
  };

  const exportCsv = async (p: Poll) => {
    try { downloadPollResults(p, await getCounts(p)); }
    catch (e: any) { toast.error(`Couldn't load results: ${e.message}`); }
  };

  const tiles = [
    { label: 'Live polls', value: stats.live, icon: Vote },
    { label: 'Awaiting decision', value: stats.needsDecision, icon: Gavel },
    { label: 'Voices counted', value: stats.voices, icon: Users },
    { label: 'Proposals to review', value: pStats?.pending ?? 0, icon: Clock },
    { label: 'Awaiting official response', value: pStats?.awaiting ?? 0, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Participation control room</p>
        <h2 className="text-xl font-semibold">Polls & decisions</h2>
        <p className="text-sm text-muted-foreground">Open, close, extend, restrict and publish decisions on every poll.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tiles.map((t) => (
          <Card key={t.label} className="p-4">
            <t.icon className="h-4 w-4 text-primary mb-2" />
            <div className="text-2xl font-semibold">{t.value}</div>
            <div className="text-xs text-muted-foreground">{t.label}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="decision">Needs decision ({stats.needsDecision})</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="all">All ({polls.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search polls" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading polls…</p> : list.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No polls here.</p>
      ) : (
        <div className="space-y-3">
          {list.map((p) => {
            const closed = isClosed(p);
            return (
              <Card key={p.id} className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={closed ? 'secondary' : 'default'}>{closed ? 'Closed' : 'Live'}</Badge>
                      {p.group_title && <Badge variant="outline">{p.group_title}</Badge>}
                      <Badge variant="outline">{p.poll_type.replace('_', ' ')}</Badge>
                      {p.eligibility && p.eligibility !== 'everyone' && <Badge variant="outline"><Lock className="h-3 w-3 mr-1" />Members only</Badge>}
                      {p.results_visibility === 'after_close' && <Badge variant="outline">Sealed</Badge>}
                      {p.is_featured && <Badge variant="outline"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                      {p.outcome_text && <Badge variant="outline"><Gavel className="h-3 w-3 mr-1" />Decided</Badge>}
                    </div>
                    <p className="font-medium break-words">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.total_participants || 0} voices · {p.ends_at ? `${closed ? 'Closed' : 'Closes'} ${new Date(p.ends_at).toLocaleDateString()}` : 'No end date'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setEditing(p)}><Settings2 className="h-4 w-4 mr-1" />Manage</Button>
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: p.id, updates: { is_featured: !p.is_featured } })}>
                      <Star className="h-4 w-4 mr-1" />{p.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    {closed ? (
                      <Button size="sm" variant="outline" onClick={() => update.mutate({ id: p.id, updates: { is_active: true, ends_at: new Date(Date.now() + 7 * 864e5).toISOString() } })}>
                        <CalendarPlus className="h-4 w-4 mr-1" />Reopen 7 days
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => update.mutate({ id: p.id, updates: { ends_at: new Date().toISOString() } })}>
                        <Power className="h-4 w-4 mr-1" />Close now
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => exportCsv(p)}><Download className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editing && <ManagePollDialog poll={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o: boolean) => !o && setDeleting(null)}
        title="Delete this poll?"
        description="All votes and results for this poll will be permanently removed."
        onConfirm={remove}
      />
    </div>
  );
};

const ManagePollDialog = ({ poll, onClose }: { poll: Poll; onClose: () => void }) => {
  const qc = useQueryClient();
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description || '');
  const [endsAt, setEndsAt] = useState(poll.ends_at ? poll.ends_at.slice(0, 16) : '');
  const [active, setActive] = useState(poll.is_active);
  const [visibility, setVisibility] = useState(poll.results_visibility || 'live');
  const [eligibility, setEligibility] = useState(poll.eligibility || 'everyone');
  const [domains, setDomains] = useState((poll.eligible_domains || []).join(', '));
  const [invites, setInvites] = useState('');
  const [outcome, setOutcome] = useState(poll.outcome_text || '');
  const [thankYou, setThankYou] = useState(poll.settings?.thank_you_message || '');
  const [saving, setSaving] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPath, setBannerPath] = useState<string | null>(poll.banner_path || null);
  const hasVotes = (poll.total_participants || 0) > 0;
  const minVis = hasVotes ? VIS_RANK[poll.results_visibility || 'live'] : 0;

  const { data: inviteList = [], refetch } = useQuery({
    queryKey: ['poll-invites', poll.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('poll_invites').select('email').eq('poll_id', poll.id);
      if (error) throw error;
      return (data || []).map((r: any) => r.email as string);
    },
  });

  const save = async () => {
    setSaving(true);
    try {
      const newBanner = bannerFile ? await uploadPollBanner(bannerFile) : bannerPath;
      const updates: any = {
        banner_path: newBanner,
        title: title.trim(), description: description.trim() || null, is_active: active,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        results_visibility: visibility, eligibility,
        eligible_domains: eligibility === 'domain' ? parseDomains(domains) : [],
        settings: { ...(poll.settings || {}), thank_you_message: thankYou.trim().slice(0, 140) || undefined },
      };
      if (outcome.trim() && outcome.trim() !== (poll.outcome_text || '')) updates.outcome_text = outcome.trim();
      const { error } = await supabase.from('polls').update(updates).eq('id', poll.id);
      if (error) throw error;
      const emails = parseInviteEmails(invites);
      if (emails.length) {
        const { error: ie } = await supabase.from('poll_invites').upsert(emails.map((email: string) => ({ poll_id: poll.id, email })), { onConflict: 'poll_id,email' });
        if (ie) throw ie;
      }
      toast.success(updates.outcome_text ? 'Saved — voters have been notified of the decision' : 'Poll settings saved');
      qc.invalidateQueries({ queryKey: ['admin-polls'] });
      qc.invalidateQueries({ queryKey: ['polls'] });
      onClose();
    } catch (e: any) {
      toast.error(`Couldn't save poll: ${e.message}`);
    } finally { setSaving(false); }
  };

  const removeInvite = async (email: string) => {
    const { error } = await supabase.from('poll_invites').delete().eq('poll_id', poll.id).eq('email', email);
    if (error) toast.error(`Couldn't remove invite: ${error.message}`); else refetch();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Manage poll</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Banner</Label><BannerPicker file={bannerFile} onFile={setBannerFile} existingPath={bannerPath} onClearExisting={() => setBannerPath(null)} /></div>
          <div className="space-y-1.5"><Label>Question</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Closing date</Label><Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></div>
            <div className="flex items-center justify-between rounded-md border p-3"><Label>Voting open</Label><Switch checked={active} onCheckedChange={setActive} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>When results are shown</Label>
            <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="live" disabled={minVis > 0}>Live</SelectItem>
                <SelectItem value="after_vote" disabled={minVis > 1}>After each person votes</SelectItem>
                <SelectItem value="after_close">Sealed until closing</SelectItem>
              </SelectContent>
            </Select>
            {hasVotes && <p className="text-xs text-muted-foreground">Votes exist, so results can only be made more private.</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Who can vote</Label>
            <Select value={eligibility} onValueChange={(v: any) => setEligibility(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Anyone signed in</SelectItem>
                <SelectItem value="domain">Work email domains</SelectItem>
                <SelectItem value="invite">Invite list only</SelectItem>
              </SelectContent>
            </Select>
            {eligibility === 'domain' && <Input placeholder="sautistack.africa, example.org" value={domains} onChange={(e) => setDomains(e.target.value)} />}
            {eligibility === 'invite' && (
              <div className="space-y-2">
                <Textarea rows={2} placeholder="Add emails, separated by commas or new lines" value={invites} onChange={(e) => setInvites(e.target.value)} />
                {inviteList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {inviteList.map((e) => (
                      <Badge key={e} variant="secondary" className="cursor-pointer" onClick={() => removeInvite(e)}>{e} ✕</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Message after voting</Label>
            <Input maxLength={140} placeholder="Leave empty for a random fun message" value={thankYou} onChange={(e) => setThankYou(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Published decision</Label>
            <Textarea rows={3} placeholder="e.g. Logo 5 adopted by the board" value={outcome} onChange={(e) => setOutcome(e.target.value)} />
            <p className="text-xs text-muted-foreground">Saving a new decision notifies everyone who voted.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving || !title.trim()}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPollsManager;
