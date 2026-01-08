import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface CMSContent {
  id: string;
  content_key: string;
  content_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'html';
  section: string;
  title: string | null;
  content: string | null;
  media_url: string | null;
  media_alt: string | null;
  metadata: Json;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export const CMS_SECTIONS = [
  { id: 'homepage', label: 'Homepage' },
  { id: 'about', label: 'About Page' },
  { id: 'banners', label: 'Section Banners' },
  { id: 'features', label: 'Features' },
  { id: 'team', label: 'Team' },
  { id: 'radio', label: 'Radio' },
  { id: 'safety', label: 'Safety' },
  { id: 'community', label: 'Community' },
] as const;

export const CONTENT_TYPES = [
  { id: 'text', label: 'Text', icon: 'Type' },
  { id: 'html', label: 'Rich Text', icon: 'FileText' },
  { id: 'image', label: 'Image', icon: 'Image' },
  { id: 'audio', label: 'Audio', icon: 'Music' },
  { id: 'video', label: 'Video', icon: 'Video' },
  { id: 'document', label: 'Document', icon: 'File' },
] as const;

// Fetch all CMS content for admin
export function useAllCMSContent() {
  return useQuery({
    queryKey: ['cms-content-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .order('section')
        .order('display_order');

      if (error) throw error;
      return data as CMSContent[];
    },
  });
}

// Fetch CMS content by section
export function useCMSSection(section: string) {
  return useQuery({
    queryKey: ['cms-content', section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('section', section)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as CMSContent[];
    },
  });
}

// Fetch single content by key
export function useCMSContent(contentKey: string) {
  return useQuery({
    queryKey: ['cms-content-key', contentKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('content_key', contentKey)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as CMSContent | null;
    },
  });
}

// Hook to get content value with fallback
export function useCMSValue(contentKey: string, fallback: string = '') {
  const { data } = useCMSContent(contentKey);
  return data?.content || data?.media_url || fallback;
}

// Create new CMS content
export function useCreateCMSContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: Partial<CMSContent>) => {
      const { content_key, content_type, section, title, content: contentText, media_url, media_alt, is_active, display_order } = content;
      
      if (!content_key || !content_type || !section) {
        throw new Error('Missing required fields');
      }
      
      const { data, error } = await supabase
        .from('cms_content')
        .insert({
          content_key,
          content_type,
          section,
          title: title || null,
          content: contentText || null,
          media_url: media_url || null,
          media_alt: media_alt || null,
          is_active: is_active ?? true,
          display_order: display_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      queryClient.invalidateQueries({ queryKey: ['cms-content-all'] });
      toast.success('Content created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create content: ${error.message}`);
    },
  });
}

// Update CMS content
export function useUpdateCMSContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CMSContent> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.media_url !== undefined) updateData.media_url = updates.media_url;
      if (updates.media_alt !== undefined) updateData.media_alt = updates.media_alt;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.display_order !== undefined) updateData.display_order = updates.display_order;
      if (updates.section !== undefined) updateData.section = updates.section;
      if (updates.content_type !== undefined) updateData.content_type = updates.content_type;
      
      const { data, error } = await supabase
        .from('cms_content')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CMSContent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      queryClient.invalidateQueries({ queryKey: ['cms-content-all'] });
      queryClient.invalidateQueries({ queryKey: ['cms-content-key', data.content_key] });
      toast.success('Content updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update content: ${error.message}`);
    },
  });
}

// Delete CMS content
export function useDeleteCMSContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      queryClient.invalidateQueries({ queryKey: ['cms-content-all'] });
      toast.success('Content deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete content: ${error.message}`);
    },
  });
}

// Upload media to CMS bucket
export async function uploadCMSMedia(file: File, folder: string = 'general'): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('cms-media')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('cms-media')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// Delete media from CMS bucket
export async function deleteCMSMedia(url: string): Promise<void> {
  const path = url.split('/cms-media/')[1];
  if (!path) return;

  const { error } = await supabase.storage
    .from('cms-media')
    .remove([path]);

  if (error) throw error;
}
