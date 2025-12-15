import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportSubmission {
  title: string;
  description: string;
  category: string;
  sub_category?: string;
  
  // Incident details
  incident_date?: string;
  incident_time?: string;
  duration_minutes?: number;
  severity_level?: string;
  urgency_level?: string;
  
  // People involved
  estimated_people_affected?: number;
  casualties_reported?: number;
  injuries_reported?: number;
  children_involved?: boolean;
  vulnerable_groups_affected?: string[];
  
  // Perpetrator
  perpetrator_type?: string;
  perpetrator_description?: string;
  
  // Witnesses
  has_witnesses?: boolean;
  witness_count?: number;
  
  // Contact
  reporter_contact_phone?: string;
  reporter_contact_email?: string;
  preferred_contact_method?: string;
  
  // Location
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
    postal_code?: string;
    accuracy?: string;
    type?: string;
  };
  
  // Evidence
  media_urls?: string[];
  evidence_description?: string;
  has_physical_evidence?: boolean;
  
  // Impact
  immediate_needs?: string[];
  community_impact_level?: string;
  services_disrupted?: string[];
  infrastructure_damage?: string[];
  economic_impact_estimate?: number;
  community_response?: string;
  immediate_actions_taken?: string[];
  
  // Assistance
  assistance_received?: boolean;
  assistance_type?: string[];
  assistance_provider?: string;
  
  // Context
  historical_context?: string;
  recurring_issue?: boolean;
  first_occurrence?: boolean;
  previous_reports_filed?: boolean;
  related_incidents?: string;
  
  // Authorities
  authorities_notified?: boolean;
  authorities_responded?: boolean;
  authority_response_details?: string;
  
  // Follow-up
  follow_up_contact_consent?: boolean;
  
  // Metadata
  is_anonymous?: boolean;
  tags?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user (optional for anonymous reports)
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
        userId = user.id;
      }
    }

    const submission = await req.json() as ReportSubmission;

    // Validate required fields
    if (!submission.title || !submission.description || !submission.category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, description, category' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate content length
    if (submission.title.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Title must be less than 200 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (submission.description.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'Description must be less than 10000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating comprehensive report: ${submission.title}`);

    // Parse incident date and time
    let incidentDateTime: string | null = null;
    if (submission.incident_date) {
      if (submission.incident_time) {
        incidentDateTime = `${submission.incident_date}T${submission.incident_time}:00Z`;
      } else {
        incidentDateTime = `${submission.incident_date}T00:00:00Z`;
      }
    }

    // Create comprehensive report
    const { data: report, error: reportError } = await supabase
      .from('citizen_reports')
      .insert({
        reporter_id: submission.is_anonymous ? null : userId,
        
        // Basic information
        title: submission.title.trim(),
        description: submission.description.trim(),
        category: submission.category,
        sub_category: submission.sub_category?.trim(),
        
        // Incident details
        incident_date: incidentDateTime,
        incident_time: submission.incident_time,
        duration_minutes: submission.duration_minutes,
        severity_level: submission.severity_level || 'medium',
        urgency_level: submission.urgency_level || 'routine',
        status: 'pending',
        
        // People involved
        estimated_people_affected: submission.estimated_people_affected,
        casualties_reported: submission.casualties_reported,
        injuries_reported: submission.injuries_reported,
        children_involved: submission.children_involved || false,
        vulnerable_groups_affected: submission.vulnerable_groups_affected || [],
        
        // Perpetrator information
        perpetrator_type: submission.perpetrator_type,
        perpetrator_description: submission.perpetrator_description?.trim(),
        
        // Witness information
        has_witnesses: submission.has_witnesses || false,
        witness_count: submission.witness_count,
        
        // Contact information
        reporter_contact_phone: submission.reporter_contact_phone?.trim(),
        reporter_contact_email: submission.reporter_contact_email?.trim(),
        preferred_contact_method: submission.preferred_contact_method || 'none',
        
        // Location
        location_latitude: submission.location?.latitude,
        location_longitude: submission.location?.longitude,
        location_address: submission.location?.address?.trim(),
        location_city: submission.location?.city?.trim(),
        location_region: submission.location?.region?.trim(),
        location_country: submission.location?.country?.trim(),
        location_postal_code: submission.location?.postal_code?.trim(),
        location_accuracy: submission.location?.accuracy || 'approximate',
        location_type: submission.location?.type,
        
        // Evidence
        media_urls: submission.media_urls || [],
        evidence_description: submission.evidence_description?.trim(),
        has_physical_evidence: submission.has_physical_evidence || false,
        
        // Impact assessment
        immediate_needs: submission.immediate_needs || [],
        community_impact_level: submission.community_impact_level,
        services_disrupted: submission.services_disrupted || [],
        infrastructure_damage: submission.infrastructure_damage || [],
        economic_impact_estimate: submission.economic_impact_estimate,
        community_response: submission.community_response?.trim(),
        immediate_actions_taken: submission.immediate_actions_taken || [],
        
        // Assistance
        assistance_received: submission.assistance_received || false,
        assistance_type: submission.assistance_type || [],
        assistance_provider: submission.assistance_provider?.trim(),
        
        // Context
        historical_context: submission.historical_context?.trim(),
        recurring_issue: submission.recurring_issue || false,
        first_occurrence: submission.first_occurrence !== undefined ? submission.first_occurrence : true,
        previous_reports_filed: submission.previous_reports_filed || false,
        related_incidents: submission.related_incidents ? [submission.related_incidents] : [],
        
        // Authorities
        authorities_notified: submission.authorities_notified || false,
        authorities_responded: submission.authorities_responded || false,
        authority_response_details: submission.authority_response_details?.trim(),
        
        // Follow-up
        follow_up_required: true,
        follow_up_contact_consent: submission.follow_up_contact_consent || false,
        
        // Metadata
        tags: submission.tags || [],
        is_anonymous: submission.is_anonymous || false,
        visibility: 'public',
        source: 'citizen_report'
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      throw reportError;
    }

    console.log(`Comprehensive report created successfully: ${report.id}`);

    // Determine priority based on severity and urgency
    const priorityMap: Record<string, string> = {
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    const taskPriority = priorityMap[submission.severity_level || 'medium'] || 'medium';

    // Automatically create a verification task for the new report
    const { data: verificationTask, error: taskError } = await supabase
      .from('verification_tasks')
      .insert({
        report_id: report.id,
        status: 'pending',
        priority: taskPriority,
        category: submission.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (taskError) {
      console.error('Error creating verification task:', taskError);
      // Don't fail the entire submission if task creation fails
    } else {
      console.log(`Verification task created: ${verificationTask.id}`);
    }

    // Update report status to indicate it's in verification queue
    await supabase
      .from('citizen_reports')
      .update({ 
        verification_status: 'pending',
        status: 'pending_verification'
      })
      .eq('id', report.id);

    // Trigger AI analysis asynchronously
    const analysisUrl = `${supabaseUrl}/functions/v1/analyze-citizen-report`;
    fetch(analysisUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId: report.id,
        title: submission.title,
        description: submission.description,
        category: submission.category
      })
    }).catch(error => {
      console.error('Failed to trigger analysis:', error);
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        report: {
          id: report.id,
          title: report.title,
          status: report.status,
          created_at: report.created_at
        },
        message: 'Comprehensive report submitted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Report submission error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to submit report' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});