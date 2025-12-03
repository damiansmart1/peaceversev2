import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedCommentsProps {
  contentId: string;
  isExpanded: boolean;
}

export const FeedComments = ({ contentId, isExpanded }: FeedCommentsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['feed-comments', contentId],
    queryFn: async () => {
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('content_id', contentId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!commentsData || commentsData.length === 0) return [];

      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      return commentsData.map(c => ({
        ...c,
        profile: profiles?.find(p => p.id === c.user_id)
      }));
    },
    enabled: isExpanded,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('comments')
        .insert({ content_id: contentId, user_id: user.id, text });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-comments', contentId] });
      setNewComment('');
      toast.success('Comment added!');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-comments', contentId] });
      toast.success('Comment deleted');
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    addCommentMutation.mutate(newComment.trim());
  };

  if (!isExpanded) return null;

  return (
    <div className="border-t p-4 space-y-4 bg-muted/30">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="text-xs">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[40px] resize-none"
            rows={1}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!newComment.trim() || addCommentMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-2 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <AnimatePresence>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map((comment: any) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-2 group"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profile?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {comment.profile?.display_name?.[0] || comment.profile?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-background rounded-lg p-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.profile?.display_name || comment.profile?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteCommentMutation.mutate(comment.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
};
