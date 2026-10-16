import { useState } from 'react';
import { Poll } from '@/hooks/usePolls';
import { PollCard } from './PollCard';
import { Button } from '@/components/ui/button';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PollItem = { kind: 'single'; poll: Poll } | { kind: 'group'; id: string; title: string; polls: Poll[] };

/** Collapse polls sharing a group_id into one item, keeping list order of the first member. */
export function groupPolls(polls: Poll[]): PollItem[] {
  const out: PollItem[] = [];
  const groups = new Map<string, Extract<PollItem, { kind: 'group' }>>();
  for (const p of polls) {
    if (!p.group_id) { out.push({ kind: 'single', poll: p }); continue; }
    let g = groups.get(p.group_id);
    if (!g) { g = { kind: 'group', id: p.group_id, title: p.group_title || p.title, polls: [] }; groups.set(p.group_id, g); out.push(g); }
    g.polls.push(p);
  }
  groups.forEach(g => g.polls.sort((a, b) => (a.group_order ?? 0) - (b.group_order ?? 0)));
  return out.map(i => (i.kind === 'group' && i.polls.length === 1 ? { kind: 'single', poll: i.polls[0] } : i));
}

export function PollGroupCard({ title, polls, compact, showFullResults }: { title: string; polls: Poll[]; compact?: boolean; showFullResults?: boolean }) {
  const [step, setStep] = useState(0);
  const current = polls[step];
  return (
    <div className="space-y-3 rounded-3xl border border-primary/30 bg-card/60 p-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"><Layers className="h-4 w-4" /></span>
          <div className="min-w-0">
            <p className="truncate font-display font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{polls.length} questions · question {step + 1} of {polls.length}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="icon" variant="ghost" aria-label="Previous question" disabled={step === 0} onClick={() => setStep(s => s - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" aria-label="Next question" disabled={step === polls.length - 1} onClick={() => setStep(s => s + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist">
        {polls.map((p, i) => (
          <button key={p.id} role="tab" aria-selected={i === step} onClick={() => setStep(i)}
            className={cn('shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              i === step ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50')}>
            {i + 1}. {p.title.replace(/^.*?:\s*/, '')}
          </button>
        ))}
      </div>
      <PollCard key={current.id} poll={current} compact={compact} showFullResults={showFullResults} />
    </div>
  );
}
