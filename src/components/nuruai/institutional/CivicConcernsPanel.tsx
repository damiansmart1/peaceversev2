import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Send, CheckCircle, Search, Filter, Clock, ThumbsUp, AlertTriangle,
  ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

interface Props {
  questions: any[];
  onRespond: (question: any) => void;
}

const priorityColors: Record<string, string> = {
  high: 'border-red-300 bg-red-50/50',
  medium: 'border-amber-300 bg-amber-50/50',
  low: 'border-border/30 bg-card/40',
};

const categoryIcons: Record<string, string> = {
  budget: '💰',
  policy: '📋',
  governance: '🏛️',
  rights: '⚖️',
  education: '📚',
  health: '🏥',
  infrastructure: '🏗️',
};

export const CivicConcernsPanel = ({ questions, onRespond }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'urgent'>('recent');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = questions.filter(q =>
    q.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'popular') return (b.upvote_count || 0) - (a.upvote_count || 0);
    if (sortBy === 'urgent') return (b.upvote_count || 0) > 10 ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border border-border/20 bg-card/30">
        <CheckCircle className="h-10 w-10 mx-auto mb-3 text-emerald-500/30" />
        <p className="text-sm font-medium">All Civic Questions Addressed</p>
        <p className="text-[11px] text-muted-foreground mt-1">Great work! No pending concerns require institutional response.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search civic concerns..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <Filter className="h-3 w-3 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent" className="text-xs">Most Recent</SelectItem>
            <SelectItem value="popular" className="text-xs">Most Upvoted</SelectItem>
            <SelectItem value="urgent" className="text-xs">Most Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Showing {sorted.length} of {questions.length} concerns
        </p>
        <Badge variant="outline" className="text-[9px]">
          <AlertTriangle className="h-2.5 w-2.5 mr-1" />
          {questions.filter(q => (q.upvote_count || 0) > 10).length} high priority
        </Badge>
      </div>

      {/* Questions List */}
      <ScrollArea className="max-h-[550px]">
        <AnimatePresence>
          {sorted.map((q, i) => {
            const priority = (q.upvote_count || 0) > 20 ? 'high' : (q.upvote_count || 0) > 5 ? 'medium' : 'low';
            const isExpanded = expandedId === q.id;
            const categoryIcon = categoryIcons[q.tags?.[0]?.toLowerCase()] || '📝';

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-xl border p-4 mb-3 transition-all duration-200 hover:shadow-sm ${priorityColors[priority]}`}
              >
                <div className="flex items-start gap-3">
                  {/* Priority Indicator */}
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <span className="text-base">{categoryIcon}</span>
                    <div className={`w-1 rounded-full ${priority === 'high' ? 'bg-red-400 h-8' : priority === 'medium' ? 'bg-amber-400 h-6' : 'bg-border h-4'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Question Text */}
                    <p className="text-xs font-medium text-foreground leading-relaxed">
                      {isExpanded ? q.question_text : q.question_text?.slice(0, 200)}
                      {!isExpanded && q.question_text?.length > 200 && '...'}
                    </p>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {q.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                          {tag}
                        </Badge>
                      ))}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(parseISO(q.created_at), { addSuffix: true })}
                      </span>
                      {(q.upvote_count || 0) > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <ThumbsUp className="h-2.5 w-2.5" />
                          {q.upvote_count} citizens
                        </span>
                      )}
                      {q.view_count > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Eye className="h-2.5 w-2.5" />
                          {q.view_count} views
                        </span>
                      )}
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-border/20 space-y-2"
                        >
                          {q.document_id && (
                            <p className="text-[10px] text-muted-foreground">
                              📄 Related document: {q.document_id}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            Submitted: {format(parseISO(q.created_at), 'MMMM d, yyyy \'at\' HH:mm')}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 text-[10px] gap-1 px-2.5"
                      onClick={() => onRespond(q)}
                    >
                      <Send className="h-3 w-3" /> Respond
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1 px-2"
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {isExpanded ? 'Less' : 'More'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};
