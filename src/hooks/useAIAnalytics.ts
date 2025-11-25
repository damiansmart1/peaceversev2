import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from 'sonner';

export interface AIAnalyticsSummary {
  id: string;
  date: string;
  total_analyses: number;
  analysis_type_breakdown: Record<string, number>;
  model_usage_stats: Record<string, number>;
  average_confidence: number;
  average_processing_time_ms: number;
  high_confidence_count: number;
  low_confidence_count: number;
  flagged_count: number;
  critical_detections: number;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysisLog {
  id: string;
  report_id: string;
  analysis_type: string;
  model_used: string;
  confidence_score: number;
  output_data: any;
  validation_status: string;
  security_flags: any;
  created_at: string;
}

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  analysisType?: string;
  minConfidence?: number;
  validationStatus?: string;
}

export function useAIAnalyticsSummary(days: number = 30) {
  return useQuery({
    queryKey: ['ai-analytics-summary', days],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error } = await supabase
        .from('ai_analytics_summary')
        .select('*')
        .gte('date', fromDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      return data as AIAnalyticsSummary[];
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useAIAnalysisLogs(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['ai-analysis-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('ai_analysis_logs')
        .select(`
          id,
          report_id,
          analysis_type,
          model_used,
          confidence_score,
          output_data,
          validation_status,
          security_flags,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters?.analysisType) {
        query = query.eq('analysis_type', filters.analysisType);
      }
      if (filters?.minConfidence) {
        query = query.gte('confidence_score', filters.minConfidence);
      }
      if (filters?.validationStatus) {
        query = query.eq('validation_status', filters.validationStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AIAnalysisLog[];
    },
  });
}

export function useGenerateAIReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportType,
      filters,
    }: {
      reportType: 'comprehensive' | 'summary' | 'security';
      filters?: ReportFilters;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-ai-report', {
        body: { reportType, filters },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-report-exports'] });
      toast.success('Report generated successfully');
      
      // Download the report
      const blob = new Blob([JSON.stringify(data.reportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-report-${data.reportData.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    },
  });
}

export function useAIReportExports() {
  return useQuery({
    queryKey: ['ai-report-exports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_report_exports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
}