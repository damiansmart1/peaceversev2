-- ===================================
-- COMPREHENSIVE DATABASE OPTIMIZATION
-- ===================================

-- 1. ADD MISSING FOREIGN KEY CONSTRAINTS
-- ===================================

-- Content table foreign keys
ALTER TABLE public.content
  DROP CONSTRAINT IF EXISTS content_user_id_fkey,
  ADD CONSTRAINT content_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS content_reviewed_by_fkey,
  ADD CONSTRAINT content_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Comments foreign keys
ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_user_id_fkey,
  ADD CONSTRAINT comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS comments_content_id_fkey,
  ADD CONSTRAINT comments_content_id_fkey 
    FOREIGN KEY (content_id) REFERENCES public.content(id) ON DELETE CASCADE;

-- Likes foreign keys
ALTER TABLE public.likes
  DROP CONSTRAINT IF EXISTS likes_user_id_fkey,
  ADD CONSTRAINT likes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS likes_content_id_fkey,
  ADD CONSTRAINT likes_content_id_fkey 
    FOREIGN KEY (content_id) REFERENCES public.content(id) ON DELETE CASCADE;

-- Incidents foreign keys
ALTER TABLE public.incidents
  DROP CONSTRAINT IF EXISTS incidents_reported_by_fkey,
  ADD CONSTRAINT incidents_reported_by_fkey 
    FOREIGN KEY (reported_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  DROP CONSTRAINT IF EXISTS incidents_verified_by_fkey,
  ADD CONSTRAINT incidents_verified_by_fkey 
    FOREIGN KEY (verified_by) REFERENCES auth.users(id) ON DELETE SET NULL,
  DROP CONSTRAINT IF EXISTS incidents_assigned_to_fkey,
  ADD CONSTRAINT incidents_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Proposals foreign keys
ALTER TABLE public.proposals
  DROP CONSTRAINT IF EXISTS proposals_author_id_fkey,
  ADD CONSTRAINT proposals_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS proposals_reviewed_by_fkey,
  ADD CONSTRAINT proposals_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Proposal comments foreign keys
ALTER TABLE public.proposal_comments
  DROP CONSTRAINT IF EXISTS proposal_comments_user_id_fkey,
  ADD CONSTRAINT proposal_comments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL,
  DROP CONSTRAINT IF EXISTS proposal_comments_proposal_id_fkey,
  ADD CONSTRAINT proposal_comments_proposal_id_fkey 
    FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS proposal_comments_parent_comment_id_fkey,
  ADD CONSTRAINT proposal_comments_parent_comment_id_fkey 
    FOREIGN KEY (parent_comment_id) REFERENCES public.proposal_comments(id) ON DELETE CASCADE;

-- Challenge submissions foreign keys
ALTER TABLE public.challenge_submissions
  DROP CONSTRAINT IF EXISTS challenge_submissions_user_id_fkey,
  ADD CONSTRAINT challenge_submissions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS challenge_submissions_challenge_id_fkey,
  ADD CONSTRAINT challenge_submissions_challenge_id_fkey 
    FOREIGN KEY (challenge_id) REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS challenge_submissions_reviewed_by_fkey,
  ADD CONSTRAINT challenge_submissions_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- User purchases foreign keys
ALTER TABLE public.user_purchases
  DROP CONSTRAINT IF EXISTS user_purchases_user_id_fkey,
  ADD CONSTRAINT user_purchases_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS user_purchases_item_id_fkey,
  ADD CONSTRAINT user_purchases_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES public.reward_store_items(id) ON DELETE RESTRICT;

-- Safe spaces foreign keys
ALTER TABLE public.safe_spaces
  DROP CONSTRAINT IF EXISTS safe_spaces_created_by_fkey,
  ADD CONSTRAINT safe_spaces_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. CREATE PERFORMANCE INDEXES
-- ===================================

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_content_user_id ON public.content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_approval_status ON public.content(approval_status);
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON public.content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_is_archived ON public.content(is_archived) WHERE is_archived = false;

-- Incidents indexes
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_country_code ON public.incidents(country_code);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by ON public.incidents(reported_by);

-- Proposals indexes
CREATE INDEX IF NOT EXISTS idx_proposals_author_id ON public.proposals(author_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_slug ON public.proposals(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_tags ON public.proposals USING GIN(tags);

-- Proposal votes indexes
CREATE INDEX IF NOT EXISTS idx_proposal_votes_proposal_id ON public.proposal_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_user_id ON public.proposal_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_unique ON public.proposal_votes(proposal_id, user_id);

-- Proposal comments indexes
CREATE INDEX IF NOT EXISTS idx_proposal_comments_proposal_id ON public.proposal_comments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_user_id ON public.proposal_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_created_at ON public.proposal_comments(created_at DESC);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_peace_points ON public.profiles(peace_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_xp_points ON public.profiles(xp_points DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read) WHERE read = false;

-- Peace actions indexes
CREATE INDEX IF NOT EXISTS idx_peace_actions_user_id ON public.peace_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_peace_actions_created_at ON public.peace_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_peace_actions_action_type ON public.peace_actions(action_type);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Likes indexes (composite for uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_user_content_unique ON public.likes(user_id, content_id);

-- 3. ADD DATA VALIDATION CONSTRAINTS
-- ===================================

-- Content constraints
ALTER TABLE public.content
  DROP CONSTRAINT IF EXISTS content_approval_status_check,
  ADD CONSTRAINT content_approval_status_check 
    CHECK (approval_status IN ('pending_approval', 'approved', 'rejected'));

ALTER TABLE public.content
  DROP CONSTRAINT IF EXISTS content_file_type_check,
  ADD CONSTRAINT content_file_type_check 
    CHECK (file_type IN ('image', 'video', 'audio', 'document', 'text'));

-- Incidents constraints
ALTER TABLE public.incidents
  DROP CONSTRAINT IF EXISTS incidents_severity_check,
  ADD CONSTRAINT incidents_severity_check 
    CHECK (severity IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE public.incidents
  DROP CONSTRAINT IF EXISTS incidents_status_check,
  ADD CONSTRAINT incidents_status_check 
    CHECK (status IN ('reported', 'verified', 'investigating', 'resolved', 'closed', 'escalated'));

ALTER TABLE public.incidents
  DROP CONSTRAINT IF EXISTS incidents_priority_check,
  ADD CONSTRAINT incidents_priority_check 
    CHECK (priority >= 0 AND priority <= 10);

-- Challenge submissions constraints
ALTER TABLE public.challenge_submissions
  DROP CONSTRAINT IF EXISTS challenge_submissions_status_check,
  ADD CONSTRAINT challenge_submissions_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Reward store items constraints
ALTER TABLE public.reward_store_items
  DROP CONSTRAINT IF EXISTS reward_store_items_cost_check,
  ADD CONSTRAINT reward_store_items_cost_check 
    CHECK (cost_points > 0);

ALTER TABLE public.reward_store_items
  DROP CONSTRAINT IF EXISTS reward_store_items_quantity_check,
  ADD CONSTRAINT reward_store_items_quantity_check 
    CHECK (quantity_remaining IS NULL OR quantity_remaining >= 0);

-- Profiles constraints
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_peace_points_check,
  ADD CONSTRAINT profiles_peace_points_check 
    CHECK (peace_points >= 0);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_xp_points_check,
  ADD CONSTRAINT profiles_xp_points_check 
    CHECK (xp_points >= 0);

-- 4. ADD FULL-TEXT SEARCH SUPPORT
-- ===================================

-- Add text search columns for content
ALTER TABLE public.content 
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_content_search_vector 
  ON public.content USING GIN(search_vector);

-- Add text search columns for proposals
ALTER TABLE public.proposals 
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_proposals_search_vector 
  ON public.proposals USING GIN(search_vector);

-- Add text search columns for incidents
ALTER TABLE public.incidents 
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_incidents_search_vector 
  ON public.incidents USING GIN(search_vector);

-- 5. CREATE AUDIT LOG TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON public.audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON public.audit_logs(changed_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- 6. CREATE RESOURCE STATISTICS VIEW
-- ===================================

CREATE OR REPLACE VIEW public.platform_statistics AS
SELECT
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(*) FROM public.content WHERE approval_status = 'approved') as total_content,
  (SELECT COUNT(*) FROM public.proposals WHERE status = 'published') as total_proposals,
  (SELECT COUNT(*) FROM public.incidents) as total_incidents,
  (SELECT COUNT(*) FROM public.incidents WHERE status = 'resolved') as resolved_incidents,
  (SELECT COUNT(*) FROM public.safe_spaces WHERE verified = true) as verified_safe_spaces,
  (SELECT COUNT(*) FROM public.proposal_votes) as total_votes,
  (SELECT SUM(peace_points) FROM public.profiles) as total_peace_points,
  (SELECT COUNT(*) FROM public.weekly_challenges WHERE is_active = true) as active_challenges,
  (SELECT COUNT(*) FROM public.challenge_submissions WHERE status = 'approved') as completed_challenges;

-- 7. ADD RESOURCE MANAGEMENT FUNCTIONS
-- ===================================

-- Function to safely delete user and cascade all related data
CREATE OR REPLACE FUNCTION public.delete_user_safely(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_counts jsonb;
BEGIN
  -- Only admins can delete users
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Collect counts before deletion
  SELECT jsonb_build_object(
    'content_deleted', (SELECT COUNT(*) FROM public.content WHERE user_id = p_user_id),
    'proposals_deleted', (SELECT COUNT(*) FROM public.proposals WHERE author_id = p_user_id),
    'comments_deleted', (SELECT COUNT(*) FROM public.comments WHERE user_id = p_user_id)
  ) INTO v_counts;

  -- Delete will cascade automatically due to foreign key constraints
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_resources', v_counts
  );
END;
$$;

-- Function to get resource statistics for a user
CREATE OR REPLACE FUNCTION public.get_user_resource_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_content', (SELECT COUNT(*) FROM public.content WHERE user_id = p_user_id),
    'approved_content', (SELECT COUNT(*) FROM public.content WHERE user_id = p_user_id AND approval_status = 'approved'),
    'total_proposals', (SELECT COUNT(*) FROM public.proposals WHERE author_id = p_user_id),
    'published_proposals', (SELECT COUNT(*) FROM public.proposals WHERE author_id = p_user_id AND status = 'published'),
    'incidents_reported', (SELECT COUNT(*) FROM public.incidents WHERE reported_by = p_user_id),
    'total_votes', (SELECT COUNT(*) FROM public.proposal_votes WHERE user_id = p_user_id),
    'total_comments', (SELECT COUNT(*) FROM public.proposal_comments WHERE user_id = p_user_id),
    'peace_points', (SELECT peace_points FROM public.profiles WHERE user_id = p_user_id),
    'xp_points', (SELECT xp_points FROM public.profiles WHERE user_id = p_user_id),
    'current_level', (SELECT current_level FROM public.profiles WHERE user_id = p_user_id)
  ) INTO v_stats;

  RETURN v_stats;
END;
$$;

-- Function to archive old content
CREATE OR REPLACE FUNCTION public.archive_old_content(p_days_old integer DEFAULT 365)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Only admins can archive content
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.content
  SET is_archived = true
  WHERE created_at < now() - (p_days_old || ' days')::interval
    AND is_archived = false
    AND approval_status = 'approved';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.delete_user_safely IS 'Safely delete a user and all related resources';
COMMENT ON FUNCTION public.get_user_resource_stats IS 'Get comprehensive resource statistics for a user';
COMMENT ON FUNCTION public.archive_old_content IS 'Archive content older than specified days';
COMMENT ON VIEW public.platform_statistics IS 'Platform-wide resource statistics';