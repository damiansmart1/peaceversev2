
-- User follows/connections table
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Direct messages table
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" ON public.direct_messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.direct_messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can mark messages as read" ON public.direct_messages FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Chatrooms table
CREATE TABLE public.chatrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  location_region TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 100,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chatrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public chatrooms" ON public.chatrooms FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated users can create chatrooms" ON public.chatrooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update their chatrooms" ON public.chatrooms FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete their chatrooms" ON public.chatrooms FOR DELETE USING (auth.uid() = created_by);

-- Chatroom members table
CREATE TABLE public.chatroom_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatroom_id UUID NOT NULL REFERENCES public.chatrooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chatroom_id, user_id)
);

ALTER TABLE public.chatroom_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chatroom members" ON public.chatroom_members FOR SELECT USING (true);
CREATE POLICY "Users can join chatrooms" ON public.chatroom_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave chatrooms" ON public.chatroom_members FOR DELETE USING (auth.uid() = user_id);

-- Chatroom messages table
CREATE TABLE public.chatroom_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatroom_id UUID NOT NULL REFERENCES public.chatrooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chatroom_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view chatroom messages" ON public.chatroom_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.chatroom_members WHERE chatroom_id = chatroom_messages.chatroom_id AND user_id = auth.uid()));
CREATE POLICY "Members can send messages" ON public.chatroom_messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.chatroom_members WHERE chatroom_id = chatroom_messages.chatroom_id AND user_id = auth.uid()));

-- User wallets for monetization
CREATE TABLE public.user_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own wallet" ON public.user_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.user_wallets FOR UPDATE USING (auth.uid() = user_id);

-- Content tips/donations
CREATE TABLE public.content_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  tipper_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tips on content" ON public.content_tips FOR SELECT USING (true);
CREATE POLICY "Users can tip content" ON public.content_tips FOR INSERT WITH CHECK (auth.uid() = tipper_id);

-- Creator earnings log
CREATE TABLE public.creator_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL, -- 'tip', 'view_bonus', 'engagement_bonus', 'challenge_reward'
  source_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earnings" ON public.creator_earnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert earnings" ON public.creator_earnings FOR INSERT WITH CHECK (true);

-- Add social fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_tier TEXT DEFAULT 'starter';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Enable realtime for chat features
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatroom_messages;

-- Create indexes for performance
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_direct_messages_participants ON public.direct_messages(sender_id, receiver_id);
CREATE INDEX idx_chatroom_messages_room ON public.chatroom_messages(chatroom_id, created_at DESC);
CREATE INDEX idx_creator_earnings_user ON public.creator_earnings(user_id, created_at DESC);
