import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AFRICAN_COUNTRIES = [
  { code: 'KE', name: 'Kenya', regions: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'] },
  { code: 'NG', name: 'Nigeria', regions: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan'] },
  { code: 'GH', name: 'Ghana', regions: ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern'] },
  { code: 'ZA', name: 'South Africa', regions: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo'] },
  { code: 'TZ', name: 'Tanzania', regions: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Zanzibar'] },
  { code: 'RW', name: 'Rwanda', regions: ['Kigali', 'Eastern', 'Southern', 'Western', 'Northern'] },
  { code: 'UG', name: 'Uganda', regions: ['Central', 'Eastern', 'Northern', 'Western', 'Kampala'] },
  { code: 'SN', name: 'Senegal', regions: ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor'] },
];

const INCIDENT_CATEGORIES = [
  { name: 'Voter Intimidation', severity_default: 'serious', sub_categories: ['Verbal threats', 'Physical threats', 'Armed presence', 'Group intimidation'] },
  { name: 'Ballot Irregularities', severity_default: 'critical', sub_categories: ['Ballot stuffing', 'Pre-marked ballots', 'Damaged ballots', 'Missing ballots'] },
  { name: 'Polling Station Issues', severity_default: 'moderate', sub_categories: ['Late opening', 'Early closure', 'Equipment failure', 'Insufficient materials'] },
  { name: 'Violence', severity_default: 'emergency', sub_categories: ['Physical assault', 'Mob violence', 'Armed attack', 'Property destruction'] },
  { name: 'Process Violations', severity_default: 'serious', sub_categories: ['Observer denied access', 'Improper verification', 'Underage voting', 'Multiple voting'] },
  { name: 'Campaign Violations', severity_default: 'moderate', sub_categories: ['Illegal campaigning', 'Vote buying', 'Bribery', 'Illegal advertising'] },
  { name: 'Technical Issues', severity_default: 'minor', sub_categories: ['System malfunction', 'Power outage', 'Network issues', 'Data loss'] },
  { name: 'Media & Information', severity_default: 'moderate', sub_categories: ['Media harassment', 'Misinformation', 'Social media manipulation', 'Fake news'] },
];

const OBSERVER_ROLES = ['domestic_observer', 'international_observer', 'party_agent', 'media', 'election_official', 'security_personnel'] as const;
const OBSERVER_ORGS = ['African Union', 'ECOWAS', 'EU Election Observation Mission', 'Carter Center', 'EISA', 'Commonwealth Observer Group', 'NDI', 'IRI', 'Local CSO Network', 'UN Electoral Assistance'];

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateIncidentCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  return `EI-${chars[randomInt(0, 25)]}${chars[randomInt(0, 25)]}${nums[randomInt(0, 9)]}${nums[randomInt(0, 9)]}${nums[randomInt(0, 9)]}${nums[randomInt(0, 9)]}`;
}

function generateCandidates(type: string): any[] {
  const count = type === 'referendum' ? 0 : randomInt(3, 8);
  const candidates = [];
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
  const lastNames = ['Kamau', 'Okonkwo', 'Mensah', 'Ndlovu', 'Diallo', 'Abubakar', 'Kigali', 'Mandela', 'Nyerere', 'Sankara'];

  for (let i = 0; i < count; i++) {
    candidates.push({
      id: `cand-${i + 1}`,
      name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
      party: `Party ${String.fromCharCode(65 + i)}`,
      photo_url: null,
      biography: `Experienced leader with background in ${randomItem(['law', 'business', 'civil service', 'activism', 'academia'])}`,
    });
  }
  return candidates;
}

function generateParties(): any[] {
  const parties = ['Unity Party', 'Progressive Alliance', 'Democratic Movement', "People's Congress", 'National Front', 'Reform Coalition'];
  return parties.map((name, i) => ({
    id: `party-${i + 1}`,
    name,
    acronym: name.split(' ').map(w => w[0]).join(''),
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][i],
  }));
}

function generateIncidentDescription(category: string, country: string): string {
  const templates: Record<string, string[]> = {
    'Voter Intimidation': [
      `Group of individuals observed outside polling station in ${country} making threatening gestures toward voters.`,
      `Reports of voters in ${country} being told who to vote for under threat of consequences.`,
      `Armed individuals spotted near voting queue in ${country} creating fear among voters.`,
    ],
    'Ballot Irregularities': [
      `Pre-marked ballots discovered in ballot box during count verification in ${country}.`,
      `Significant discrepancy between number of voters recorded and ballots found in ${country}.`,
      `Damaged ballot papers in ${country} making voter intent unclear.`,
    ],
    'Polling Station Issues': [
      `Polling station in ${country} opened 2 hours late due to delayed materials delivery.`,
      `Biometric verification equipment malfunction in ${country} causing long queues.`,
      `Insufficient ballot papers in ${country} requiring emergency resupply.`,
    ],
    'Violence': [
      `Physical altercation between supporters of rival parties near polling station in ${country}.`,
      `Vandalism of campaign materials and election posters in ${country}.`,
      `Mob gathered outside polling station in ${country} causing disruption to voting process.`,
    ],
    'Process Violations': [
      `Accredited observers denied entry to counting hall in ${country}.`,
      `Voters observed casting multiple ballots in ${country}.`,
      `Improper voter ID verification procedures followed in ${country}.`,
    ],
    'Campaign Violations': [
      `Active campaigning observed within restricted zone near polling station in ${country}.`,
      `Reports of voters in ${country} being offered money or goods in exchange for votes.`,
      `Unauthorized campaign materials distributed at polling location in ${country}.`,
    ],
    'Technical Issues': [
      `Power outage in ${country} affecting electronic result transmission.`,
      `Network connectivity issues in ${country} preventing real-time reporting.`,
      `Biometric system database synchronization failure in ${country}.`,
    ],
    'Media & Information': [
      `False results being circulated on social media in ${country} before official announcement.`,
      `Journalist equipment confiscated by security personnel in ${country}.`,
      `Coordinated disinformation campaign detected online targeting ${country} elections.`,
    ],
  };

  return randomItem(templates[category] || [`Incident reported at polling location in ${country}.`]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action = 'seed' } = await req.json().catch(() => ({}));
    const errors: string[] = [];

    if (action === 'clear') {
      await supabase.from('election_incidents').delete().like('title', '[DEMO]%');
      await supabase.from('election_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('election_observers').delete().like('full_name', '[DEMO]%');
      await supabase.from('polling_stations').delete().like('station_name', '[DEMO]%');
      await supabase.from('elections').delete().like('name', '[DEMO]%');

      return new Response(JSON.stringify({ success: true, message: 'Demo data cleared' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clear existing demo data first to avoid duplicates
    console.log('Clearing existing demo data...');
    await supabase.from('election_incidents').delete().like('title', '[DEMO]%');
    await supabase.from('election_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('election_observers').delete().like('full_name', '[DEMO]%');
    await supabase.from('polling_stations').delete().like('station_name', '[DEMO]%');
    await supabase.from('elections').delete().like('name', '[DEMO]%');

    // Seed incident categories
    console.log('Seeding incident categories...');
    for (const cat of INCIDENT_CATEGORIES) {
      const { error } = await supabase.from('election_incident_categories').upsert({
        name: cat.name,
        severity_default: cat.severity_default,
        sub_categories: cat.sub_categories,
        is_active: true,
        display_order: INCIDENT_CATEGORIES.indexOf(cat) + 1,
      }, { onConflict: 'name' });
      if (error) {
        console.error(`Category upsert error for ${cat.name}:`, error.message);
        errors.push(`Category ${cat.name}: ${error.message}`);
      }
    }

    // Create demo elections
    const elections: any[] = [];
    const now = new Date();

    const electionScenarios = [
      { country: AFRICAN_COUNTRIES[0], type: 'presidential' as const, status: 'voting' as const, daysOffset: 0, name: 'Presidential Election 2026' },
      { country: AFRICAN_COUNTRIES[1], type: 'gubernatorial' as const, status: 'counting' as const, daysOffset: -1, name: 'Gubernatorial Elections 2026' },
      { country: AFRICAN_COUNTRIES[2], type: 'parliamentary' as const, status: 'scheduled' as const, daysOffset: 30, name: 'Parliamentary Election 2026' },
      { country: AFRICAN_COUNTRIES[3], type: 'local' as const, status: 'verification' as const, daysOffset: -3, name: 'Municipal Elections 2026' },
      { country: AFRICAN_COUNTRIES[4], type: 'referendum' as const, status: 'campaigning' as const, daysOffset: 14, name: 'Constitutional Referendum 2026' },
      { country: AFRICAN_COUNTRIES[5], type: 'presidential' as const, status: 'completed' as const, daysOffset: -30, name: 'Presidential Election 2025' },
    ];

    console.log(`Creating ${electionScenarios.length} elections...`);

    for (const scenario of electionScenarios) {
      const votingDate = new Date(now);
      votingDate.setDate(votingDate.getDate() + scenario.daysOffset);

      const regStart = new Date(votingDate);
      regStart.setDate(regStart.getDate() - 90);
      const regEnd = new Date(votingDate);
      regEnd.setDate(regEnd.getDate() - 30);
      const campStart = new Date(votingDate);
      campStart.setDate(campStart.getDate() - 21);
      const campEnd = new Date(votingDate);
      campEnd.setDate(campEnd.getDate() - 1);

      const insertData = {
        name: `[DEMO] ${scenario.country.name} ${scenario.name}`,
        description: `Official ${scenario.type} election for ${scenario.country.name}. International observers deployed. Multi-signature verification enabled.`,
        election_type: scenario.type,
        country_code: scenario.country.code,
        country_name: scenario.country.name,
        regions: scenario.country.regions,
        voting_date: votingDate.toISOString().split('T')[0],
        registration_start: regStart.toISOString().split('T')[0],
        registration_end: regEnd.toISOString().split('T')[0],
        campaign_start: campStart.toISOString().split('T')[0],
        campaign_end: campEnd.toISOString().split('T')[0],
        status: scenario.status,
        is_active: scenario.status !== 'completed',
        total_registered_voters: randomInt(1000000, 25000000),
        total_polling_stations: randomInt(5000, 40000),
        verification_required: true,
        multi_signature_required: true,
        min_signatures_required: 3,
        config: {
          timezone: 'Africa/' + scenario.country.name.replace(' ', '_'),
          voting_hours: { start: '06:00', end: '18:00' },
          results_transmission: 'electronic_and_manual',
          biometric_verification: true,
          parallel_vote_tabulation: true,
        },
        candidates: generateCandidates(scenario.type),
        political_parties: generateParties(),
      };

      console.log(`Inserting election: ${insertData.name}`);
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .insert(insertData)
        .select()
        .single();

      if (electionError) {
        console.error(`Election insert error:`, electionError.message, electionError.details, electionError.hint);
        errors.push(`Election ${insertData.name}: ${electionError.message}`);
        continue;
      }

      if (!election) {
        console.error(`Election insert returned null for ${insertData.name}`);
        errors.push(`Election ${insertData.name}: returned null`);
        continue;
      }

      console.log(`Election created: ${election.id}`);
      elections.push(election);

      // Create polling stations
      const stationCount = randomInt(15, 25);
      const stations: any[] = [];
      const stationInserts = [];

      for (let i = 0; i < stationCount; i++) {
        const region = randomItem(scenario.country.regions);
        stationInserts.push({
          election_id: election.id,
          station_code: `${scenario.country.code}-${region.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
          station_name: `[DEMO] ${region} Polling Station ${i + 1}`,
          country_code: scenario.country.code,
          region: region,
          district: `District ${randomInt(1, 10)}`,
          constituency: `Constituency ${randomInt(1, 5)}`,
          ward: `Ward ${randomInt(1, 20)}`,
          registered_voters: randomInt(500, 5000),
          is_active: true,
          is_accessible: Math.random() > 0.2,
          accessibility_notes: Math.random() > 0.5 ? 'Wheelchair accessible, Braille materials available' : null,
          equipment_status: {
            biometric_scanner: Math.random() > 0.1 ? 'operational' : 'faulty',
            result_transmission_kit: Math.random() > 0.05 ? 'operational' : 'offline',
            backup_power: Math.random() > 0.3,
          },
          setup_verified: Math.random() > 0.3,
          latitude: parseFloat((-1.2921 + (Math.random() * 10 - 5)).toFixed(6)),
          longitude: parseFloat((36.8219 + (Math.random() * 20 - 10)).toFixed(6)),
        });
      }

      // Batch insert stations
      const { data: stationData, error: stationError } = await supabase
        .from('polling_stations')
        .insert(stationInserts)
        .select();

      if (stationError) {
        console.error(`Station insert error:`, stationError.message);
        errors.push(`Stations for ${scenario.country.name}: ${stationError.message}`);
      } else if (stationData) {
        stations.push(...stationData);
        console.log(`Created ${stationData.length} polling stations`);
      }

      // Create observers - batch insert
      const observerCount = randomInt(20, 40);
      const observerInserts = [];
      for (let i = 0; i < observerCount; i++) {
        const role = randomItem(OBSERVER_ROLES);
        const org = role === 'international_observer' ? randomItem(OBSERVER_ORGS.slice(0, 6)) :
                    role === 'domestic_observer' ? randomItem(OBSERVER_ORGS.slice(6)) :
                    role === 'party_agent' ? randomItem(generateParties()).name :
                    role === 'media' ? randomItem(['BBC', 'CNN', 'Al Jazeera', 'Reuters', 'AFP', 'Local Press']) :
                    'Government';

        observerInserts.push({
          election_id: election.id,
          full_name: `[DEMO] Observer ${i + 1}`,
          email: `observer${i + 1}.${scenario.country.code.toLowerCase()}@demo.org`,
          phone: `+1${randomInt(1000000000, 9999999999)}`,
          organization: org,
          observer_role: role,
          accreditation_number: `ACC-${election.country_code}-${String(i + 1).padStart(5, '0')}`,
          accreditation_status: Math.random() > 0.1 ? 'approved' : randomItem(['pending', 'rejected', 'suspended']),
          assigned_stations: stations.length > 0 ? stations.slice(0, randomInt(1, Math.min(5, stations.length))).map((s: any) => s.id) : [],
          assigned_regions: [randomItem(scenario.country.regions)],
          id_verified: Math.random() > 0.2,
          training_completed: Math.random() > 0.15,
          oath_signed: Math.random() > 0.1,
          is_active: true,
          deployment_status: Math.random() > 0.3 ? 'deployed' : randomItem(['standby', 'in_transit', 'recalled']),
        });
      }

      const { error: observerError } = await supabase.from('election_observers').insert(observerInserts);
      if (observerError) {
        console.error(`Observer insert error:`, observerError.message);
        errors.push(`Observers for ${scenario.country.name}: ${observerError.message}`);
      } else {
        console.log(`Created ${observerInserts.length} observers`);
      }

      // Create incidents for active elections
      if (['voting', 'counting', 'verification', 'completed'].includes(scenario.status)) {
        const incidentCount = randomInt(15, 35);
        const incidentInserts = [];

        for (let i = 0; i < incidentCount; i++) {
          const category = randomItem(INCIDENT_CATEGORIES);
          const severity = Math.random() > 0.7 ? randomItem(['critical', 'emergency'] as const) :
                          Math.random() > 0.5 ? category.severity_default :
                          randomItem(['minor', 'moderate'] as const);
          const station = stations.length > 0 ? randomItem(stations) : null;

          const incidentTime = new Date(votingDate);
          incidentTime.setHours(randomInt(6, 18));
          incidentTime.setMinutes(randomInt(0, 59));

          incidentInserts.push({
            election_id: election.id,
            polling_station_id: station?.id || null,
            is_anonymous: Math.random() > 0.6,
            incident_code: generateIncidentCode(),
            title: `[DEMO] ${category.name}: ${randomItem(category.sub_categories)}`,
            description: generateIncidentDescription(category.name, scenario.country.name),
            category: category.name,
            sub_category: randomItem(category.sub_categories),
            severity: severity,
            country_code: scenario.country.code,
            region: station?.region || randomItem(scenario.country.regions),
            district: station?.district || null,
            location_address: station?.station_name || null,
            latitude: parseFloat((station?.latitude || (-1.2921 + (Math.random() * 2 - 1))).toFixed(6)),
            longitude: parseFloat((station?.longitude || (36.8219 + (Math.random() * 2 - 1))).toFixed(6)),
            incident_datetime: incidentTime.toISOString(),
            duration_minutes: randomInt(5, 180),
            has_witnesses: Math.random() > 0.4,
            witness_count: randomInt(0, 20),
            people_affected: randomInt(10, 500),
            voting_disrupted: Math.random() > 0.6,
            disruption_duration_minutes: randomInt(0, 120),
            status: randomItem(['reported', 'under_investigation', 'resolved', 'escalated']),
            verification_status: randomItem(['pending', 'verified', 'unverified', 'disputed']),
            credibility_score: parseFloat((Math.random() * 0.6 + 0.4).toFixed(2)),
            requires_immediate_action: severity === 'emergency' || severity === 'critical',
            escalated: severity === 'emergency',
          });
        }

        const { error: incidentError } = await supabase.from('election_incidents').insert(incidentInserts);
        if (incidentError) {
          console.error(`Incident insert error:`, incidentError.message);
          errors.push(`Incidents for ${scenario.country.name}: ${incidentError.message}`);
        } else {
          console.log(`Created ${incidentInserts.length} incidents`);
        }
      }

      // Create results for completed/verification elections
      if (['verification', 'completed', 'counting'].includes(scenario.status)) {
        const resultInserts = [];
        for (const station of stations.slice(0, Math.min(stations.length, 20))) {
          const registered = station.registered_voters || 1000;
          const turnout = Math.random() * 0.4 + 0.45;
          const totalVotes = Math.floor(registered * turnout);
          const rejected = Math.floor(totalVotes * (Math.random() * 0.05));
          const valid = totalVotes - rejected;

          const candidates = (election.candidates as any[]) || [];
          const resultsData: Record<string, number> = {};
          let remaining = valid;

          candidates.forEach((candidate: any, idx: number) => {
            if (idx === candidates.length - 1) {
              resultsData[candidate.name] = remaining;
            } else {
              const share = Math.floor(remaining * (Math.random() * 0.4 + 0.1));
              resultsData[candidate.name] = share;
              remaining -= share;
            }
          });

          resultInserts.push({
            election_id: election.id,
            polling_station_id: station.id,
            total_registered: registered,
            total_votes_cast: totalVotes,
            valid_votes: valid,
            rejected_votes: rejected,
            results_data: resultsData,
            turnout_percentage: Math.round(turnout * 100 * 100) / 100,
            signature_count: randomInt(2, 5),
            fully_verified: scenario.status === 'completed',
            status: scenario.status === 'completed' ? 'certified' : randomItem(['pending', 'verified', 'contested']),
            contested: Math.random() > 0.9,
          });
        }

        if (resultInserts.length > 0) {
          const { error: resultError } = await supabase.from('election_results').insert(resultInserts);
          if (resultError) {
            console.error(`Result insert error:`, resultError.message);
            errors.push(`Results for ${scenario.country.name}: ${resultError.message}`);
          } else {
            console.log(`Created ${resultInserts.length} results`);
          }
        }
      }
    }

    console.log(`Seeding complete. Created ${elections.length} elections. Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        message: errors.length === 0
          ? 'Election demo data seeded successfully'
          : `Seeded with ${errors.length} errors`,
        elections: elections.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error('Fatal error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
