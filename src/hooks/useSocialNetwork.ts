import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// User follows hooks
export const useUserFollows = (userId?: string) => {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ['user-follows', targetId],
    queryFn: async () => {
      if (!targetId) return { followers: [], following: [] };

      const [followersRes, followingRes] = await Promise.all([
        supabase.from('user_follows').select('follower_id').eq('following_id', targetId),
        supabase.from('user_follows').select('following_id').eq('follower_id', targetId)
      ]);

      return {
        followers: followersRes.data || [],
        following: followingRes.data || []
      };
    },
    enabled: !!targetId,
  });
};

export const useIsFollowing = (targetUserId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['is-following', user?.id, targetUserId],
    queryFn: async () => {
      if (!user?.id || !targetUserId) return false;
      
      const { data } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      return !!data;
    },
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });
};

export const useFollowUser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: targetUserId });

      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['user-follows'] });
      queryClient.invalidateQueries({ queryKey: ['is-following', user?.id, targetUserId] });
      toast.success('Following user!');
    },
    onError: () => toast.error('Failed to follow user'),
  });
};

export const useUnfollowUser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;
    },
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['user-follows'] });
      queryClient.invalidateQueries({ queryKey: ['is-following', user?.id, targetUserId] });
      toast.success('Unfollowed user');
    },
    onError: () => toast.error('Failed to unfollow user'),
  });
};

// Direct messages hooks
export const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: messages } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!messages) return [];

      // Group by conversation partner
      const conversationMap = new Map();
      messages.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            partnerId,
            lastMessage: msg,
            unreadCount: msg.receiver_id === user.id && !msg.is_read ? 1 : 0
          });
        } else if (msg.receiver_id === user.id && !msg.is_read) {
          conversationMap.get(partnerId).unreadCount++;
        }
      });

      // Fetch partner profiles
      const partnerIds = Array.from(conversationMap.keys());
      if (partnerIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', partnerIds);

      return Array.from(conversationMap.values()).map(conv => ({
        ...conv,
        partner: profiles?.find(p => p.id === conv.partnerId)
      }));
    },
    enabled: !!user?.id,
  });
};

export const useDirectMessages = (partnerId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['direct-messages', user?.id, partnerId],
    queryFn: async () => {
      if (!user?.id || !partnerId) return [];

      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      return data || [];
    },
    enabled: !!user?.id && !!partnerId,
  });
};

export const useSendDirectMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('direct_messages')
        .insert({ sender_id: user.id, receiver_id: receiverId, content });

      if (error) throw error;
    },
    onSuccess: (_, { receiverId }) => {
      queryClient.invalidateQueries({ queryKey: ['direct-messages', user?.id, receiverId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => toast.error('Failed to send message'),
  });
};

// Chatrooms hooks
export const useChatrooms = (category?: string) => {
  return useQuery({
    queryKey: ['chatrooms', category],
    queryFn: async () => {
      let query = supabase.from('chatrooms').select('*').eq('is_public', true);
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      const { data } = await query.order('created_at', { ascending: false });
      return data || [];
    },
  });
};

export const useChatroomMembers = (chatroomId: string) => {
  return useQuery({
    queryKey: ['chatroom-members', chatroomId],
    queryFn: async () => {
      const { data: members } = await supabase
        .from('chatroom_members')
        .select('*')
        .eq('chatroom_id', chatroomId);

      if (!members || members.length === 0) return [];

      const userIds = members.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      return members.map(m => ({
        ...m,
        profile: profiles?.find(p => p.id === m.user_id)
      }));
    },
    enabled: !!chatroomId,
  });
};

export const useChatroomMessages = (chatroomId: string) => {
  return useQuery({
    queryKey: ['chatroom-messages', chatroomId],
    queryFn: async () => {
      const { data: messages } = await supabase
        .from('chatroom_messages')
        .select('*')
        .eq('chatroom_id', chatroomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!messages || messages.length === 0) return [];

      const userIds = [...new Set(messages.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', userIds);

      return messages.map(m => ({
        ...m,
        profile: profiles?.find(p => p.id === m.user_id)
      }));
    },
    enabled: !!chatroomId,
  });
};

export const useJoinChatroom = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatroomId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('chatroom_members')
        .insert({ chatroom_id: chatroomId, user_id: user.id });

      if (error && !error.message.includes('duplicate')) throw error;
    },
    onSuccess: (_, chatroomId) => {
      queryClient.invalidateQueries({ queryKey: ['chatroom-members', chatroomId] });
      toast.success('Joined chatroom!');
    },
    onError: () => toast.error('Failed to join chatroom'),
  });
};

export const useSendChatroomMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatroomId, content }: { chatroomId: string; content: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('chatroom_messages')
        .insert({ chatroom_id: chatroomId, user_id: user.id, content });

      if (error) throw error;
    },
    onSuccess: (_, { chatroomId }) => {
      queryClient.invalidateQueries({ queryKey: ['chatroom-messages', chatroomId] });
    },
    onError: () => toast.error('Failed to send message'),
  });
};

export const useCreateChatroom = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description: string; category: string; location_region?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: chatroom, error } = await supabase
        .from('chatrooms')
        .insert({ ...data, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator
      await supabase
        .from('chatroom_members')
        .insert({ chatroom_id: chatroom.id, user_id: user.id, role: 'admin' });

      return chatroom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatrooms'] });
      toast.success('Chatroom created!');
    },
    onError: () => toast.error('Failed to create chatroom'),
  });
};

// Creator earnings hooks
export const useUserWallet = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-wallet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      let { data } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Create wallet if doesn't exist
      if (!data) {
        const { data: newWallet } = await supabase
          .from('user_wallets')
          .insert({ user_id: user.id })
          .select()
          .single();
        data = newWallet;
      }

      return data;
    },
    enabled: !!user?.id,
  });
};

export const useCreatorEarnings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['creator-earnings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data } = await supabase
        .from('creator_earnings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      return data || [];
    },
    enabled: !!user?.id,
  });
};

export const useTipContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, creatorId, amount, message }: { contentId: string; creatorId: string; amount: number; message?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Use secure server-side function for atomic tip processing
      const { data, error } = await supabase.rpc('process_content_tip', {
        p_content_id: contentId,
        p_creator_id: creatorId,
        p_amount: amount,
        p_message: message || null,
      });

      if (error) throw error;
      
      const result = data as any;
      if (result && !result.success) {
        throw new Error(result.error || 'Tip processing failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tips'] });
      toast.success('Tip sent! Thank you for supporting creators.');
    },
    onError: () => toast.error('Failed to send tip'),
  });
};

// Social profile hooks
export const useSocialProfile = (userId?: string) => {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ['social-profile', targetId],
    queryFn: async () => {
      if (!targetId) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

      // If no profile exists, return a default profile structure
      if (!profile) {
        return {
          id: targetId,
          username: null,
          display_name: user?.user_metadata?.first_name || 'User',
          avatar_url: null,
          bio: null,
          user_type: 'citizen',
          is_creator: false,
          is_verified: false,
          creator_tier: 'starter',
          peace_points: 0,
          current_level: 1,
          social_links: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          content: [],
          followersCount: 0,
          followingCount: 0
        };
      }

      const { data: content } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', targetId)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false });

      const [followersRes, followingRes] = await Promise.all([
        supabase.from('user_follows').select('id').eq('following_id', targetId),
        supabase.from('user_follows').select('id').eq('follower_id', targetId)
      ]);

      return {
        ...profile,
        content: content || [],
        followersCount: followersRes.data?.length || 0,
        followingCount: followingRes.data?.length || 0
      };
    },
    enabled: !!targetId,
  });
};
