-- Create a secure view that masks sensitive reporter contact information
-- Only the reporter themselves, admins, and verifiers can see contact details

CREATE OR REPLACE VIEW public.citizen_reports_safe AS
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
  witness_contact_info,
  location_latitude,
  location_longitude,
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
  -- Mask contact info for unauthorized users
  CASE 
    WHEN auth.uid() = reporter_id 
      OR public.has_role(auth.uid(), 'admin'::app_role) 
      OR public.has_role(auth.uid(), 'verifier'::app_role)
    THEN reporter_contact_phone 
    ELSE NULL 
  END as reporter_contact_phone,
  CASE 
    WHEN auth.uid() = reporter_id 
      OR public.has_role(auth.uid(), 'admin'::app_role) 
      OR public.has_role(auth.uid(), 'verifier'::app_role)
    THEN reporter_contact_email 
    ELSE NULL 
  END as reporter_contact_email,
  preferred_contact_method,
  location_name,
  location_address,
  location_city,
  location_region,
  location_country,
  location_postal_code,
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
  -- Mask confidential notes for unauthorized users
  CASE 
    WHEN auth.uid() = reporter_id 
      OR public.has_role(auth.uid(), 'admin'::app_role) 
      OR public.has_role(auth.uid(), 'verifier'::app_role)
    THEN confidential_notes 
    ELSE NULL 
  END as confidential_notes,
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
FROM public.citizen_reports;

-- Grant access to the view
GRANT SELECT ON public.citizen_reports_safe TO authenticated;
GRANT SELECT ON public.citizen_reports_safe TO anon;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.citizen_reports_safe IS 'Secure view that masks reporter contact information (phone, email) and confidential notes for unauthorized users. Only the report owner, admins, and verifiers can see sensitive contact details.';