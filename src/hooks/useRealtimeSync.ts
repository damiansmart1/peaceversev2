import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';

type RealtimeTable = 
  | 'citizen_reports'
  | 'verification_tasks'
  | 'proposals'
  | 'proposal_votes'
  | 'polls'
  | 'poll_responses'
  | 'notifications'
  | 'content'
  | 'comments'
  | 'likes'
  | 'direct_messages'
  | 'chatroom_messages'
  | 'alert_logs'
  | 'incident_risk_scores'
  | 'predictive_hotspots';

interface RealtimeSyncConfig {
  table: RealtimeTable;
  queryKeys: string[][];
  filter?: { column: string; value: string };
}

// Hook for subscribing to a single table
export const useRealtimeTable = (config: RealtimeSyncConfig) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channelName = `realtime-${config.table}-${config.filter?.value || 'all'}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table,
          ...(config.filter && { filter: `${config.filter.column}=eq.${config.filter.value}` }),
        },
        (payload) => {
          console.log(`[Realtime] ${config.table} change:`, payload.eventType);
          
          // Invalidate all related query keys
          config.queryKeys.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [config.table, config.filter?.value, queryClient]);
};

// Hook for subscribing to multiple tables at once
export const useRealtimeSyncAll = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Citizen Reports / Incidents
    const incidentsChannel = supabase
      .channel('realtime-incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'citizen_reports' }, () => {
        queryClient.invalidateQueries({ queryKey: ['incidents'] });
        queryClient.invalidateQueries({ queryKey: ['citizen-reports'] });
        queryClient.invalidateQueries({ queryKey: ['my-reports'] });
        queryClient.invalidateQueries({ queryKey: ['incident-stats'] });
        queryClient.invalidateQueries({ queryKey: ['report-detail'] });
      })
      .subscribe();
    channels.push(incidentsChannel);

    // Verification Tasks
    const verificationChannel = supabase
      .channel('realtime-verification')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verification_tasks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['verification-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['my-verification-tasks'] });
      })
      .subscribe();
    channels.push(verificationChannel);

    // Proposals & Votes
    const proposalsChannel = supabase
      .channel('realtime-proposals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposals' }, () => {
        queryClient.invalidateQueries({ queryKey: ['proposals'] });
        queryClient.invalidateQueries({ queryKey: ['admin-proposals'] });
        queryClient.invalidateQueries({ queryKey: ['proposal'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposal_votes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['proposals'] });
        queryClient.invalidateQueries({ queryKey: ['proposal'] });
        queryClient.invalidateQueries({ queryKey: ['proposal-votes'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proposal_comments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['proposal'] });
        queryClient.invalidateQueries({ queryKey: ['comments'] });
        queryClient.invalidateQueries({ queryKey: ['proposal-comments'] });
      })
      .subscribe();
    channels.push(proposalsChannel);

    // Polls & Responses
    const pollsChannel = supabase
      .channel('realtime-polls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls' }, () => {
        queryClient.invalidateQueries({ queryKey: ['polls'] });
        queryClient.invalidateQueries({ queryKey: ['featured-polls'] });
        queryClient.invalidateQueries({ queryKey: ['poll'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_responses' }, () => {
        queryClient.invalidateQueries({ queryKey: ['poll'] });
        queryClient.invalidateQueries({ queryKey: ['poll-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['poll-user-response'] });
      })
      .subscribe();
    channels.push(pollsChannel);

    // Content & Social
    const contentChannel = supabase
      .channel('realtime-content')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => {
        queryClient.invalidateQueries({ queryKey: ['content'] });
        queryClient.invalidateQueries({ queryKey: ['social-feed'] });
        queryClient.invalidateQueries({ queryKey: ['admin-content'] });
        queryClient.invalidateQueries({ queryKey: ['user-content'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
        queryClient.invalidateQueries({ queryKey: ['content-comments'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['content'] });
        queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_tips' }, () => {
        queryClient.invalidateQueries({ queryKey: ['creator-earnings'] });
        queryClient.invalidateQueries({ queryKey: ['user-wallet'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_follows' }, () => {
        queryClient.invalidateQueries({ queryKey: ['followers'] });
        queryClient.invalidateQueries({ queryKey: ['following'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      })
      .subscribe();
    channels.push(contentChannel);

    // Notifications
    const notificationsChannel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
      })
      .subscribe();
    channels.push(notificationsChannel);

    // Alerts & Risk
    const alertsChannel = supabase
      .channel('realtime-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alert_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        queryClient.invalidateQueries({ queryKey: ['alert-logs'] });
        queryClient.invalidateQueries({ queryKey: ['realtime-alerts'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_risk_scores' }, () => {
        queryClient.invalidateQueries({ queryKey: ['risk-scores'] });
        queryClient.invalidateQueries({ queryKey: ['incidents'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictive_hotspots' }, () => {
        queryClient.invalidateQueries({ queryKey: ['hotspots'] });
        queryClient.invalidateQueries({ queryKey: ['predictive-hotspots'] });
      })
      .subscribe();
    channels.push(alertsChannel);

    // Messages
    const messagesChannel = supabase
      .channel('realtime-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['direct-messages'] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chatroom_messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['chatroom-messages'] });
      })
      .subscribe();
    channels.push(messagesChannel);

    // Gamification & Challenges
    const gamificationChannel = supabase
      .channel('realtime-gamification')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_challenges' }, () => {
        queryClient.invalidateQueries({ queryKey: ['weekly-challenges'] });
        queryClient.invalidateQueries({ queryKey: ['challenges'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_submissions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['challenge-submissions'] });
        queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_achievements' }, () => {
        queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
        queryClient.invalidateQueries({ queryKey: ['gamification'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        queryClient.invalidateQueries({ queryKey: ['profiles'] });
      })
      .subscribe();
    channels.push(gamificationChannel);

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient]);
};

// Hook to sync a specific user's data
export const useUserRealtimeSync = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-sync-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_messages', filter: `receiver_id=eq.${userId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['direct-messages'] });
          queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};
