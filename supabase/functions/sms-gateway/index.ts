import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Africa's Talking SMS Integration
const AT_API_KEY = Deno.env.get('AFRICASTALKING_API_KEY');
const AT_USERNAME = Deno.env.get('AFRICASTALKING_USERNAME') || 'sandbox';
const AT_SHORTCODE = Deno.env.get('AFRICASTALKING_SHORTCODE') || 'PEACEVERSE';
const AT_API_URL = AT_USERNAME === 'sandbox' 
  ? 'https://api.sandbox.africastalking.com/version1/messaging'
  : 'https://api.africastalking.com/version1/messaging';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Send SMS via Africa's Talking
async function sendSMS(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!AT_API_KEY) {
    console.log('Africa\'s Talking API key not configured, skipping SMS send');
    return { success: false, error: 'SMS provider not configured' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('username', AT_USERNAME);
    formData.append('to', to);
    formData.append('message', message);
    if (AT_SHORTCODE) {
      formData.append('from', AT_SHORTCODE);
    }

    const response = await fetch(AT_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': AT_API_KEY,
      },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('Africa\'s Talking response:', result);

    if (result.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
      return { 
        success: true, 
        messageId: result.SMSMessageData.Recipients[0].messageId 
      };
    }

    return { 
      success: false, 
      error: result.SMSMessageData?.Recipients?.[0]?.status || 'Unknown error' 
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

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
        // Fetch safe spaces from database
        const { data: safeSpaces } = await supabase
          .from('safe_spaces')
          .select('name, contact_phone')
          .eq('is_archived', false)
          .limit(3);

        if (safeSpaces && safeSpaces.length > 0) {
          response = `Safe spaces:\n${safeSpaces.map((s, i) => `${i + 1}. ${s.name}${s.contact_phone ? ` - ${s.contact_phone}` : ''}`).join('\n')}\nCall for assistance`;
        } else {
          response = `Safe spaces:\n1. Red Cross - 0800-723-253\n2. UNHCR - 0800-727-253\n3. Emergency - 112`;
        }
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

      // Send SMS response via Africa's Talking
      const smsResult = await sendSMS(from, response);
      
      // Log outbound SMS
      await supabase.from('sms_logs').insert({
        phone_number: from,
        direction: 'outbound',
        message: response,
        status: smsResult.success ? 'delivered' : 'failed'
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          response,
          smsDelivery: smsResult,
          // Format for Africa's Talking callback
          sms: [{ to: from, message: response }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send single SMS
    if (req.method === 'POST' && action === 'send') {
      const { to, message } = await req.json();
      
      if (!to || !message) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: to, message' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await sendSMS(to, message);
      
      // Log the SMS
      await supabase.from('sms_logs').insert({
        phone_number: to,
        direction: 'outbound',
        message: message,
        status: result.success ? 'delivered' : 'failed'
      });

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS alert to subscribers (broadcast)
    if (req.method === 'POST' && action === 'broadcast') {
      const { alertId, message, recipients } = await req.json();
      
      console.log(`Broadcasting alert ${alertId} to ${recipients?.length || 0} recipients`);

      // Create broadcast record
      const { data: broadcast } = await supabase.from('sms_broadcasts').insert({
        alert_id: alertId,
        message,
        recipient_count: recipients?.length || 0,
        status: 'processing'
      }).select('id').single();

      let deliveredCount = 0;
      let failedCount = 0;

      // Send to all recipients
      if (recipients && recipients.length > 0) {
        for (const recipient of recipients) {
          const result = await sendSMS(recipient, message);
          if (result.success) {
            deliveredCount++;
          } else {
            failedCount++;
          }
          
          // Log each SMS
          await supabase.from('sms_logs').insert({
            phone_number: recipient,
            direction: 'outbound',
            message: message,
            status: result.success ? 'delivered' : 'failed'
          });
        }
      }

      // Update broadcast status
      if (broadcast?.id) {
        await supabase.from('sms_broadcasts').update({
          delivered_count: deliveredCount,
          failed_count: failedCount,
          status: 'completed',
          completed_at: new Date().toISOString()
        }).eq('id', broadcast.id);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          queued: recipients?.length || 0,
          delivered: deliveredCount,
          failed: failedCount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get SMS statistics
    if (req.method === 'GET' && action === 'stats') {
      const { data: stats } = await supabase
        .from('sms_logs')
        .select('direction, status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const inbound = stats?.filter(s => s.direction === 'inbound').length || 0;
      const outbound = stats?.filter(s => s.direction === 'outbound').length || 0;
      const delivered = stats?.filter(s => s.status === 'delivered').length || 0;
      const failed = stats?.filter(s => s.status === 'failed').length || 0;

      // Get broadcast stats
      const { data: broadcasts } = await supabase
        .from('sms_broadcasts')
        .select('recipient_count, delivered_count, failed_count')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const totalBroadcasts = broadcasts?.length || 0;
      const totalBroadcastRecipients = broadcasts?.reduce((sum, b) => sum + (b.recipient_count || 0), 0) || 0;

      return new Response(
        JSON.stringify({ 
          success: true, 
          stats: { 
            inbound, 
            outbound, 
            total: inbound + outbound,
            delivered,
            failed,
            deliveryRate: outbound > 0 ? ((delivered / outbound) * 100).toFixed(1) : '0',
            broadcasts: {
              total: totalBroadcasts,
              recipients: totalBroadcastRecipients
            },
            period: '30 days'
          },
          provider: {
            name: 'Africa\'s Talking',
            configured: !!AT_API_KEY,
            mode: AT_USERNAME === 'sandbox' ? 'sandbox' : 'production'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check provider status
    if (req.method === 'GET' && action === 'status') {
      return new Response(
        JSON.stringify({ 
          success: true,
          provider: {
            name: 'Africa\'s Talking',
            configured: !!AT_API_KEY,
            mode: AT_USERNAME === 'sandbox' ? 'sandbox' : 'production',
            shortcode: AT_SHORTCODE
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Invalid action',
        available_actions: ['incoming', 'send', 'broadcast', 'stats', 'status']
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
