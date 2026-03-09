import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSMessage {
  from: string;
  to: string;
  text: string;
  timestamp?: string;
  carrier?: string;
  country?: string;
}

interface ParsedElectionReport {
  type: 'incident' | 'result' | 'alert' | 'status';
  stationCode?: string;
  incidentType?: string;
  severity?: string;
  description?: string;
  results?: Record<string, number>;
  language?: string;
}

// Multi-language keyword mapping
const KEYWORDS: Record<string, Record<string, string>> = {
  en: {
    INCIDENT: 'incident',
    RESULT: 'result',
    ALERT: 'alert',
    STATUS: 'status',
    HELP: 'help'
  },
  sw: {
    TUKIO: 'incident',
    MATOKEO: 'result',
    ONYO: 'alert',
    HALI: 'status',
    MSAADA: 'help'
  },
  fr: {
    INCIDENT: 'incident',
    RESULTAT: 'result',
    ALERTE: 'alert',
    STATUT: 'status',
    AIDE: 'help'
  }
};

// Severity mapping
const SEVERITY_KEYWORDS: Record<string, string> = {
  'CRITICAL': 'critical',
  'EMERGENCY': 'emergency',
  'HIGH': 'serious',
  'SERIOUS': 'serious',
  'MEDIUM': 'moderate',
  'MODERATE': 'moderate',
  'LOW': 'minor',
  'MINOR': 'minor',
  // Swahili
  'DHARURA': 'emergency',
  'KALI': 'serious',
  'WASTANI': 'moderate',
  'NDOGO': 'minor',
  // French
  'CRITIQUE': 'critical',
  'URGENCE': 'emergency',
  'ELEVE': 'serious',
  'MOYEN': 'moderate',
  'BAS': 'minor'
};

// Incident type keywords
const INCIDENT_TYPES: Record<string, string> = {
  'VIOLENCE': 'voter_intimidation',
  'INTIMIDATION': 'voter_intimidation',
  'FRAUD': 'electoral_fraud',
  'UDANGANYIFU': 'electoral_fraud',
  'FRAUDE': 'electoral_fraud',
  'DELAY': 'procedural_violation',
  'UCHELEWESHAJI': 'procedural_violation',
  'RETARD': 'procedural_violation',
  'EQUIPMENT': 'equipment_failure',
  'VIFAA': 'equipment_failure',
  'EQUIPEMENT': 'equipment_failure',
  'BRIBERY': 'vote_buying',
  'HONGO': 'vote_buying',
  'CORRUPTION': 'vote_buying'
};

function detectLanguage(text: string): string {
  const swahiliWords = ['TUKIO', 'MATOKEO', 'ONYO', 'HALI', 'DHARURA'];
  const frenchWords = ['RESULTAT', 'ALERTE', 'STATUT', 'CRITIQUE', 'URGENCE'];
  
  const upperText = text.toUpperCase();
  
  if (swahiliWords.some(word => upperText.includes(word))) return 'sw';
  if (frenchWords.some(word => upperText.includes(word))) return 'fr';
  return 'en';
}

function parseElectionSMS(text: string): ParsedElectionReport | null {
  const language = detectLanguage(text);
  const upperText = text.toUpperCase().trim();
  const parts = upperText.split(/\s+/);
  
  if (parts.length < 2) return null;
  
  const command = parts[0];
  
  // Detect report type
  let type: 'incident' | 'result' | 'alert' | 'status' = 'incident';
  
  for (const [lang, keywords] of Object.entries(KEYWORDS)) {
    for (const [keyword, reportType] of Object.entries(keywords)) {
      if (command === keyword) {
        type = reportType as any;
        break;
      }
    }
  }
  
  // Parse based on type
  if (type === 'incident') {
    // Format: INCIDENT PS-1234 INTIMIDATION HIGH Description text
    const stationCode = parts.find(p => /^PS-?\d+/i.test(p) || /^[A-Z]{2,3}-[A-Z0-9-]+/i.test(p));
    const severity = parts.find(p => SEVERITY_KEYWORDS[p]);
    const incidentType = parts.find(p => INCIDENT_TYPES[p]);
    
    // Get description (remaining text after keywords)
    const keywordIndices = parts.map((p, i) => 
      (p === command || p === stationCode || SEVERITY_KEYWORDS[p] || INCIDENT_TYPES[p]) ? i : -1
    ).filter(i => i >= 0);
    const maxKeywordIndex = Math.max(...keywordIndices);
    const description = parts.slice(maxKeywordIndex + 1).join(' ');
    
    return {
      type: 'incident',
      stationCode,
      incidentType: incidentType ? INCIDENT_TYPES[incidentType] : 'other',
      severity: severity ? SEVERITY_KEYWORDS[severity] : 'moderate',
      description: description || text.slice(command.length + (stationCode?.length || 0) + 2).trim(),
      language
    };
  }
  
  if (type === 'result') {
    // Format: RESULT PS-1234 CANDIDATE1=456 CANDIDATE2=389 REJ=12
    const stationCode = parts.find(p => /^PS-?\d+/i.test(p) || /^[A-Z]{2,3}-[A-Z0-9-]+/i.test(p));
    const results: Record<string, number> = {};
    
    for (const part of parts) {
      const match = part.match(/^([A-Z]+)=(\d+)$/i);
      if (match) {
        results[match[1]] = parseInt(match[2], 10);
      }
    }
    
    return {
      type: 'result',
      stationCode,
      results,
      language
    };
  }
  
  if (type === 'alert') {
    // Format: ALERT PS-1234 Emergency message
    const stationCode = parts.find(p => /^PS-?\d+/i.test(p) || /^[A-Z]{2,3}-[A-Z0-9-]+/i.test(p));
    const description = parts.slice(stationCode ? 2 : 1).join(' ');
    
    return {
      type: 'alert',
      stationCode,
      severity: 'emergency',
      description,
      language
    };
  }
  
  return {
    type: 'status',
    stationCode: parts[1],
    language
  };
}

function generateHelpResponse(language: string): string {
  const helpMessages: Record<string, string> = {
    en: `Election SMS Commands:
INCIDENT [STATION] [TYPE] [SEVERITY] [DETAILS]
RESULT [STATION] [CANDIDATE=VOTES]...
ALERT [STATION] [MESSAGE]
STATUS [STATION]
Example: INCIDENT PS-1234 INTIMIDATION HIGH Voters threatened`,
    sw: `Maagizo ya SMS:
TUKIO [KITUO] [AINA] [KIWANGO] [MAELEZO]
MATOKEO [KITUO] [MGOMBEA=KURA]...
ONYO [KITUO] [UJUMBE]
HALI [KITUO]`,
    fr: `Commandes SMS Élection:
INCIDENT [STATION] [TYPE] [GRAVITE] [DETAILS]
RESULTAT [STATION] [CANDIDAT=VOTES]...
ALERTE [STATION] [MESSAGE]
STATUT [STATION]`
  };
  
  return helpMessages[language] || helpMessages.en;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sms }: { sms: SMSMessage } = await req.json();
    
    if (!sms || !sms.text) {
      return new Response(
        JSON.stringify({ error: "Missing SMS data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const language = detectLanguage(sms.text);
    
    // Check for HELP command
    const upperText = sms.text.toUpperCase().trim();
    if (upperText.startsWith('HELP') || upperText.startsWith('MSAADA') || upperText.startsWith('AIDE')) {
      return new Response(
        JSON.stringify({
          success: true,
          response: generateHelpResponse(language),
          parsed: null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the SMS
    const parsed = parseElectionSMS(sms.text);
    
    if (!parsed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not parse message. Reply HELP for commands.",
          parsed: null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the SMS to database
    const { error: logError } = await supabase.from("sms_election_reports").insert({
      phone_number: sms.from,
      raw_message: sms.text,
      parsed_data: parsed,
      report_type: parsed.type,
      station_code: parsed.stationCode,
      severity: parsed.severity,
      language: parsed.language,
      carrier: sms.carrier,
      country: sms.country,
      status: 'received'
    });

    if (logError) {
      console.error("Failed to log SMS:", logError);
    }

    // Process based on type
    let responseMessage = '';
    
    if (parsed.type === 'incident' && parsed.stationCode) {
      // Create election incident
      const incidentCode = `SMS-${Date.now().toString(36).toUpperCase()}`;
      
      const { data: incident, error: incidentError } = await supabase
        .from("election_incidents")
        .insert({
          incident_code: incidentCode,
          title: `SMS Report: ${parsed.incidentType?.replace('_', ' ')}`,
          description: parsed.description || 'Reported via SMS',
          category: parsed.incidentType || 'other',
          severity: parsed.severity || 'moderate',
          status: 'reported',
          verification_status: 'pending',
          is_anonymous: true,
          source: 'sms',
          incident_datetime: new Date().toISOString(),
          country_code: sms.country || 'KE'
        })
        .select()
        .single();

      if (incidentError) {
        console.error("Failed to create incident:", incidentError);
        responseMessage = language === 'sw' 
          ? 'Hitilafu. Jaribu tena.'
          : language === 'fr'
            ? 'Erreur. Réessayez.'
            : 'Error. Please try again.';
      } else {
        responseMessage = language === 'sw'
          ? `Tukio limepokelewa. Ref: ${incidentCode}`
          : language === 'fr'
            ? `Incident reçu. Ref: ${incidentCode}`
            : `Incident received. Ref: ${incidentCode}`;
      }
    } else if (parsed.type === 'result' && parsed.stationCode && parsed.results) {
      responseMessage = language === 'sw'
        ? `Matokeo yamepokelewa kutoka ${parsed.stationCode}. Yatahakikiwa.`
        : language === 'fr'
          ? `Résultats reçus de ${parsed.stationCode}. En cours de vérification.`
          : `Results received from ${parsed.stationCode}. Pending verification.`;
    } else if (parsed.type === 'alert') {
      // High-priority alert
      const alertCode = `ALT-${Date.now().toString(36).toUpperCase()}`;
      responseMessage = language === 'sw'
        ? `ONYO limepokelewa. Ref: ${alertCode}. Timu yetu itawasiliana.`
        : language === 'fr'
          ? `ALERTE reçue. Ref: ${alertCode}. Notre équipe vous contactera.`
          : `ALERT received. Ref: ${alertCode}. Our team will follow up.`;
    } else {
      responseMessage = language === 'sw'
        ? 'Jibu MSAADA kwa maagizo.'
        : language === 'fr'
          ? 'Répondez AIDE pour les commandes.'
          : 'Reply HELP for commands.';
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: responseMessage,
        parsed,
        language
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("SMS election processing error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
