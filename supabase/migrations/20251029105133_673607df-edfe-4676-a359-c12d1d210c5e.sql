-- Create levels table
CREATE TABLE public.levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  xp_required INTEGER NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎯',
  description TEXT,
  rewards JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert 10 levels
INSERT INTO public.levels (level_number, title, xp_required, icon, description) VALUES
(1, 'Listener', 0, '👂', 'You''re just beginning your peace journey'),
(2, 'Storyteller', 100, '📖', 'Your voice is starting to be heard'),
(3, 'Bridge Builder', 300, '🌉', 'Connecting people across divides'),
(4, 'Peacemaker', 600, '🕊️', 'Active contributor to peace'),
(5, 'Ambassador', 1000, '🎭', 'Representing peace in your community'),
(6, 'Champion', 1500, '🏆', 'Leading by example'),
(7, 'Unifier', 2200, '🤝', 'Bringing communities together'),
(8, 'Changemaker', 3000, '⚡', 'Creating lasting impact'),
(9, 'Visionary', 4000, '🌟', 'Inspiring others to build peace'),
(10, 'Global Influencer', 5500, '🌍', 'Your impact is felt worldwide');

-- Add new columns to profiles for gamification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date DATE,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS profile_frame TEXT,
ADD COLUMN IF NOT EXISTS avatar_accessories JSONB DEFAULT '[]'::jsonb;

-- Create weekly challenges table
CREATE TABLE public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'storytelling', 'artwork', 'community_activity', 'youth_diplomacy'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 50,
  badge_reward UUID REFERENCES public.achievements(id),
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  guidelines TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge submissions table
CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  submission_type TEXT NOT NULL, -- 'text', 'audio', 'video', 'image'
  submission_url TEXT,
  submission_text TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  points_awarded INTEGER DEFAULT 0,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leaderboard view for regional rankings
CREATE TABLE public.leaderboard_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  peace_points INTEGER DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  region TEXT,
  rank_global INTEGER,
  rank_regional INTEGER,
  weekly_points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reward store items table
CREATE TABLE public.reward_store_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL, -- 'avatar_upgrade', 'profile_frame', 'boost_badge', 'accessory'
  name TEXT NOT NULL,
  description TEXT,
  cost_points INTEGER NOT NULL,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_available BOOLEAN DEFAULT true,
  limited_quantity INTEGER,
  quantity_remaining INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user purchases table
CREATE TABLE public.user_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.reward_store_items(id),
  points_spent INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create streaks table for detailed tracking
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_frozen_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update achievements table to include new badge categories
INSERT INTO public.achievements (name, description, badge_icon, category, points_required) VALUES
('Early Voice', 'Shared your first story with the community', '🎤', 'storytelling', 0),
('Peace Champion', 'Completed a major peace challenge', '🏅', 'leadership', 50),
('Unity Builder', 'Successfully collaborated with others', '🤝', 'community', 30),
('Community Hero', 'Helped and supported others consistently', '🦸', 'community', 100),
('Streak Master', 'Maintained a 7-day login streak', '🔥', 'leadership', 20),
('Global Citizen', 'Connected with users from 5+ regions', '🌏', 'community', 75)
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for levels
CREATE POLICY "Levels are viewable by everyone" ON public.levels FOR SELECT USING (true);

-- RLS Policies for weekly challenges
CREATE POLICY "Active challenges are viewable by everyone" ON public.weekly_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage challenges" ON public.weekly_challenges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for challenge submissions
CREATE POLICY "Users can view all submissions" ON public.challenge_submissions FOR SELECT USING (true);
CREATE POLICY "Users can create their own submissions" ON public.challenge_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their pending submissions" ON public.challenge_submissions FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Admins can review submissions" ON public.challenge_submissions FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- RLS Policies for leaderboard
CREATE POLICY "Leaderboard is viewable by everyone" ON public.leaderboard_cache FOR SELECT USING (true);

-- RLS Policies for reward store
CREATE POLICY "Store items are viewable by everyone" ON public.reward_store_items FOR SELECT USING (is_available = true);
CREATE POLICY "Admins can manage store items" ON public.reward_store_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user purchases
CREATE POLICY "Users can view their own purchases" ON public.user_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can make purchases" ON public.user_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user streaks
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage streaks" ON public.user_streaks FOR ALL USING (true);

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level INTEGER;
BEGIN
  -- Find the highest level the user qualifies for
  SELECT level_number INTO new_level
  FROM public.levels
  WHERE xp_required <= NEW.xp_points
  ORDER BY level_number DESC
  LIMIT 1;
  
  IF new_level IS NOT NULL AND new_level > NEW.current_level THEN
    NEW.current_level := new_level;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update level
CREATE TRIGGER update_level_on_xp_change
BEFORE UPDATE OF xp_points ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_user_level();

-- Function to award points and XP
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_action_type TEXT,
  p_points INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert peace action
  INSERT INTO public.peace_actions (user_id, action_type, points_awarded, description)
  VALUES (p_user_id, p_action_type, p_points, p_description);
  
  -- Update user profile
  UPDATE public.profiles
  SET 
    peace_points = peace_points + p_points,
    xp_points = xp_points + p_points,
    total_actions = total_actions + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM public.user_streaks
  WHERE user_id = p_user_id;
  
  IF v_last_activity IS NULL THEN
    -- First time activity
    INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE);
  ELSIF v_last_activity = CURRENT_DATE THEN
    -- Already logged in today, do nothing
    RETURN;
  ELSIF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE public.user_streaks
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    -- Update profile
    UPDATE public.profiles
    SET login_streak = v_current_streak + 1
    WHERE user_id = p_user_id;
    
    -- Award streak bonus
    IF (v_current_streak + 1) % 7 = 0 THEN
      PERFORM public.award_points(p_user_id, 'streak_milestone', 20, 'Week-long streak maintained!');
    END IF;
  ELSE
    -- Streak broken
    UPDATE public.user_streaks
    SET 
      current_streak = 1,
      last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
    
    UPDATE public.profiles
    SET login_streak = 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;