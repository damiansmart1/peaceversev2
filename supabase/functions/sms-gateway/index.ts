import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Handle incoming SMS (webhook from SMS provider)
    if (req.method === 'POST' && action === 'incoming') {
      const body = await req.json();
      console.log('Incoming SMS:', body);

      const { from, text, sessionId } = body;
      
      // Parse SMS command
      const command = text?.trim().toUpperCase();
      let response = '';

      if (command === 'HELP' || command === '0') {
        response = `Peaceverse Early Warning\n1. REPORT - Report incident\n2. ALERT - Get alerts\n3. STATUS - Check report status\n4. SAFE - Find safe spaces\nReply with number or keyword`;
      } else if (command === '1' || command === 'REPORT') {
        response = `To report incident, send:\nREPORT [location] [description]\nExample: REPORT Nairobi Market fire near main gate`;
        
        // Store session state
        await supabase.from('sms_sessions').upsert({
          phone_number: from,
          session_id: sessionId,
          current_state: 'awaiting_report',
          updated_at: new Date().toISOString()
        });
      } else if (command === '2' || command === 'ALERT') {
        // Fetch recent critical alerts
        const { data: alerts } = await supabase
          .from('alert_logs')
          .select('title, message, severity')
          .eq('status', 'active')
          .order('triggered_at', { ascending: false })
          .limit(3);

        if (alerts && alerts.length > 0) {
          response = `Recent Alerts:\n${alerts.map((a, i) => `${i + 1}. [${a.severity}] ${a.title}`).join('\n')}`;
        } else {
          response = 'No active alerts in your area. Stay safe!';
        }
      } else if (command === '3' || command === 'STATUS') {
        response = `To check status, send:\nSTATUS [report ID]\nExample: STATUS RPT-123456`;
      } else if (command === '4' || command === 'SAFE') {
        response = `Safe spaces near you:\n1. Red Cross Center - 2km\n2. Community Hall - 3km\n3. School Shelter - 4km\nCall 0800-PEACE for help`;
      } else if (command.startsWith('REPORT ')) {
        // Process incident report
        const reportText = text.substring(7).trim();
        const words = reportText.split(' ');
        const location = words[0] || 'Unknown';
        const description = words.slice(1).join(' ') || reportText;

        // Create citizen report
        const { data: report, error } = await supabase
          .from('citizen_reports')
          .insert({
            title: `SMS Report from ${from}`,
            description: description,
            category: 'general',
            source: 'sms',
            location_name: location,
            reporter_contact_phone: from,
            is_anonymous: false,
            status: 'pending',
            verification_status: 'pending'
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating report:', error);
          response = 'Sorry, could not submit report. Please try again.';
        } else {
          response = `Report submitted!\nID: RPT-${report.id.substring(0, 8).toUpperCase()}\nWe will verify and respond. Reply STATUS [ID] to track.`;
        }

        // Log SMS interaction
        await supabase.from('sms_logs').insert({
          phone_number: from,
          direction: 'inbound',
          message: text,
          report_id: report?.id
        });
      } else if (command.startsWith('STATUS ')) {
        const reportId = command.substring(7).trim().replace('RPT-', '');
        
        const { data: report } = await supabase
          .from('citizen_reports')
          .select('status, verification_status, created_at')
          .ilike('id', `${reportId}%`)
          .single();

        if (report) {
          response = `Report Status:\nSubmitted: ${new Date(report.created_at).toLocaleDateString()}\nStatus: ${report.status}\nVerification: ${report.verification_status}`;
        } else {
          response = 'Report not found. Check ID and try again.';
        }
      } else {
        response = `Peaceverse: Invalid command. Reply HELP for options.`;
      }

      // Log outbound SMS
      await supabase.from('sms_logs').insert({
        phone_number: from,
        direction: 'outbound',
        message: response
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          response,
          // Format for Africa's Talking API
          sms: [{ to: from, message: response }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS alert to subscribers
    if (req.method === 'POST' && action === 'broadcast') {
      const { alertId, message, recipients } = await req.json();
      
      console.log(`Broadcasting alert ${alertId} to ${recipients?.length || 0} recipients`);

      // In production, integrate with Africa's Talking, Twilio, or local SMS provider
      // For now, log the broadcast
      await supabase.from('sms_broadcasts').insert({
        alert_id: alertId,
        message,
        recipient_count: recipients?.length || 0,
        status: 'queued'
      });

      return new Response(
        JSON.stringify({ success: true, queued: recipients?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get SMS statistics
    if (req.method === 'GET' && action === 'stats') {
      const { data: stats } = await supabase
        .from('sms_logs')
        .select('direction')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const inbound = stats?.filter(s => s.direction === 'inbound').length || 0;
      const outbound = stats?.filter(s => s.direction === 'outbound').length || 0;

      return new Response(
        JSON.stringify({ 
          success: true, 
          stats: { 
            inbound, 
            outbound, 
            total: inbound + outbound,
            period: '30 days'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Invalid action',
        available_actions: ['incoming', 'broadcast', 'stats']
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SMS Gateway Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
