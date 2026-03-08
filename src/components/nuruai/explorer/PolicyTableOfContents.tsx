import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookmarkCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PolicySection {
  title: string;
  content: string;
}

interface PolicyTableOfContentsProps {
  sections: PolicySection[];
  activeSectionIndex: number | null;
  onSelectSection: (index: number) => void;
  sectionsRead: number[];
  bookmarkedSections: number[];
}

const PolicyTableOfContents = ({
  sections, activeSectionIndex, onSelectSection, sectionsRead, bookmarkedSections,
}: PolicyTableOfContentsProps) => {
  return (
    <div className="rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm overflow-hidden">
      <div className="p-3 border-b border-border/20">
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Table of Contents</h4>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="p-2 space-y-0.5">
          {sections.map((section, i) => {
            const isRead = sectionsRead.includes(i);
            const isBookmarked = bookmarkedSections.includes(i);
            const isActive = activeSectionIndex === i;

            return (
              <button
                key={i}
                onClick={() => onSelectSection(i)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-[10px] font-mono text-muted-foreground/50 w-5 shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 truncate">{section.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {isBookmarked && <BookmarkCheck className="h-3 w-3 text-primary" />}
                  {isRead && <CheckCircle2 className="h-3 w-3 text-success" />}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PolicyTableOfContents;
