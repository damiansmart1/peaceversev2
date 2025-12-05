import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, Trophy, Star, Gift, TrendingUp } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  category: string;
  points_required: number;
  points_reward: number;
  is_active: boolean;
}

interface Level {
  id: string;
  level_number: number;
  title: string;
  xp_required: number;
  icon: string;
  description: string;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  item_type: string;
  cost_points: number;
  is_available: boolean;
}

export const AdminGamificationManager = () => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Form states
  const [achievementForm, setAchievementForm] = useState({
    name: '', description: '', badge_icon: '🏆', category: 'general', points_required: 0, points_reward: 50
  });
  const [levelForm, setLevelForm] = useState({
    level_number: 1, title: '', xp_required: 0, icon: '⭐', description: ''
  });
  const [rewardForm, setRewardForm] = useState({
    name: '', description: '', item_type: 'badge', cost_points: 100
  });

  const { data: achievements, isLoading: loadingAchievements } = useQuery({
    queryKey: ['admin-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points_required');
      if (error) throw error;
      return (data || []) as Achievement[];
    },
  });

  const { data: levels, isLoading: loadingLevels } = useQuery({
    queryKey: ['admin-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('level_number');
      if (error) throw error;
      return (data || []) as Level[];
    },
  });

  const { data: rewards, isLoading: loadingRewards } = useQuery({
    queryKey: ['admin-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reward_store_items')
        .select('*')
        .order('cost_points');
      if (error) throw error;
      return (data || []) as RewardItem[];
    },
  });

  // Achievement mutations
  const createAchievementMutation = useMutation({
    mutationFn: async (data: typeof achievementForm) => {
      const { error } = await supabase.from('achievements').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-achievements'] });
      toast.success('Achievement created');
      resetForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateAchievementMutation = useMutation({
    mutationFn: async ({ id, ...data }: Achievement) => {
      const { error } = await supabase.from('achievements').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-achievements'] });
      toast.success('Achievement updated');
      resetForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-achievements'] });
      toast.success('Achievement deleted');
      setDeleteId(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Level mutations
  const createLevelMutation = useMutation({
    mutationFn: async (data: typeof levelForm) => {
      const { error } = await supabase.from('levels').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-levels'] });
      toast.success('Level created');
      resetForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateLevelMutation = useMutation({
    mutationFn: async ({ id, ...data }: Level) => {
      const { error } = await supabase.from('levels').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-levels'] });
      toast.success('Level updated');
      resetForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteLevelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('levels').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-levels'] });
      toast.success('Level deleted');
      setDeleteId(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Reward mutations
  const createRewardMutation = useMutation({
    mutationFn: async (data: typeof rewardForm) => {
      const { error } = await supabase.from('reward_store_items').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      toast.success('Reward created');
      resetForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, ...data }: RewardItem) => {
      const { error } = await supabase.from('reward_store_items').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      toast.success('Reward updated');
      resetForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteRewardMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reward_store_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      toast.success('Reward deleted');
      setDeleteId(null);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setAchievementForm({ name: '', description: '', badge_icon: '🏆', category: 'general', points_required: 0, points_reward: 50 });
    setLevelForm({ level_number: 1, title: '', xp_required: 0, icon: '⭐', description: '' });
    setRewardForm({ name: '', description: '', item_type: 'badge', cost_points: 100 });
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
    if (type === 'achievement') {
      setAchievementForm({
        name: item.name,
        description: item.description,
        badge_icon: item.badge_icon,
        category: item.category,
        points_required: item.points_required,
        points_reward: item.points_reward
      });
    } else if (type === 'level') {
      setLevelForm({
        level_number: item.level_number,
        title: item.title,
        xp_required: item.xp_required,
        icon: item.icon,
        description: item.description || ''
      });
    } else if (type === 'reward') {
      setRewardForm({
        name: item.name,
        description: item.description,
        item_type: item.item_type,
        cost_points: item.cost_points
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (activeTab === 'achievements') {
      if (editingItem) {
        updateAchievementMutation.mutate({ id: editingItem.id, ...achievementForm } as any);
      } else {
        createAchievementMutation.mutate(achievementForm);
      }
    } else if (activeTab === 'levels') {
      if (editingItem) {
        updateLevelMutation.mutate({ id: editingItem.id, ...levelForm } as any);
      } else {
        createLevelMutation.mutate(levelForm);
      }
    } else if (activeTab === 'rewards') {
      if (editingItem) {
        updateRewardMutation.mutate({ id: editingItem.id, ...rewardForm } as any);
      } else {
        createRewardMutation.mutate(rewardForm);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'achievements') {
      deleteAchievementMutation.mutate(id);
    } else if (activeTab === 'levels') {
      deleteLevelMutation.mutate(id);
    } else if (activeTab === 'rewards') {
      deleteRewardMutation.mutate(id);
    }
  };

  const isLoading = loadingAchievements || loadingLevels || loadingRewards;
  const isPending = createAchievementMutation.isPending || updateAchievementMutation.isPending ||
    createLevelMutation.isPending || updateLevelMutation.isPending ||
    createRewardMutation.isPending || updateRewardMutation.isPending;

  // Stats cards
  const stats = [
    { label: 'Achievements', value: achievements?.length || 0, icon: Trophy, color: 'text-warning' },
    { label: 'Levels', value: levels?.length || 0, icon: Star, color: 'text-primary' },
    { label: 'Rewards', value: rewards?.length || 0, icon: Gift, color: 'text-accent' },
  ];

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gamification Management</h2>
          <p className="text-muted-foreground">Manage achievements, levels, and rewards</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-4 bg-gradient-to-br from-card to-accent/5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">🏆 Achievements</TabsTrigger>
          <TabsTrigger value="levels">⭐ Levels</TabsTrigger>
          <TabsTrigger value="rewards">🎁 Rewards</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen && activeTab === 'achievements'} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Achievement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Achievement' : 'Create Achievement'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={achievementForm.name} onChange={(e) => setAchievementForm({ ...achievementForm, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={achievementForm.description} onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Badge Icon (emoji)</Label>
                      <Input value={achievementForm.badge_icon} onChange={(e) => setAchievementForm({ ...achievementForm, badge_icon: e.target.value })} />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input value={achievementForm.category} onChange={(e) => setAchievementForm({ ...achievementForm, category: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Points Required</Label>
                      <Input type="number" value={achievementForm.points_required} onChange={(e) => setAchievementForm({ ...achievementForm, points_required: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Points Reward</Label>
                      <Input type="number" value={achievementForm.points_reward} onChange={(e) => setAchievementForm({ ...achievementForm, points_reward: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Badge</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements?.map((achievement) => (
                  <TableRow key={achievement.id}>
                    <TableCell><span className="text-2xl">{achievement.badge_icon}</span></TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-48">{achievement.description}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{achievement.category}</Badge></TableCell>
                    <TableCell>{achievement.points_required} pts</TableCell>
                    <TableCell className="text-accent font-medium">+{achievement.points_reward}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(achievement, 'achievement')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={deleteId === achievement.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(achievement.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Achievement?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(achievement.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!achievements || achievements.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No achievements found. Create your first one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Levels Tab */}
        <TabsContent value="levels" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen && activeTab === 'levels'} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Level
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Level' : 'Create Level'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Level Number</Label>
                      <Input type="number" value={levelForm.level_number} onChange={(e) => setLevelForm({ ...levelForm, level_number: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div>
                      <Label>Icon (emoji)</Label>
                      <Input value={levelForm.icon} onChange={(e) => setLevelForm({ ...levelForm, icon: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input value={levelForm.title} onChange={(e) => setLevelForm({ ...levelForm, title: e.target.value })} />
                  </div>
                  <div>
                    <Label>XP Required</Label>
                    <Input type="number" value={levelForm.xp_required} onChange={(e) => setLevelForm({ ...levelForm, xp_required: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={levelForm.description} onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })} />
                  </div>
                  <Button onClick={handleSubmit} className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>XP Required</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels?.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-bold text-lg">{level.level_number}</TableCell>
                    <TableCell><span className="text-2xl">{level.icon}</span></TableCell>
                    <TableCell className="font-medium">{level.title}</TableCell>
                    <TableCell><Badge variant="secondary">{level.xp_required.toLocaleString()} XP</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-48">{level.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(level, 'level')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={deleteId === level.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(level.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Level?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(level.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!levels || levels.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No levels found. Create your first one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen && activeTab === 'rewards'} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Reward
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Reward' : 'Create Reward'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={rewardForm.name} onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={rewardForm.description} onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Item Type</Label>
                      <Input value={rewardForm.item_type} onChange={(e) => setRewardForm({ ...rewardForm, item_type: e.target.value })} placeholder="badge/frame/accessory/perk" />
                    </div>
                    <div>
                      <Label>Cost (Points)</Label>
                      <Input type="number" value={rewardForm.cost_points} onChange={(e) => setRewardForm({ ...rewardForm, cost_points: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards?.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{reward.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-48">{reward.description}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{reward.item_type}</Badge></TableCell>
                    <TableCell className="font-medium">{reward.cost_points.toLocaleString()} pts</TableCell>
                    <TableCell>
                      <Badge variant={reward.is_available ? 'default' : 'secondary'}>
                        {reward.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(reward, 'reward')}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={deleteId === reward.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(reward.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Reward?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(reward.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!rewards || rewards.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No rewards found. Create your first one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};