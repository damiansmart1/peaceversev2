import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

// Proposal comment actions
export const useCommentLikes = (commentId: string) => {
  return useQuery({
    queryKey: ['comment-likes', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!commentId,
  });
};

export const useUserCommentLike = (commentId: string) => {
  return useQuery({
    queryKey: ['user-comment-like', commentId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!commentId,
  });
};

export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: ['comment-likes', commentId] });
      queryClient.invalidateQueries({ queryKey: ['user-comment-like', commentId] });
    },
  });
};

export const useReportComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, reason, details }: { commentId: string; reason: string; details?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason,
          details,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Comment reported. Thank you for helping keep our community safe.');
      queryClient.invalidateQueries({ queryKey: ['comment-reports'] });
    },
    onError: (error) => {
      toast.error('Failed to report comment: ' + error.message);
    },
  });
};

// Content comment actions (for social feed)
export const useContentCommentLikes = (commentId: string) => {
  return useQuery({
    queryKey: ['content-comment-likes', commentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_comment_likes')
        .select('*')
        .eq('comment_id', commentId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!commentId,
  });
};

export const useUserContentCommentLike = (commentId: string) => {
  return useQuery({
    queryKey: ['user-content-comment-like', commentId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('content_comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!commentId,
  });
};

export const useToggleContentCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        const { error } = await supabase
          .from('content_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('content_comment_likes')
          .insert({ comment_id: commentId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: ['content-comment-likes', commentId] });
      queryClient.invalidateQueries({ queryKey: ['user-content-comment-like', commentId] });
    },
  });
};

export const useReportContentComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, reason, details }: { commentId: string; reason: string; details?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('content_comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason,
          details,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Comment reported. Thank you for helping keep our community safe.');
      queryClient.invalidateQueries({ queryKey: ['content-comment-reports'] });
    },
    onError: (error) => {
      toast.error('Failed to report comment: ' + error.message);
    },
  });
};