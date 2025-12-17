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
  REPORT_SUBCATEGORY: 'report_subcategory',
  REPORT_SEVERITY: 'report_severity',
  REPORT_LOCATION: 'report_location',
  REPORT_DESCRIPTION: 'report_description',
  REPORT_WITNESSES: 'report_witnesses',
  REPORT_ANONYMOUS: 'report_anonymous',
  REPORT_CONFIRM: 'report_confirm',
  EMERGENCY_REPORT: 'emergency_report',
  VIEW_ALERTS: 'view_alerts',
  CHECK_STATUS: 'check_status',
  FIND_SAFE_SPACE: 'find_safe_space',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  SUBSCRIBE_ALERTS: 'subscribe_alerts',
  LANGUAGE_SELECT: 'language_select'
};

const CATEGORIES = [
  { id: 'violence', name: 'Violence/Conflict', subcats: ['Armed Attack', 'Civil Unrest', 'Domestic Violence', 'Other'] },
  { id: 'displacement', name: 'Displacement', subcats: ['Refugees', 'Internal Displacement', 'Eviction', 'Other'] },
  { id: 'natural_disaster', name: 'Natural Disaster', subcats: ['Flood', 'Drought', 'Earthquake', 'Fire', 'Other'] },
  { id: 'political', name: 'Political Unrest', subcats: ['Protest', 'Election Violence', 'Government Action', 'Other'] },
  { id: 'humanitarian', name: 'Humanitarian Crisis', subcats: ['Food Shortage', 'Medical Emergency', 'Water Crisis', 'Other'] },
  { id: 'other', name: 'Other Emergency', subcats: [] }
];

const SEVERITY_LEVELS = [
  { id: 'critical', name: 'CRITICAL - Life threatening', emoji: '🔴' },
  { id: 'high', name: 'HIGH - Urgent response needed', emoji: '🟠' },
  { id: 'medium', name: 'MEDIUM - Serious but stable', emoji: '🟡' },
  { id: 'low', name: 'LOW - Minor incident', emoji: '🟢' }
];

// Multi-language support
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Peaceverse Early Warning',
    report: 'Report Incident',
    emergency: 'EMERGENCY (Quick)',
    alerts: 'View Alerts',
    status: 'Check Report Status',
    safe_spaces: 'Find Safe Spaces',
    subscribe: 'Subscribe to Alerts',
    language: 'Change Language',
    exit: 'Exit',
    back: 'Back',
    select_category: 'Select incident type:',
    select_severity: 'How severe is this?',
    enter_location: 'Enter location name:',
    enter_description: 'Describe what happened (max 100 chars):',
    witnesses: 'Estimated number of witnesses:',
    anonymous: 'Report anonymously?',
    confirm_report: 'Confirm Report:',
    submit: 'Submit',
    cancel: 'Cancel',
    report_submitted: 'Report Submitted!',
    no_alerts: 'No active alerts. Your area is currently safe.',
    enter_report_id: 'Enter your Report ID:',
    thank_you: 'Thank you for using Peaceverse. Stay safe.',
    invalid_option: 'Invalid option. Please try again.',
    error: 'System error. Please try again.',
    emergency_desc: 'For immediate danger, describe briefly:',
    contacts: 'Emergency Contacts',
  },
  sw: {
    welcome: 'Peaceverse Onyo la Mapema',
    report: 'Ripoti Tukio',
    emergency: 'DHARURA (Haraka)',
    alerts: 'Tazama Tahadhari',
    status: 'Angalia Hali ya Ripoti',
    safe_spaces: 'Pata Maeneo Salama',
    subscribe: 'Jiandikishe kwa Tahadhari',
    language: 'Badilisha Lugha',
    exit: 'Ondoka',
    back: 'Rudi',
    select_category: 'Chagua aina ya tukio:',
    select_severity: 'Ni mbaya kiasi gani?',
    enter_location: 'Ingiza jina la eneo:',
    enter_description: 'Eleza kilichotokea (max 100):',
    witnesses: 'Idadi ya mashahidi:',
    anonymous: 'Ripoti bila jina?',
    confirm_report: 'Thibitisha Ripoti:',
    submit: 'Tuma',
    cancel: 'Ghairi',
    report_submitted: 'Ripoti Imetumwa!',
    no_alerts: 'Hakuna tahadhari. Eneo lako ni salama.',
    enter_report_id: 'Ingiza ID ya Ripoti:',
    thank_you: 'Asante kwa kutumia Peaceverse. Kaa salama.',
    invalid_option: 'Chaguo batili. Jaribu tena.',
    error: 'Kosa la mfumo. Jaribu tena.',
    emergency_desc: 'Kwa hatari ya haraka, eleza kwa ufupi:',
    contacts: 'Nambari za Dharura',
  },
  fr: {
    welcome: 'Peaceverse Alerte Précoce',
    report: 'Signaler un Incident',
    emergency: 'URGENCE (Rapide)',
    alerts: 'Voir les Alertes',
    status: 'Vérifier le Statut',
    safe_spaces: 'Trouver des Espaces Sûrs',
    subscribe: 'S\'abonner aux Alertes',
    language: 'Changer de Langue',
    exit: 'Quitter',
    back: 'Retour',
    select_category: 'Type d\'incident:',
    select_severity: 'Gravité de l\'incident:',
    enter_location: 'Entrez le lieu:',
    enter_description: 'Décrivez (max 100 car.):',
    witnesses: 'Nombre de témoins:',
    anonymous: 'Signaler anonymement?',
    confirm_report: 'Confirmer le Rapport:',
    submit: 'Soumettre',
    cancel: 'Annuler',
    report_submitted: 'Rapport Soumis!',
    no_alerts: 'Aucune alerte. Votre zone est sûre.',
    enter_report_id: 'Entrez l\'ID du rapport:',
    thank_you: 'Merci d\'utiliser Peaceverse. Restez en sécurité.',
    invalid_option: 'Option invalide. Réessayez.',
    error: 'Erreur système. Réessayez.',
    emergency_desc: 'Pour danger immédiat, décrivez brièvement:',
    contacts: 'Contacts d\'Urgence',
  },
  ar: {
    welcome: 'Peaceverse الإنذار المبكر',
    report: 'الإبلاغ عن حادث',
    emergency: 'طوارئ (سريع)',
    alerts: 'عرض التنبيهات',
    status: 'حالة البلاغ',
    safe_spaces: 'أماكن آمنة',
    subscribe: 'اشترك في التنبيهات',
    language: 'تغيير اللغة',
    exit: 'خروج',
    back: 'رجوع',
    select_category: 'نوع الحادث:',
    select_severity: 'مدى الخطورة:',
    enter_location: 'أدخل الموقع:',
    enter_description: 'وصف الحادث (100 حرف):',
    witnesses: 'عدد الشهود:',
    anonymous: 'إبلاغ مجهول؟',
    confirm_report: 'تأكيد البلاغ:',
    submit: 'إرسال',
    cancel: 'إلغاء',
    report_submitted: 'تم الإرسال!',
    no_alerts: 'لا توجد تنبيهات. منطقتك آمنة.',
    enter_report_id: 'أدخل رقم البلاغ:',
    thank_you: 'شكراً لاستخدام Peaceverse. ابق آمناً.',
    invalid_option: 'خيار غير صالح. حاول مرة أخرى.',
    error: 'خطأ في النظام. حاول مرة أخرى.',
    emergency_desc: 'للخطر الفوري، صف بإيجاز:',
    contacts: 'جهات اتصال الطوارئ',
  },
  am: {
    welcome: 'Peaceverse ቅድመ ማስጠንቀቂያ',
    report: 'ክስተት ሪፖርት',
    emergency: 'ድንገተኛ (ፈጣን)',
    alerts: 'ማስጠንቀቂያዎች',
    status: 'የሪፖርት ሁኔታ',
    safe_spaces: 'ደህንነት ቦታዎች',
    subscribe: 'ለማስጠንቀቂያ ይመዝገቡ',
    language: 'ቋንቋ ቀይር',
    exit: 'ውጣ',
    back: 'ተመለስ',
    select_category: 'የክስተት ዓይነት:',
    select_severity: 'ምን ያህል ከባድ ነው?',
    enter_location: 'ቦታ ያስገቡ:',
    enter_description: 'ምን እንደሆነ ይግለጹ (100):',
    witnesses: 'የምስክሮች ብዛት:',
    anonymous: 'ስም-አልባ ሪፖርት?',
    confirm_report: 'ሪፖርት አረጋግጥ:',
    submit: 'ላክ',
    cancel: 'ሰርዝ',
    report_submitted: 'ሪፖርት ተልኳል!',
    no_alerts: 'ማስጠንቀቂያ የለም። አካባቢዎ ደህና ነው።',
    enter_report_id: 'የሪፖርት ID ያስገቡ:',
    thank_you: 'Peaceverse ስለተጠቀሙ እናመሰግናለን።',
    invalid_option: 'ልክ ያልሆነ። እንደገና ሞክር።',
    error: 'የስርዓት ስህተት። እንደገና ሞክር።',
    emergency_desc: 'ለፈጣን አደጋ፣ በአጭሩ ይግለጹ:',
    contacts: 'የአደጋ ጊዜ አድራሻዎች',
  }
};

function t(lang: string, key: string): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Parse USSD request (format varies by provider - Africa's Talking, Safaricom, etc.)
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    
    if (contentType.includes('form')) {
      const formData = await req.formData();
      body = {
        sessionId: formData.get('sessionId'),
        phoneNumber: formData.get('phoneNumber'),
        text: formData.get('text'),
        serviceCode: formData.get('serviceCode'),
        networkCode: formData.get('networkCode'),
      };
    } else {
      body = await req.json().catch(() => ({}));
    }
    
    const sessionId = body.sessionId || body.session_id || `sess_${Date.now()}`;
    const phoneNumber = body.phoneNumber || body.phone_number || body.msisdn || '';
    const text = body.text || '';
    const serviceCode = body.serviceCode || body.service_code || '*384*PEACE#';
    const networkCode = body.networkCode || body.network_code || '';

    console.log('USSD Request:', { sessionId, phoneNumber, text, serviceCode, networkCode });

    // Get or create session
    let { data: session } = await supabase
      .from('ussd_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (!session) {
      // Detect country from phone number
      const countryCode = detectCountryFromPhone(phoneNumber);
      
      const { data: newSession } = await supabase
        .from('ussd_sessions')
        .insert({
          session_id: sessionId,
          phone_number: phoneNumber,
          current_state: STATES.MAIN_MENU,
          data: { country_code: countryCode, network: networkCode },
          language: 'en'
        })
        .select()
        .single();
      session = newSession;
    }

    const lang = session?.language || 'en';
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
          response = buildMainMenu(lang, serviceCode);
        } else {
          switch (currentInput) {
            case '1': // Report Incident
              newState = STATES.REPORT_CATEGORY;
              response = `CON ${t(lang, 'select_category')}\n\n${CATEGORIES.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}\n0. ${t(lang, 'back')}`;
              break;
            case '2': // Emergency Quick Report
              newState = STATES.EMERGENCY_REPORT;
              response = `CON 🚨 ${t(lang, 'emergency_desc')}\n\n(Type location and what's happening)`;
              break;
            case '3': // View Alerts
              const { data: alerts } = await supabase
                .from('alert_logs')
                .select('title, severity, message')
                .eq('status', 'active')
                .order('triggered_at', { ascending: false })
                .limit(3);
              
              if (alerts?.length) {
                response = `CON ${t(lang, 'alerts')}:\n\n${alerts.map((a, i) => `${i + 1}. [${a.severity?.toUpperCase()}] ${truncate(a.title, 20)}`).join('\n')}\n\n0. ${t(lang, 'back')}`;
                newState = STATES.VIEW_ALERTS;
              } else {
                response = `CON ${t(lang, 'no_alerts')}\n\n0. ${t(lang, 'back')}`;
              }
              break;
            case '4': // Check Status
              newState = STATES.CHECK_STATUS;
              response = `CON ${t(lang, 'enter_report_id')}\n(e.g., RPT12345)\n\n0. ${t(lang, 'back')}`;
              break;
            case '5': // Find Safe Spaces
              newState = STATES.FIND_SAFE_SPACE;
              const countryCode = sessionData.country_code || 'KE';
              const { data: safeSpaces } = await supabase
                .from('safe_spaces')
                .select('name, contact_phone')
                .eq('is_archived', false)
                .limit(4);
              
              if (safeSpaces?.length) {
                response = `CON ${t(lang, 'safe_spaces')}:\n\n${safeSpaces.map((s, i) => `${i + 1}. ${truncate(s.name, 15)}${s.contact_phone ? ` - ${s.contact_phone}` : ''}`).join('\n')}\n\n0. ${t(lang, 'back')}`;
              } else {
                response = `CON ${t(lang, 'safe_spaces')}:\n\n1. Red Cross\n2. UNHCR\n3. Emergency - 112\n\n0. ${t(lang, 'back')}`;
              }
              break;
            case '6': // Emergency Contacts
              newState = STATES.EMERGENCY_CONTACTS;
              const userCountry = sessionData.country_code || 'KE';
              const { data: contacts } = await supabase
                .from('emergency_contacts')
                .select('name, phone_number, category')
                .eq('country_code', userCountry)
                .eq('is_active', true)
                .order('priority')
                .limit(5);
              
              if (contacts?.length) {
                response = `CON ${t(lang, 'contacts')} (${userCountry}):\n\n${contacts.map((c, i) => `${i + 1}. ${c.name}\n   ${c.phone_number}`).join('\n')}\n\n0. ${t(lang, 'back')}`;
              } else {
                response = `CON ${t(lang, 'contacts')}:\n\n1. Police - 999/112\n2. Ambulance - 112\n3. Red Cross - 0800-723-253\n\n0. ${t(lang, 'back')}`;
              }
              break;
            case '7': // Subscribe to Alerts
              newState = STATES.SUBSCRIBE_ALERTS;
              response = `CON ${t(lang, 'subscribe')}:\n\n1. Critical alerts only\n2. All high priority\n3. Weekly digest\n4. Unsubscribe\n\n0. ${t(lang, 'back')}`;
              break;
            case '8': // Change Language
              newState = STATES.LANGUAGE_SELECT;
              response = `CON Select Language:\n\n1. English\n2. Kiswahili\n3. Français\n4. العربية (Arabic)\n5. አማርኛ (Amharic)\n\n0. ${t(lang, 'back')}`;
              break;
            case '0':
              response = `END ${t(lang, 'thank_you')}\nDial ${serviceCode} anytime.`;
              endSession = true;
              break;
            default:
              response = `CON ${t(lang, 'invalid_option')}\n\n` + buildMainMenu(lang, serviceCode).replace('CON ', '');
          }
        }
        break;

      case STATES.EMERGENCY_REPORT:
        if (currentInput && currentInput !== '0') {
          // Quick emergency report - parse location and description
          const reportText = currentInput;
          const words = reportText.split(' ');
          const location = words[0] || 'Unknown';
          const description = words.slice(1).join(' ') || reportText;
          
          const { data: report, error } = await supabase
            .from('citizen_reports')
            .insert({
              title: `🚨 EMERGENCY: ${truncate(description, 30)}`,
              description: description,
              category: 'emergency',
              severity_level: 'critical',
              urgency_level: 'immediate',
              source: 'ussd',
              location_name: location,
              reporter_contact_phone: phoneNumber,
              is_anonymous: false,
              status: 'pending',
              verification_status: 'pending',
              tags: ['emergency', 'ussd', 'priority']
            })
            .select('id')
            .single();

          if (error) {
            console.error('Emergency report error:', error);
            response = `END ${t(lang, 'error')}\nCall 112 for immediate help.`;
          } else {
            const reportId = `RPT${report.id.substring(0, 6).toUpperCase()}`;
            response = `END 🚨 ${t(lang, 'report_submitted')}\n\nID: ${reportId}\nPRIORITY: CRITICAL\n\nHelp is being notified.\nCall 112 if in immediate danger.`;
            
            // Log and trigger emergency notification
            await supabase.from('ussd_logs').insert({
              phone_number: phoneNumber,
              session_id: sessionId,
              action: 'emergency_report',
              report_id: report.id,
              metadata: { severity: 'critical', location }
            });
          }
          endSession = true;
        } else {
          newState = STATES.MAIN_MENU;
          response = buildMainMenu(lang, serviceCode);
        }
        break;

      case STATES.REPORT_CATEGORY:
        if (currentInput === '0') {
          newState = STATES.MAIN_MENU;
          response = buildMainMenu(lang, serviceCode);
        } else {
          const categoryIndex = parseInt(currentInput) - 1;
          if (categoryIndex >= 0 && categoryIndex < CATEGORIES.length) {
            sessionData.category = CATEGORIES[categoryIndex].id;
            sessionData.categoryName = CATEGORIES[categoryIndex].name;
            
            if (CATEGORIES[categoryIndex].subcats.length > 0) {
              newState = STATES.REPORT_SUBCATEGORY;
              response = `CON ${sessionData.categoryName}\n\nSelect type:\n${CATEGORIES[categoryIndex].subcats.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n0. ${t(lang, 'back')}`;
            } else {
              newState = STATES.REPORT_SEVERITY;
              response = `CON ${t(lang, 'select_severity')}\n\n${SEVERITY_LEVELS.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}\n0. ${t(lang, 'back')}`;
            }
          } else {
            response = `CON ${t(lang, 'invalid_option')}\n\n${CATEGORIES.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}\n0. ${t(lang, 'back')}`;
          }
        }
        break;

      case STATES.REPORT_SUBCATEGORY:
        if (currentInput === '0') {
          newState = STATES.REPORT_CATEGORY;
          response = `CON ${t(lang, 'select_category')}\n\n${CATEGORIES.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}\n0. ${t(lang, 'back')}`;
        } else {
          const cat = CATEGORIES.find(c => c.id === sessionData.category);
          const subIndex = parseInt(currentInput) - 1;
          if (cat && subIndex >= 0 && subIndex < cat.subcats.length) {
            sessionData.subcategory = cat.subcats[subIndex];
            newState = STATES.REPORT_SEVERITY;
            response = `CON ${t(lang, 'select_severity')}\n\n${SEVERITY_LEVELS.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}\n0. ${t(lang, 'back')}`;
          } else {
            response = `CON ${t(lang, 'invalid_option')}\n\n${cat?.subcats.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n0. ${t(lang, 'back')}`;
          }
        }
        break;

      case STATES.REPORT_SEVERITY:
        if (currentInput === '0') {
          newState = STATES.REPORT_CATEGORY;
          response = `CON ${t(lang, 'select_category')}\n\n${CATEGORIES.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}\n0. ${t(lang, 'back')}`;
        } else {
          const sevIndex = parseInt(currentInput) - 1;
          if (sevIndex >= 0 && sevIndex < SEVERITY_LEVELS.length) {
            sessionData.severity = SEVERITY_LEVELS[sevIndex].id;
            sessionData.severityName = SEVERITY_LEVELS[sevIndex].name;
            newState = STATES.REPORT_LOCATION;
            response = `CON ${t(lang, 'enter_location')}\n(e.g., Kibera, Nairobi)`;
          } else {
            response = `CON ${t(lang, 'invalid_option')}\n\n${SEVERITY_LEVELS.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}\n0. ${t(lang, 'back')}`;
          }
        }
        break;

      case STATES.REPORT_LOCATION:
        if (currentInput && currentInput !== '0') {
          sessionData.location = currentInput;
          newState = STATES.REPORT_DESCRIPTION;
          response = `CON ${t(lang, 'enter_description')}`;
        } else {
          newState = STATES.REPORT_SEVERITY;
          response = `CON ${t(lang, 'select_severity')}\n\n${SEVERITY_LEVELS.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}\n0. ${t(lang, 'back')}`;
        }
        break;

      case STATES.REPORT_DESCRIPTION:
        if (currentInput && currentInput !== '0') {
          sessionData.description = currentInput.substring(0, 100);
          newState = STATES.REPORT_WITNESSES;
          response = `CON ${t(lang, 'witnesses')}\n\n1. None/Unknown\n2. 1-5 people\n3. 5-20 people\n4. 20+ people\n0. ${t(lang, 'back')}`;
        } else {
          newState = STATES.REPORT_LOCATION;
          response = `CON ${t(lang, 'enter_location')}`;
        }
        break;

      case STATES.REPORT_WITNESSES:
        if (currentInput === '0') {
          newState = STATES.REPORT_DESCRIPTION;
          response = `CON ${t(lang, 'enter_description')}`;
        } else {
          const witnessOptions: Record<string, number> = { '1': 0, '2': 3, '3': 12, '4': 25 };
          sessionData.witnesses = witnessOptions[currentInput] || 0;
          newState = STATES.REPORT_ANONYMOUS;
          response = `CON ${t(lang, 'anonymous')}\n\n1. Yes (Hide my number)\n2. No (Include contact)\n0. ${t(lang, 'back')}`;
        }
        break;

      case STATES.REPORT_ANONYMOUS:
        if (currentInput === '0') {
          newState = STATES.REPORT_WITNESSES;
          response = `CON ${t(lang, 'witnesses')}\n\n1. None/Unknown\n2. 1-5 people\n3. 5-20 people\n4. 20+ people\n0. ${t(lang, 'back')}`;
        } else if (currentInput === '1' || currentInput === '2') {
          sessionData.anonymous = currentInput === '1';
          newState = STATES.REPORT_CONFIRM;
          response = `CON ${t(lang, 'confirm_report')}\n\nType: ${sessionData.categoryName}\n${sessionData.subcategory ? `Sub: ${sessionData.subcategory}\n` : ''}Severity: ${sessionData.severity?.toUpperCase()}\nLocation: ${sessionData.location}\nAnonymous: ${sessionData.anonymous ? 'Yes' : 'No'}\n\n1. ${t(lang, 'submit')}\n2. ${t(lang, 'cancel')}`;
        } else {
          response = `CON ${t(lang, 'invalid_option')}\n\n1. Yes\n2. No\n0. ${t(lang, 'back')}`;
        }
        break;

      case STATES.REPORT_CONFIRM:
        if (currentInput === '1') {
          // Submit report
          const { data: report, error } = await supabase
            .from('citizen_reports')
            .insert({
              title: `USSD: ${sessionData.categoryName}${sessionData.subcategory ? ' - ' + sessionData.subcategory : ''}`,
              description: sessionData.description,
              category: sessionData.category || 'general',
              sub_category: sessionData.subcategory,
              severity_level: sessionData.severity || 'medium',
              source: 'ussd',
              location_name: sessionData.location,
              location_country: sessionData.country_code,
              reporter_contact_phone: sessionData.anonymous ? null : phoneNumber,
              is_anonymous: sessionData.anonymous,
              witness_count: sessionData.witnesses,
              status: 'pending',
              verification_status: 'pending',
              language: lang,
              tags: ['ussd', sessionData.category, sessionData.severity]
            })
            .select('id')
            .single();

          if (error) {
            console.error('Error submitting report:', error);
            response = `END ${t(lang, 'error')}\nCall 0800-PEACE for help.`;
          } else {
            const reportId = `RPT${report.id.substring(0, 6).toUpperCase()}`;
            response = `END ${t(lang, 'report_submitted')}\n\nID: ${reportId}\nSeverity: ${sessionData.severity?.toUpperCase()}\n\nWe will verify and respond.\nDial ${serviceCode} > 4 to track.`;
            
            // Log USSD report
            await supabase.from('ussd_logs').insert({
              phone_number: sessionData.anonymous ? 'ANONYMOUS' : phoneNumber,
              session_id: sessionId,
              action: 'report_submitted',
              report_id: report.id,
              metadata: { 
                category: sessionData.category, 
                severity: sessionData.severity,
                anonymous: sessionData.anonymous,
                language: lang
              }
            });
          }
          endSession = true;
        } else {
          newState = STATES.MAIN_MENU;
          response = `CON Report cancelled.\n\n` + buildMainMenu(lang, serviceCode).replace('CON ', '');
        }
        break;

      case STATES.CHECK_STATUS:
        if (currentInput === '0') {
          newState = STATES.MAIN_MENU;
          response = buildMainMenu(lang, serviceCode);
        } else if (currentInput) {
          const searchId = currentInput.replace('RPT', '').toLowerCase();
          const { data: report } = await supabase
            .from('citizen_reports')
            .select('status, verification_status, severity_level, created_at, resolution_notes')
            .ilike('id', `${searchId}%`)
            .single();

          if (report) {
            const statusEmoji = report.status === 'resolved' ? '✅' : report.status === 'pending' ? '⏳' : '🔄';
            response = `END ${statusEmoji} Report Status:\n\nSubmitted: ${new Date(report.created_at).toLocaleDateString()}\nStatus: ${report.status?.toUpperCase()}\nVerification: ${report.verification_status}\nSeverity: ${report.severity_level?.toUpperCase()}\n${report.resolution_notes ? `\nNote: ${truncate(report.resolution_notes, 40)}` : ''}\n\nDial ${serviceCode} for more.`;
          } else {
            response = `CON Report not found.\n\n${t(lang, 'enter_report_id')}\n0. ${t(lang, 'back')}`;
          }
          if (report) endSession = true;
        }
        break;

      case STATES.SUBSCRIBE_ALERTS:
        if (currentInput === '0') {
          newState = STATES.MAIN_MENU;
          response = buildMainMenu(lang, serviceCode);
        } else {
          const alertPrefs: Record<string, string[]> = {
            '1': ['critical'],
            '2': ['critical', 'high'],
            '3': ['weekly_digest']
          };
          
          if (currentInput === '4') {
            // Unsubscribe
            await supabase.from('sms_subscribers').update({ is_active: false, unsubscribed_at: new Date().toISOString() }).eq('phone_number', phoneNumber);
            response = `END You have been unsubscribed.\nDial ${serviceCode} to resubscribe anytime.`;
          } else if (alertPrefs[currentInput]) {
            await supabase.from('sms_subscribers').upsert({
              phone_number: phoneNumber,
              country_code: sessionData.country_code,
              language: lang,
              alert_types: alertPrefs[currentInput],
              is_active: true
            }, { onConflict: 'phone_number' });
            response = `END ✅ Subscribed!\nYou will receive ${currentInput === '1' ? 'critical' : currentInput === '2' ? 'critical & high priority' : 'weekly digest'} alerts.\n\nDial ${serviceCode} to manage.`;
          } else {
            response = `CON ${t(lang, 'invalid_option')}\n\n1. Critical only\n2. All high priority\n3. Weekly digest\n4. Unsubscribe\n0. ${t(lang, 'back')}`;
            break;
          }
          endSession = true;
        }
        break;

      case STATES.VIEW_ALERTS:
      case STATES.FIND_SAFE_SPACE:
      case STATES.EMERGENCY_CONTACTS:
        newState = STATES.MAIN_MENU;
        response = buildMainMenu(lang, serviceCode);
        break;

      case STATES.LANGUAGE_SELECT:
        const languages: Record<string, string> = { '1': 'en', '2': 'sw', '3': 'fr', '4': 'ar', '5': 'am' };
        const langNames: Record<string, string> = { '1': 'English', '2': 'Kiswahili', '3': 'Français', '4': 'العربية', '5': 'አማርኛ' };
        
        if (currentInput === '0') {
          newState = STATES.MAIN_MENU;
          response = buildMainMenu(lang, serviceCode);
        } else if (languages[currentInput]) {
          sessionData.language = languages[currentInput];
          const newLang = languages[currentInput];
          response = `CON ✅ Language: ${langNames[currentInput]}\n\n` + buildMainMenu(newLang, serviceCode).replace('CON ', '');
          newState = STATES.MAIN_MENU;
          
          // Update session language
          await supabase.from('ussd_sessions').update({ language: newLang }).eq('session_id', sessionId);
        } else {
          response = `CON ${t(lang, 'invalid_option')}\n\n1. English\n2. Kiswahili\n3. Français\n4. العربية\n5. አማርኛ\n0. ${t(lang, 'back')}`;
        }
        break;

      default:
        response = buildMainMenu(lang, serviceCode);
        newState = STATES.MAIN_MENU;
    }

    // Update session
    if (!endSession) {
      await supabase
        .from('ussd_sessions')
        .update({
          current_state: newState,
          data: sessionData,
          language: sessionData.language || lang,
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

    console.log('USSD Response:', { state: newState, response: truncate(response, 50) });

    // Return plain text for USSD (required by most providers)
    return new Response(response, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error('USSD Handler Error:', error);
    return new Response(
      'END System error. Please try again or call 112.',
      { headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
    );
  }
});

function buildMainMenu(lang: string, serviceCode: string): string {
  return `CON ${t(lang, 'welcome')}\n\n1. ${t(lang, 'report')}\n2. ${t(lang, 'emergency')}\n3. ${t(lang, 'alerts')}\n4. ${t(lang, 'status')}\n5. ${t(lang, 'safe_spaces')}\n6. ${t(lang, 'contacts')}\n7. ${t(lang, 'subscribe')}\n8. ${t(lang, 'language')}\n0. ${t(lang, 'exit')}`;
}

function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen - 2) + '..' : str;
}

function detectCountryFromPhone(phone: string): string {
  if (!phone) return 'KE';
  const cleaned = phone.replace(/[^0-9+]/g, '');
  
  const prefixes: Record<string, string> = {
    '+254': 'KE', '+255': 'TZ', '+256': 'UG', '+251': 'ET', '+234': 'NG',
    '+27': 'ZA', '+233': 'GH', '+250': 'RW', '+257': 'BI', '+243': 'CD',
    '+237': 'CM', '+225': 'CI', '+221': 'SN', '+20': 'EG', '+212': 'MA',
    '+216': 'TN', '+213': 'DZ', '+249': 'SD', '+211': 'SS'
  };
  
  for (const [prefix, code] of Object.entries(prefixes)) {
    if (cleaned.startsWith(prefix)) return code;
  }
  return 'KE'; // Default to Kenya
}