import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Plus, Trash2, RefreshCw, Mail, Loader2, Calendar, Globe2, FileText, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import {
  useBriefings, useBriefingDigests, useCreateBriefing, useDeleteBriefing,
  useGenerateDigest, useMarkDigestRead, type NuruBriefingDigest,
} from '@/hooks/useNuruBriefings';

export default function NuruBriefingsPanel() {
  const [createOpen, setCreateOpen] = useState(false);
  const [activeDigest, setActiveDigest] = useState<NuruBriefingDigest | null>(null);
  const [title, setTitle] = useState('');
  const [topics, setTopics] = useState('');
  const [countries, setCountries] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const { data: briefings, isLoading } = useBriefings();
  const { data: digests } = useBriefingDigests();
  const createBriefing = useCreateBriefing();
  const deleteBriefing = useDeleteBriefing();
  const generateDigest = useGenerateDigest();
  const markRead = useMarkDigestRead();

  const handleCreate = () => {
    if (!title.trim()) return;
    createBriefing.mutate(
      {
        title: title.trim(),
        topics: topics.split(',').map(t => t.trim()).filter(Boolean),
        countries: countries.split(',').map(c => c.trim()).filter(Boolean),
        frequency,
      },
      {
        onSuccess: () => {
          setTitle(''); setTopics(''); setCountries(''); setFrequency('weekly');
          setCreateOpen(false);
        },
      }
    );
  };

  const handleOpenDigest = (d: NuruBriefingDigest) => {
    setActiveDigest(d);
    if (!d.read_at) markRead.mutate(d.id);
  };

  const unreadCount = (digests || []).filter(d => !d.read_at).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">Auto-briefings</h3>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-[10px] h-5 px-1.5">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI-generated digests from policy documents matching your interests
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New briefing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create auto-briefing</DialogTitle>
              <DialogDescription className="text-xs">
                NuruAI will scan policy documents matching your filters and generate a digest on your chosen schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Weekly Health Policy Brief"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Topics (comma-separated)</Label>
                <Input
                  value={topics}
                  onChange={e => setTopics(e.target.value)}
                  placeholder="e.g., health, education, finance"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Countries (comma-separated)</Label>
                <Input
                  value={countries}
                  onChange={e => setCountries(e.target.value)}
                  placeholder="e.g., Kenya, Nigeria"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Frequency</Label>
                <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!title.trim() || createBriefing.isPending}>
                {createBriefing.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Briefings list */}
      {isLoading ? (
        <div className="text-xs text-muted-foreground py-6 text-center">Loading…</div>
      ) : !briefings?.length ? (
        <Card className="p-6 text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-2 opacity-60" />
          <p className="text-sm font-medium">No briefings yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create your first auto-briefing to receive AI-curated policy digests.
          </p>
        </Card>
      ) : (
        <div className="grid gap-2">
          {briefings.map(b => {
            const bDigests = (digests || []).filter(d => d.briefing_id === b.id);
            const latest = bDigests[0];
            return (
              <Card key={b.id} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p className="text-sm font-semibold truncate">{b.title}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <Badge variant="outline" className="h-4 px-1.5 capitalize">
                        <Calendar className="h-2.5 w-2.5 mr-1" /> {b.frequency}
                      </Badge>
                      {b.countries?.slice(0, 2).map(c => (
                        <Badge key={c} variant="secondary" className="h-4 px-1.5">
                          <Globe2 className="h-2.5 w-2.5 mr-1" /> {c}
                        </Badge>
                      ))}
                      {b.topics?.slice(0, 3).map(t => (
                        <Badge key={t} variant="secondary" className="h-4 px-1.5">{t}</Badge>
                      ))}
                    </div>
                    {latest && (
                      <button
                        onClick={() => handleOpenDigest(latest)}
                        className="mt-2 text-[11px] text-primary hover:underline flex items-center gap-1"
                      >
                        {!latest.read_at && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        Read latest digest · {formatDistanceToNow(new Date(latest.generated_at), { addSuffix: true })}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => generateDigest.mutate(b.id)}
                      disabled={generateDigest.isPending && generateDigest.variables === b.id}
                      title="Generate digest now"
                    >
                      {generateDigest.isPending && generateDigest.variables === b.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteBriefing.mutate(b.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Digest reader */}
      <Dialog open={!!activeDigest} onOpenChange={(o) => !o && setActiveDigest(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-5 pb-2 border-b">
            <DialogTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Briefing digest
            </DialogTitle>
            {activeDigest && (
              <DialogDescription className="text-xs">
                Generated {formatDistanceToNow(new Date(activeDigest.generated_at), { addSuffix: true })}
              </DialogDescription>
            )}
          </DialogHeader>
          {activeDigest && (
            <ScrollArea className="flex-1 px-5 py-3">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{activeDigest.content}</ReactMarkdown>
              </div>
              {!!activeDigest.source_documents?.length && (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Sources</p>
                  <div className="space-y-1">
                    {activeDigest.source_documents.map((s: any) => (
                      <div key={s.id || s.ref} className="text-xs flex items-start gap-2">
                        <FileText className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                        <span>[{s.ref}] {s.title} {s.country ? `· ${s.country}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
