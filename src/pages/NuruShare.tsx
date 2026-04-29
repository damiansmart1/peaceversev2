import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Brain, FileText, MessageSquareText, ArrowLeft, Eye, Clock, Bot, User as UserIcon } from 'lucide-react';
import { useSharedConversation } from '@/hooks/useNuruShare';
import { CitationChip } from '@/components/nuruai/CitationChip';
import { ConfidenceBadge } from '@/components/nuruai/ConfidenceBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

function renderWithCitationsInline(text: string, sources: any[]) {
  const realSources = (sources || []).filter(s => !s._meta);
  if (!text) return null;
  if (!realSources.length) return <ReactMarkdown>{text}</ReactMarkdown>;

  const sourceMap = new Map(realSources.map(s => [s.id, s]));
  const regex = /\[(\d+)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    const src = sourceMap.get(num);
    if (!src) continue;
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    parts.push(<CitationChip key={`s-${m.index}`} source={src} num={num} />);
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));

  // Render text segments through markdown, citations as JSX
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {parts.map((p, i) =>
        typeof p === 'string'
          ? <ReactMarkdown key={i} components={{ p: ({ children }) => <span>{children}</span> }}>{p}</ReactMarkdown>
          : p
      )}
    </div>
  );
}

export default function NuruShare() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useSharedConversation(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Brain className="h-10 w-10 text-primary mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading shared conversation…</p>
        </div>
      </div>
    );
  }

  if (error || !data?.conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md p-6 text-center">
          <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h1 className="text-lg font-semibold mb-2">Shared conversation not found</h1>
          <p className="text-sm text-muted-foreground mb-4">
            This link may be expired, revoked, or invalid.
          </p>
          <Link to="/nuru-ai">
            <Button size="sm" variant="outline" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Open NuruAI
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { conversation, messages } = data;
  const doc = conversation.civic_documents;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative border-b border-border/30 bg-gradient-to-br from-primary/8 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-5">
          <Link to="/nuru-ai" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="h-3 w-3" /> Back to NuruAI
          </Link>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15 border border-primary/20">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight truncate">{conversation.title || 'Shared NuruAI conversation'}</h1>
                <Badge variant="outline" className="text-[10px]">Public share</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(conversation.created_at), 'PP')}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {conversation.share_view_count || 0} views</span>
                <span className="flex items-center gap-1"><MessageSquareText className="h-3 w-3" /> {messages.length} messages</span>
                {doc && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {doc.title}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <ScrollArea className="container mx-auto px-4 py-5 max-w-3xl">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No messages in this conversation.
            </Card>
          ) : (
            messages.map((m: any) => {
              const isUser = m.role === 'user';
              const sources = Array.isArray(m.sources) ? m.sources : [];
              const meta = sources.find((s: any) => s._meta);
              return (
                <div key={m.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isUser ? 'bg-secondary' : 'bg-primary/15'}`}>
                    {isUser ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <div className={`flex-1 min-w-0 ${isUser ? 'max-w-[85%]' : ''}`}>
                    <Card className={`p-3 ${isUser ? 'bg-primary/5 border-primary/15' : ''}`}>
                      {!isUser && (m.confidence !== null && m.confidence !== undefined) && (
                        <div className="mb-2">
                          <ConfidenceBadge
                            score={m.confidence}
                            level={meta?.level}
                            reason={meta?.reason}
                          />
                        </div>
                      )}
                      {isUser ? (
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        renderWithCitationsInline(m.content, sources)
                      )}
                    </Card>
                    <p className="text-[10px] text-muted-foreground mt-1 px-1">
                      {format(new Date(m.created_at), 'PP p')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-8 pt-4 border-t text-center">
          <p className="text-[11px] text-muted-foreground mb-2">
            This is a shared NuruAI conversation. Start your own to ask follow-up questions.
          </p>
          <Link to="/nuru-ai">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Brain className="h-3.5 w-3.5" /> Open NuruAI
            </Button>
          </Link>
        </div>
      </ScrollArea>
    </div>
  );
}
