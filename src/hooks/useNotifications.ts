import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  type: 'content_approved' | 'content_rejected' | 'proposal_approved' | 'proposal_rejected' | 'system' | 'achievement' | 'gamification' | 'incident' | 'verification' | 'report_status';
  title: string;
  message: string;
  related_id: string | null;
  read: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Show toast for new notification
          const toastType = newNotification.type === 'incident' ? 'error' : 
                          newNotification.type === 'achievement' || newNotification.type === 'gamification' ? 'success' : 
                          'info';
          
          if (toastType === 'error') {
            toast.error(newNotification.title, {
              description: newNotification.message,
              duration: 8000,
            });
          } else if (toastType === 'success') {
            toast.success(newNotification.title, {
              description: newNotification.message,
              duration: 6000,
            });
          } else {
            toast.info(newNotification.title, {
              description: newNotification.message,
              duration: 5000,
            });
          }

          // Invalidate query to refresh notifications list
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });
};

// Helper function to create notifications
export const createNotification = async (
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  metadata?: Record<string, any>,
  relatedId?: string
) => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      metadata: metadata || null,
      related_id: relatedId || null,
    });

  if (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
};
