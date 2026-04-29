import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface Source {
  id: number;
  quote: string;
  section?: string | null;
  documentTitle?: string | null;
}

export function CitationChip({ source, num }: { source: Source; num: number }) {
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 mx-0.5 rounded-md text-[10px] font-bold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 hover:scale-110 transition-all cursor-help align-text-top"
          aria-label={`Citation ${num}`}
        >
          {num}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="w-80 p-3 text-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold bg-primary/15 text-primary">
            {num}
          </span>
          {source.documentTitle && (
            <span className="font-semibold text-foreground truncate">{source.documentTitle}</span>
          )}
        </div>
        <blockquote className="text-foreground/80 italic border-l-2 border-primary/40 pl-2 leading-relaxed">
          "{source.quote}"
        </blockquote>
        {source.section && (
          <p className="text-[10px] text-muted-foreground mt-2">📍 {source.section}</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * Replaces inline `[1]`, `[2]`-style citation markers in markdown text
 * with React CitationChip components.
 *
 * Returns an array of strings + JSX nodes that can be rendered inline,
 * OR — if you need pure markdown — call `stripCitations` instead.
 */
export function renderWithCitations(text: string, sources: Source[]): React.ReactNode[] {
  if (!text || !sources?.length) return [text];
  const sourceMap = new Map(sources.map(s => [s.id, s]));
  const parts: React.ReactNode[] = [];
  const regex = /\[(\d+)\]/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    const src = sourceMap.get(num);
    if (!src) continue;
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    parts.push(<CitationChip key={`cit-${match.index}`} source={src} num={num} />);
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}
