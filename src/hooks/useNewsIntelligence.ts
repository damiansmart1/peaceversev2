import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface NewsIntelligenceReport {
  id: string;
  scan_batch_id: string;
  title: string;
  summary: string;
  detailed_analysis: string;
  category: string;
  severity_level: string;
  credibility_score: number;
  credibility_methodology: any;
  source_count: number;
  source_urls: string[];
  source_names: string[];
  cross_reference_summary: string;
  affected_countries: string[];
  affected_regions: string[];
  estimated_people_affected: number | null;
  location_name: string;
  actors_involved: any[];
  key_facts: any[];
  timeline_events: any[];
  recommended_actions: any[];
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  published_report_id: string | null;
  ai_model_used: string;
  ai_confidence: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ScanBatch {
  id: string;
  scan_type: string;
  status: string;
  trigger_user_id: string | null;
  articles_found: number;
  articles_processed: number;
  clusters_identified: number;
  reports_generated: number;
  started_at: string;
  completed_at: string | null;
}

export interface NewsSourceEntry {
  id: string;
  domain: string;
  name: string;
  credibility_score: number;
  total_articles_scanned: number;
  is_primary_source: boolean;
  source_type: string;
  last_scanned_at: string;
}

export const useNewsIntelligenceReports = (filters?: {
  status?: string;
  severity?: string;
  minCredibility?: number;
}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['news-intelligence-reports', filters],
    queryFn: async () => {
      let q = supabase
        .from('news_intelligence_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) q = q.eq('review_status', filters.status);
      if (filters?.severity) q = q.eq('severity_level', filters.severity);
      if (filters?.minCredibility) q = q.gte('credibility_score', filters.minCredibility);

      const { data, error } = await q;
      if (error) throw error;
      return data as NewsIntelligenceReport[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('news-reports-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'news_intelligence_reports',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['news-intelligence-reports'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
};

export const useScanBatches = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['news-scan-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_scan_batches')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as ScanBatch[];
    },
  });

  // Realtime for scan progress
  useEffect(() => {
    const channel = supabase
      .channel('scan-batches-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'news_scan_batches',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['news-scan-batches'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return query;
};

export const useSourceRegistry = () => {
  return useQuery({
    queryKey: ['news-source-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_source_registry')
        .select('*')
        .order('credibility_score', { ascending: false });
      if (error) throw error;
      return data as NewsSourceEntry[];
    },
  });
};

export const useTriggerScan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: { queries?: string[]; focus_region?: string }) => {
      const { data, error } = await supabase.functions.invoke('news-intelligence-scanner', {
        body: params || {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-scan-batches'] });
      queryClient.invalidateQueries({ queryKey: ['news-intelligence-reports'] });
      toast({
        title: '🔍 Scan Complete',
        description: `Found ${data.articles_processed} articles → ${data.reports_generated} intelligence reports generated`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Scan Failed',
        description: error.message || 'Failed to run news intelligence scan',
        variant: 'destructive',
      });
    },
  });
};

export const useReviewReport = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      action,
      notes,
    }: {
      reportId: string;
      action: 'approve' | 'reject' | 'escalate';
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const statusMap = {
        approve: 'approved',
        reject: 'rejected',
        escalate: 'escalated',
      };

      const { error } = await supabase
        .from('news_intelligence_reports')
        .update({
          review_status: statusMap[action],
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      // If approved, create a citizen_report from it
      if (action === 'approve') {
        const { data: report } = await supabase
          .from('news_intelligence_reports')
          .select('*')
          .eq('id', reportId)
          .single();

        if (report) {
          const { error: insertError } = await supabase
            .from('citizen_reports')
            .insert({
              title: `[AI Intelligence] ${report.title}`,
              description: report.detailed_analysis || report.summary,
              category: report.category,
              severity_level: report.severity_level,
              status: 'verified',
              location_name: report.location_name,
              location_country: report.affected_countries?.[0] || null,
              estimated_people_affected: report.estimated_people_affected,
              is_anonymous: false,
              source: 'news_intelligence',
              credibility_score: report.credibility_score,
              ai_sentiment: 'auto_generated',
              ai_key_entities: report.actors_involved,
              tags: ['ai-generated', 'news-intelligence', ...(report.tags || [])],
              verified_by: user.id,
              verified_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error('Failed to create citizen report:', insertError);
          } else {
            // Link back
            await supabase
              .from('news_intelligence_reports')
              .update({ published_report_id: reportId })
              .eq('id', reportId);
          }
        }
      }

      return { action };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-intelligence-reports'] });
      queryClient.invalidateQueries({ queryKey: ['citizen-reports'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast({
        title: data.action === 'approve' ? '✅ Report Approved & Published' :
               data.action === 'reject' ? '❌ Report Rejected' : '⚡ Report Escalated',
        description: data.action === 'approve'
          ? 'Intelligence report has been published to the incident feed'
          : data.action === 'reject'
          ? 'Report has been marked as rejected'
          : 'Report has been escalated for further review',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Review Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
