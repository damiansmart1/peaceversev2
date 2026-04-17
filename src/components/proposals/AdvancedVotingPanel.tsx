import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Vote, Shuffle, Calculator, ListChecks, ShieldCheck } from 'lucide-react';
import { useCastAdvancedVote } from '@/hooks/useWorldClassProposals';

interface Props {
  proposalId: string;
  method: 'simple' | 'ranked_choice' | 'quadratic' | 'approval' | 'weighted';
  options: Array<{ id: string; label: string }>;
  quadraticCredits?: number;
}

const AdvancedVotingPanel = ({ proposalId, method, options, quadraticCredits = 100 }: Props) => {
  const cast = useCastAdvancedVote();
  const [ranked, setRanked] = useState<string[]>([]);
  const [approval, setApproval] = useState<string[]>([]);
  const [quadratic, setQuadratic] = useState<Record<string, number>>(
    Object.fromEntries(options.map(o => [o.id, 0]))
  );

  const usedCredits = useMemo(
    () => Object.values(quadratic).reduce((s, v) => s + v * v, 0),
    [quadratic]
  );

  const moveRanked = (id: string) => {
    setRanked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleApproval = (id: string) => {
    setApproval(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submit = () => {
    if (method === 'ranked_choice') cast.mutate({ proposalId, method, ranked });
    else if (method === 'approval') cast.mutate({ proposalId, method, approval });
    else if (method === 'quadratic') cast.mutate({ proposalId, method, quadratic });
    else if (method === 'weighted') cast.mutate({ proposalId, method: 'weighted' });
  };

  const methodIcon = {
    ranked_choice: Shuffle,
    quadratic: Calculator,
    approval: ListChecks,
    weighted: Vote,
    simple: Vote,
  }[method];
  const Icon = methodIcon;

  if (method === 'simple') return null;

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <Icon className="w-5 h-5 text-primary" />
          {method.replace('_', '-').replace(/\b\w/g, l => l.toUpperCase())} Voting
          <Badge variant="outline" className="text-xs">
            <ShieldCheck className="w-3 h-3 mr-1" />Hash-chain verified
          </Badge>
        </CardTitle>
        {method === 'ranked_choice' && <p className="text-sm text-muted-foreground">Click options in order of preference (most preferred first).</p>}
        {method === 'quadratic' && <p className="text-sm text-muted-foreground">Allocate up to {quadraticCredits} credits. Cost grows quadratically — expressing strong preference is expensive but possible.</p>}
        {method === 'approval' && <p className="text-sm text-muted-foreground">Select all options you approve of.</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {method === 'ranked_choice' && (
          <div className="space-y-2">
            {options.map(o => {
              const rank = ranked.indexOf(o.id);
              return (
                <Button
                  key={o.id}
                  variant={rank >= 0 ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => moveRanked(o.id)}
                >
                  {rank >= 0 && <Badge className="mr-2">{rank + 1}</Badge>}
                  {o.label}
                </Button>
              );
            })}
          </div>
        )}

        {method === 'approval' && (
          <div className="space-y-2">
            {options.map(o => (
              <label key={o.id} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50">
                <Checkbox checked={approval.includes(o.id)} onCheckedChange={() => toggleApproval(o.id)} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        )}

        {method === 'quadratic' && (
          <div className="space-y-3">
            <div className="text-sm">
              Credits used: <span className={usedCredits > quadraticCredits ? 'text-red-500 font-bold' : 'font-bold'}>{usedCredits}</span> / {quadraticCredits}
            </div>
            {options.map(o => (
              <div key={o.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{o.label}</span>
                  <span>{quadratic[o.id]} votes ({quadratic[o.id] ** 2} credits)</span>
                </div>
                <Slider
                  value={[quadratic[o.id]]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={([v]) => setQuadratic(q => ({ ...q, [o.id]: v }))}
                />
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={submit}
          disabled={cast.isPending || (method === 'quadratic' && usedCredits > quadraticCredits)}
          className="w-full"
        >
          Cast {method.replace('_', ' ')} Vote
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdvancedVotingPanel;
