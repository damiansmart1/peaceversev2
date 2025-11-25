import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportType: 'comprehensive' | 'summary' | 'security';
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    analysisType?: string;
    minConfidence?: number;
    validationStatus?: string;
  };
}

interface CitizenReport {
  title: string;
  category: string;
  location_country: string;
  severity_level: string;
}

interface AnalysisLog {
  id: string;
  report_id: string;
  analysis_type: string;
  model_used: string;
  confidence_score: number;
  output_data: any;
  validation_status: string;
  security_flags: any;
  created_at: string;
  citizen_reports: CitizenReport | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { reportType, filters = {} } = await req.json() as ReportRequest;

    // Input validation
    if (!['comprehensive', 'summary', 'security'].includes(reportType)) {
      return new Response(JSON.stringify({ error: 'Invalid report type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build query
    let query = supabase
      .from('ai_analysis_logs')
      .select<any, AnalysisLog>(`
        id,
        report_id,
        analysis_type,
        model_used,
        confidence_score,
        output_data,
        validation_status,
        security_flags,
        created_at,
        citizen_reports!report_id (
          title,
          category,
          location_country,
          severity_level
        )
      `);

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }
    if (filters.analysisType) {
      query = query.eq('analysis_type', filters.analysisType);
    }
    if (filters.minConfidence) {
      query = query.gte('confidence_score', filters.minConfidence);
    }
    if (filters.validationStatus) {
      query = query.eq('validation_status', filters.validationStatus);
    }

    const { data: analysisData, error: queryError } = await query.order('created_at', { ascending: false });

    if (queryError) {
      console.error('Query error:', queryError);
      throw queryError;
    }

    const typedData = analysisData as unknown as AnalysisLog[];

    // Create export record
    const { data: exportRecord, error: exportError } = await supabase
      .from('ai_report_exports')
      .insert({
        generated_by: user.id,
        report_type: reportType,
        filters: filters,
        date_range: {
          from: filters.dateFrom || null,
          to: filters.dateTo || null
        },
        status: 'completed',
        record_count: typedData?.length || 0,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (exportError) {
      console.error('Export record error:', exportError);
    }

    // Generate report based on type
    let reportData: any;

    if (reportType === 'comprehensive') {
      reportData = {
        title: 'Comprehensive AI Analysis Report',
        generatedAt: new Date().toISOString(),
        generatedBy: user.email,
        filters,
        totalRecords: typedData?.length || 0,
        analyses: typedData?.map(log => ({
          id: log.id,
          reportId: log.report_id,
          reportTitle: log.citizen_reports?.title || 'N/A',
          category: log.citizen_reports?.category || 'N/A',
          country: log.citizen_reports?.location_country || 'N/A',
          analysisType: log.analysis_type,
          model: log.model_used,
          confidence: log.confidence_score,
          threatLevel: log.output_data?.threat_level,
          sentiment: log.output_data?.sentiment,
          credibilityScore: log.output_data?.credibility_score,
          keyEntities: log.output_data?.key_entities,
          recommendedActions: log.output_data?.recommended_actions,
          validationStatus: log.validation_status,
          securityFlags: log.security_flags,
          analyzedAt: log.created_at
        }))
      };
    } else if (reportType === 'summary') {
      const stats: Record<string, any> = {
        totalAnalyses: typedData?.length || 0,
        averageConfidence: typedData?.reduce((sum, log) => sum + (log.confidence_score || 0), 0) / (typedData?.length || 1),
        threatLevelDistribution: {} as Record<string, number>,
        sentimentDistribution: {} as Record<string, number>,
        modelUsage: {} as Record<string, number>,
        validationStatus: {} as Record<string, number>,
        countryCoverage: {} as Record<string, number>
      };

      typedData?.forEach(log => {
        const threat = log.output_data?.threat_level || 'unknown';
        const sentiment = log.output_data?.sentiment || 'unknown';
        const model = log.model_used || 'unknown';
        const status = log.validation_status || 'unknown';
        const country = log.citizen_reports?.location_country || 'unknown';

        stats.threatLevelDistribution[threat] = (stats.threatLevelDistribution[threat] || 0) + 1;
        stats.sentimentDistribution[sentiment] = (stats.sentimentDistribution[sentiment] || 0) + 1;
        stats.modelUsage[model] = (stats.modelUsage[model] || 0) + 1;
        stats.validationStatus[status] = (stats.validationStatus[status] || 0) + 1;
        stats.countryCoverage[country] = (stats.countryCoverage[country] || 0) + 1;
      });

      reportData = {
        title: 'AI Analysis Summary Report',
        generatedAt: new Date().toISOString(),
        generatedBy: user.email,
        filters,
        statistics: stats
      };
    } else if (reportType === 'security') {
      reportData = {
        title: 'AI Security Analysis Report',
        generatedAt: new Date().toISOString(),
        generatedBy: user.email,
        filters,
        totalRecords: typedData?.length || 0,
        securityInsights: {
          flaggedAnalyses: typedData?.filter(log => log.validation_status === 'flagged').length || 0,
          criticalThreatDetections: typedData?.filter(log => 
            log.output_data?.threat_level === 'critical' || log.output_data?.threat_level === 'high'
          ).length || 0,
          lowConfidenceAnalyses: typedData?.filter(log => (log.confidence_score || 0) < 60).length || 0,
          analysesWithSecurityFlags: typedData?.filter(log => 
            log.security_flags && Object.keys(log.security_flags).length > 0
          ).length || 0
        },
        flaggedCases: typedData
          ?.filter(log => 
            log.validation_status === 'flagged' || 
            log.output_data?.threat_level === 'critical' ||
            (log.security_flags && Object.keys(log.security_flags).length > 0)
          )
          .map(log => ({
            id: log.id,
            reportTitle: log.citizen_reports?.title || 'N/A',
            threatLevel: log.output_data?.threat_level,
            validationStatus: log.validation_status,
            securityFlags: log.security_flags,
            confidence: log.confidence_score,
            analyzedAt: log.created_at
          }))
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        reportData,
        exportId: exportRecord?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Report generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Report generation failed' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});