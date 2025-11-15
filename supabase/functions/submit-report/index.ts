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
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  media_urls?: string[];
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

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    if (submission.description.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Description must be less than 5000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating report from user ${user.id}: ${submission.title}`);

    // Create report
    const { data: report, error: reportError } = await supabase
      .from('citizen_reports')
      .insert({
        reporter_id: submission.is_anonymous ? null : user.id,
        title: submission.title.trim(),
        description: submission.description.trim(),
        category: submission.category,
        location: submission.location ? `POINT(${submission.location.longitude} ${submission.location.latitude})` : null,
        location_name: submission.location?.address,
        media_urls: submission.media_urls || [],
        tags: submission.tags || [],
        status: 'pending',
        visibility: 'public',
        is_anonymous: submission.is_anonymous || false
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      throw reportError;
    }

    console.log(`Report created successfully: ${report.id}`);

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

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: submission.is_anonymous ? null : user.id,
        action: 'report_submitted',
        entity_type: 'citizen_report',
        entity_id: report.id,
        changes: { submission },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    // Update user reputation (if not anonymous)
    if (!submission.is_anonymous) {
      const { error: repError } = await supabase.rpc('increment_user_reputation', {
        user_id: user.id,
        points: 10
      });
      
      if (repError) {
        console.error('Failed to update reputation:', repError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        report: {
          id: report.id,
          title: report.title,
          status: report.status,
          created_at: report.created_at
        }
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
