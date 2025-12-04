import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Flag, Copy, Check, MoreHorizontal, Smile } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🙏', '✊', '🕊️'];

interface EmojiReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

interface CommentActionsProps {
  commentId: string;
  commentText: string;
  likeCount: number;
  isLiked: boolean;
  onToggleLike: () => void;
  onReport: (reason: string, details?: string) => void;
  isLikeLoading?: boolean;
  isReportLoading?: boolean;
  className?: string;
  emojiReactions?: EmojiReaction[];
  onEmojiReact?: (emoji: string) => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'violence', label: 'Violence or dangerous content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

const CommentActions = ({
  commentId,
  commentText,
  likeCount,
  isLiked,
  onToggleLike,
  onReport,
  isLikeLoading,
  isReportLoading,
  className,
  emojiReactions = [],
  onEmojiReact,
}: CommentActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [localReactions, setLocalReactions] = useState<Record<string, { count: number; hasReacted: boolean }>>({});

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.href}#comment-${commentId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Comment link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Check out this comment',
      text: commentText.substring(0, 100) + (commentText.length > 100 ? '...' : ''),
      url: `${window.location.href}#comment-${commentId}`,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    onReport(reportReason, reportDetails);
    setReportDialogOpen(false);
    setReportReason('');
    setReportDetails('');
  };

  const handleEmojiReact = (emoji: string) => {
    if (onEmojiReact) {
      onEmojiReact(emoji);
    } else {
      // Local state fallback
      setLocalReactions(prev => {
        const current = prev[emoji] || { count: 0, hasReacted: false };
        return {
          ...prev,
          [emoji]: {
            count: current.hasReacted ? current.count - 1 : current.count + 1,
            hasReacted: !current.hasReacted
          }
        };
      });
    }
    setEmojiPickerOpen(false);
  };

  const displayReactions = emojiReactions.length > 0 
    ? emojiReactions 
    : Object.entries(localReactions).map(([emoji, data]) => ({
        emoji,
        count: data.count,
        hasReacted: data.hasReacted
      }));

  return (
    <>
      <div className={cn('flex items-center gap-1 flex-wrap', className)}>
        {/* Emoji Reactions Display */}
        <AnimatePresence>
          {displayReactions.filter(r => r.count > 0).map((reaction) => (
            <motion.div
              key={reaction.emoji}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiReact(reaction.emoji)}
                className={cn(
                  'h-6 px-1.5 gap-0.5 text-xs rounded-full',
                  reaction.hasReacted 
                    ? 'bg-primary/10 border border-primary/30 hover:bg-primary/20' 
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="font-medium">{reaction.count}</span>
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Emoji Button */}
        <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 rounded-full hover:bg-muted"
            >
              <Smile className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start" side="top">
            <div className="grid grid-cols-5 gap-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  onClick={() => handleEmojiReact(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-base"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-4 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleLike}
          disabled={isLikeLoading}
          className={cn(
            'h-7 px-2 gap-1 text-xs',
            isLiked && 'text-red-500 hover:text-red-600'
          )}
        >
          <Heart className={cn('w-3.5 h-3.5', isLiked && 'fill-current')} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="h-7 px-2 gap-1 text-xs"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Share2 className="w-3.5 h-3.5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setReportDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Flag className="w-4 h-4 mr-2" />
              Report comment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
            <DialogDescription>
              Help us understand what's wrong with this comment. Reports are anonymous and reviewed by our moderation team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Why are you reporting this comment?</Label>
              <RadioGroup value={reportReason} onValueChange={setReportReason}>
                {REPORT_REASONS.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="font-normal cursor-pointer">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide any additional context..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={!reportReason || isReportLoading}
              variant="destructive"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommentActions;
