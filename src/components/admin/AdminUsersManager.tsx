import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Shield, Ban, CheckCircle, UserX, Mail, MailCheck, Edit, Trash2, AlertTriangle, Key } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const AdminUsersManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey(role, is_active, expires_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'citizen' | 'verifier' | 'partner' | 'government' | 'admin' }) => {
      // Delete existing roles
      await (supabase as any).from('user_roles').delete().eq('user_id', userId);
      
      // Insert new role
      const { error } = await (supabase as any)
        .from('user_roles')
        .insert({ user_id: userId, role: role as any, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ userId, displayName, bio }: { userId: string; displayName: string; bio: string }) => {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ display_name: displayName, bio })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ userId, isVerified }: { userId: string; isVerified: boolean }) => {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ is_verified: !isVerified })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(`User ${variables.isVerified ? 'unverified' : 'verified'} successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update verification: ${error.message}`);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user roles first (cascade will handle this, but being explicit)
      await (supabase as any)
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      
      // Delete user profile
      const { error } = await (supabase as any)
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setDisplayName(user.display_name || '');
    setBio(user.bio || '');
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const filteredUsers = users?.filter((user: any) =>
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6" />
            User Management & Security
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, permissions, and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search users by name, username, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <div className="flex gap-2 text-sm text-muted-foreground items-center">
              <span className="font-medium">{filteredUsers?.length || 0}</span> users found
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">User Details</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Stats</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {user.display_name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="font-medium">{user.display_name || 'Anonymous User'}</div>
                          <div className="text-sm text-muted-foreground">@{user.username || 'no-username'}</div>
                          {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
                          <div className="text-xs text-muted-foreground mt-0.5">{user.id?.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.user_type || 'youth'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.user_roles && user.user_roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.user_roles.filter((r: any) => r.is_active !== false).map((roleObj: any, idx: number) => (
                            <Badge 
                              key={idx}
                              variant={roleObj.role === 'admin' ? 'default' : 
                                      roleObj.role === 'moderator' ? 'secondary' : 'outline'}
                            >
                              {roleObj.role}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <Badge variant="outline">citizen</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Points:</span>
                          <span className="font-medium">{user.peace_points || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Level:</span>
                          <span className="font-medium">{user.current_level || 1}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {user.is_verified ? (
                          <Badge variant="default" className="gap-1 w-fit">
                            <MailCheck className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 w-fit">
                            <Mail className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Manage: {user.display_name || 'User'}
                              </DialogTitle>
                              <DialogDescription>
                                Comprehensive user account and security management
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs defaultValue="role" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="role">Role & Permissions</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="info">Information</TabsTrigger>
                              </TabsList>

                              <TabsContent value="role" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                  <Label className="text-base font-semibold">User Role</Label>
                                  <Select
                                    defaultValue={(user.user_roles as any)?.[0]?.role || 'citizen'}
                                    onValueChange={(role: any) => updateRoleMutation.mutate({ userId: user.id, role })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="citizen">
                                        <div className="flex flex-col items-start">
                                          <span className="font-medium">Citizen</span>
                                          <span className="text-xs text-muted-foreground">Standard platform access</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="verifier">
                                        <div className="flex flex-col items-start">
                                          <span className="font-medium">Verifier</span>
                                          <span className="text-xs text-muted-foreground">Verify content submissions</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="partner">
                                        <div className="flex flex-col items-start">
                                          <span className="font-medium">Partner</span>
                                          <span className="text-xs text-muted-foreground">Partner organization access</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="government">
                                        <div className="flex flex-col items-start">
                                          <span className="font-medium">Government</span>
                                          <span className="text-xs text-muted-foreground">Government official access</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="admin">
                                        <div className="flex flex-col items-start">
                                          <span className="font-medium">Administrator</span>
                                          <span className="text-xs text-muted-foreground">Full platform control</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                                    Role changes take effect immediately and are logged for security auditing
                                  </p>
                                </div>

                                <div className="rounded-lg border p-4 bg-muted/50">
                                  <h4 className="font-semibold text-sm mb-2">Current Permissions</h4>
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-3 w-3 text-primary" />
                                      Create and share content
                                    </li>
                                    {user.user_roles?.some((r: any) => r.role === 'verifier' || r.role === 'admin') && (
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-primary" />
                                        Verify content submissions
                                      </li>
                                    )}
                                    {user.user_roles?.some((r: any) => r.role === 'partner' || r.role === 'admin') && (
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-primary" />
                                        Partner dashboard access
                                      </li>
                                    )}
                                    {user.user_roles?.some((r: any) => r.role === 'government' || r.role === 'admin') && (
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-primary" />
                                        Government insights access
                                      </li>
                                    )}
                                    {user.user_roles?.some((r: any) => r.role === 'admin') && (
                                      <>
                                        <li className="flex items-center gap-2">
                                          <CheckCircle className="h-3 w-3 text-primary" />
                                          Full administrative access
                                        </li>
                                        <li className="flex items-center gap-2">
                                          <CheckCircle className="h-3 w-3 text-primary" />
                                          Manage user roles
                                        </li>
                                      </>
                                    )}
                                  </ul>
                                </div>
                              </TabsContent>

                              <TabsContent value="security" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="space-y-0.5">
                                      <Label className="text-base">Email Verification Status</Label>
                                      <p className="text-sm text-muted-foreground">
                                        {user.is_verified ? 'Email address verified' : 'Email not verified'}
                                      </p>
                                    </div>
                                    <Button
                                      variant={user.is_verified ? "outline" : "default"}
                                      size="sm"
                                      onClick={() => toggleVerificationMutation.mutate({ 
                                        userId: user.id, 
                                        isVerified: user.is_verified 
                                      })}
                                      disabled={toggleVerificationMutation.isPending}
                                    >
                                      {user.is_verified ? (
                                        <>
                                          <Ban className="h-4 w-4 mr-1" />
                                          Revoke
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Verify
                                        </>
                                      )}
                                    </Button>
                                  </div>

                                  <div className="rounded-lg border p-4 bg-muted/50 space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                                      Security Information
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Account Created:</span>
                                        <span className="font-medium">
                                          {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Updated:</span>
                                        <span className="font-medium">
                                          {new Date(user.updated_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">User ID:</span>
                                        <span className="font-medium text-xs">{user.id.slice(0, 12)}...</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="info" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Display Name</Label>
                                    <Input value={user.display_name || ''} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Username</Label>
                                    <Input value={user.username || ''} disabled />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Bio</Label>
                                    <Textarea value={user.bio || 'No bio provided'} disabled rows={3} />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>User Type</Label>
                                    <Input value={user.user_type || 'youth'} disabled />
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Profile
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user information. Changes will be reflected immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Display Name</Label>
              <Input
                id="edit-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Enter bio"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateProfileMutation.mutate({
                userId: selectedUser?.id,
                displayName,
                bio,
              })}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete <strong>{selectedUser?.display_name}</strong>'s account?
              </p>
              <p className="text-destructive font-medium">
                This action is irreversible and will permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>User profile and personal information</li>
                <li>All content created by the user</li>
                <li>Progress, points, and achievements</li>
                <li>All associated data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserMutation.mutate(selectedUser?.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
