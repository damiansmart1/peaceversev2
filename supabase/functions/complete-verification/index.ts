import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationResult {
  taskId: string;
  verdict: 'verified' | 'rejected' | 'needs_more_info';
  confidence_score: number;
  notes?: string;
  evidence_urls?: string[];
  recommended_action?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const result = await req.json() as VerificationResult;

    // Validate input
    if (!result.taskId || !result.verdict || result.confidence_score === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: taskId, verdict, confidence_score' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (result.confidence_score < 0 || result.confidence_score > 100) {
      return new Response(
        JSON.stringify({ error: 'Confidence score must be between 0 and 100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Completing verification task ${result.taskId} by user ${user.id}`);

    // Get task
    const { data: task, error: taskError } = await supabase
      .from('verification_tasks')
      .select('*, citizen_reports(*)')
      .eq('id', result.taskId)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: 'Task not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership
    if (task.assigned_to !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Task not assigned to you' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update task
    const { error: updateError } = await supabase
      .from('verification_tasks')
      .update({
        status: 'completed',
        verdict: result.verdict,
        verifier_confidence: result.confidence_score,
        verifier_notes: result.notes,
        evidence_urls: result.evidence_urls || [],
        completed_at: new Date().toISOString()
      })
      .eq('id', result.taskId);

    if (updateError) {
      console.error('Error updating task:', updateError);
      throw updateError;
    }

    // Update report status based on verdict
    let newReportStatus: string;
    let verificationStatus: string;

    switch (result.verdict) {
      case 'verified':
        newReportStatus = 'verified';
        verificationStatus = 'verified';
        break;
      case 'rejected':
        newReportStatus = 'rejected';
        verificationStatus = 'rejected';
        break;
      case 'needs_more_info':
        newReportStatus = 'pending';
        verificationStatus = 'pending';
        break;
    }

    const { error: reportError } = await supabase
      .from('citizen_reports')
      .update({
        status: newReportStatus,
        verification_status: verificationStatus,
        verified_by: result.verdict === 'verified' ? user.id : null,
        verified_at: result.verdict === 'verified' ? new Date().toISOString() : null
      })
      .eq('id', task.report_id);

    if (reportError) {
      console.error('Error updating report:', reportError);
    }

    // Update verifier stats
    const { error: statsError } = await supabase.rpc('increment_verifier_stats', {
      verifier_id: user.id,
      verdict: result.verdict
    });
    
    if (statsError) {
      console.error('Failed to update verifier stats:', statsError);
    }

    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'verification_completed',
        entity_type: 'verification_task',
        entity_id: result.taskId,
        changes: { verdict: result.verdict, confidence_score: result.confidence_score },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    // Notify report owner
    if (task.citizen_reports.reporter_id) {
      const notificationMessages = {
        verified: 'Your report has been verified by our team.',
        rejected: 'Your report could not be verified at this time.',
        needs_more_info: 'More information is needed to verify your report.'
      };

      await supabase
        .from('notifications')
        .insert({
          user_id: task.citizen_reports.reporter_id,
          type: 'verification_result',
          title: `Report ${result.verdict}`,
          message: notificationMessages[result.verdict],
          related_entity_type: 'citizen_report',
          related_entity_id: task.report_id
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        verdict: result.verdict,
        message: 'Verification completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verification completion error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to complete verification' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
