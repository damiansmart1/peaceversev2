import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { materialSchema, validateMaterialFile, type Material, type MaterialDraft } from '@/lib/participation';

export function useParticipationMaterials(kind: 'proposal' | 'poll', id: string) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['participation-materials', kind, id], enabled: !!id, queryFn: async () => {
    const { data, error } = await supabase.from('participation_materials').select('*').eq(`${kind}_id`, id).order('created_at');
    if (error) throw error;
    return data as Material[];
  }});
  const save = async (drafts: MaterialDraft[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in to add materials');
    for (const draft of drafts) {
      const validated = materialSchema.parse(draft);
      let path: string | null = null;
      let materialKind = 'link';
      if (draft.file) {
        const ext = validateMaterialFile(draft.file);
        path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from('participation-materials').upload(path, draft.file, { upsert: false });
        if (error) throw error;
        materialKind = draft.file.type.startsWith('image/') ? 'image' : draft.file.type.startsWith('video/') ? 'video' : 'document';
      }
      if (!path && !validated.url) throw new Error('Add a file or reference link');
      const { error } = await supabase.from('participation_materials').insert({ [`${kind}_id`]: id, created_by: user.id, title: validated.title, context: validated.context, language: validated.language, kind: materialKind, storage_path: path, url: path ? null : validated.url });
      if (error) {
        if (path) await supabase.storage.from('participation-materials').remove([path]);
        throw error;
      }
      // Remove completed entries so retrying cannot duplicate already saved materials.
      drafts.splice(drafts.indexOf(draft), 1);
    }
    await qc.invalidateQueries({ queryKey: ['participation-materials', kind, id] });
  };
  return { ...query, save };
}