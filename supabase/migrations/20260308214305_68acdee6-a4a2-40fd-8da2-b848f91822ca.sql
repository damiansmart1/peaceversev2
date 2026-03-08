
-- Policy bookmarks and annotations
CREATE TABLE public.policy_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID NOT NULL,
  section_index INTEGER NOT NULL,
  section_title TEXT,
  bookmark_type TEXT DEFAULT 'bookmark' CHECK (bookmark_type IN ('bookmark', 'annotation', 'highlight')),
  note TEXT,
  color TEXT DEFAULT 'primary',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reading progress tracking
CREATE TABLE public.policy_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID NOT NULL,
  sections_read INTEGER[] DEFAULT '{}',
  total_sections INTEGER DEFAULT 0,
  last_section_index INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, document_id)
);

-- RLS
ALTER TABLE public.policy_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_reading_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bookmarks" ON public.policy_bookmarks
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own reading progress" ON public.policy_reading_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
