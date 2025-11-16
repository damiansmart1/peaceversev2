import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRewardStoreItems, usePurchaseItem, useUserPurchases } from '@/hooks/useRewardStore';
import { useUserGamificationProfile } from '@/hooks/useGamification';
import { ShoppingBag, Star, Sparkles, Frame, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const RewardStoreSection = () => {
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const { data: items, isLoading: itemsLoading } = useRewardStoreItems(selectedType);
  const { data: purchases } = useUserPurchases();
  const { data: profile } = useUserGamificationProfile();
  const purchaseItem = usePurchaseItem();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'avatar_upgrade': return <Sparkles className="w-5 h-5" />;
      case 'profile_frame': return <Frame className="w-5 h-5" />;
      case 'boost_badge': return <Zap className="w-5 h-5" />;
      case 'accessory': return <Star className="w-5 h-5" />;
      default: return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const handlePurchase = (itemId: string, cost: number) => {
    if (!profile) return;
    
    if (profile.peace_points < cost) {
      toast({
        title: 'Not Enough Points',
        description: `You need ${cost - profile.peace_points} more Peace Points to purchase this item.`,
        variant: 'destructive'
      });
      return;
    }

    purchaseItem.mutate(itemId);
  };

  const isOwned = (itemId: string) => {
    return (purchases as any)?.some((p: any) => p.item_id === itemId);
  };

  if (itemsLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-96 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-accent/5 border-border/40 shadow-elevated">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-story">
            <ShoppingBag className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reward Store</h2>
            <p className="text-sm text-muted-foreground">Redeem your Peace Points</p>
          </div>
        </div>
        
        {profile && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-accent/10 to-primary/10 px-4 py-2 rounded-full border border-accent/30">
            <Star className="w-5 h-5 text-accent" />
            <span className="font-bold text-foreground">{profile.peace_points}</span>
            <span className="text-sm text-muted-foreground">Points</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all" onClick={() => setSelectedType(undefined)}>All</TabsTrigger>
          <TabsTrigger value="avatar_upgrade" onClick={() => setSelectedType('avatar_upgrade')}>Avatars</TabsTrigger>
          <TabsTrigger value="profile_frame" onClick={() => setSelectedType('profile_frame')}>Frames</TabsTrigger>
          <TabsTrigger value="boost_badge" onClick={() => setSelectedType('boost_badge')}>Boosts</TabsTrigger>
          <TabsTrigger value="accessory" onClick={() => setSelectedType('accessory')}>Extras</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType || 'all'} className="space-y-4">
          {items && items.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const owned = isOwned(item.id);
                const canAfford = profile && profile.peace_points >= item.cost_points;

                return (
                  <Card 
                    key={item.id} 
                    className={`p-5 transition-all duration-200 ${
                      owned 
                        ? 'bg-success/5 border-success/30' 
                        : 'bg-card/90 hover:shadow-story border-border/40'
                    }`}
                  >
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-4 text-5xl">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        getTypeIcon(item.item_type)
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          {owned && <Badge className="bg-success text-success-foreground text-xs rounded-full">Owned</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-accent" />
                          <span className="font-bold text-accent">{item.cost_points}</span>
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>

                        <Button 
                          size="sm" 
                          className="rounded-full"
                          onClick={() => handlePurchase(item.id, item.cost_points)}
                          disabled={owned || !canAfford || purchaseItem.isPending}
                          variant={owned ? "outline" : canAfford ? "default" : "secondary"}
                        >
                          {owned ? 'Owned' : canAfford ? 'Buy' : 'Locked'}
                        </Button>
                      </div>

                      {item.limited_quantity && item.quantity_remaining !== null && (
                        <p className="text-xs text-warning">
                          Only {item.quantity_remaining} left!
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No items available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default RewardStoreSection;
