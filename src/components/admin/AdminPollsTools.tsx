import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowUp, ArrowDown, ImagePlus, Plus, Trash2, X, Layers, Pencil, Check } from 'lucide-react';
import type { Poll } from '@/hooks/usePolls';
import OptionImage, { OPTION_IMAGE_BUCKET } from '@/components/polls/OptionImage';

const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadOptionImage(file: File): Promise<string> {
  if (!IMG_TYPES.includes(file.type)) throw new Error('Answer pictures must be JPG, PNG or WebP');
  if (file.size > 5 * 1024 * 1024) throw new Error('Answer pictures must be under 5 MB');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in to add a picture');
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(OPTION_IMAGE_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Picture upload failed: ${error.message}`);
  return path;
}

/* ---------------- Voting activity ---------------- */

export const PollActivityDialog = ({ poll, counts, onClose }: { poll: Poll; counts: number[] | null; onClose: () => void }) => {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['poll-activity', poll.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('poll_analytics')
        .select('event_type,created_at').eq('poll_id', poll.id).order('created_at', { ascending: true }).limit(5000);
      if (error) throw error;
      return (data || []) as { event_type: string; created_at: string }[];
    },
  });

  const { series, opened, confirmed, changed } = useMemo(() => {
    const byDay: Record<string, number> = {};
    let opened = 0, confirmed = 0, changed = 0;
    for (const e of events) {
      if (e.event_type === 'confirm_opened') opened++;
      if (e.event_type === 'vote_changed') changed++;
      if (e.event_type === 'vote_confirmed') {
        confirmed++;
        const d = e.created_at.slice(0, 10);
        byDay[d] = (byDay[d] || 0) + 1;
      }
    }
    return { series: Object.entries(byDay).map(([day, votes]) => ({ day: day.slice(5), votes })), opened, confirmed, changed };
  }, [events]);

  const total = counts ? counts.reduce((a, b) => a + b, 0) : 0;
  const ranked = (poll.options || []).map((o: any, i: number) => ({ text: o.text, path: o.image_path, n: counts?.[i] ?? 0 }))
    .sort((a, b) => b.n - a.n);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Voting activity</DialogTitle>
          <DialogDescription className="break-words">{poll.title}</DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">Couldn't load activity: {(error as Error).message}</p> : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                ['Voices', poll.total_participants || 0],
                ['Reviewed a vote', opened],
                ['Confirmed', confirmed],
                ['Changed their mind', changed],
              ].map(([l, v]) => (
                <Card key={l as string} className="p-3"><div className="text-xl font-semibold">{v}</div><div className="text-xs text-muted-foreground">{l}</div></Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmation tracking started with the review step, so older votes appear in "Voices" only.
              {opened > 0 && ` ${Math.round((changed / opened) * 100)}% of reviews led someone to change their choice.`}
            </p>
            <div>
              <p className="text-sm font-medium mb-2">Confirmed votes per day</p>
              {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : series.length === 0 ? (
                <p className="text-sm text-muted-foreground">No confirmed votes recorded yet.</p>
              ) : (
                <div className="h-48">
                  <ResponsiveContainer>
                    <AreaChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} fontSize={11} stroke="hsl(var(--muted-foreground))" width={28} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Area dataKey="votes" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.25)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">{poll.poll_type === 'ranked' ? 'Points by answer' : 'Votes by answer'}</p>
              {!counts ? <p className="text-sm text-muted-foreground">Results are sealed until the poll closes.</p> : (
                <div className="space-y-2">
                  {ranked.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <OptionImage path={r.path} alt={r.text} className="h-9 w-14" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2 text-sm"><span className="truncate">{i === 0 && r.n > 0 ? '👑 ' : ''}{r.text}</span><span className="shrink-0 tabular-nums">{r.n}</span></div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${total ? (r.n / total) * 100 : 0}%` }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ---------------- Collections manager ---------------- */

export const CollectionsPanel = ({ polls }: { polls: Poll[] }) => {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  const groups = useMemo(() => {
    const m = new Map<string, Poll[]>();
    polls.filter((p) => p.group_id).forEach((p) => m.set(p.group_id!, [...(m.get(p.group_id!) || []), p]));
    return [...m.entries()].map(([id, list]) => ({ id, title: list[0].group_title || 'Untitled collection', list: list.sort((a, b) => (a.group_order || 0) - (b.group_order || 0)) }));
  }, [polls]);
  const standalone = polls.filter((p) => !p.group_id);

  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin-polls'] }); qc.invalidateQueries({ queryKey: ['polls'] }); qc.invalidateQueries({ queryKey: ['featured-polls'] }); };
  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try { await fn(); toast.success(ok); refresh(); } catch (e: any) { toast.error(`Couldn't update collection: ${e.message}`); } finally { setBusy(false); }
  };
  const upd = async (id: string, updates: Record<string, unknown>) => {
    const { error } = await supabase.from('polls').update(updates).eq('id', id);
    if (error) throw error;
  };

  const rename = (gid: string, list: Poll[]) => run(async () => { for (const p of list) await upd(p.id, { group_title: name.trim() }); setEditingId(null); }, 'Collection renamed');
  const move = (list: Poll[], i: number, dir: -1 | 1) => run(async () => {
    const order = [...list]; const j = i + dir; [order[i], order[j]] = [order[j], order[i]];
    for (let k = 0; k < order.length; k++) await upd(order[k].id, { group_order: k + 1 });
  }, 'Order updated');
  const removeFrom = (p: Poll) => run(() => upd(p.id, { group_id: null, group_title: null, group_order: null }), 'Removed from collection');
  const addTo = (g: { id: string; title: string; list: Poll[] }, pollId: string) => run(() => upd(pollId, { group_id: g.id, group_title: g.title, group_order: g.list.length + 1 }), 'Added to collection');
  const create = (pollId: string) => run(async () => { await upd(pollId, { group_id: crypto.randomUUID(), group_title: newName.trim(), group_order: 1 }); setNewName(''); }, 'Collection created');

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-2">
        <p className="text-sm font-medium">Start a new collection</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Collection name, e.g. Sauti Stack brand vote" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Select disabled={!newName.trim() || busy} onValueChange={create}>
            <SelectTrigger className="sm:w-64"><SelectValue placeholder="Pick its first poll" /></SelectTrigger>
            <SelectContent>{standalone.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </Card>
      {groups.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No collections yet.</p>}
      {groups.map((g) => (
        <Card key={g.id} className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary shrink-0" />
            {editingId === g.id ? (
              <>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" />
                <Button size="sm" disabled={!name.trim() || busy} onClick={() => rename(g.id, g.list)}><Check className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <p className="font-medium flex-1 min-w-0 break-words">{g.title}</p>
                <Badge variant="outline">{g.list.length} questions</Badge>
                <Button size="sm" variant="ghost" aria-label="Rename collection" onClick={() => { setEditingId(g.id); setName(g.title); }}><Pencil className="h-4 w-4" /></Button>
              </>
            )}
          </div>
          <ol className="space-y-1.5">
            {g.list.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2 rounded-md border p-2">
                <span className="text-xs font-semibold text-primary w-5 shrink-0">{i + 1}</span>
                <span className="text-sm flex-1 min-w-0 break-words">{p.title}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Move up" disabled={i === 0 || busy} onClick={() => move(g.list, i, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Move down" disabled={i === g.list.length - 1 || busy} onClick={() => move(g.list, i, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Remove from collection" disabled={busy} onClick={() => removeFrom(p)}><X className="h-4 w-4" /></Button>
              </li>
            ))}
          </ol>
          {standalone.length > 0 && (
            <Select disabled={busy} onValueChange={(v) => addTo(g, v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Add a poll to this collection" /></SelectTrigger>
              <SelectContent>{standalone.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </Card>
      ))}
    </div>
  );
};

/* ---------------- Answer editor ---------------- */

export type EditableOption = { text: string; image_path?: string | null; file?: File | null; [k: string]: unknown };

export const OptionsEditor = ({ options, onChange, locked }: { options: EditableOption[]; onChange: (o: EditableOption[]) => void; locked: boolean }) => {
  const set = (i: number, patch: Partial<EditableOption>) => onChange(options.map((o, k) => (k === i ? { ...o, ...patch } : o)));
  if (locked) return <p className="text-xs text-muted-foreground">People have already voted, so answers can't be changed. This keeps every vote counted against the answer it was cast for.</p>;
  return (
    <div className="space-y-2">
      {options.map((o, i) => (
        <div key={i} className="flex items-center gap-2">
          {o.file ? <img src={URL.createObjectURL(o.file)} alt="" className="h-9 w-14 rounded object-cover shrink-0" /> : o.image_path ? <OptionImage path={o.image_path} alt={o.text} className="h-9 w-14" /> : null}
          <Input value={o.text} maxLength={200} onChange={(e) => set(i, { text: e.target.value })} placeholder={`Answer ${i + 1}`} />
          <label className="cursor-pointer shrink-0 rounded-md border p-2 hover:bg-muted" aria-label="Add picture">
            <ImagePlus className="h-4 w-4" />
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (!IMG_TYPES.includes(f.type) || f.size > 5 * 1024 * 1024) { toast.error('Pictures must be JPG, PNG or WebP under 5 MB'); return; }
              set(i, { file: f });
            }} />
          </label>
          {(o.image_path || o.file) && <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Remove picture" onClick={() => set(i, { image_path: null, file: null })}><X className="h-4 w-4" /></Button>}
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Delete answer" disabled={options.length <= 2} onClick={() => onChange(options.filter((_, k) => k !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" disabled={options.length >= 20} onClick={() => onChange([...options, { text: '', votes: 0 }])}><Plus className="h-4 w-4 mr-1" />Add answer</Button>
    </div>
  );
};

export async function finaliseOptions(options: EditableOption[]) {
  const out = [];
  for (const { file, ...o } of options) {
    const image_path = file ? await uploadOptionImage(file) : o.image_path || undefined;
    out.push({ ...o, text: o.text.trim(), votes: 0, image_path });
  }
  if (out.some((o) => !o.text)) throw new Error('Every answer needs text');
  if (out.length < 2) throw new Error('A poll needs at least two answers');
  return out;
}
