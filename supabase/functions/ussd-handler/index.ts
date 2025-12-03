import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// USSD Session states
const STATES = {
  MAIN_MENU: 'main_menu',
  REPORT_CATEGORY: 'report_category',
  REPORT_LOCATION: 'report_location',
  REPORT_DESCRIPTION: 'report_description',
  REPORT_CONFIRM: 'report_confirm',
  VIEW_ALERTS: 'view_alerts',
  CHECK_STATUS: 'check_status',
  FIND_SAFE_SPACE: 'find_safe_space',
  LANGUAGE_SELECT: 'language_select'
};

const CATEGORIES = ['Violence', 'Displacement', 'Natural Disaster', 'Political Unrest', 'Other'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Parse USSD request (format varies by provider - Africa's Talking, Safaricom, etc.)
    const body = await req.formData().catch(() => null) || await req.json().catch(() => ({}));
    
    const sessionId = body.get?.('sessionId') || body.sessionId || '';
    const phoneNumber = body.get?.('phoneNumber') || body.phoneNumber || '';
    const text = body.get?.('text') || body.text || '';
    const serviceCode = body.get?.('serviceCode') || body.serviceCode || '*384*PEACE#';

    console.log('USSD Request:', { sessionId, phoneNumber, text, serviceCode });

    // Get or create session
    let { data: session } = await supabase
      .from('ussd_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!session) {
      const { data: newSession } = await supabase
        .from('ussd_sessions')
        .insert({
          session_id: sessionId,
          phone_number: phoneNumber,
          current_state: STATES.MAIN_MENU,
          data: {},
          language: 'en'
        })
        .select()
        .single();
      session = newSession;
    }

    const inputs = text.split('*').filter(Boolean);
    const currentInput = inputs[inputs.length - 1] || '';
    
    let response = '';
    let endSession = false;
    let newState = session?.current_state || STATES.MAIN_MENU;
    let sessionData = session?.data || {};

    // Process based on current state
    switch (session?.current_state) {
      case STATES.MAIN_MENU:
        if (currentInput === '') {
          response = `CON Peaceverse Early Warning\n\n1. Report Incident\n2. View Alerts\n3. Check Report Status\n4. Find Safe Spaces\n5. Change Language\n0. Exit`;
        } else {
          switch (currentInput) {
            case '1':
              newState = STATES.REPORT_CATEGORY;
              response = `CON Select incident type:\n\n${CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n0. Back`;
              break;
            case '2':
              newState = STATES.VIEW_ALERTS;
              const { data: alerts } = await supabase
                .from('alert_logs')
                .select('title, severity')
                .eq('status', 'active')
                .order('triggered_at', { ascending: false })
                .limit(3);
              
              if (alerts?.length) {
                response = `CON Active Alerts:\n\n${alerts.map((a, i) => `${i + 1}. [${a.severity?.toUpperCase()}] ${a.title?.substring(0, 25)}`).join('\n')}\n\n0. Back`;
              } else {
                response = `CON No active alerts.\nYour area is currently safe.\n\n0. Back to menu`;
              }
              break;
            case '3':
              newState = STATES.CHECK_STATUS;
              response = `CON Enter your Report ID:\n(e.g., RPT12345)\n\n0. Back`;
              break;
            case '4':
              newState = STATES.FIND_SAFE_SPACE;
              response = `CON Safe Spaces Near You:\n\n1. Red Cross - 0800-723-253\n2. UNHCR - 0800-727-253\n3. Police - 999/112\n4. Community Center\n\n0. Back`;
              break;
            case '5':
              newState = STATES.LANGUAGE_SELECT;
              response = `CON Select Language:\n\n1. English\n2. Kiswahili\n3. Français\n4. العربية (Arabic)\n5. Amharic\n\n0. Back`;
              break;
            case '0':
              response = `END Thank you for using Peaceverse.\nStay safe. Dial ${serviceCode} anytime.`;
              endSession = true;
              break;
            default:
              response = `CON Invalid option.\n\n1. Report Incident\n2. View Alerts\n3. Check Status\n4. Safe Spaces\n0. Exit`;
          }
        }
        break;

      case STATES.REPORT_CATEGORY:
        if (currentInput === '0') {
          newState = STATES.MAIN_MENU;
          response = `CON Peaceverse Early Warning\n\n1. Report Incident\n2. View Alerts\n3. Check Report Status\n4. Find Safe Spaces\n0. Exit`;
        } else {
          const categoryIndex = parseInt(currentInput) - 1;
          if (categoryIndex >= 0 && categoryIndex < CATEGORIES.length) {
            sessionData.category = CATEGORIES[categoryIndex];
            newState = STATES.REPORT_LOCATION;
            response = `CON Category: ${CATEGORIES[categoryIndex]}\n\nEnter location name:\n(e.g., Kibera, Nairobi)`;
          } else {
            response = `CON Invalid option.\n\n${CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n0. Back`;
          }
        }
        break;

      case STATES.REPORT_LOCATION:
        if (currentInput && currentInput !== '0') {
          sessionData.location = currentInput;
          newState = STATES.REPORT_DESCRIPTION;
          response = `CON Location: ${currentInput}\n\nBriefly describe the incident:\n(max 100 chars)`;
        } else {
          newState = STATES.REPORT_CATEGORY;
          response = `CON Select incident type:\n\n${CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n0. Back`;
        }
        break;

      case STATES.REPORT_DESCRIPTION:
        if (currentInput && currentInput !== '0') {
          sessionData.description = currentInput.substring(0, 100);
          newState = STATES.REPORT_CONFIRM;
          response = `CON Confirm Report:\n\nType: ${sessionData.category}\nLocation: ${sessionData.location}\nDetails: ${sessionData.description?.substring(0, 30)}...\n\n1. Submit\n2. Cancel`;
        } else {
          newState = STATES.REPORT_LOCATION;
          response = `CON Enter location name:`;
        }
        break;

      case STATES.REPORT_CONFIRM:
        if (currentInput === '1') {
          // Submit report
          const { data: report, error } = await supabase
            .from('citizen_reports')
            .insert({
              title: `USSD Report: ${sessionData.category}`,
              description: sessionData.description,
              category: sessionData.category?.toLowerCase().replace(' ', '_') || 'general',
              source: 'ussd',
              location_name: sessionData.location,
              reporter_contact_phone: phoneNumber,
              is_anonymous: false,
              status: 'pending',
              verification_status: 'pending'
            })
            .select('id')
            .single();

          if (error) {
            console.error('Error submitting report:', error);
            response = `END Error submitting report.\nPlease try again or call\n0800-PEACE for help.`;
          } else {
            const reportId = `RPT${report.id.substring(0, 6).toUpperCase()}`;
            response = `END Report Submitted!\n\nID: ${reportId}\n\nWe will verify and respond.\nDial ${serviceCode} > 3 to track.`;
            
            // Log USSD report
            await supabase.from('ussd_logs').insert({
              phone_number: phoneNumber,
              session_id: sessionId,
              action: 'report_submitted',
              report_id: report.id
            });
          }
          endSession = true;
        } else {
          newState = STATES.MAIN_MENU;
          response = `CON Report cancelled.\n\n1. Report Incident\n2. View Alerts\n3. Check Status\n0. Exit`;
        }
        break;

      case STATES.CHECK_STATUS:
        if (currentInput === '0') {
          newState = STATES.MAIN_MENU;
          response = `CON Peaceverse Early Warning\n\n1. Report Incident\n2. View Alerts\n3. Check Report Status\n4. Find Safe Spaces\n0. Exit`;
        } else if (currentInput) {
          const searchId = currentInput.replace('RPT', '').toLowerCase();
          const { data: report } = await supabase
            .from('citizen_reports')
            .select('status, verification_status, created_at')
            .ilike('id', `${searchId}%`)
            .single();

          if (report) {
            response = `END Report Status:\n\nSubmitted: ${new Date(report.created_at).toLocaleDateString()}\nStatus: ${report.status}\nVerification: ${report.verification_status}\n\nDial ${serviceCode} for more.`;
          } else {
            response = `CON Report not found.\n\nEnter Report ID:\n0. Back to menu`;
          }
          if (report) endSession = true;
        }
        break;

      case STATES.FIND_SAFE_SPACE:
        newState = STATES.MAIN_MENU;
        response = `CON Peaceverse Early Warning\n\n1. Report Incident\n2. View Alerts\n3. Check Report Status\n4. Find Safe Spaces\n0. Exit`;
        break;

      case STATES.LANGUAGE_SELECT:
        const languages: Record<string, string> = { '1': 'en', '2': 'sw', '3': 'fr', '4': 'ar', '5': 'am' };
        const langNames: Record<string, string> = { '1': 'English', '2': 'Kiswahili', '3': 'Français', '4': 'Arabic', '5': 'Amharic' };
        
        if (currentInput && languages[currentInput]) {
          sessionData.language = languages[currentInput];
          response = `CON Language set to ${langNames[currentInput]}.\n\n1. Report Incident\n2. View Alerts\n3. Check Status\n0. Exit`;
          newState = STATES.MAIN_MENU;
        } else {
          newState = STATES.MAIN_MENU;
          response = `CON Peaceverse Early Warning\n\n1. Report Incident\n2. View Alerts\n3. Check Report Status\n4. Find Safe Spaces\n0. Exit`;
        }
        break;

      default:
        response = `CON Peaceverse Early Warning\n\n1. Report Incident\n2. View Alerts\n3. Check Report Status\n4. Find Safe Spaces\n0. Exit`;
        newState = STATES.MAIN_MENU;
    }

    // Update session
    if (!endSession) {
      await supabase
        .from('ussd_sessions')
        .update({
          current_state: newState,
          data: sessionData,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    } else {
      // Clean up session
      await supabase
        .from('ussd_sessions')
        .delete()
        .eq('session_id', sessionId);
    }

    console.log('USSD Response:', response);

    // Return plain text for USSD (required by most providers)
    return new Response(response, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error('USSD Handler Error:', error);
    return new Response(
      'END System error. Please try again.',
      { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
    );
  }
});
