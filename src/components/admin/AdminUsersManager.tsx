import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Shield, Ban, CheckCircle } from 'lucide-react';

export const AdminUsersManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'moderator' | 'admin' }) => {
      // Remove existing role
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Add new role
      if (role !== 'user') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated');
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  const filteredUsers = users?.filter(user =>
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>

      <Input
        placeholder="Search users by name, username, or ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.display_name || 'Anonymous'}</div>
                    <div className="text-sm text-muted-foreground">@{user.username || 'no-username'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.user_type || 'youth'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={(user.user_roles as any)?.[0]?.role === 'admin' ? 'default' : 'secondary'}>
                    {(user.user_roles as any)?.[0]?.role || 'user'}
                  </Badge>
                </TableCell>
                <TableCell>{user.peace_points}</TableCell>
                <TableCell>{user.current_level}</TableCell>
                <TableCell>
                  {user.is_verified ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Dialog open={selectedUser?.id === user.id} onOpenChange={(open) => !open && setSelectedUser(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                        <Shield className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manage User: {user.display_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">User Role</label>
                          <Select
                            defaultValue={(user.user_roles as any)?.[0]?.role || 'user'}
                            onValueChange={(role: any) => updateRoleMutation.mutate({ userId: user.user_id, role })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
