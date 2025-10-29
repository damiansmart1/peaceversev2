import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProposalComments } from '@/hooks/useProposalDetail';
import { useAddComment } from '@/hooks/useProposals';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

interface ProposalCommentsProps {
  proposalId: string;
}

const ProposalComments = ({ proposalId }: ProposalCommentsProps) => {
  const [comment, setComment] = useState('');
  const [displayAnonymous, setDisplayAnonymous] = useState(false);
  const { data: comments, isLoading } = useProposalComments(proposalId);
  const addComment = useAddComment();

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    await addComment.mutateAsync({
      proposalId,
      body: comment,
      displayAnonymous,
    });

    setComment('');
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card border border-border rounded-lg space-y-4">
        <h3 className="text-lg font-semibold">Add Comment</h3>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="comment-anonymous"
              checked={displayAnonymous}
              onCheckedChange={setDisplayAnonymous}
            />
            <Label htmlFor="comment-anonymous" className="text-sm cursor-pointer">
              Post anonymously
            </Label>
          </div>
          <Button onClick={handleSubmit} disabled={!comment.trim() || addComment.isPending}>
            Post Comment
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({comments?.length || 0})
        </h3>

        {isLoading ? (
          <p className="text-muted-foreground">Loading comments...</p>
        ) : !comments || comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-card border border-border rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {comment.display_anonymous
                        ? 'A'
                        : comment.profiles?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {comment.display_anonymous
                          ? 'Anonymous'
                          : comment.profiles?.display_name || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{comment.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalComments;
