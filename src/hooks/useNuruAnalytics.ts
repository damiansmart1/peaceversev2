import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const sb = supabase as any;

// Token usage over time
export function useTokenUsageTimeline() {
  return useQuery({
    queryKey: ['nuru-token-timeline'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('nuru_token_usage')
        .select('tokens_used, request_type, model_used, created_at')
        .order('created_at', { ascending: true })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
  });
}

// Conversation analytics (engagement)
export function useConversationAnalytics() {
  return useQuery({
    queryKey: ['nuru-conversation-analytics'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('nuru_conversations')
        .select('id, user_id, message_count, created_at, last_message_at, document_id')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });
}

// Message-level analytics
export function useMessageAnalytics() {
  return useQuery({
    queryKey: ['nuru-message-analytics'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('nuru_messages')
        .select('id, role, model_used, processing_time_ms, confidence, sources, created_at, conversation_id')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
  });
}

// Claim review stats
export function useClaimReviewStats() {
  return useQuery({
    queryKey: ['nuru-claim-review-stats'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('civic_claim_reviews')
        .select('id, review_status, created_at, claim_text')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}

// Institutional response analytics
export function useInstitutionalResponseStats() {
  return useQuery({
    queryKey: ['nuru-institutional-stats'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('institutional_responses')
        .select('id, institution_name, status, created_at, question_id')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}

// Recent activity feed
export function useNuruRecentActivity() {
  return useQuery({
    queryKey: ['nuru-recent-activity'],
    queryFn: async () => {
      // Fetch recent audit entries as activity
      const { data, error } = await sb
        .from('nuru_audit_log')
        .select('id, action, entity_type, details, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}
