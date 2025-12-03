import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Hash function for API key validation
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const path = url.pathname.replace('/public-api', '');
  
  console.log(`[Public API] ${req.method} ${path}`);

  try {
    // Get API key from header
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'API key required',
          message: 'Please provide your API key in the x-api-key header',
          docs: 'https://peaceverse.app/docs/api'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key
    const keyPrefix = apiKey.substring(0, 8);
    const keyHash = await hashApiKey(apiKey);
    
    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_prefix', keyPrefix)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single();

    if (keyError || !apiKeyData) {
      console.log('[Public API] Invalid API key');
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const permissions = apiKeyData.permissions as string[];
    
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    // Route handling
    let responseData: any = null;
    let responseStatus = 200;

    // GET /incidents - List incidents
    if (path === '/incidents' && req.method === 'GET') {
      if (!permissions.includes('read:incidents')) {
        return new Response(
          JSON.stringify({ error: 'Permission denied: read:incidents required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const country = url.searchParams.get('country');
      const severity = url.searchParams.get('severity');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const format = url.searchParams.get('format') || 'json';

      let query = supabase
        .from('citizen_reports')
        .select('id, title, description, category, severity_level, status, location_country, location_region, location_city, location_latitude, location_longitude, created_at, updated_at')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (country) query = query.eq('location_country', country);
      if (severity) query = query.eq('severity_level', severity);

      const { data: incidents, error } = await query;
      if (error) throw error;

      // Format as CAP (Common Alerting Protocol) if requested
      if (format === 'cap') {
        responseData = {
          alert: {
            xmlns: 'urn:oasis:names:tc:emergency:cap:1.2',
            identifier: `peaceverse-${Date.now()}`,
            sender: 'peaceverse.app',
            sent: new Date().toISOString(),
            status: 'Actual',
            msgType: 'Alert',
            scope: 'Public',
            info: incidents?.map((inc: any) => ({
              category: 'Security',
              event: inc.title,
              urgency: inc.severity_level === 'critical' ? 'Immediate' : 'Expected',
              severity: inc.severity_level?.charAt(0).toUpperCase() + inc.severity_level?.slice(1) || 'Unknown',
              certainty: 'Observed',
              headline: inc.title,
              description: inc.description,
              area: {
                areaDesc: `${inc.location_city || ''}, ${inc.location_region || ''}, ${inc.location_country || ''}`,
                circle: inc.location_latitude && inc.location_longitude 
                  ? `${inc.location_latitude},${inc.location_longitude} 0`
                  : null
              }
            }))
          }
        };
      } else if (format === 'geojson') {
        responseData = {
          type: 'FeatureCollection',
          features: incidents?.filter((inc: any) => inc.location_latitude && inc.location_longitude).map((inc: any) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [parseFloat(inc.location_longitude), parseFloat(inc.location_latitude)]
            },
            properties: {
              id: inc.id,
              title: inc.title,
              category: inc.category,
              severity: inc.severity_level,
              status: inc.status,
              country: inc.location_country,
              region: inc.location_region,
              created_at: inc.created_at
            }
          }))
        };
      } else {
        responseData = {
          data: incidents,
          meta: {
            total: incidents?.length || 0,
            limit,
            offset,
            timestamp: new Date().toISOString()
          }
        };
      }
    }

    // GET /alerts - List active alerts
    else if (path === '/alerts' && req.method === 'GET') {
      if (!permissions.includes('read:alerts')) {
        return new Response(
          JSON.stringify({ error: 'Permission denied: read:alerts required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: alerts, error } = await supabase
        .from('alert_logs')
        .select('*')
        .eq('status', 'active')
        .order('triggered_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      responseData = { data: alerts, meta: { timestamp: new Date().toISOString() } };
    }

    // GET /hotspots - List predictive hotspots
    else if (path === '/hotspots' && req.method === 'GET') {
      if (!permissions.includes('read:hotspots')) {
        return new Response(
          JSON.stringify({ error: 'Permission denied: read:hotspots required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: hotspots, error } = await supabase
        .from('predictive_hotspots')
        .select('*')
        .eq('status', 'active')
        .order('hotspot_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      responseData = { data: hotspots, meta: { timestamp: new Date().toISOString() } };
    }

    // GET /countries - List available countries
    else if (path === '/countries' && req.method === 'GET') {
      const { data: countries, error } = await supabase
        .from('african_countries')
        .select('code, name, capital, official_languages')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      responseData = { data: countries };
    }

    // GET /health - API health check
    else if (path === '/health' || path === '/') {
      responseData = {
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: [
          { path: '/incidents', methods: ['GET'], description: 'List incidents with optional filters' },
          { path: '/alerts', methods: ['GET'], description: 'List active alerts' },
          { path: '/hotspots', methods: ['GET'], description: 'List predictive hotspots' },
          { path: '/countries', methods: ['GET'], description: 'List available countries' },
        ],
        formats: ['json', 'geojson', 'cap'],
        documentation: 'https://peaceverse.app/docs/api'
      };
    }

    else {
      responseStatus = 404;
      responseData = { error: 'Endpoint not found', path };
    }

    // Log API usage
    const responseTime = Date.now() - startTime;
    await supabase.from('api_usage_logs').insert({
      api_key_id: apiKeyData.id,
      endpoint: path,
      method: req.method,
      response_status: responseStatus,
      response_time_ms: responseTime,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    });

    console.log(`[Public API] Response: ${responseStatus} in ${responseTime}ms`);

    return new Response(
      JSON.stringify(responseData),
      { 
        status: responseStatus, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Response-Time': `${responseTime}ms`
        } 
      }
    );

  } catch (error: any) {
    console.error('[Public API] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
