-- Create weekly_challenges table
CREATE TABLE public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'community_activity',
  points_reward INTEGER NOT NULL DEFAULT 100,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_submissions table
CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  submission_type TEXT NOT NULL DEFAULT 'text',
  submission_text TEXT,
  submission_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  points_awarded INTEGER,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekly_challenges
CREATE POLICY "Anyone can view active challenges"
  ON public.weekly_challenges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
  ON public.weekly_challenges FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for challenge_submissions
CREATE POLICY "Users can view own submissions"
  ON public.challenge_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON public.challenge_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
  ON public.challenge_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update submissions"
  ON public.challenge_submissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert sample challenges
INSERT INTO public.weekly_challenges (title, description, challenge_type, points_reward, end_date) VALUES
('Share Your Peace Story', 'Write and share a personal story about how peace has impacted your community. Stories should be at least 200 words.', 'storytelling', 150, now() + interval '7 days'),
('Community Art for Peace', 'Create artwork that represents unity and peace in Africa. Submit an image of your creation.', 'artwork', 200, now() + interval '10 days'),
('Youth Dialogue Initiative', 'Organize or participate in a youth dialogue session about conflict resolution. Document your experience.', 'youth_diplomacy', 250, now() + interval '14 days'),
('Neighborhood Peace Walk', 'Organize a peace walk in your neighborhood and share photos with at least 5 participants.', 'community_activity', 175, now() + interval '5 days');