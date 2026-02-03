import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useElectionDemo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const seedMutation = useMutation({
    mutationFn: async (action: 'seed' | 'clear' = 'seed') => {
      const { data, error } = await supabase.functions.invoke('seed-election-demo', {
        body: { action },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      queryClient.invalidateQueries({ queryKey: ['all-election-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['election-incident-categories'] });
      
      toast({
        title: action === 'clear' ? 'Demo Data Cleared' : 'Demo Data Seeded',
        description: action === 'clear' 
          ? 'All demo election data has been removed.'
          : `Created elections with polling stations, observers, incidents, and results.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Operation Failed',
        description: error.message || 'Failed to manage demo data',
        variant: 'destructive',
      });
    },
  });

  return {
    seedDemoData: () => seedMutation.mutate('seed'),
    clearDemoData: () => seedMutation.mutate('clear'),
    isLoading: seedMutation.isPending,
  };
};