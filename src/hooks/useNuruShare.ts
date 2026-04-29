import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const sb = supabase as any;

async function invokeAction(body: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke('nuru-ai-chat', { body });
  if (error) {
    let msg = error.message || 'Request failed';
    try {
      if (error.context && typeof error.context.json === 'function') {
        const parsed = await error.context.json();
        if (parsed?.error) msg = parsed.error;
      }
    } catch {}
    throw new Error(msg);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useShareConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      return await invokeAction({ action: 'share_conversation', conversationId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-conversations'] });
      toast.success('Public share link created');
    },
    onError: (e: any) => toast.error(e.message || 'Could not create share link'),
  });
}

export function useUnshareConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      return await invokeAction({ action: 'unshare_conversation', conversationId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nuru-conversations'] });
      toast.success('Sharing disabled');
    },
    onError: (e: any) => toast.error(e.message || 'Could not disable sharing'),
  });
}

export function useSharedConversation(token: string | undefined) {
  return useQuery({
    queryKey: ['nuru-shared-conversation', token],
    enabled: !!token,
    queryFn: async () => {
      const data = await invokeAction({ action: 'get_shared_conversation', shareToken: token });
      return data;
    },
  });
}
