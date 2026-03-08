import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const sb = supabase as any;

export interface PolicyBookmark {
  id: string;
  user_id: string;
  document_id: string;
  section_index: number;
  section_title: string | null;
  bookmark_type: 'bookmark' | 'annotation' | 'highlight';
  note: string | null;
  color: string;
  created_at: string;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  document_id: string;
  sections_read: number[];
  total_sections: number;
  last_section_index: number;
  completed_at: string | null;
}

export const usePolicyBookmarks = (documentId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookmarks = [], ...query } = useQuery({
    queryKey: ['policy-bookmarks', documentId, user?.id],
    queryFn: async () => {
      if (!user?.id || !documentId) return [];
      const { data, error } = await sb
        .from('policy_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('document_id', documentId)
        .order('section_index');
      if (error) throw error;
      return data as PolicyBookmark[];
    },
    enabled: !!user?.id && !!documentId,
  });

  const addBookmark = useMutation({
    mutationFn: async (params: {
      sectionIndex: number;
      sectionTitle: string;
      bookmarkType: 'bookmark' | 'annotation' | 'highlight';
      note?: string;
      color?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await sb.from('policy_bookmarks').insert({
        user_id: user.id,
        document_id: documentId,
        section_index: params.sectionIndex,
        section_title: params.sectionTitle,
        bookmark_type: params.bookmarkType,
        note: params.note || null,
        color: params.color || 'primary',
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-bookmarks', documentId] });
      toast.success('Bookmark saved');
    },
  });

  const removeBookmark = useMutation({
    mutationFn: async (bookmarkId: string) => {
      const { error } = await sb.from('policy_bookmarks').delete().eq('id', bookmarkId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-bookmarks', documentId] });
      toast.success('Bookmark removed');
    },
  });

  const updateBookmark = useMutation({
    mutationFn: async (params: { id: string; note?: string; color?: string }) => {
      const { error } = await sb.from('policy_bookmarks')
        .update({ note: params.note, color: params.color, updated_at: new Date().toISOString() })
        .eq('id', params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-bookmarks', documentId] });
    },
  });

  return { bookmarks, addBookmark, removeBookmark, updateBookmark, ...query };
};

export const useReadingProgress = (documentId: string, totalSections: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, ...query } = useQuery({
    queryKey: ['reading-progress', documentId, user?.id],
    queryFn: async () => {
      if (!user?.id || !documentId) return null;
      const { data, error } = await sb
        .from('policy_reading_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('document_id', documentId)
        .maybeSingle();
      if (error) throw error;
      return data as ReadingProgress | null;
    },
    enabled: !!user?.id && !!documentId,
  });

  const markSectionRead = useMutation({
    mutationFn: async (sectionIndex: number) => {
      if (!user?.id) throw new Error('Not authenticated');
      const currentRead = progress?.sections_read || [];
      if (currentRead.includes(sectionIndex)) return;
      const updatedRead = [...new Set([...currentRead, sectionIndex])].sort((a, b) => a - b);
      const completed = updatedRead.length >= totalSections;

      const { error } = await sb.from('policy_reading_progress').upsert({
        user_id: user.id,
        document_id: documentId,
        sections_read: updatedRead,
        total_sections: totalSections,
        last_section_index: sectionIndex,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,document_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', documentId] });
    },
  });

  const percentComplete = progress && totalSections > 0
    ? Math.round((progress.sections_read?.length || 0) / totalSections * 100)
    : 0;

  return { progress, markSectionRead, percentComplete, ...query };
};
