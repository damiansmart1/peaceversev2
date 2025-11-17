import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { toast } from '@/hooks/use-toast';

export interface RewardStoreItem {
  id: string;
  item_type: string;
  name: string;
  description: string;
  cost_points: number;
  image_url: string;
  metadata: any;
  is_available: boolean;
  limited_quantity: number;
  quantity_remaining: number;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  item_id: string;
  points_spent: number;
  purchased_at: string;
}

// Fetch available store items
export const useRewardStoreItems = (itemType?: string) => {
  return useQuery({
    queryKey: ['rewardStoreItems', itemType],
    queryFn: async () => {
      let query = supabase
        .from('reward_store_items')
        .select('*')
        .eq('is_available', true);

      if (itemType) {
        query = query.eq('item_type', itemType);
      }

      query = query.order('cost_points', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      return data as RewardStoreItem[];
    }
  });
};

// Fetch user's purchases
export const useUserPurchases = () => {
  return useQuery({
    queryKey: ['userPurchases'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_purchases')
        .select('*, reward_store_items(*)')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

// Purchase an item using secure server-side function
export const usePurchaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.rpc('purchase_reward_item', {
        p_item_id: itemId
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; purchase_id?: string; message?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Purchase failed');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPurchases'] });
      queryClient.invalidateQueries({ queryKey: ['userGamificationProfile'] });
      queryClient.invalidateQueries({ queryKey: ['rewardStoreItems'] });
      toast({
        title: 'Purchase Successful!',
        description: 'Your new item has been added to your profile.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Purchase Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
};
