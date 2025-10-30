-- Add approval statuses to proposals enum
ALTER TYPE proposal_status ADD VALUE IF NOT EXISTS 'pending_approval';
ALTER TYPE proposal_status ADD VALUE IF NOT EXISTS 'rejected';

-- Add approval fields to content table
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending_approval' CHECK (approval_status IN ('pending_approval', 'approved', 'rejected', 'draft')),
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add approval fields to proposals table
ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create notifications table for user alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('content_approved', 'content_rejected', 'proposal_approved', 'proposal_rejected', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  related_id uuid,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Update RLS policies for content - only show approved content to public
DROP POLICY IF EXISTS "Content is viewable by everyone" ON public.content;

CREATE POLICY "Approved content is viewable by everyone"
ON public.content FOR SELECT
USING (
  approval_status = 'approved' 
  OR auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'moderator'::app_role)
);

-- Update RLS policies for proposals - only show approved/published proposals to public
DROP POLICY IF EXISTS "Published proposals are viewable by everyone" ON public.proposals;

CREATE POLICY "Approved proposals are viewable by everyone"
ON public.proposals FOR SELECT
USING (
  (status = 'published'::proposal_status AND (reviewed_by IS NOT NULL OR reviewed_at < now() - interval '7 days'))
  OR auth.uid() = author_id 
  OR auth.uid() = ANY(co_authors) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'moderator'::app_role)
);

-- Function to send notification when content is approved/rejected
CREATE OR REPLACE FUNCTION public.notify_content_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'content' AND OLD.approval_status != NEW.approval_status THEN
    IF NEW.approval_status = 'approved' THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        NEW.user_id,
        'content_approved',
        'Content Approved!',
        'Your content "' || NEW.title || '" has been approved and is now live on the platform.',
        NEW.id
      );
    ELSIF NEW.approval_status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        NEW.user_id,
        'content_rejected',
        'Content Not Approved',
        'Your content "' || NEW.title || '" was not approved. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided'),
        NEW.id
      );
    END IF;
  ELSIF TG_TABLE_NAME = 'proposals' AND OLD.status != NEW.status THEN
    IF NEW.status = 'published'::proposal_status AND NEW.reviewed_by IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        NEW.author_id,
        'proposal_approved',
        'Proposal Approved!',
        'Your proposal "' || NEW.title || '" has been approved and is now published.',
        NEW.id
      );
    ELSIF NEW.status = 'rejected'::proposal_status THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        NEW.author_id,
        'proposal_rejected',
        'Proposal Not Approved',
        'Your proposal "' || NEW.title || '" was not approved. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided'),
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for notifications
DROP TRIGGER IF EXISTS content_status_notification ON public.content;
CREATE TRIGGER content_status_notification
AFTER UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION public.notify_content_status_change();

DROP TRIGGER IF EXISTS proposal_status_notification ON public.proposals;
CREATE TRIGGER proposal_status_notification
AFTER UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.notify_content_status_change();

-- Add index for better notification performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read) WHERE read = false;