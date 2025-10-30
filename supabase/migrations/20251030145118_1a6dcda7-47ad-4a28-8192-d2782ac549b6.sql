-- Fix RLS policy to show published proposals (published status means already approved)
DROP POLICY IF EXISTS "Approved proposals are viewable by everyone" ON proposals;

CREATE POLICY "Published proposals are viewable by everyone"
ON proposals FOR SELECT
USING (
  status = 'published'
  OR auth.uid() = author_id
  OR auth.uid() = ANY(co_authors)
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'moderator')
);