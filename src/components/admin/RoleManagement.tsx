import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, UserPlus, Trash2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import type { AppRole, UserRoleWithProfile } from '@/types/database';

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-500',
  moderator: 'bg-orange-500',
  verifier: 'bg-blue-500',
  partner: 'bg-purple-500',
  government: 'bg-green-500',
  citizen: 'bg-gray-500',
};

const roleDescriptions: Record<AppRole, string> = {
  admin: 'Full system access and control',
  moderator: 'Content moderation and review',
  verifier: 'Verify citizen reports and evidence',
  partner: 'NGO/Organization partner access',
  government: 'Government official access',
  citizen: 'Standard user access',
};

export const RoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('citizen');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all user roles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      const result = await (supabase as any)
        .from('user_roles')
        .select(`
          *,
          profiles(username, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (result.error) throw result.error;
      return result.data as unknown as UserRoleWithProfile[];
    },
  });

  // Search users by email
  const { data: searchResults } = useQuery({
    queryKey: ['search-users', searchEmail],
    queryFn: async () => {
      if (!searchEmail || searchEmail.length < 3) return [];
      
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${searchEmail}%,display_name.ilike.%${searchEmail}%`)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: searchEmail.length >= 3,
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role, expiresAt }: { userId: string; role: AppRole; expiresAt?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase as any)
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as any,
          is_active: true,
          expires_at: expiresAt || null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      toast({
        title: 'Role Assigned',
        description: 'User role has been successfully assigned.',
      });
      setIsDialogOpen(false);
      setSelectedUserId('');
      setExpiresAt('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive',
      });
    },
  });

  // Revoke role mutation
  const revokeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await (supabase as any)
        .from('user_roles')
        .update({ is_active: false } as any)
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      toast({
        title: 'Role Revoked',
        description: 'User role has been revoked.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke role',
        variant: 'destructive',
      });
    },
  });

  const handleAssignRole = () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: 'Missing Information',
        description: 'Please select a user and role',
        variant: 'destructive',
      });
      return;
    }

    assignRoleMutation.mutate({
      userId: selectedUserId,
      role: selectedRole,
      expiresAt: expiresAt || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Role Management</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign User Role</DialogTitle>
                <DialogDescription>
                  Grant a specific role to a user. This will affect their access permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search User</Label>
                  <Input
                    id="search"
                    placeholder="Search by username or name..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                  {searchResults && searchResults.length > 0 && (
                    <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          className="w-full p-2 text-left hover:bg-accent transition-colors"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setSearchEmail(user.display_name || user.username || '');
                          }}
                        >
                          <div className="font-medium">{user.display_name || user.username}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleDescriptions).map(([role, desc]) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${roleColors[role as AppRole]}`} />
                            <div>
                              <div className="font-medium capitalize">{role}</div>
                              <div className="text-xs text-muted-foreground">{desc}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires">Expires At (Optional)</Label>
                  <Input
                    id="expires"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleAssignRole}
                  disabled={!selectedUserId || assignRoleMutation.isPending}
                >
                  {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Role'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Manage user roles and permissions across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading roles...</div>
        ) : !userRoles || userRoles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No roles assigned yet
          </div>
        ) : (
          <div className="space-y-3">
            {userRoles.map((userRole) => {
              const isExpired = userRole.expires_at && new Date(userRole.expires_at) < new Date();
              const profile = userRole.profiles as any;

              return (
                <div
                  key={userRole.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Badge className={roleColors[userRole.role as AppRole]}>
                      {userRole.role}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">
                        {profile?.display_name || profile?.username || 'Unknown User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {roleDescriptions[userRole.role as AppRole]}
                      </div>
                      {userRole.expires_at && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          Expires: {new Date(userRole.expires_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {userRole.is_active && !isExpired ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    {userRole.is_active && !isExpired && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => revokeRoleMutation.mutate(userRole.id)}
                        disabled={revokeRoleMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
