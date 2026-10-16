import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Volume2, Square, Gavel, Download, EyeOff, BellRing } from 'lucide-react';
import { useTranslationContext } from '@/components/TranslationProvider';
import { usePublishPollOutcome, type Poll } from '@/hooks/usePolls';
import { format } from 'date-fns';
import { toast } from 'sonner';

const LETTERS = 'ABCDEFGHIJ';

/** Reads the question and every answer aloud with the device's built-in voice (no data cost). */
export function ReadAloudButton({ poll }: { poll: Poll }) {
  const { language } = useTranslationContext();
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  if (!supported) return null;
  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const parts = [poll.title, poll.description || '', ...poll.options.map((o, i) => `${poll.poll_type === 'rating' ? '' : `Option ${LETTERS[i]}. `}${o.text}`)];
    const u = new SpeechSynthesisUtterance(parts.filter(Boolean).join('. '));
    u.lang = language;
    u.rate = 0.95;
    u.onend = u.onerror = () => setSpeaking(false);
    synth.cancel(); synth.speak(u); setSpeaking(true);
  };
  return (
    <Button type="button" variant="outline" size="sm" onClick={toggle} aria-pressed={speaking} className="h-8 rounded-full gap-1.5">
      {speaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {speaking ? 'Stop' : 'Listen'}
    </Button>
  );
}

export function HiddenResultsNotice({ poll, hasVoted }: { poll: Poll; hasVoted: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 text-center">
      <EyeOff className="mx-auto mb-2 h-6 w-6 text-primary" />
      <p className="font-semibold text-foreground">{hasVoted ? 'Your vote is sealed' : 'Results are sealed'}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Results are revealed {poll.ends_at ? `on ${format(new Date(poll.ends_at), 'd MMM yyyy, HH:mm')}` : 'when the poll closes'} so nobody is swayed by early counts.
        {' '}{poll.total_participants || 0} {poll.total_participants === 1 ? 'person has' : 'people have'} voted so far.
      </p>
    </div>
  );
}

export function OutcomePanel({ poll, canManage }: { poll: Poll; canManage: boolean }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const publish = usePublishPollOutcome();
  if (poll.outcome_text) {
    return (
      <div className="rounded-2xl border border-secondary/50 bg-secondary/10 p-4">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-secondary-foreground">
          <Gavel className="h-3.5 w-3.5" /> Decision{poll.outcome_published_at && ` · ${format(new Date(poll.outcome_published_at), 'd MMM yyyy')}`}
        </p>
        <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-foreground">{poll.outcome_text}</p>
      </div>
    );
  }
  if (!canManage) return null;
  return open ? (
    <div className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-3">
      <Textarea rows={3} maxLength={2000} value={text} onChange={e => setText(e.target.value)} placeholder="What was decided, and what happens next? e.g. Logo 5 adopted; rollout starts in November." />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        <Button size="sm" disabled={!text.trim() || publish.isPending} onClick={() => publish.mutate({ pollId: poll.id, outcome: text })}>
          <BellRing className="mr-1.5 h-4 w-4" /> Publish & notify voters
        </Button>
      </div>
    </div>
  ) : (
    <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => setOpen(true)}>
      <Gavel className="mr-1.5 h-4 w-4" /> Publish the decision
    </Button>
  );
}

export function downloadPollResults(poll: Poll, counts: number[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const total = counts.reduce((a, b) => a + b, 0);
  const unit = poll.poll_type === 'ranked' ? 'points' : 'votes';
  const rows = [
    [esc('Poll'), esc(poll.title)], [esc('Participants'), poll.total_participants || 0],
    [esc('Closes'), esc(poll.ends_at || 'open')], [],
    [esc('Option'), esc(unit), esc('share %')],
    ...poll.options.map((o, i) => [esc(o.text), counts[i] || 0, total ? ((100 * (counts[i] || 0)) / total).toFixed(1) : '0']),
  ];
  if (poll.outcome_text) rows.push([], [esc('Decision'), esc(poll.outcome_text)]);
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${poll.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60)}-results.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast.success('Results downloaded');
}

export function DownloadResultsButton({ poll, counts }: { poll: Poll; counts: number[] }) {
  return (
    <Button variant="ghost" size="sm" className="rounded-full" onClick={() => downloadPollResults(poll, counts)}>
      <Download className="mr-1 h-4 w-4" /> Results
    </Button>
  );
}
