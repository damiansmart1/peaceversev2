import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from '@/hooks/use-toast';
import { createNotification } from './useNotifications';

export interface Level {
  id: string;
  level_number: number;
  title: string;
  xp_required: number;
  icon: string;
  description: string;
  rewards: any[];
}

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  peace_points: number;
  xp_points: number;
  current_level: number;
  login_streak: number;
  total_stories: number;
  total_actions: number;
  region: string;
  profile_frame: string;
  avatar_accessories: any[];
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  start_date: string;
  end_date: string;
  points_reward: number;
  badge_reward: string;
  is_active: boolean;
  image_url: string;
  guidelines: string;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  submission_type: string;
  submission_url: string;
  submission_text: string;
  status: string;
  points_awarded: number;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  peace_points: number;
  xp_points: number;
  current_level: number;
  region: string;
  rank_global: number;
  rank_regional: number;
  weekly_points: number;
}

// Fetch all levels
export const useLevels = () => {
  return useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('level_number', { ascending: true });
      
      if (error) throw error;
      return data as Level[];
    }
  });
};

// Fetch current user's gamification profile
export const useUserGamificationProfile = () => {
  return useQuery({
    queryKey: ['userGamificationProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    }
  });
};

// Fetch active weekly challenges
export const useWeeklyChallenges = () => {
  return useQuery({
    queryKey: ['weeklyChallenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as WeeklyChallenge[];
    }
  });
};

// Submit a challenge
export const useSubmitChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: {
      challenge_id: string;
      submission_type: string;
      submission_url?: string;
      submission_text?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('challenge_submissions')
        .insert({
          ...submission,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for challenge submission
      await createNotification(
        user.id,
        'gamification',
        '🎯 Challenge Submitted!',
        'Your submission is under review. Points will be awarded once approved.',
        { challenge_id: submission.challenge_id }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challengeSubmissions'] });
      toast({
        title: 'Challenge Submitted!',
        description: 'Your submission is under review. Points will be awarded once approved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
};

// Fetch user's challenge submissions
export const useUserChallengeSubmissions = () => {
  return useQuery({
    queryKey: ['challengeSubmissions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('challenge_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ChallengeSubmission[];
    }
  });
};

// Fetch leaderboard
export const useLeaderboard = (filter: 'global' | 'regional' | 'weekly' = 'global', region?: string) => {
  return useQuery({
    queryKey: ['leaderboard', filter, region],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, peace_points, xp_points, current_level, region');

      if (filter === 'regional' && region) {
        query = query.eq('region', region);
      }

      query = query.order('xp_points', { ascending: false }).limit(100);

      const { data, error } = await query;
      if (error) throw error;

      // Add ranking
      return data.map((user, index) => ({
        ...user,
        rank_global: index + 1,
        rank_regional: index + 1
      })) as LeaderboardEntry[];
    }
  });
};

// Award points (called from other actions)
export const useAwardPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      action_type: string;
      points: number;
      description?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('award_points', {
        p_user_id: user.id,
        p_action_type: params.action_type,
        p_points: params.points,
        p_description: params.description
      });

      if (error) throw error;

      // Create notification for points awarded
      await createNotification(
        user.id,
        'gamification',
        `🎉 +${params.points} Peace Points!`,
        params.description || `You earned ${params.points} points for ${params.action_type}!`,
        { action_type: params.action_type, points: params.points }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGamificationProfile'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    }
  });
};

// Update streak
export const useUpdateStreak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('update_user_streak', {
        p_user_id: user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGamificationProfile'] });
    }
  });
};

// Helper to send notification for level up
export const notifyLevelUp = async (userId: string, newLevel: number, levelTitle: string) => {
  await createNotification(
    userId,
    'achievement',
    `⭐ Level Up! You reached Level ${newLevel}!`,
    `Congratulations! You are now a ${levelTitle}!`,
    { level: newLevel, title: levelTitle }
  );
};

// Helper to send notification for badge earned
export const notifyBadgeEarned = async (userId: string, badgeName: string, points: number) => {
  await createNotification(
    userId,
    'achievement',
    `🏆 Badge Earned: ${badgeName}!`,
    `You earned ${points} Peace Points with this achievement!`,
    { badge: badgeName, points }
  );
};

// Helper to send notification for streak bonus
export const notifyStreakBonus = async (userId: string, streakDays: number, bonusPoints: number) => {
  await createNotification(
    userId,
    'gamification',
    `🔥 ${streakDays}-Day Streak Bonus!`,
    `Amazing! You earned +${bonusPoints} bonus Peace Points for your dedication!`,
    { streak_days: streakDays, bonus_points: bonusPoints }
  );
};
