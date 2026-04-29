import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Props {
  score: number | null | undefined;
  level?: string | null;
  reason?: string | null;
  compact?: boolean;
}

export function ConfidenceBadge({ score, level, reason, compact = false }: Props) {
  if (score === null || score === undefined) return null;

  const pct = Math.round(score * 100);
  const tier =
    level === 'high' || score >= 0.85 ? 'high' :
    level === 'low' || score < 0.5 ? 'low' : 'medium';

  const config = {
    high:   { Icon: ShieldCheck,    label: 'High confidence',   cls: 'bg-success/10 text-success border-success/30' },
    medium: { Icon: ShieldQuestion, label: 'Medium confidence', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    low:    { Icon: ShieldAlert,    label: 'Low confidence',    cls: 'bg-destructive/10 text-destructive border-destructive/30' },
  }[tier];

  const { Icon } = config;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md border font-medium',
            compact ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5',
            config.cls
          )}
        >
          <Icon className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
          {compact ? `${pct}%` : `${config.label} · ${pct}%`}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-xs">
        <p className="font-semibold mb-1">{config.label} ({pct}%)</p>
        {reason ? (
          <p className="text-muted-foreground">{reason}</p>
        ) : (
          <p className="text-muted-foreground">
            How directly the source documents support this answer.
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
