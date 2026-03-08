import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const sb = supabase as any;

// Governance registry with extended fields
export function useGovernanceRegistryExtended() {
  return useQuery({
    queryKey: ['governance-registry-extended'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('ai_governance_registry')
        .select('*')
        .order('priority', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// Update a governance risk entry
export function useUpdateGovernanceRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { data, error } = await sb
        .from('ai_governance_registry')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['governance-registry-extended'] }),
  });
}

// Create a new governance risk
export function useCreateGovernanceRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (risk: Record<string, any>) => {
      const { data, error } = await sb
        .from('ai_governance_registry')
        .insert(risk)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['governance-registry-extended'] }),
  });
}

// AI Feedback - submit
export function useSubmitAIFeedback() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feedback: {
      message_id?: string;
      conversation_id?: string;
      feedback_type: string;
      severity: string;
      description?: string;
      ai_response_snippet?: string;
    }) => {
      const { data, error } = await sb
        .from('nuru_ai_feedback')
        .insert({ ...feedback, user_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nuru-ai-feedback'] }),
  });
}

// AI Feedback - list (admin)
export function useAIFeedbackList() {
  return useQuery({
    queryKey: ['nuru-ai-feedback'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('nuru_ai_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });
}

// Update feedback review status (admin)
export function useReviewAIFeedback() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, review_status, review_notes }: { id: string; review_status: string; review_notes?: string }) => {
      const { data, error } = await sb
        .from('nuru_ai_feedback')
        .update({
          review_status,
          review_notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nuru-ai-feedback'] }),
  });
}

// Governance health metrics derived from audit log and messages
export function useGovernanceHealthMetrics() {
  return useQuery({
    queryKey: ['governance-health-metrics'],
    queryFn: async () => {
      // Get message data for quality metrics
      const { data: messages } = await sb
        .from('nuru_messages')
        .select('confidence, sources, model_used, created_at')
        .eq('role', 'assistant')
        .order('created_at', { ascending: false })
        .limit(500);

      // Get feedback data
      const { data: feedback } = await sb
        .from('nuru_ai_feedback')
        .select('feedback_type, severity, review_status, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      const msgs = messages || [];
      const fb = feedback || [];

      // Calculate health metrics
      const totalResponses = msgs.length;
      const highConfidence = msgs.filter((m: any) => m.confidence >= 0.8).length;
      const sourcedResponses = msgs.filter((m: any) => m.sources && (m.sources as any[]).length > 0).length;
      const avgConfidence = totalResponses > 0
        ? msgs.reduce((sum: number, m: any) => sum + (m.confidence || 0), 0) / totalResponses
        : 0;

      // Feedback breakdown
      const feedbackByType: Record<string, number> = {};
      const feedbackBySeverity: Record<string, number> = {};
      fb.forEach((f: any) => {
        feedbackByType[f.feedback_type] = (feedbackByType[f.feedback_type] || 0) + 1;
        feedbackBySeverity[f.severity] = (feedbackBySeverity[f.severity] || 0) + 1;
      });

      // Weekly trends (last 8 weeks)
      const weeklyTrends: { week: string; confidence: number; citations: number; flags: number; responses: number }[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        const weekMsgs = msgs.filter((m: any) => {
          const d = new Date(m.created_at);
          return d >= weekStart && d < weekEnd;
        });
        const weekFb = fb.filter((f: any) => {
          const d = new Date(f.created_at);
          return d >= weekStart && d < weekEnd;
        });
        weeklyTrends.push({
          week: `W${8 - i}`,
          confidence: weekMsgs.length > 0 ? Math.round(weekMsgs.reduce((s: number, m: any) => s + (m.confidence || 0), 0) / weekMsgs.length * 100) : 0,
          citations: weekMsgs.filter((m: any) => m.sources && (m.sources as any[]).length > 0).length,
          flags: weekFb.length,
          responses: weekMsgs.length,
        });
      }

      return {
        totalResponses,
        highConfidence,
        sourcedResponses,
        avgConfidence: Math.round(avgConfidence * 100),
        citationRate: totalResponses > 0 ? Math.round((sourcedResponses / totalResponses) * 100) : 0,
        hallucinationFlags: feedbackByType['hallucination'] || 0,
        totalFlags: fb.length,
        pendingReviews: fb.filter((f: any) => f.review_status === 'pending').length,
        confirmedIssues: fb.filter((f: any) => f.review_status === 'confirmed').length,
        feedbackByType,
        feedbackBySeverity,
        weeklyTrends,
      };
    },
    refetchInterval: 60000,
  });
}
