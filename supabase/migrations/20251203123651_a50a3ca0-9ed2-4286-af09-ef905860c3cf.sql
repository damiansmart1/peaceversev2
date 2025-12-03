-- Create comment_likes table for proposal comments
CREATE TABLE public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.proposal_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create comment_reports table for reporting comments
CREATE TABLE public.comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.proposal_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Create content_comment_likes table for social content comments
CREATE TABLE public.content_comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create content_comment_reports table for reporting content comments
CREATE TABLE public.content_comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for comment_likes
CREATE POLICY "Anyone can view comment likes" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like comments" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike comments" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for comment_reports
CREATE POLICY "Users can view own reports" ON public.comment_reports FOR SELECT USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can report comments" ON public.comment_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can update reports" ON public.comment_reports FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for content_comment_likes
CREATE POLICY "Anyone can view content comment likes" ON public.content_comment_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like content comments" ON public.content_comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike content comments" ON public.content_comment_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for content_comment_reports
CREATE POLICY "Users can view own content reports" ON public.content_comment_reports FOR SELECT USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can report content comments" ON public.content_comment_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can update content reports" ON public.content_comment_reports FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX idx_comment_reports_comment ON public.comment_reports(comment_id);
CREATE INDEX idx_content_comment_likes_comment ON public.content_comment_likes(comment_id);
CREATE INDEX idx_content_comment_reports_comment ON public.content_comment_reports(comment_id);