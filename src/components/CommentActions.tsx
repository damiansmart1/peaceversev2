import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Flag, Copy, Check, MoreHorizontal } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
}: CommentActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

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

  return (
    <>
      <div className={cn('flex items-center gap-1', className)}>
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