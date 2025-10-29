-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_and_award_achievements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award "First Voice" achievement for first story
  IF TG_TABLE_NAME = 'content' AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, a.id
    FROM public.achievements a
    WHERE a.name = 'First Voice'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua 
      WHERE ua.user_id = NEW.user_id AND ua.achievement_id = a.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.content c 
      WHERE c.user_id = NEW.user_id AND c.id != NEW.id
    );
  END IF;

  -- Award peace points for various actions
  IF TG_TABLE_NAME = 'content' THEN
    INSERT INTO public.peace_actions (user_id, action_type, points_awarded, description)
    VALUES (NEW.user_id, 'story_shared', 10, 'Shared a story');
    
    -- Update user's peace points
    UPDATE public.profiles 
    SET peace_points = peace_points + 10,
        total_stories = total_stories + 1
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Fix search_path for new functions
CREATE OR REPLACE FUNCTION public.generate_proposal_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.update_proposal_contributor_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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