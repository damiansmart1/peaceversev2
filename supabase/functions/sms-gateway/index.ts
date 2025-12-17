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

// Keywords that indicate emergency/severity
const EMERGENCY_KEYWORDS = ['urgent', 'emergency', 'help', 'danger', 'attack', 'fire', 'flood', 'shooting', 'bomb', 'violence', 'msaada', 'hatari', 'dharura'];
const HIGH_SEVERITY_KEYWORDS = ['serious', 'injured', 'wounded', 'casualties', 'conflict', 'riot', 'protest'];

// Multi-language responses
const RESPONSES: Record<string, Record<string, string>> = {
  en: {
    help: `Peaceverse Early Warning\n\nCommands:\nREPORT [location] [description]\nALERT - Get alerts\nSTATUS [ID] - Check report\nSAFE - Safe spaces\nSUB - Subscribe\nUNSUB - Unsubscribe\nLANG [en/sw/fr] - Language`,
    report_prompt: 'To report, send:\nREPORT [location] [what happened]\n\nExample:\nREPORT Nairobi Market fire near entrance',
    report_success: 'Report submitted!\nID: {id}\nSeverity: {severity}\n\nWe will verify and respond.',
    report_error: 'Could not submit report. Try again or call 112.',
    no_alerts: 'No active alerts. Your area is safe. Stay vigilant.',
    status_prompt: 'Send: STATUS [report ID]\nExample: STATUS RPT123456',
    status_found: 'Report {id}:\nStatus: {status}\nVerification: {verification}\nSubmitted: {date}',
    status_not_found: 'Report not found. Check ID and try again.',
    safe_spaces: 'Safe spaces:\n{spaces}\n\nCall for assistance.',
    subscribed: 'Subscribed to {type} alerts. Send UNSUB to stop.',
    unsubscribed: 'Unsubscribed. Send SUB to resubscribe.',
    invalid: 'Unknown command. Send HELP for options.',
    emergency_detected: '🚨 EMERGENCY report received!\nID: {id}\nHelp is being notified.\nCall 112 if in immediate danger.',
    contacts: 'Emergency:\n{contacts}'
  },
  sw: {
    help: `Peaceverse Onyo\n\nAmri:\nRIPOTI [eneo] [maelezo]\nTAHADHARI - Pata tahadhari\nHALI [ID] - Angalia ripoti\nSALAMA - Maeneo salama\nJIANDIKISHE - Jiandikishe\nONDOKA - Ondoka\nLUGHA [en/sw/fr]`,
    report_prompt: 'Kuripoti, tuma:\nRIPOTI [eneo] [kilichotokea]\n\nMfano:\nRIPOTI Nairobi Soko moto karibu na lango',
    report_success: 'Ripoti imetumwa!\nID: {id}\nUkali: {severity}\n\nTutajibu haraka.',
    report_error: 'Imeshindikana kutuma. Jaribu tena au piga 112.',
    no_alerts: 'Hakuna tahadhari. Eneo lako ni salama.',
    status_prompt: 'Tuma: HALI [ID ya ripoti]',
    status_found: 'Ripoti {id}:\nHali: {status}\nUthibitishaji: {verification}\nTarehe: {date}',
    status_not_found: 'Ripoti haijapatikana. Angalia ID.',
    safe_spaces: 'Maeneo salama:\n{spaces}\n\nPiga simu kwa msaada.',
    subscribed: 'Umejiandikisha kwa tahadhari za {type}.',
    unsubscribed: 'Umeondoka. Tuma JIANDIKISHE kujiandikisha tena.',
    invalid: 'Amri haijulikani. Tuma HELP kwa chaguo.',
    emergency_detected: '🚨 Ripoti ya DHARURA imepokewa!\nID: {id}\nMsaada unaletwa.\nPiga 112 kwa hatari ya haraka.',
    contacts: 'Dharura:\n{contacts}'
  },
  fr: {
    help: `Peaceverse Alerte\n\nCommandes:\nSIGNALER [lieu] [description]\nALERTE - Voir alertes\nSTATUT [ID] - Vérifier\nSUR - Lieux sûrs\nABONNER - S'abonner\nDESABONNER\nLANGUE [en/sw/fr]`,
    report_prompt: 'Pour signaler:\nSIGNALER [lieu] [événement]\n\nExemple:\nSIGNALER Dakar Marché feu près entrée',
    report_success: 'Rapport soumis!\nID: {id}\nGravité: {severity}\n\nNous vérifierons.',
    report_error: 'Échec. Réessayez ou appelez 112.',
    no_alerts: 'Aucune alerte. Votre zone est sûre.',
    status_prompt: 'Envoyez: STATUT [ID rapport]',
    status_found: 'Rapport {id}:\nStatut: {status}\nVérification: {verification}\nDate: {date}',
    status_not_found: 'Rapport non trouvé. Vérifiez l\'ID.',
    safe_spaces: 'Lieux sûrs:\n{spaces}\n\nAppelez pour aide.',
    subscribed: 'Abonné aux alertes {type}.',
    unsubscribed: 'Désabonné. Envoyez ABONNER pour réactiver.',
    invalid: 'Commande inconnue. Envoyez HELP.',
    emergency_detected: '🚨 URGENCE reçue!\nID: {id}\nSecours notifiés.\nAppelez 112 si danger immédiat.',
    contacts: 'Urgence:\n{contacts}'
  }
};

function t(lang: string, key: string, vars?: Record<string, string>): string {
  let text = RESPONSES[lang]?.[key] || RESPONSES['en'][key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}

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

// Detect severity from message content
function detectSeverity(text: string): string {
  const lowerText = text.toLowerCase();
  if (EMERGENCY_KEYWORDS.some(k => lowerText.includes(k))) return 'critical';
  if (HIGH_SEVERITY_KEYWORDS.some(k => lowerText.includes(k))) return 'high';
  return 'medium';
}

// Detect country from phone number
function detectCountry(phone: string): string {
  if (!phone) return 'KE';
  const cleaned = phone.replace(/[^0-9+]/g, '');
  const prefixes: Record<string, string> = {
    '+254': 'KE', '+255': 'TZ', '+256': 'UG', '+251': 'ET', '+234': 'NG',
    '+27': 'ZA', '+233': 'GH', '+250': 'RW', '+243': 'CD', '+237': 'CM'
  };
  for (const [prefix, code] of Object.entries(prefixes)) {
    if (cleaned.startsWith(prefix)) return code;
  }
  return 'KE';
}

// Get user language preference
async function getUserLanguage(supabase: any, phone: string): Promise<string> {
  const { data } = await supabase
    .from('sms_subscribers')
    .select('language')
    .eq('phone_number', phone)
    .single();
  return data?.language || 'en';
}

serve(async (req) => {
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
      const contentType = req.headers.get('content-type') || '';
      let body: any = {};
      
      if (contentType.includes('form')) {
        const formData = await req.formData();
        body = {
          from: formData.get('from') || formData.get('phoneNumber'),
          text: formData.get('text') || formData.get('message'),
          to: formData.get('to'),
          id: formData.get('id'),
        };
      } else {
        body = await req.json();
      }

      const from = body.from || body.phoneNumber || body.msisdn || '';
      const text = (body.text || body.message || '').trim();
      const messageId = body.id || body.messageId;
      
      console.log('Incoming SMS:', { from, text: text.substring(0, 50), messageId });

      // Get user language preference
      const lang = await getUserLanguage(supabase, from);
      const countryCode = detectCountry(from);
      
      // Log incoming message
      await supabase.from('sms_logs').insert({
        phone_number: from,
        direction: 'inbound',
        message: text,
        command: text.split(' ')[0]?.toUpperCase(),
        provider_message_id: messageId,
        metadata: { country: countryCode, language: lang }
      });

      // Parse SMS command
      const command = text.toUpperCase().split(' ')[0];
      const args = text.substring(command.length).trim();
      let response = '';

      switch (command) {
        case 'HELP':
        case '0':
        case 'MENU':
        case 'MSAADA': // Swahili
        case 'AIDE': // French
          response = t(lang, 'help');
          break;

        case '1':
        case 'REPORT':
        case 'RIPOTI': // Swahili
        case 'SIGNALER': // French
          if (!args) {
            response = t(lang, 'report_prompt');
          } else {
            // Parse location and description
            const words = args.split(' ');
            const location = words[0] || 'Unknown';
            const description = words.slice(1).join(' ') || args;
            const severity = detectSeverity(text);
            const isEmergency = severity === 'critical';

            // Create citizen report
            const { data: report, error } = await supabase
              .from('citizen_reports')
              .insert({
                title: `SMS${isEmergency ? ' 🚨 EMERGENCY' : ''}: ${description.substring(0, 40)}`,
                description: description,
                category: isEmergency ? 'emergency' : 'general',
                severity_level: severity,
                urgency_level: isEmergency ? 'immediate' : 'standard',
                source: 'sms',
                location_name: location,
                location_country: countryCode,
                reporter_contact_phone: from,
                is_anonymous: false,
                status: 'pending',
                verification_status: 'pending',
                language: lang,
                tags: ['sms', severity, isEmergency ? 'emergency' : 'standard']
              })
              .select('id')
              .single();

            if (error) {
              console.error('Error creating report:', error);
              response = t(lang, 'report_error');
            } else {
              const reportId = `RPT-${report.id.substring(0, 8).toUpperCase()}`;
              
              if (isEmergency) {
                response = t(lang, 'emergency_detected', { id: reportId });
              } else {
                response = t(lang, 'report_success', { id: reportId, severity: severity.toUpperCase() });
              }

              // Update SMS log with report ID
              await supabase.from('sms_logs').update({ report_id: report.id }).eq('provider_message_id', messageId);

              // Queue for offline processing if needed
              await supabase.from('offline_report_queue').insert({
                phone_number: from,
                source: 'sms',
                raw_data: { text, from, messageId },
                parsed_data: { location, description, severity },
                report_id: report.id,
                processing_status: 'completed',
                processed_at: new Date().toISOString()
              });
            }
          }
          break;

        case '2':
        case 'ALERT':
        case 'ALERTS':
        case 'TAHADHARI': // Swahili
        case 'ALERTE': // French
          const { data: alerts } = await supabase
            .from('alert_logs')
            .select('title, message, severity')
            .eq('status', 'active')
            .order('triggered_at', { ascending: false })
            .limit(3);

          if (alerts && alerts.length > 0) {
            response = `Active Alerts:\n${alerts.map((a, i) => `${i + 1}. [${a.severity?.toUpperCase()}] ${a.title?.substring(0, 30)}`).join('\n')}`;
          } else {
            response = t(lang, 'no_alerts');
          }
          break;

        case '3':
        case 'STATUS':
        case 'HALI': // Swahili
        case 'STATUT': // French
          if (!args) {
            response = t(lang, 'status_prompt');
          } else {
            const searchId = args.replace('RPT-', '').replace('RPT', '').toLowerCase();
            
            const { data: report } = await supabase
              .from('citizen_reports')
              .select('id, status, verification_status, created_at, resolution_notes')
              .ilike('id', `${searchId}%`)
              .single();

            if (report) {
              response = t(lang, 'status_found', {
                id: `RPT-${report.id.substring(0, 8).toUpperCase()}`,
                status: report.status?.toUpperCase() || 'PENDING',
                verification: report.verification_status || 'pending',
                date: new Date(report.created_at).toLocaleDateString()
              });
            } else {
              response = t(lang, 'status_not_found');
            }
          }
          break;

        case '4':
        case 'SAFE':
        case 'SALAMA': // Swahili
        case 'SUR': // French
          const { data: safeSpaces } = await supabase
            .from('safe_spaces')
            .select('name, contact_phone')
            .eq('is_archived', false)
            .limit(3);

          const { data: emergencyContacts } = await supabase
            .from('emergency_contacts')
            .select('name, phone_number')
            .eq('country_code', countryCode)
            .eq('is_active', true)
            .order('priority')
            .limit(3);

          let spacesText = '';
          if (safeSpaces?.length) {
            spacesText = safeSpaces.map((s, i) => `${i + 1}. ${s.name}${s.contact_phone ? ` - ${s.contact_phone}` : ''}`).join('\n');
          } else if (emergencyContacts?.length) {
            spacesText = emergencyContacts.map((c, i) => `${i + 1}. ${c.name} - ${c.phone_number}`).join('\n');
          } else {
            spacesText = '1. Red Cross - 0800-723-253\n2. UNHCR - 0800-727-253\n3. Emergency - 112';
          }
          response = t(lang, 'safe_spaces', { spaces: spacesText });
          break;

        case 'SUB':
        case 'SUBSCRIBE':
        case 'JIANDIKISHE': // Swahili
        case 'ABONNER': // French
          const alertType = args.toLowerCase() === 'all' ? ['critical', 'high'] : ['critical'];
          await supabase.from('sms_subscribers').upsert({
            phone_number: from,
            country_code: countryCode,
            language: lang,
            alert_types: alertType,
            is_active: true,
            verified: true
          }, { onConflict: 'phone_number' });
          response = t(lang, 'subscribed', { type: alertType.join(' & ') });
          break;

        case 'UNSUB':
        case 'UNSUBSCRIBE':
        case 'ONDOKA': // Swahili
        case 'DESABONNER': // French
          await supabase.from('sms_subscribers').update({ 
            is_active: false, 
            unsubscribed_at: new Date().toISOString() 
          }).eq('phone_number', from);
          response = t(lang, 'unsubscribed');
          break;

        case 'LANG':
        case 'LUGHA': // Swahili
        case 'LANGUE': // French
          const newLang = args.toLowerCase();
          if (['en', 'sw', 'fr'].includes(newLang)) {
            await supabase.from('sms_subscribers').upsert({
              phone_number: from,
              language: newLang,
              is_active: true
            }, { onConflict: 'phone_number' });
            response = `Language set to ${newLang === 'en' ? 'English' : newLang === 'sw' ? 'Kiswahili' : 'Français'}`;
          } else {
            response = 'Send: LANG en/sw/fr';
          }
          break;

        case 'CONTACTS':
        case 'EMERGENCY':
        case 'DHARURA': // Swahili
        case 'URGENCE': // French
          const { data: contacts } = await supabase
            .from('emergency_contacts')
            .select('name, phone_number')
            .eq('country_code', countryCode)
            .eq('is_active', true)
            .order('priority')
            .limit(5);

          if (contacts?.length) {
            response = t(lang, 'contacts', { 
              contacts: contacts.map(c => `${c.name}: ${c.phone_number}`).join('\n')
            });
          } else {
            response = `Emergency:\nPolice: 999/112\nAmbulance: 112\nRed Cross: 0800-723-253`;
          }
          break;

        default:
          // Check if it looks like a report (location + description pattern)
          if (text.length > 10 && text.includes(' ')) {
            const severity = detectSeverity(text);
            const words = text.split(' ');
            const location = words[0];
            const description = words.slice(1).join(' ');

            const { data: report, error } = await supabase
              .from('citizen_reports')
              .insert({
                title: `SMS Auto-Report: ${description.substring(0, 30)}`,
                description: description,
                category: severity === 'critical' ? 'emergency' : 'general',
                severity_level: severity,
                source: 'sms',
                location_name: location,
                location_country: countryCode,
                reporter_contact_phone: from,
                status: 'pending',
                verification_status: 'pending'
              })
              .select('id')
              .single();

            if (!error && report) {
              response = t(lang, 'report_success', { 
                id: `RPT-${report.id.substring(0, 8).toUpperCase()}`,
                severity: severity.toUpperCase()
              });
            } else {
              response = t(lang, 'invalid');
            }
          } else {
            response = t(lang, 'invalid');
          }
      }

      // Send SMS response
      const smsResult = await sendSMS(from, response);
      
      // Log outbound SMS
      await supabase.from('sms_logs').insert({
        phone_number: from,
        direction: 'outbound',
        message: response,
        command: command,
        status: smsResult.success ? 'delivered' : 'failed',
        provider_message_id: smsResult.messageId,
        error_message: smsResult.error
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          response,
          smsDelivery: smsResult,
          sms: [{ to: from, message: response }]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send single SMS
    if (req.method === 'POST' && action === 'send') {
      const { to, message, language } = await req.json();
      
      if (!to || !message) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: to, message' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await sendSMS(to, message);
      
      await supabase.from('sms_logs').insert({
        phone_number: to,
        direction: 'outbound',
        message: message,
        status: result.success ? 'delivered' : 'failed',
        provider_message_id: result.messageId,
        error_message: result.error
      });

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS alert to subscribers (broadcast)
    if (req.method === 'POST' && action === 'broadcast') {
      const { alertId, message, severity, countryCode, region } = await req.json();
      
      console.log(`Broadcasting alert ${alertId} - Severity: ${severity}`);

      // Get subscribers based on severity and location
      let query = supabase
        .from('sms_subscribers')
        .select('phone_number, language')
        .eq('is_active', true)
        .contains('alert_types', [severity || 'critical']);

      if (countryCode) {
        query = query.eq('country_code', countryCode);
      }
      if (region) {
        query = query.eq('region', region);
      }

      const { data: subscribers } = await query;
      const recipients = subscribers || [];

      // Create broadcast record
      const { data: broadcast } = await supabase.from('sms_broadcasts').insert({
        alert_id: alertId,
        message,
        recipient_count: recipients.length,
        status: 'processing'
      }).select('id').single();

      let deliveredCount = 0;
      let failedCount = 0;

      // Send to all subscribers
      for (const subscriber of recipients) {
        // Translate message if needed
        let localizedMessage = message;
        if (subscriber.language && subscriber.language !== 'en') {
          localizedMessage = `[${subscriber.language.toUpperCase()}] ${message}`;
        }

        const result = await sendSMS(subscriber.phone_number, localizedMessage);
        if (result.success) {
          deliveredCount++;
        } else {
          failedCount++;
        }
        
        await supabase.from('sms_logs').insert({
          phone_number: subscriber.phone_number,
          direction: 'outbound',
          message: localizedMessage,
          status: result.success ? 'delivered' : 'failed',
          provider_message_id: result.messageId
        });

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
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
          broadcastId: broadcast?.id,
          queued: recipients.length,
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
        .select('direction, status, command')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const inbound = stats?.filter(s => s.direction === 'inbound').length || 0;
      const outbound = stats?.filter(s => s.direction === 'outbound').length || 0;
      const delivered = stats?.filter(s => s.status === 'delivered').length || 0;
      const failed = stats?.filter(s => s.status === 'failed').length || 0;

      // Command breakdown
      const commandStats: Record<string, number> = {};
      stats?.filter(s => s.command).forEach(s => {
        commandStats[s.command!] = (commandStats[s.command!] || 0) + 1;
      });

      // Subscriber count
      const { count: subscriberCount } = await supabase
        .from('sms_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Broadcast stats
      const { data: broadcasts } = await supabase
        .from('sms_broadcasts')
        .select('recipient_count, delivered_count, failed_count')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

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
            commands: commandStats,
            subscribers: subscriberCount || 0,
            broadcasts: {
              total: broadcasts?.length || 0,
              recipients: broadcasts?.reduce((sum, b) => sum + (b.recipient_count || 0), 0) || 0,
              delivered: broadcasts?.reduce((sum, b) => sum + (b.delivered_count || 0), 0) || 0
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
          },
          features: ['incoming', 'outgoing', 'broadcast', 'subscription', 'multi-language']
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subscribers
    if (req.method === 'GET' && action === 'subscribers') {
      const countryCode = url.searchParams.get('country');
      
      let query = supabase
        .from('sms_subscribers')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false });

      if (countryCode) {
        query = query.eq('country_code', countryCode);
      }

      const { data: subscribers, count } = await query;

      return new Response(
        JSON.stringify({ 
          success: true,
          count: subscribers?.length || 0,
          subscribers
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Invalid action',
        available_actions: ['incoming', 'send', 'broadcast', 'stats', 'status', 'subscribers']
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