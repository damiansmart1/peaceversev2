-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  age_group TEXT CHECK (age_group IN ('13-17', '18-24', '25-35', '35+')),
  user_type TEXT CHECK (user_type IN ('youth', 'woman', 'pwd', 'minority', 'community_leader', 'ngo_admin')) DEFAULT 'youth',
  anonymous_mode BOOLEAN DEFAULT false,
  preferred_language TEXT DEFAULT 'en',
  accessibility_needs JSONB DEFAULT '{}',
  peace_points INTEGER DEFAULT 0,
  total_stories INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_peace_champion BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  category TEXT CHECK (category IN ('storytelling', 'community', 'peace', 'leadership', 'participation')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (true);

-- Create safe spaces table for community mapping
CREATE TABLE public.safe_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  space_type TEXT CHECK (space_type IN ('community_center', 'school', 'library', 'youth_center', 'religious_center', 'ngo_office')) NOT NULL,
  contact_info JSONB DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  active_users_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.safe_spaces ENABLE ROW LEVEL SECURITY;

-- Create policies for safe spaces
CREATE POLICY "Safe spaces are viewable by everyone" 
ON public.safe_spaces 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create safe spaces" 
ON public.safe_spaces 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Creators can update their safe spaces" 
ON public.safe_spaces 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create peace actions table for tracking community engagement
CREATE TABLE public.peace_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT CHECK (action_type IN ('story_shared', 'dialogue_participated', 'conflict_mediated', 'safe_space_reported', 'misinformation_flagged', 'positive_engagement')) NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.peace_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for peace actions
CREATE POLICY "Users can view their own actions" 
ON public.peace_actions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert peace actions" 
ON public.peace_actions 
FOR INSERT 
WITH CHECK (true);

-- Create content moderation table
CREATE TABLE public.content_moderation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  flagged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  flag_reason TEXT CHECK (flag_reason IN ('hate_speech', 'misinformation', 'inappropriate_content', 'spam', 'violence_incitement', 'other')) NOT NULL,
  flag_description TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'approved', 'removed', 'escalated')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  ai_confidence_score DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_content_or_comment CHECK (
    (content_id IS NOT NULL AND comment_id IS NULL) OR 
    (content_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;

-- Create policies for content moderation
CREATE POLICY "Moderators can view all flags" 
ON public.content_moderation 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_type IN ('ngo_admin', 'community_leader')
  )
);

CREATE POLICY "Users can flag content" 
ON public.content_moderation 
FOR INSERT 
WITH CHECK (auth.uid() = flagged_by);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, badge_icon, points_required, category) VALUES
('First Voice', 'Share your first story with the community', '🎤', 10, 'storytelling'),
('Peace Ambassador', 'Receive 50 positive reactions on your stories', '🕊️', 100, 'peace'),
('Community Builder', 'Connect with 10 other peace builders', '🤝', 50, 'community'),
('Safe Space Guardian', 'Report and verify 5 safe spaces', '🛡️', 75, 'community'),
('Story Weaver', 'Share 10 meaningful stories', '⭐', 150, 'storytelling'),
('Unity Champion', 'Facilitate peaceful resolution of conflicts', '🏆', 200, 'leadership'),
('Voice of Hope', 'Inspire 100+ people with your content', '💫', 300, 'peace'),
('Digital Peacekeeper', 'Help moderate community discussions', '🔒', 80, 'participation'),
('Bridge Builder', 'Connect different communities through dialogue', '🌉', 250, 'leadership'),
('Harmony Herald', 'Share verified positive news and counter misinformation', '📢', 120, 'participation');

-- Create function to award achievements automatically
CREATE OR REPLACE FUNCTION public.check_and_award_achievements()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic achievement awarding
CREATE TRIGGER trigger_award_achievements_content
AFTER INSERT ON public.content
FOR EACH ROW EXECUTE FUNCTION public.check_and_award_achievements();

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER trigger_create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for safe_spaces
CREATE TRIGGER update_safe_spaces_updated_at
BEFORE UPDATE ON public.safe_spaces
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_safe_spaces_location ON public.safe_spaces(latitude, longitude);
CREATE INDEX idx_peace_actions_user_id ON public.peace_actions(user_id);
CREATE INDEX idx_content_moderation_status ON public.content_moderation(status);