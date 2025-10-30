-- Ensure all users (authenticated and anonymous) can view published proposals
DROP POLICY IF EXISTS "Published proposals are viewable by everyone" ON proposals;

CREATE POLICY "Everyone can view published proposals"
ON proposals FOR SELECT
TO public
USING (
  status = 'published'
  OR (auth.uid() IS NOT NULL AND auth.uid() = author_id)
  OR (auth.uid() IS NOT NULL AND auth.uid() = ANY(co_authors))
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'))
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'moderator'))
);

-- Ensure all users (authenticated and anonymous) can view approved content
DROP POLICY IF EXISTS "Approved content is viewable by everyone" ON content;

CREATE POLICY "Everyone can view approved content"
ON content FOR SELECT
TO public
USING (
  approval_status = 'approved'
  OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'))
  OR (auth.uid() IS NOT NULL AND has_role(auth.uid(), 'moderator'))
);