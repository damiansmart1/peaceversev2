-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for proposal status
CREATE TYPE public.proposal_status AS ENUM ('draft', 'published', 'closed', 'archived');

-- Create enum for interaction types
CREATE TYPE public.interaction_type AS ENUM ('like', 'support', 'oppose', 'idea', 'bookmark');

-- Create enum for moderation status
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create proposals table
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  status proposal_status DEFAULT 'draft' NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  co_authors UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  signature_goal INTEGER,
  signature_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  unique_contributors INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  vote_support_count INTEGER DEFAULT 0,
  vote_oppose_count INTEGER DEFAULT 0,
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_proposals_slug ON public.proposals(slug);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_author_id ON public.proposals(author_id);
CREATE INDEX idx_proposals_created_at ON public.proposals(created_at DESC);

-- Create proposal_votes table
CREATE TABLE public.proposal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)),
  display_anonymous BOOLEAN DEFAULT false NOT NULL,
  location_hidden BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (proposal_id, user_id)
);

ALTER TABLE public.proposal_votes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_proposal_votes_proposal_id ON public.proposal_votes(proposal_id);
CREATE INDEX idx_proposal_votes_user_id ON public.proposal_votes(user_id);

-- Create proposal_comments table
CREATE TABLE public.proposal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.proposal_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  like_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  display_anonymous BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.proposal_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_proposal_comments_proposal_id ON public.proposal_comments(proposal_id);
CREATE INDEX idx_proposal_comments_user_id ON public.proposal_comments(user_id);
CREATE INDEX idx_proposal_comments_parent_id ON public.proposal_comments(parent_comment_id);

-- Create proposal_interactions table
CREATE TABLE public.proposal_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interaction_type interaction_type NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (proposal_id, user_id, interaction_type)
);

ALTER TABLE public.proposal_interactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_proposal_interactions_proposal_id ON public.proposal_interactions(proposal_id);
CREATE INDEX idx_proposal_interactions_user_id ON public.proposal_interactions(user_id);

-- Create proposal_shares table
CREATE TABLE public.proposal_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.proposal_shares ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_proposal_shares_proposal_id ON public.proposal_shares(proposal_id);

-- Create proposal_versions table (for edit history)
CREATE TABLE public.proposal_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.proposal_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_proposal_versions_proposal_id ON public.proposal_versions(proposal_id);

-- Create moderation_flags table
CREATE TABLE public.moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.proposal_comments(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  flag_reason TEXT NOT NULL,
  flag_description TEXT,
  status moderation_status DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CHECK ((proposal_id IS NOT NULL AND comment_id IS NULL) OR (proposal_id IS NULL AND comment_id IS NOT NULL))
);

ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_moderation_flags_status ON public.moderation_flags(status);
CREATE INDEX idx_moderation_flags_flagged_by ON public.moderation_flags(flagged_by);

-- Create moderation_actions table
CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_moderation_actions_actor_id ON public.moderation_actions(actor_id);
CREATE INDEX idx_moderation_actions_target ON public.moderation_actions(target_type, target_id);

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to generate slug
CREATE OR REPLACE FUNCTION public.generate_proposal_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(trim(title), '[^a-z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  base_slug := substring(base_slug, 1, 50);
  
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.proposals WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create function to update proposal contributor count
CREATE OR REPLACE FUNCTION public.update_proposal_contributor_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_TABLE_NAME = 'proposal_votes' THEN
    UPDATE public.proposals
    SET unique_contributors = (
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM public.proposal_votes WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_comments WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_interactions WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_shares WHERE proposal_id = NEW.proposal_id AND user_id IS NOT NULL
      ) AS contributors
    ),
    vote_support_count = (SELECT COUNT(*) FROM public.proposal_votes WHERE proposal_id = NEW.proposal_id AND vote_value = 1),
    vote_oppose_count = (SELECT COUNT(*) FROM public.proposal_votes WHERE proposal_id = NEW.proposal_id AND vote_value = -1)
    WHERE id = NEW.proposal_id;
  ELSIF TG_TABLE_NAME = 'proposal_comments' THEN
    UPDATE public.proposals
    SET unique_contributors = (
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM public.proposal_votes WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_comments WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_interactions WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_shares WHERE proposal_id = NEW.proposal_id AND user_id IS NOT NULL
      ) AS contributors
    ),
    comment_count = (SELECT COUNT(*) FROM public.proposal_comments WHERE proposal_id = NEW.proposal_id)
    WHERE id = NEW.proposal_id;
  ELSIF TG_TABLE_NAME = 'proposal_interactions' THEN
    UPDATE public.proposals
    SET unique_contributors = (
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM public.proposal_votes WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_comments WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_interactions WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_shares WHERE proposal_id = NEW.proposal_id AND user_id IS NOT NULL
      ) AS contributors
    ),
    like_count = (SELECT COUNT(*) FROM public.proposal_interactions WHERE proposal_id = NEW.proposal_id AND interaction_type = 'like')
    WHERE id = NEW.proposal_id;
  ELSIF TG_TABLE_NAME = 'proposal_shares' THEN
    UPDATE public.proposals
    SET unique_contributors = (
      SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM public.proposal_votes WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_comments WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_interactions WHERE proposal_id = NEW.proposal_id
        UNION
        SELECT user_id FROM public.proposal_shares WHERE proposal_id = NEW.proposal_id AND user_id IS NOT NULL
      ) AS contributors
    ),
    share_count = (SELECT COUNT(*) FROM public.proposal_shares WHERE proposal_id = NEW.proposal_id)
    WHERE id = NEW.proposal_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for updating contributor counts
CREATE TRIGGER update_proposal_contributors_on_vote
AFTER INSERT OR UPDATE ON public.proposal_votes
FOR EACH ROW EXECUTE FUNCTION public.update_proposal_contributor_count();

CREATE TRIGGER update_proposal_contributors_on_comment
AFTER INSERT ON public.proposal_comments
FOR EACH ROW EXECUTE FUNCTION public.update_proposal_contributor_count();

CREATE TRIGGER update_proposal_contributors_on_interaction
AFTER INSERT OR UPDATE ON public.proposal_interactions
FOR EACH ROW EXECUTE FUNCTION public.update_proposal_contributor_count();

CREATE TRIGGER update_proposal_contributors_on_share
AFTER INSERT ON public.proposal_shares
FOR EACH ROW EXECUTE FUNCTION public.update_proposal_contributor_count();

-- Create trigger for proposal updated_at
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposal_votes_updated_at
BEFORE UPDATE ON public.proposal_votes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposal_comments_updated_at
BEFORE UPDATE ON public.proposal_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for proposals
CREATE POLICY "Published proposals are viewable by everyone"
ON public.proposals FOR SELECT
USING (status = 'published' OR auth.uid() = author_id OR auth.uid() = ANY(co_authors) OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Authenticated users can create proposals"
ON public.proposals FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and co-authors can update proposals"
ON public.proposals FOR UPDATE
USING (auth.uid() = author_id OR auth.uid() = ANY(co_authors));

CREATE POLICY "Authors and admins can delete proposals"
ON public.proposals FOR DELETE
USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for proposal_votes
CREATE POLICY "Votes are viewable by everyone"
ON public.proposal_votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.proposal_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
ON public.proposal_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.proposal_votes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for proposal_comments
CREATE POLICY "Comments are viewable by everyone"
ON public.proposal_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.proposal_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.proposal_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users and moderators can delete comments"
ON public.proposal_comments FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for proposal_interactions
CREATE POLICY "Interactions are viewable by everyone"
ON public.proposal_interactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create interactions"
ON public.proposal_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions"
ON public.proposal_interactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions"
ON public.proposal_interactions FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for proposal_shares
CREATE POLICY "Shares are viewable by everyone"
ON public.proposal_shares FOR SELECT
USING (true);

CREATE POLICY "Anyone can create shares"
ON public.proposal_shares FOR INSERT
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- RLS Policies for proposal_versions
CREATE POLICY "Versions are viewable by everyone"
ON public.proposal_versions FOR SELECT
USING (true);

CREATE POLICY "System can create versions"
ON public.proposal_versions FOR INSERT
WITH CHECK (true);

-- RLS Policies for moderation_flags
CREATE POLICY "Users can view their own flags"
ON public.moderation_flags FOR SELECT
USING (auth.uid() = flagged_by OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create flags"
ON public.moderation_flags FOR INSERT
WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Moderators can update flags"
ON public.moderation_flags FOR UPDATE
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for moderation_actions
CREATE POLICY "Moderators can view all actions"
ON public.moderation_actions FOR SELECT
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can create actions"
ON public.moderation_actions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));