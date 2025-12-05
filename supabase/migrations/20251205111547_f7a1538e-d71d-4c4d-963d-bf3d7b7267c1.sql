-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL DEFAULT 'general',
  points_required INTEGER NOT NULL DEFAULT 0,
  points_reward INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create levels table
CREATE TABLE public.levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  xp_required INTEGER NOT NULL,
  icon TEXT NOT NULL DEFAULT '⭐',
  description TEXT,
  rewards JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reward_store_items table
CREATE TABLE public.reward_store_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'badge',
  cost_points INTEGER NOT NULL DEFAULT 100,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table for tracking
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage achievements" ON public.achievements FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for levels
CREATE POLICY "Anyone can view levels" ON public.levels FOR SELECT USING (true);
CREATE POLICY "Admins can manage levels" ON public.levels FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for reward_store_items
CREATE POLICY "Anyone can view rewards" ON public.reward_store_items FOR SELECT USING (is_available = true);
CREATE POLICY "Admins can manage rewards" ON public.reward_store_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_achievements
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- Insert mock levels (1-20)
INSERT INTO public.levels (level_number, title, xp_required, icon, description) VALUES
(1, 'Peace Seedling', 0, '🌱', 'Just starting your peace journey'),
(2, 'Peace Sprout', 100, '🌿', 'Growing awareness of peace'),
(3, 'Peace Gardener', 300, '🪴', 'Cultivating peace in your community'),
(4, 'Peace Guardian', 600, '🛡️', 'Protecting peace and harmony'),
(5, 'Peace Advocate', 1000, '📢', 'Speaking up for peace'),
(6, 'Peace Ambassador', 1500, '🕊️', 'Representing peace across borders'),
(7, 'Peace Mentor', 2200, '🎓', 'Teaching others about peace'),
(8, 'Peace Champion', 3000, '🏆', 'Leading peace initiatives'),
(9, 'Peace Luminary', 4000, '✨', 'Shining light on peace efforts'),
(10, 'Peace Master', 5500, '🌟', 'Mastering the art of peacebuilding'),
(11, 'Peace Sage', 7500, '📜', 'Wisdom in conflict resolution'),
(12, 'Peace Oracle', 10000, '🔮', 'Foreseeing paths to peace'),
(13, 'Peace Sentinel', 13000, '⚔️', 'Standing guard for peace'),
(14, 'Peace Beacon', 17000, '🔥', 'A guiding light for others'),
(15, 'Peace Legend', 22000, '👑', 'Legendary peacebuilder'),
(16, 'Peace Titan', 28000, '🗿', 'Immovable in pursuit of peace'),
(17, 'Peace Phoenix', 35000, '🦅', 'Rising from conflict'),
(18, 'Peace Harbinger', 45000, '🌈', 'Bringing hope and peace'),
(19, 'Peace Architect', 60000, '🏛️', 'Building lasting peace structures'),
(20, 'Peace Eternal', 80000, '💎', 'Ultimate peacebuilder');

-- Insert mock achievements
INSERT INTO public.achievements (name, description, badge_icon, category, points_required, points_reward) VALUES
('First Steps', 'Submit your first peace report', '👣', 'reporting', 0, 25),
('Storyteller', 'Share 5 peace stories', '📖', 'storytelling', 100, 50),
('Community Voice', 'Participate in 10 community discussions', '💬', 'community', 200, 75),
('Verified Reporter', 'Have 3 reports verified as accurate', '✅', 'reporting', 300, 100),
('Peace Ambassador', 'Refer 5 new members to the platform', '🤝', 'community', 500, 150),
('Challenge Champion', 'Complete 5 weekly challenges', '🎯', 'challenges', 400, 125),
('Early Responder', 'Be among first 10 to report a verified incident', '⚡', 'reporting', 250, 100),
('Streak Master', 'Maintain a 30-day login streak', '🔥', 'engagement', 600, 200),
('Peacemaker', 'Help resolve 3 community conflicts', '☮️', 'peacebuilding', 800, 250),
('Global Citizen', 'Engage with reports from 10 different countries', '🌍', 'community', 700, 175),
('Truth Seeker', 'Verify 20 incidents as a verifier', '🔍', 'verification', 1000, 300),
('Community Pillar', 'Reach 100 followers', '🏛️', 'social', 500, 150),
('Content Creator', 'Create 25 pieces of approved content', '🎨', 'content', 750, 200),
('Dialogue Facilitator', 'Host 5 peace dialogues', '🎤', 'peacebuilding', 900, 275),
('Safety Advocate', 'Report 10 safety concerns that were addressed', '🛡️', 'safety', 600, 175);

-- Insert mock reward store items
INSERT INTO public.reward_store_items (name, description, item_type, cost_points, is_available) VALUES
('Golden Peace Badge', 'Exclusive golden peace symbol for your profile', 'badge', 500, true),
('Rainbow Frame', 'Colorful rainbow profile frame', 'frame', 300, true),
('Dove Avatar', 'Beautiful dove avatar accessory', 'accessory', 250, true),
('Champion Crown', 'Crown overlay for your avatar', 'frame', 750, true),
('Peace Ambassador Title', 'Special title displayed on your profile', 'title', 1000, true),
('Custom Profile Theme', 'Unlock custom color themes for your profile', 'theme', 600, true),
('Early Access Pass', 'Get early access to new features', 'perk', 1500, true),
('Verified Creator Badge', 'Blue checkmark for verified creators', 'badge', 2000, true),
('Community Spotlight', 'Feature on community highlights for 1 week', 'perk', 800, true),
('Peace Points Multiplier', '2x points for 24 hours', 'boost', 400, true);