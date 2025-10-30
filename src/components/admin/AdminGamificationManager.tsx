import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trophy } from 'lucide-react';

export const AdminGamificationManager = () => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: achievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ['admin-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('achievements').select('*').order('points_required');
      if (error) throw error;
      return data;
    },
  });

  const { data: levels, isLoading: loadingLevels } = useQuery({
    queryKey: ['admin-levels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('levels').select('*').order('level_number');
      if (error) throw error;
      return data;
    },
  });

  const { data: rewards, isLoading: loadingRewards } = useQuery({
    queryKey: ['admin-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase.from('reward_store_items').select('*').order('cost_points');
      if (error) throw error;
      return data;
    },
  });

  const createAchievementMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('achievements').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-achievements'] });
      toast.success('Achievement created');
      setIsDialogOpen(false);
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('reward_store_items').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      toast.success('Reward created');
      setIsDialogOpen(false);
    },
  });

  if (loadingAchievements || loadingLevels || loadingRewards) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gamification Management</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen && activeTab === 'achievements'} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Achievement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Achievement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Name" />
                  <Textarea placeholder="Description" />
                  <Input placeholder="Badge Icon (emoji)" />
                  <Input type="number" placeholder="Points Required" />
                  <Button onClick={() => setIsDialogOpen(false)} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Badge</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements?.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell><span className="text-2xl">{achievement.badge_icon}</span></TableCell>
                  <TableCell className="font-medium">{achievement.name}</TableCell>
                  <TableCell>{achievement.points_required}</TableCell>
                  <TableCell>{achievement.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>XP Required</TableHead>
                <TableHead>Icon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels?.map((level) => (
                <TableRow key={level.id}>
                  <TableCell className="font-bold">{level.level_number}</TableCell>
                  <TableCell>{level.title}</TableCell>
                  <TableCell>{level.xp_required} XP</TableCell>
                  <TableCell><span className="text-2xl">{level.icon}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen && activeTab === 'rewards'} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Reward
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Reward</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Name" />
                  <Textarea placeholder="Description" />
                  <Input type="number" placeholder="Cost (Points)" />
                  <Input placeholder="Item Type (badge/frame/accessory)" />
                  <Button onClick={() => setIsDialogOpen(false)} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards?.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="font-medium">{reward.name}</TableCell>
                  <TableCell>{reward.item_type}</TableCell>
                  <TableCell>{reward.cost_points} pts</TableCell>
                  <TableCell>{reward.is_available ? '✓' : '✗'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};
