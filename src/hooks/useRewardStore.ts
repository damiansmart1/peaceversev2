import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

// Purchase an item
export const usePurchaseItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get item details
      const { data: item, error: itemError } = await supabase
        .from('reward_store_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      if (!item) throw new Error('Item not found');

      // Check if user has enough points
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('peace_points')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profile.peace_points < item.cost_points) {
        throw new Error('Not enough Peace Points');
      }

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          user_id: user.id,
          item_id: itemId,
          points_spent: item.cost_points
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Deduct points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ peace_points: profile.peace_points - item.cost_points })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update item quantity if limited
      if (item.limited_quantity && item.quantity_remaining !== null) {
        const { error: quantityError } = await supabase
          .from('reward_store_items')
          .update({ quantity_remaining: item.quantity_remaining - 1 })
          .eq('id', itemId);

        if (quantityError) throw quantityError;
      }

      // Apply the item to user profile based on type
      if (item.item_type === 'profile_frame') {
        await supabase
          .from('profiles')
          .update({ profile_frame: item.image_url })
          .eq('user_id', user.id);
      } else if (item.item_type === 'accessory') {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('avatar_accessories')
          .eq('user_id', user.id)
          .single();

        const accessories = Array.isArray(currentProfile?.avatar_accessories) 
          ? currentProfile.avatar_accessories 
          : [];
        const newAccessories = [...accessories, item.metadata];
        
        await supabase
          .from('profiles')
          .update({ avatar_accessories: newAccessories })
          .eq('user_id', user.id);
      }

      return purchase;
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
