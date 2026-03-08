import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles, ChevronDown, ChevronRight, Loader2, AlertTriangle, Users,
  Bookmark, BookmarkCheck, MessageSquare, Share2, Globe, CheckCircle2,
  Copy, Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface PolicySectionCardProps {
  index: number;
  title: string;
  content: string;
  explanation?: string;
  impact?: string;
  isExpanded: boolean;
  isLoading: boolean;
  isBookmarked: boolean;
  isRead: boolean;
  bookmarkNote?: string;
  onExplain: () => void;
  onToggleBookmark: () => void;
  onAddNote: (note: string) => void;
  onTranslate: () => void;
  onShare: () => void;
  isTranslating?: boolean;
  translatedContent?: string;
  searchHighlight?: string;
}

const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-gold/30 text-foreground rounded px-0.5">{part}</mark> : part
  );
};

const PolicySectionCard = ({
  index, title, content, explanation, impact, isExpanded, isLoading,
  isBookmarked, isRead, bookmarkNote, onExplain, onToggleBookmark, onAddNote,
  onTranslate, onShare, isTranslating, translatedContent, searchHighlight,
}: PolicySectionCardProps) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(bookmarkNote || '');

  const handleCopySection = () => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    toast.success('Section copied to clipboard');
  };

  const handleSaveNote = () => {
    onAddNote(noteText);
    setShowNoteInput(false);
  };

  const displayContent = translatedContent || content;

  return (
    <motion.div
      id={`policy-section-${index}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden group"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-primary/60">§{index + 1}</span>
              <h4 className="text-sm font-semibold">{searchHighlight ? highlightText(title, searchHighlight) : title}</h4>
              {isRead && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {searchHighlight ? highlightText(displayContent, searchHighlight) : displayContent}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleBookmark} title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
              {isBookmarked ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNoteInput(!showNoteInput)} title="Add note">
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopySection} title="Copy section">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onTranslate} title="Translate" disabled={isTranslating}>
              <Globe className={`h-3.5 w-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onShare} title="Share section">
              <Share2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline" size="sm" className="h-8 text-xs gap-1.5 ml-1"
              onClick={onExplain} disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Analyzing...</>
              ) : explanation ? (
                <>{isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />} {isExpanded ? 'Hide' : 'Show'}</>
              ) : (
                <><Sparkles className="h-3 w-3" /> Explain</>
              )}
            </Button>
          </div>
        </div>

        {/* Annotation input */}
        <AnimatePresence>
          {showNoteInput && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 space-y-2">
                <Textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add your notes about this section..."
                  className="text-xs min-h-[60px]"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setShowNoteInput(false)}>Cancel</Button>
                  <Button size="sm" className="h-7 text-[10px]" onClick={handleSaveNote}>Save Note</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing bookmark note */}
        {bookmarkNote && !showNoteInput && (
          <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-primary font-medium mb-0.5">Your Note</p>
            <p className="text-xs text-foreground/70">{bookmarkNote}</p>
          </div>
        )}
      </div>

      {/* AI Explanation */}
      <AnimatePresence>
        {isExpanded && explanation && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="border-t border-border/20 bg-gradient-to-b from-primary/[0.03] to-transparent">
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[11px] font-semibold text-primary">Plain Language Explanation</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{explanation}</p>
                </div>

                {impact && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[11px] font-semibold text-amber-500">Citizen Impact</span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{impact}</p>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  AI-generated explanation — verify with official sources
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PolicySectionCard;
