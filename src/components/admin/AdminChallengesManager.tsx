import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';

export const AdminChallengesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: 'story',
    points_reward: 50,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const queryClient = useQueryClient();

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('weekly_challenges').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('Challenge created');
      resetForm();
    },
    onError: (error: any) => toast.error(`Failed: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: any) => {
      const { error } = await supabase.from('weekly_challenges').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('Challenge updated');
      resetForm();
    },
    onError: (error: any) => toast.error(`Failed: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('weekly_challenges').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('Challenge deleted');
      setDeleteId(null);
    },
    onError: (error: any) => toast.error(`Failed: ${error.message}`),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from('weekly_challenges').update({ is_active: !isActive }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('Status updated');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      challenge_type: 'story',
      points_reward: 50,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setEditingChallenge(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = () => {
    if (editingChallenge) {
      updateMutation.mutate({ id: editingChallenge.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (challenge: any) => {
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      challenge_type: challenge.challenge_type,
      points_reward: challenge.points_reward,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Challenges Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingChallenge ? 'Edit' : 'Create'} Challenge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Challenge Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Points Reward"
                value={formData.points_reward}
                onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="datetime-local"
                  value={formData.start_date.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value).toISOString() })}
                />
                <Input
                  type="datetime-local"
                  value={formData.end_date.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, end_date: new Date(e.target.value).toISOString() })}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingChallenge ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges?.map((challenge) => (
            <TableRow key={challenge.id}>
              <TableCell className="font-medium">{challenge.title}</TableCell>
              <TableCell><Badge variant="outline">{challenge.challenge_type}</Badge></TableCell>
              <TableCell>{challenge.points_reward} pts</TableCell>
              <TableCell className="text-sm">
                {format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d')}
              </TableCell>
              <TableCell>
                <Badge variant={challenge.is_active ? 'default' : 'secondary'}>
                  {challenge.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(challenge)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActiveMutation.mutate({ id: challenge.id, isActive: challenge.is_active })}
                  >
                    {challenge.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(challenge.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
