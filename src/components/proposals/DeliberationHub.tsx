import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageSquareQuote, Sparkles, Scale } from 'lucide-react';
import { useProposalArguments, useSubmitArgument } from '@/hooks/useWorldClassProposals';

interface Props { proposalId: string; }

const stanceColors: Record<string, string> = {
  for: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  against: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
  neutral: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
};

const DeliberationHub = ({ proposalId }: Props) => {
  const { data: args = [], isLoading } = useProposalArguments(proposalId);
  const submit = useSubmitArgument();
  const [stance, setStance] = useState<'for' | 'against' | 'neutral'>('for');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const forArgs = args.filter((a: any) => a.stance === 'for');
  const againstArgs = args.filter((a: any) => a.stance === 'against');
  const neutralArgs = args.filter((a: any) => a.stance === 'neutral');

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) return;
    submit.mutate(
      { proposalId, stance, title, body },
      { onSuccess: () => { setTitle(''); setBody(''); } }
    );
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Deliberation Hub
          <Badge variant="outline" className="ml-2 text-xs">IAP2 Involve</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Structured for/against debate. Best arguments rise to the top with AI-summarized reasoning.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Submission */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
          <div className="flex gap-2">
            {(['for', 'against', 'neutral'] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={stance === s ? 'default' : 'outline'}
                onClick={() => setStance(s)}
                className="capitalize"
              >
                {s === 'for' && <ThumbsUp className="w-3 h-3 mr-1" />}
                {s === 'against' && <ThumbsDown className="w-3 h-3 mr-1" />}
                {s === 'neutral' && <MessageSquareQuote className="w-3 h-3 mr-1" />}
                {s}
              </Button>
            ))}
          </div>
          <Input
            placeholder="Headline of your argument"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
          <Textarea
            placeholder="Detail your reasoning. Cite evidence where possible."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={1500}
          />
          <Button onClick={handleSubmit} disabled={submit.isPending || !title.trim() || !body.trim()}>
            <Sparkles className="w-4 h-4 mr-2" />
            Publish Argument
          </Button>
        </div>

        {/* Arguments */}
        <Tabs defaultValue="for">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="for">For ({forArgs.length})</TabsTrigger>
            <TabsTrigger value="against">Against ({againstArgs.length})</TabsTrigger>
            <TabsTrigger value="neutral">Neutral ({neutralArgs.length})</TabsTrigger>
          </TabsList>

          {[
            { key: 'for', list: forArgs },
            { key: 'against', list: againstArgs },
            { key: 'neutral', list: neutralArgs },
          ].map(({ key, list }) => (
            <TabsContent key={key} value={key} className="space-y-3 mt-4">
              {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
              {!isLoading && list.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No arguments yet. Be the first to contribute.
                </p>
              )}
              {list.map((a: any) => (
                <div key={a.id} className={`p-4 rounded-lg border ${stanceColors[a.stance]}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold">{a.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      <ThumbsUp className="w-3 h-3 mr-1" />{a.upvotes}
                    </Badge>
                  </div>
                  <p className="text-sm whitespace-pre-line">{a.body}</p>
                  {a.ai_summary && (
                    <div className="mt-2 pt-2 border-t border-current/20 text-xs italic flex gap-1">
                      <Sparkles className="w-3 h-3 mt-0.5" />
                      {a.ai_summary}
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DeliberationHub;
