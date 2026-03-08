import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2, CheckCircle, Clock, Search, ThumbsUp, ThumbsDown,
  Share2, ExternalLink, MessageSquareText
} from 'lucide-react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

interface Props {
  responses: any[];
  questions: any[];
}

const statusStyles: Record<string, { bg: string; icon: typeof CheckCircle }> = {
  published: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  draft: { bg: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  under_review: { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
};

export const PublishedResponsesPanel = ({ responses, questions }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');

  const enrichedResponses = responses?.map(r => {
    const question = questions?.find((q: any) => q.id === r.question_id);
    return { ...r, question };
  }) || [];

  const filtered = enrichedResponses.filter(r =>
    r.response_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.question?.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!responses || responses.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border border-border/20 bg-card/30">
        <Building2 className="h-10 w-10 mx-auto mb-3 text-primary/20" />
        <p className="text-sm font-medium">No Institutional Responses Yet</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Responses to civic questions will appear here once published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex flex-wrap gap-3 p-3 rounded-xl border border-border/20 bg-card/30">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[11px] font-medium">
            {responses.filter(r => r.status === 'published').length} Published
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-medium">
            {new Set(responses.map(r => r.institution_name)).size} Institutions
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[11px] font-medium">
            {responses.filter(r => r.question_id).length} To Questions
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search responses..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Responses List */}
      <ScrollArea className="max-h-[500px]">
        {filtered.map((r, i) => {
          const style = statusStyles[r.status] || statusStyles.published;
          const StatusIcon = style.icon;
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-border/30 bg-card/40 p-4 mb-3 hover:bg-card/60 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold">{r.institution_name}</span>
                    <p className="text-[9px] text-muted-foreground">
                      {formatDistanceToNow(parseISO(r.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[9px] px-1.5 ${style.bg}`}>
                  <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                  {r.status}
                </Badge>
              </div>

              {/* Original Question (if linked) */}
              {r.question && (
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/10 mb-3">
                  <p className="text-[10px] text-muted-foreground font-medium mb-0.5">In response to:</p>
                  <p className="text-[11px] text-foreground/80 italic">"{r.question.question_text?.slice(0, 150)}..."</p>
                </div>
              )}

              {/* Response Text */}
              <p className="text-xs text-foreground/90 leading-relaxed">{r.response_text}</p>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/10">
                <p className="text-[10px] text-muted-foreground">
                  {format(parseISO(r.created_at), 'MMM d, yyyy \'at\' HH:mm')}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2">
                    <ThumbsUp className="h-2.5 w-2.5" /> Helpful
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2">
                    <Share2 className="h-2.5 w-2.5" /> Share
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </ScrollArea>
    </div>
  );
};
