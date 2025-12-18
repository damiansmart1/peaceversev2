
-- Drop and recreate the citizen_reports_safe view with enhanced protection
-- Masks precise location (lat/lng), address details, and witness info from unauthorized users

DROP VIEW IF EXISTS public.citizen_reports_safe;

CREATE VIEW public.citizen_reports_safe AS
SELECT 
    id,
    reporter_id,
    incident_date,
    incident_time,
    duration_minutes,
    estimated_people_affected,
    casualties_reported,
    injuries_reported,
    children_involved,
    has_witnesses,
    witness_count,
    -- Mask witness contact info from non-authorized users
    CASE
        WHEN (auth.uid() = reporter_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role) OR has_role(auth.uid(), 'government'::app_role)
        THEN witness_contact_info
        ELSE NULL
    END AS witness_contact_info,
    -- Mask precise GPS coordinates - only show to authorized users
    CASE
        WHEN (auth.uid() = reporter_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role) OR has_role(auth.uid(), 'government'::app_role)
        THEN location_latitude
        ELSE CASE 
            WHEN location_latitude IS NOT NULL THEN ROUND(location_latitude::numeric, 1)::double precision
            ELSE NULL
        END
    END AS location_latitude,
    CASE
        WHEN (auth.uid() = reporter_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role) OR has_role(auth.uid(), 'government'::app_role)
        THEN location_longitude
        ELSE CASE 
            WHEN location_longitude IS NOT NULL THEN ROUND(location_longitude::numeric, 1)::double precision
            ELSE NULL
        END
    END AS location_longitude,
    has_physical_evidence,
    economic_impact_estimate,
    related_incidents,
    recurring_issue,
    first_occurrence,
    previous_reports_filed,
    authorities_notified,
    authorities_responded,
    assistance_received,
    follow_up_required,
    follow_up_contact_consent,
    resolution_date,
    credibility_score,
    ai_key_entities,
    verified_by,
    verified_at,
    is_anonymous,
    created_at,
    updated_at,
    last_activity_at,
    view_count,
    share_count,
    engagement_score,
    vulnerable_groups_affected,
    -- Contact info already masked
    CASE
        WHEN (auth.uid() = reporter_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role)
        THEN reporter_contact_phone
        ELSE NULL::text
    END AS reporter_contact_phone,
    CASE
        WHEN (auth.uid() = reporter_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role)
        THEN reporter_contact_email
        ELSE NULL::text
    END AS reporter_contact_email,
    preferred_contact_method,
    -- Mask precise location name/address - only show city/region/country for public
    CASE
        WHEN (auth.uid() = reporter_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role) OR has_role(auth.uid(), 'government'::app_role)
        THEN location_name
        ELSE NULL::text
    END AS location_name,
    CASE
        WHEN (auth.uid() = reporter_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role) OR has_role(auth.uid(), 'government'::app_role)
        THEN location_address
        ELSE NULL::text
    END AS location_address,
    location_city,
    location_region,
    location_country,
    -- Mask postal code
    CASE
        WHEN (auth.uid() = reporter_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role) OR has_role(auth.uid(), 'government'::app_role)
        THEN location_postal_code
        ELSE NULL::text
    END AS location_postal_code,
    location_accuracy,
    location_type,
    media_urls,
    media_types,
    evidence_description,
    immediate_needs,
    community_impact_level,
    infrastructure_damage,
    services_disrupted,
    historical_context,
    perpetrator_type,
    perpetrator_description,
    authority_response_details,
    immediate_actions_taken,
    community_response,
    assistance_type,
    assistance_provider,
    resolution_status,
    resolution_notes,
    ai_threat_level,
    ai_sentiment,
    verification_status,
    verification_notes,
    tags,
    visibility,
    CASE
        WHEN (auth.uid() = reporter_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role)
        THEN confidential_notes
        ELSE NULL::text
    END AS confidential_notes,
    source,
    language,
    translated_from,
    sub_category,
    severity_level,
    urgency_level,
    status,
    title,
    description,
    category
FROM citizen_reports
WHERE visibility = 'public' OR auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'verifier'::app_role);

-- Grant access to the view
GRANT SELECT ON public.citizen_reports_safe TO anon, authenticated;

COMMENT ON VIEW public.citizen_reports_safe IS 'Secure view that masks sensitive reporter information (precise location, contact details, witness info) from unauthorized users. Public users only see city/region/country and rounded coordinates.';
