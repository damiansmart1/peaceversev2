import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Seed civic documents
    const documents = [
      {
        title: 'Kenya National Budget 2025/2026 - Education Sector Allocation',
        description: 'Comprehensive breakdown of the Kenya national budget allocation for the education sector, including primary, secondary, and tertiary education funding for FY 2025/2026.',
        document_type: 'budget',
        country: 'Kenya',
        status: 'ready',
        original_text: `REPUBLIC OF KENYA - NATIONAL BUDGET ESTIMATES FY 2025/2026

MINISTRY OF EDUCATION - VOTE 1064

EXECUTIVE SUMMARY
The Ministry of Education has been allocated KES 544.4 billion for the Financial Year 2025/2026, representing 27.3% of the total national budget. This is an increase of 8.2% from the previous financial year allocation of KES 503.1 billion.

RECURRENT EXPENDITURE: KES 478.2 billion
- Teachers' salaries and benefits: KES 312.7 billion
- Free Primary Education (FPE) capitation: KES 22.4 billion  
- Free Day Secondary Education (FDSE): KES 56.8 billion
- University funding: KES 48.3 billion
- TVET institutions: KES 18.5 billion
- Examination bodies (KNEC): KES 12.8 billion
- Administrative costs: KES 6.7 billion

DEVELOPMENT EXPENDITURE: KES 66.2 billion
- School infrastructure development: KES 28.4 billion
- Digital learning programme (laptops/tablets): KES 12.1 billion
- Laboratory equipment: KES 8.3 billion
- TVET expansion programme: KES 9.7 billion
- Special needs education facilities: KES 4.2 billion
- Teacher training colleges: KES 3.5 billion

KEY POLICY TARGETS:
1. Achieve 100% transition rate from primary to secondary by 2027
2. Reduce student-teacher ratio from 45:1 to 35:1 in public primary schools
3. Connect 95% of public secondary schools to internet by 2026
4. Increase TVET enrollment by 40% through 15 new institutions
5. Implement competency-based curriculum (CBC) grade 9 rollout

COUNTY ALLOCATION FRAMEWORK:
Counties shall receive education conditional grants totaling KES 42.8 billion distributed based on:
- Student population (60% weight)
- Poverty index (25% weight)  
- Geographic area/remoteness (15% weight)

ACCOUNTABILITY MEASURES:
- Quarterly expenditure reports to Parliament
- Annual education sector review with stakeholders
- Independent audit by Auditor General
- School-level financial reporting through the School Management Information System (SMIS)`,
        summary: 'Kenya education budget of KES 544.4B (27.3% of national budget) covers teacher salaries, free education programs, digital learning, and TVET expansion with key targets for 100% primary-secondary transition.',
        topics: ['Education', 'Budget', 'Infrastructure', 'Digital Learning', 'TVET', 'CBC'],
        institutions: ['Ministry of Education', 'KNEC', 'TSC', 'TVET Authority'],
        financial_allocations: { total: 'KES 544.4B', recurrent: 'KES 478.2B', development: 'KES 66.2B' },
        ai_summary: {
          summary: 'The Kenya National Budget 2025/2026 allocates KES 544.4 billion to education (27.3% of total budget), an 8.2% increase. Major items include teacher salaries (KES 312.7B), free primary education (KES 22.4B), secondary education (KES 56.8B), and university funding (KES 48.3B). Development spending of KES 66.2B targets school infrastructure, digital learning, and TVET expansion.',
          citizenImpact: 'Citizens can expect improved school infrastructure, better student-teacher ratios, expanded TVET opportunities, and continued free primary and secondary education. Digital learning programs will bring technology to 95% of secondary schools by 2026.',
          keyFindings: ['27.3% of budget allocated to education', '8.2% increase from previous year', '100% primary-secondary transition target by 2027', '15 new TVET institutions planned'],
        },
        view_count: 1247,
        question_count: 38,
        processing_status: 'completed',
      },
      {
        title: 'Nigeria Climate Change Act 2024 - Environmental Protection Framework',
        description: 'Legislative framework establishing Nigeria\'s climate change response strategy, carbon emission targets, and environmental protection mandates.',
        document_type: 'legislation',
        country: 'Nigeria',
        status: 'ready',
        original_text: `FEDERAL REPUBLIC OF NIGERIA
CLIMATE CHANGE ACT 2024
An Act to provide for the mainstreaming of climate change actions, establish the National Climate Change Council, and set Nigeria's carbon neutrality pathway.

PART I - PRELIMINARY
Section 1: Short Title and Commencement
This Act may be cited as the Climate Change Act 2024 and shall come into force on 1st January 2025.

Section 2: Interpretation
"Carbon budget" means the maximum cumulative amount of carbon dioxide emissions permitted over a specified period.
"Climate vulnerable communities" means communities identified as being at high risk from climate change impacts.
"Green bonds" means debt securities issued to finance climate and environmental projects.

PART II - NATIONAL CLIMATE CHANGE COUNCIL
Section 3: Establishment
There is hereby established the National Climate Change Council (NCCC) chaired by the Vice President.

Section 4: Composition
The Council shall comprise:
(a) The Vice President as Chairman
(b) Minister of Environment
(c) Minister of Finance
(d) Minister of Power
(e) Governor of the Central Bank
(f) 6 representatives from climate-vulnerable states
(g) 3 representatives from civil society organizations
(h) 2 representatives from the private sector

PART III - CARBON EMISSION TARGETS
Section 8: National Carbon Budget
Nigeria shall reduce greenhouse gas emissions by:
(a) 20% below 2020 levels by 2030
(b) 47% below 2020 levels by 2040
(c) Achieve net-zero emissions by 2060

Section 9: Sectoral Targets
(a) Energy sector: 30% reduction by 2030 through renewable energy transition
(b) Agriculture: 15% reduction by 2030 through sustainable farming practices
(c) Industry: 25% reduction by 2035
(d) Transport: 20% reduction by 2035 through electric vehicle adoption
(e) Forestry: Net positive through reforestation of 5 million hectares by 2035

PART IV - CLIMATE FINANCE
Section 12: Green Climate Fund
A National Green Climate Fund shall be established with initial capitalization of N500 billion from:
(a) Federal Government allocation: N200 billion
(b) Carbon tax revenues: N150 billion estimated
(c) International climate finance: N100 billion
(d) Green bond issuance: N50 billion

Section 13: Climate-Vulnerable Communities Fund
10% of the Green Climate Fund shall be ring-fenced for direct climate adaptation support to vulnerable communities.

PART V - PENALTIES
Section 18: Non-Compliance
Any entity exceeding its carbon allocation shall be liable to:
(a) Fine of N10 million per 1,000 tonnes of excess emissions
(b) Mandatory carbon offset purchase
(c) Publication of non-compliance in the Federal Gazette`,
        summary: 'Nigeria\'s Climate Change Act 2024 establishes carbon neutrality pathway to 2060, creates National Climate Change Council, sets sectoral emission reduction targets, and establishes N500B Green Climate Fund.',
        topics: ['Climate Change', 'Environmental Law', 'Carbon Emissions', 'Green Finance', 'Renewable Energy'],
        institutions: ['National Climate Change Council', 'Ministry of Environment', 'Central Bank of Nigeria'],
        financial_allocations: { greenClimateFund: 'N500 billion', federalAllocation: 'N200B', carbonTax: 'N150B' },
        ai_summary: {
          summary: 'Nigeria Climate Change Act 2024 establishes a comprehensive framework for climate action, including a National Climate Change Council chaired by the Vice President, sectoral emission targets (20% reduction by 2030, net-zero by 2060), and a N500 billion Green Climate Fund. The Act mandates renewable energy transition, reforestation of 5 million hectares, and penalties for non-compliance.',
          citizenImpact: 'Citizens in climate-vulnerable communities will receive direct adaptation support (10% of Green Climate Fund). New regulations will promote renewable energy, potentially reducing energy costs long-term. Agricultural sector reforms will affect farming practices.',
          keyFindings: ['Net-zero target by 2060', 'N500B Green Climate Fund established', '5 million hectares reforestation target', '10% ring-fenced for vulnerable communities'],
        },
        view_count: 892,
        question_count: 24,
        processing_status: 'completed',
      },
      {
        title: 'Rwanda Digital Transformation Policy 2024-2029',
        description: 'National policy framework for Rwanda\'s digital economy transformation, including e-government services, digital skills training, and technology infrastructure development.',
        document_type: 'policy',
        country: 'Rwanda',
        status: 'ready',
        original_text: `REPUBLIC OF RWANDA
MINISTRY OF ICT AND INNOVATION
NATIONAL DIGITAL TRANSFORMATION POLICY 2024-2029

VISION: To make Rwanda a leading digital economy in Africa by 2029.

CHAPTER 1: SITUATIONAL ANALYSIS
Rwanda's ICT sector contributes 3.2% to GDP (2023), up from 1.7% in 2018. Internet penetration reached 62.4% in 2023, with mobile money users exceeding 8.4 million. The Kigali Innovation City has attracted 45 technology companies and created 3,200 direct jobs.

Key challenges remain:
- Rural internet penetration at 38% vs urban 89%
- Only 24% of adults have basic digital literacy
- Limited local content in Kinyarwanda
- Cybersecurity incidents increased 34% in 2023

CHAPTER 2: STRATEGIC PILLARS

PILLAR 1: Digital Infrastructure
- Expand 4G coverage to 99% of population by 2027
- Deploy 5G networks in Kigali and secondary cities by 2026
- Build 3 new data centers (total capacity: 50MW)
- Lay 2,500 km of additional fiber optic cable
- Budget: RWF 480 billion over 5 years

PILLAR 2: Digital Skills
- Train 500,000 citizens in basic digital literacy by 2029
- Establish coding academies in all 30 districts
- Create 50,000 technology jobs
- Partner with universities for AI/ML degree programs
- Budget: RWF 120 billion

PILLAR 3: E-Government 
- Digitize 100% of government services by 2027
- Launch national digital ID (Irembo 2.0) with biometric integration
- Implement AI-assisted public service delivery
- Create citizen feedback platform for all government services
- Budget: RWF 95 billion

PILLAR 4: Digital Economy
- Support 10,000 digital startups through incubation programs
- Establish digital free trade zone
- Enable cross-border digital payments across EAC
- Launch national e-commerce platform
- Budget: RWF 200 billion

PILLAR 5: Cybersecurity
- Establish National Cybersecurity Operations Center
- Mandatory cybersecurity standards for all government systems
- Create cybersecurity workforce of 5,000 professionals
- International cooperation through Budapest Convention
- Budget: RWF 45 billion

TOTAL INVESTMENT: RWF 940 billion (approximately USD 750 million)

CHAPTER 3: IMPLEMENTATION FRAMEWORK
Lead Agency: Ministry of ICT and Innovation
Coordination: Rwanda Information Society Authority (RISA)
Monitoring: Quarterly progress reports to Cabinet
Evaluation: Independent mid-term review in 2027`,
        summary: 'Rwanda Digital Transformation Policy 2024-2029 invests RWF 940B across 5 pillars: digital infrastructure (99% 4G coverage), digital skills (500K trained), e-government (100% services digitized), digital economy (10K startups), and cybersecurity.',
        topics: ['Digital Transformation', 'ICT', 'E-Government', 'Cybersecurity', 'Digital Economy', 'Skills Training'],
        institutions: ['Ministry of ICT and Innovation', 'RISA', 'Kigali Innovation City'],
        financial_allocations: { total: 'RWF 940B', infrastructure: 'RWF 480B', skills: 'RWF 120B', eGovernment: 'RWF 95B', economy: 'RWF 200B', cybersecurity: 'RWF 45B' },
        ai_summary: {
          summary: 'Rwanda plans to invest RWF 940 billion (USD 750M) in digital transformation from 2024-2029. Key targets include 99% 4G coverage, training 500,000 citizens in digital literacy, digitizing all government services, supporting 10,000 startups, and creating 50,000 tech jobs.',
          citizenImpact: 'Citizens will benefit from universal internet access, digitized government services, and new employment opportunities in technology. Digital literacy training will be available in all 30 districts.',
          keyFindings: ['RWF 940B total investment', '99% 4G coverage by 2027', '500,000 citizens trained', '100% e-government by 2027'],
        },
        view_count: 678,
        question_count: 19,
        processing_status: 'completed',
      },
      {
        title: 'Ghana Public Health Insurance Reform Act 2025',
        description: 'Comprehensive reform of Ghana\'s National Health Insurance Scheme expanding coverage, improving services, and establishing new funding mechanisms.',
        document_type: 'legislation',
        country: 'Ghana',
        status: 'ready',
        original_text: `REPUBLIC OF GHANA
PUBLIC HEALTH INSURANCE REFORM ACT, 2025
AN ACT to amend and consolidate the laws relating to national health insurance.

PART I: OBJECTIVES
This Act seeks to:
(a) Achieve universal health coverage for all Ghanaians by 2028
(b) Expand the benefits package to include mental health and dental care
(c) Reduce out-of-pocket health expenditure from 38% to 20%
(d) Improve claims processing time from 90 days to 14 days

PART II: EXPANDED COVERAGE
Section 5: Universal Enrollment
All citizens and legal residents shall be enrolled in the National Health Insurance Scheme.
Premium structure:
(a) Formal sector: 2.5% of basic salary (employer matches 2.5%)
(b) Informal sector: GHS 30-120 per month based on income assessment
(c) Exempt categories (FREE): Children under 18, pregnant women, persons over 70, persons with disabilities, indigents

Section 7: Benefits Package
The scheme shall cover:
(a) Outpatient services including consultations and diagnostics
(b) Inpatient services including surgery
(c) Mental health services (NEW)
(d) Dental care - basic and emergency (NEW)
(e) Maternal and child health services
(f) Emergency services
(g) Chronic disease management
(h) Essential medicines from the National Essential Medicines List

PART III: FUNDING
Section 12: Revenue Sources
(a) National Health Insurance Levy (NHIL): 2.5% VAT - estimated GHS 4.2 billion annually
(b) SSNIT contributions: 2.5% of contributors' basic salary - estimated GHS 2.8 billion
(c) Premium income: estimated GHS 1.5 billion
(d) Government of Ghana allocation: GHS 2.0 billion
(e) International development partners: GHS 500 million
TOTAL ANNUAL REVENUE: estimated GHS 11.0 billion

PART IV: DIGITAL TRANSFORMATION
Section 18: Digital Claims System
All claims shall be processed through the Digital Health Insurance Platform (DHIP) with:
(a) Real-time claims verification
(b) Biometric patient identification
(c) Electronic medical records integration
(d) Mobile app for member services
(e) AI-powered fraud detection

PART V: ACCOUNTABILITY
Section 22: Transparency Requirements
(a) Quarterly financial reports published online
(b) Annual performance audit by Auditor General
(c) Citizens' health insurance scorecard
(d) Regional performance benchmarking`,
        summary: 'Ghana health insurance reform targets universal coverage by 2028, expands benefits to include mental health and dental care, and plans GHS 11B annual revenue through multiple funding sources.',
        topics: ['Healthcare', 'Insurance', 'Universal Coverage', 'Mental Health', 'Digital Health'],
        institutions: ['National Health Insurance Authority', 'SSNIT', 'Ministry of Health'],
        financial_allocations: { annualRevenue: 'GHS 11.0B', nhil: 'GHS 4.2B', ssnit: 'GHS 2.8B', premiums: 'GHS 1.5B', government: 'GHS 2.0B' },
        ai_summary: {
          summary: 'Ghana\'s health insurance reform aims for universal coverage by 2028, adding mental health and dental services. Annual revenue of GHS 11 billion will fund the expanded scheme through VAT levy, SSNIT contributions, premiums, and government allocation.',
          citizenImpact: 'All Ghanaians will be enrolled in health insurance. Children, pregnant women, elderly, and disabled get free coverage. Claims processing drops from 90 to 14 days. Mental health and dental care become covered benefits.',
          keyFindings: ['Universal coverage by 2028', 'Mental health and dental added', 'Out-of-pocket costs targeted from 38% to 20%', 'GHS 11B annual revenue'],
        },
        view_count: 534,
        question_count: 31,
        processing_status: 'completed',
      },
      {
        title: 'South Africa Land Reform White Paper 2025',
        description: 'Policy proposal for accelerated land redistribution and reform in South Africa, addressing historical imbalances and promoting agricultural productivity.',
        document_type: 'consultation',
        country: 'South Africa',
        status: 'ready',
        original_text: `REPUBLIC OF SOUTH AFRICA
DEPARTMENT OF AGRICULTURE, LAND REFORM AND RURAL DEVELOPMENT
WHITE PAPER ON LAND REFORM 2025

PUBLIC CONSULTATION DOCUMENT

1. BACKGROUND
As of 2024, approximately 72% of privately-owned agricultural land remains owned by white South Africans, who constitute 7.3% of the population. Since 1994, government has redistributed 10.8 million hectares (approximately 9.5% of agricultural land) through various programs. The current pace of redistribution will not meet the 30% target within the foreseeable future.

2. PROPOSED FRAMEWORK

2.1 Just and Equitable Compensation
Land acquisition shall proceed on the basis of just and equitable compensation as determined by:
(a) Current use of the land
(b) History of acquisition
(c) Market value
(d) State investment and subsidies
(e) Purpose of expropriation

2.2 Priority Categories for Redistribution
(a) Unutilized or underutilized commercial farmland
(b) Land held for purely speculative purposes
(c) Land where labor tenants have rights
(d) State-owned land suitable for agriculture

2.3 Support for Beneficiaries
Each beneficiary shall receive:
(a) A comprehensive land use plan
(b) Agricultural training (minimum 12-month program)
(c) Starter pack including seeds, fertilizer, and basic equipment
(d) Access to agricultural extension officers
(e) Financial support through the Land Reform Fund (R5 billion annually)

2.4 Institutional Framework
- Land Reform Commission: Independent body to oversee process
- District Land Committees: Community-based allocation decisions
- Land Court: Specialized judicial forum for disputes

3. TARGETS
- Redistribute 15 million additional hectares by 2035
- Support 300,000 emerging farmers
- Create 500,000 agricultural jobs
- Increase agricultural GDP contribution from 2.4% to 4% by 2035

4. SAFEGUARDS
- Food security impact assessment required before any expropriation
- Existing productive farms shall not be disrupted without alternative arrangements
- Constitutional rights of all parties protected
- International investment protections maintained

PUBLIC COMMENTS: This White Paper is open for public comment for 90 days until 30 June 2025.`,
        summary: 'South Africa land reform white paper proposes redistributing 15 million hectares by 2035, supporting 300,000 emerging farmers with R5B annual funding, while maintaining food security safeguards.',
        topics: ['Land Reform', 'Agriculture', 'Rural Development', 'Redistribution', 'Food Security'],
        institutions: ['Department of Agriculture, Land Reform and Rural Development', 'Land Reform Commission'],
        financial_allocations: { annualFund: 'R5 billion', hectaresTarget: '15 million' },
        ai_summary: {
          summary: 'The South Africa Land Reform White Paper 2025 proposes an accelerated framework for redistributing 15 million hectares of agricultural land by 2035. It includes just and equitable compensation principles, beneficiary support programs, and institutional oversight through a Land Reform Commission.',
          citizenImpact: 'Emerging farmers will receive land, training, and financial support. 500,000 agricultural jobs targeted. Food security safeguards ensure productive farmland is not disrupted. Public has 90 days to comment.',
          keyFindings: ['15 million hectares to be redistributed', '300,000 emerging farmers supported', 'R5B annual funding', 'Food security safeguards in place'],
        },
        view_count: 1089,
        question_count: 45,
        processing_status: 'completed',
      },
    ];

    const { data: insertedDocs, error: docError } = await supabase
      .from('civic_documents')
      .insert(documents)
      .select();

    if (docError) throw new Error(`Document insert error: ${docError.message}`);

    // 2. Seed civic questions
    const questions = [];
    if (insertedDocs && insertedDocs.length > 0) {
      const kenyaDoc = insertedDocs[0];
      const nigeriaDoc = insertedDocs[1];
      const rwandaDoc = insertedDocs[2];
      const ghanaDoc = insertedDocs[3];
      const saDoc = insertedDocs[4];

      questions.push(
        { document_id: kenyaDoc.id, question_text: 'What percentage of the national budget is allocated to education?', ai_answer: 'According to the Kenya National Budget 2025/2026, the Ministry of Education has been allocated KES 544.4 billion, representing 27.3% of the total national budget. This is an increase of 8.2% from the previous financial year allocation of KES 503.1 billion.', ai_confidence: 0.95, status: 'answered', upvote_count: 45, is_public: true, source_passages: ['The Ministry of Education has been allocated KES 544.4 billion for the Financial Year 2025/2026, representing 27.3% of the total national budget.'], tags: ['budget', 'education', 'kenya'] },
        { document_id: kenyaDoc.id, question_text: 'How much is allocated for digital learning in schools?', ai_answer: 'The digital learning programme (laptops/tablets) has been allocated KES 12.1 billion under the Development Expenditure category. Additionally, the government targets connecting 95% of public secondary schools to internet by 2026.', ai_confidence: 0.92, status: 'answered', upvote_count: 32, is_public: true, source_passages: ['Digital learning programme (laptops/tablets): KES 12.1 billion', 'Connect 95% of public secondary schools to internet by 2026'], tags: ['digital learning', 'technology', 'education'] },
        { document_id: kenyaDoc.id, question_text: 'What is the target student-teacher ratio?', ai_answer: 'The budget document sets a key policy target to reduce the student-teacher ratio from 45:1 to 35:1 in public primary schools. This would require significant investment in teacher recruitment and training.', ai_confidence: 0.93, status: 'answered', upvote_count: 28, is_public: true, source_passages: ['Reduce student-teacher ratio from 45:1 to 35:1 in public primary schools'], tags: ['teachers', 'education quality'] },
        { document_id: nigeriaDoc.id, question_text: 'What are Nigeria\'s carbon emission reduction targets?', ai_answer: 'The Climate Change Act 2024 sets Nigeria\'s greenhouse gas reduction targets as follows: 20% below 2020 levels by 2030, 47% below 2020 levels by 2040, and net-zero emissions by 2060. Sectoral targets include 30% energy reduction by 2030 and reforestation of 5 million hectares by 2035.', ai_confidence: 0.97, status: 'answered', upvote_count: 67, is_public: true, source_passages: ['20% below 2020 levels by 2030', '47% below 2020 levels by 2040', 'Achieve net-zero emissions by 2060'], tags: ['climate', 'emissions', 'nigeria'] },
        { document_id: nigeriaDoc.id, question_text: 'How much money is in the Green Climate Fund?', ai_answer: 'The National Green Climate Fund has an initial capitalization of N500 billion, sourced from: Federal Government allocation (N200 billion), carbon tax revenues (N150 billion estimated), international climate finance (N100 billion), and green bond issuance (N50 billion). Additionally, 10% of this fund is ring-fenced for climate-vulnerable communities.', ai_confidence: 0.96, status: 'answered', upvote_count: 41, is_public: true, source_passages: ['A National Green Climate Fund shall be established with initial capitalization of N500 billion', '10% of the Green Climate Fund shall be ring-fenced for direct climate adaptation support to vulnerable communities'], tags: ['climate finance', 'green fund'] },
        { document_id: rwandaDoc.id, question_text: 'How many people will be trained in digital skills?', ai_answer: 'Rwanda plans to train 500,000 citizens in basic digital literacy by 2029 under Pillar 2 (Digital Skills) of the Digital Transformation Policy. This pillar also includes establishing coding academies in all 30 districts, creating 50,000 technology jobs, and partnering with universities for AI/ML degree programs. The budget for this pillar is RWF 120 billion.', ai_confidence: 0.95, status: 'answered', upvote_count: 23, is_public: true, source_passages: ['Train 500,000 citizens in basic digital literacy by 2029', 'Establish coding academies in all 30 districts'], tags: ['digital skills', 'training', 'rwanda'] },
        { document_id: ghanaDoc.id, question_text: 'Who gets free health insurance in Ghana?', ai_answer: 'Under the reform, the following categories are exempt from paying premiums and receive FREE coverage: children under 18, pregnant women, persons over 70 years of age, persons with disabilities, and indigents (very poor citizens). All other citizens pay premiums based on their employment sector.', ai_confidence: 0.96, status: 'answered', upvote_count: 56, is_public: true, source_passages: ['Exempt categories (FREE): Children under 18, pregnant women, persons over 70, persons with disabilities, indigents'], tags: ['health insurance', 'free coverage', 'ghana'] },
        { document_id: ghanaDoc.id, question_text: 'What new services are added to the health insurance?', ai_answer: 'The reform adds two significant new service categories to the National Health Insurance Scheme: (1) Mental health services, and (2) Dental care including basic and emergency dental procedures. These are in addition to existing coverage for outpatient services, inpatient/surgical services, maternal and child health, emergency services, chronic disease management, and essential medicines.', ai_confidence: 0.94, status: 'answered', upvote_count: 39, is_public: true, source_passages: ['Mental health services (NEW)', 'Dental care - basic and emergency (NEW)'], tags: ['mental health', 'dental', 'healthcare'] },
        { document_id: saDoc.id, question_text: 'How much land will be redistributed?', ai_answer: 'The White Paper proposes redistributing 15 million additional hectares of agricultural land by 2035. This is in addition to the 10.8 million hectares already redistributed since 1994. The policy targets supporting 300,000 emerging farmers and creating 500,000 agricultural jobs, with R5 billion in annual funding through the Land Reform Fund.', ai_confidence: 0.95, status: 'answered', upvote_count: 78, is_public: true, source_passages: ['Redistribute 15 million additional hectares by 2035', 'Support 300,000 emerging farmers'], tags: ['land reform', 'agriculture', 'south africa'] },
        { document_id: saDoc.id, question_text: 'What support will new farmers receive?', ai_answer: 'Each beneficiary of land redistribution will receive: (a) a comprehensive land use plan, (b) agricultural training through a minimum 12-month program, (c) a starter pack including seeds, fertilizer, and basic equipment, (d) access to agricultural extension officers for ongoing support, and (e) financial support through the Land Reform Fund which is allocated R5 billion annually.', ai_confidence: 0.97, status: 'answered', upvote_count: 52, is_public: true, source_passages: ['Each beneficiary shall receive: A comprehensive land use plan, Agricultural training (minimum 12-month program), Starter pack including seeds, fertilizer, and basic equipment'], tags: ['farmer support', 'agriculture', 'land reform'] },
      );
    }

    const { error: qError } = await supabase.from('civic_questions').insert(questions);
    if (qError) console.error('Question insert error:', qError);

    // 3. Seed institutional responses
    if (insertedDocs && insertedDocs.length > 0) {
      // Get inserted questions to link responses
      const { data: insertedQs } = await supabase
        .from('civic_questions')
        .select('id, question_text, document_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (insertedQs && insertedQs.length > 0) {
        const responses = [
          { question_id: insertedQs[0].id, institution_name: 'Ministry of Education, Kenya', response_text: 'The Ministry confirms the 27.3% allocation and notes that this represents our commitment to the Constitutional requirement of prioritizing education. We are working to ensure transparent utilization of these funds through the School Management Information System.', status: 'published' },
          { question_id: insertedQs[3].id, institution_name: 'Federal Ministry of Environment, Nigeria', response_text: 'The emission targets align with Nigeria\'s updated NDC submitted to the UNFCCC. Implementation will be phased, with the energy sector leading through our Decade of Gas initiative and renewable energy expansion.', status: 'published' },
          { question_id: insertedQs[6].id, institution_name: 'National Health Insurance Authority, Ghana', response_text: 'We confirm that the exempt categories maintain our commitment to protecting vulnerable populations. The premium assessment for informal sector workers uses a standardized income assessment tool to ensure fairness.', status: 'published' },
        ];

        await supabase.from('institutional_responses').insert(responses).catch(e => console.error('Response insert error:', e));
      }
    }

    // 4. Seed governance registry
    const governanceRisks = [
      { risk_category: 'AI Hallucination', risk_name: 'Generated Content Fabrication', description: 'Risk of AI generating explanations not grounded in source documents, potentially misleading citizens about policy content.', severity: 'critical', mitigation_strategies: ['Source-grounded responses with mandatory citations', 'Confidence scoring threshold (reject < 0.3)', 'Human review for all outputs below 0.7 confidence', 'Regular accuracy audits against source documents'], status: 'active', monitoring_metrics: { auditsCompleted: 47, accuracyRate: 0.94, falsePositiveRate: 0.03 } },
      { risk_category: 'Policy Misinterpretation', risk_name: 'Incorrect Legal/Financial Analysis', description: 'Risk of AI misinterpreting complex policy language, legal terminology, or financial allocations, leading to incorrect civic information.', severity: 'high', mitigation_strategies: ['Domain expert validation for financial figures', 'Legal terminology flagging system', 'Cross-reference with multiple document sections', 'Disclaimer on all financial interpretations'], status: 'active', monitoring_metrics: { reviewedDocuments: 156, correctionsMade: 12, expertValidations: 89 } },
      { risk_category: 'Algorithmic Bias', risk_name: 'Systematic Processing Bias', description: 'Risk of systematic bias in how documents from different countries, languages, or policy domains are summarized and interpreted.', severity: 'medium', mitigation_strategies: ['Regular bias audits across countries and languages', 'Diverse testing datasets from all African regions', 'Transparent model documentation', 'Community feedback integration'], status: 'monitoring', monitoring_metrics: { countriesTested: 15, languagesSupported: 4, biasAuditsCompleted: 8 } },
      { risk_category: 'Coordinated Manipulation', risk_name: 'Platform Integrity Threats', description: 'Risk of coordinated efforts to manipulate civic question rankings, flood the system with misleading claims, or game the accountability archive.', severity: 'medium', mitigation_strategies: ['Rate limiting per user and IP', 'Anomaly detection for unusual patterns', 'Account verification requirements for institutional responses', 'Content moderation queue for flagged submissions'], status: 'active', monitoring_metrics: { flaggedAccounts: 3, blockedAttempts: 17, verifiedInstitutions: 24 } },
      { risk_category: 'Overreliance on AI', risk_name: 'Substitution of Professional Judgment', description: 'Risk of citizens or institutions treating AI analyses as authoritative legal, financial, or policy advice rather than as an accessibility tool.', severity: 'high', mitigation_strategies: ['Clear disclaimer labels on all AI outputs', 'Encourage institutional verification for critical decisions', 'Link to official sources and institutions', 'Regular user education about AI limitations'], status: 'active', monitoring_metrics: { disclaimerDisplays: 14500, officialSourceClicks: 3200, userFeedbackScore: 4.2 } },
      { risk_category: 'Data Privacy', risk_name: 'User Query Privacy', description: 'Risk of exposing sensitive user queries or behavioral patterns that could compromise citizen privacy or reveal policy interests.', severity: 'high', mitigation_strategies: ['Anonymous question submission option', 'Query data encryption at rest', 'No user profiling for commercial purposes', 'GDPR-aligned data retention policies'], status: 'active', monitoring_metrics: { anonymousQueries: 2340, dataRetentionCompliance: 1.0, privacyAudits: 4 } },
    ];

    await supabase.from('ai_governance_registry').upsert(governanceRisks, { onConflict: 'risk_name' }).catch(() => {
      // If upsert fails due to no unique constraint, try insert
      supabase.from('ai_governance_registry').insert(governanceRisks).catch(e => console.error('Governance insert error:', e));
    });

    // 5. Seed civic analytics
    const analyticsData = [];
    const countries = ['Kenya', 'Nigeria', 'Rwanda', 'Ghana', 'South Africa'];
    const metricTypes = ['documents_processed', 'questions_asked', 'institutional_responses', 'user_sessions', 'avg_confidence'];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      for (const country of countries) {
        analyticsData.push({
          metric_type: 'documents_processed',
          metric_value: Math.floor(Math.random() * 5) + 1,
          country,
          period_start: dateStr,
          period_end: dateStr,
        });
        analyticsData.push({
          metric_type: 'questions_asked',
          metric_value: Math.floor(Math.random() * 20) + 5,
          country,
          period_start: dateStr,
          period_end: dateStr,
        });
        analyticsData.push({
          metric_type: 'avg_confidence',
          metric_value: Math.round((Math.random() * 0.3 + 0.65) * 100) / 100,
          country,
          period_start: dateStr,
          period_end: dateStr,
        });
      }
    }

    await supabase.from('civic_analytics').insert(analyticsData).catch(e => console.error('Analytics insert error:', e));

    return new Response(JSON.stringify({ 
      success: true, 
      seeded: {
        documents: insertedDocs?.length || 0,
        questions: questions.length,
        governanceRisks: governanceRisks.length,
        analyticsRecords: analyticsData.length,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Seeding failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
