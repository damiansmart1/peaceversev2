import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate HMAC signature for webhook payload
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[Webhook Trigger] Processing webhook trigger request');

  try {
    const { event_type, payload, filters } = await req.json();
    
    if (!event_type || !payload) {
      return new Response(
        JSON.stringify({ error: 'event_type and payload required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get active webhook subscriptions for this event
    const { data: webhooks, error } = await supabase
      .from('webhook_subscriptions')
      .select('*')
      .eq('is_active', true)
      .contains('events', [event_type]);

    if (error) throw error;

    console.log(`[Webhook Trigger] Found ${webhooks?.length || 0} webhooks for event: ${event_type}`);

    const results = [];

    for (const webhook of webhooks || []) {
      // Check filters
      if (webhook.filters && Object.keys(webhook.filters).length > 0) {
        const webhookFilters = webhook.filters as Record<string, any>;
        let shouldSend = true;

        if (webhookFilters.countries && payload.country) {
          shouldSend = webhookFilters.countries.includes(payload.country);
        }
        if (webhookFilters.severity && payload.severity) {
          shouldSend = shouldSend && webhookFilters.severity.includes(payload.severity);
        }

        if (!shouldSend) {
          console.log(`[Webhook Trigger] Skipping webhook ${webhook.id} due to filters`);
          continue;
        }
      }

      // Prepare webhook payload
      const webhookPayload = {
        event: event_type,
        timestamp: new Date().toISOString(),
        data: payload,
        webhook_id: webhook.id
      };

      const payloadString = JSON.stringify(webhookPayload);
      const signature = await generateSignature(payloadString, webhook.secret);

      // Send webhook with retry logic
      let success = false;
      let responseStatus = 0;
      let responseBody = '';
      let errorMessage = '';
      let attemptNumber = 1;
      const startTime = Date.now();

      for (let attempt = 1; attempt <= webhook.retry_count; attempt++) {
        attemptNumber = attempt;
        try {
          console.log(`[Webhook Trigger] Sending to ${webhook.url} (attempt ${attempt})`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000);

          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Peaceverse-Signature': signature,
              'X-Peaceverse-Event': event_type,
              'X-Peaceverse-Delivery': crypto.randomUUID(),
              'User-Agent': 'Peaceverse-Webhook/1.0'
            },
            body: payloadString,
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          responseStatus = response.status;
          responseBody = await response.text();

          if (response.ok) {
            success = true;
            console.log(`[Webhook Trigger] Successfully delivered to ${webhook.url}`);
            break;
          } else {
            errorMessage = `HTTP ${response.status}: ${responseBody}`;
            console.log(`[Webhook Trigger] Failed attempt ${attempt}: ${errorMessage}`);
          }
        } catch (err: any) {
          errorMessage = err?.message || 'Unknown error';
          console.log(`[Webhook Trigger] Error attempt ${attempt}: ${errorMessage}`);
        }

        // Wait before retry (exponential backoff)
        if (attempt < webhook.retry_count) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      const duration = Date.now() - startTime;

      // Log delivery
      await supabase.from('webhook_deliveries').insert({
        webhook_id: webhook.id,
        event_type,
        payload: webhookPayload,
        response_status: responseStatus,
        response_body: responseBody.substring(0, 1000),
        duration_ms: duration,
        attempt_number: attemptNumber,
        success,
        error_message: errorMessage || null
      });

      // Update webhook status
      await supabase
        .from('webhook_subscriptions')
        .update({
          last_triggered_at: new Date().toISOString(),
          last_status: success ? 'success' : 'failed',
          failure_count: success ? 0 : webhook.failure_count + 1
        })
        .eq('id', webhook.id);

      results.push({
        webhook_id: webhook.id,
        success,
        status: responseStatus,
        duration_ms: duration
      });
    }

    return new Response(
      JSON.stringify({ 
        message: 'Webhooks processed',
        event_type,
        results 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Webhook Trigger] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
