import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Shield, CheckCircle, Mail, MailCheck, Edit, Trash2, Download, Users, TrendingUp, Award, Filter, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

type SortField = 'display_name' | 'email' | 'created_at' | 'peace_points' | 'current_level';
type SortOrder = 'asc' | 'desc';

export const AdminUsersManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const queryClient = useQueryClient();

  // Real-time subscription for live updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch users with real-time updates
  const { data: users, isLoading, refetch } = useQuery({
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

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data: profiles } = await (supabase as any).from('profiles').select('*');
      const { data: roles } = await (supabase as any).from('user_roles').select('*');
      
      const totalUsers = profiles?.length || 0;
      const verifiedUsers = profiles?.filter((p: any) => p.is_verified).length || 0;
      const totalPoints = profiles?.reduce((sum: number, p: any) => sum + (p.peace_points || 0), 0) || 0;
      const avgLevel = profiles?.length > 0 
        ? (profiles.reduce((sum: number, p: any) => sum + (p.current_level || 1), 0) / profiles.length).toFixed(1)
        : '1.0';

      const roleDistribution: Record<string, number> = {};
      roles?.forEach((r: any) => {
        if (r.is_active) {
          roleDistribution[r.role] = (roleDistribution[r.role] || 0) + 1;
        }
      });

      return {
        totalUsers,
        verifiedUsers,
        totalPoints,
        avgLevel,
        roleDistribution,
        newUsersThisWeek: profiles?.filter((p: any) => {
          const created = new Date(p.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return created > weekAgo;
        }).length || 0
      };
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'citizen' | 'verifier' | 'partner' | 'government' | 'admin' }) => {
      await (supabase as any).from('user_roles').delete().eq('user_id', userId);
      const { error } = await (supabase as any)
        .from('user_roles')
        .insert({ user_id: userId, role: role as any, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(`User ${variables.isVerified ? 'unverified' : 'verified'} successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update verification: ${error.message}`);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await (supabase as any).from('user_roles').delete().eq('user_id', userId);
      const { error } = await (supabase as any).from('profiles').delete().eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      await (supabase as any).from('user_roles').delete().in('user_id', userIds);
      const { error } = await (supabase as any).from('profiles').delete().in('id', userIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(`${selectedUsers.size} users deleted successfully`);
      setSelectedUsers(new Set());
    },
    onError: (error: any) => {
      toast.error(`Failed to delete users: ${error.message}`);
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

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) return;
    if (confirm(`Delete ${selectedUsers.size} selected users? This cannot be undone.`)) {
      bulkDeleteMutation.mutate(Array.from(selectedUsers));
    }
  };

  const handleExportCSV = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Name', 'Username', 'Email', 'Role', 'Verified', 'Points', 'Level', 'Created'];
    const rows = filteredUsers.map((user: any) => [
      user.display_name || '',
      user.username || '',
      user.email || '',
      user.user_roles?.[0]?.role || 'citizen',
      user.is_verified ? 'Yes' : 'No',
      user.peace_points || 0,
      user.current_level || 1,
      new Date(user.created_at).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Users exported successfully');
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers?.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers?.map((u: any) => u.id) || []));
    }
  };

  // Apply filters and sorting
  const filteredUsers = users?.filter((user: any) => {
    const matchesSearch = 
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || 
      user.user_roles?.some((r: any) => r.role === roleFilter && r.is_active);

    const matchesVerified = verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && user.is_verified) ||
      (verifiedFilter === 'unverified' && !user.is_verified);

    return matchesSearch && matchesRole && matchesVerified;
  }).sort((a: any, b: any) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    return aVal < bVal ? -multiplier : aVal > bVal ? multiplier : 0;
  });

  // Pagination
  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
  const paginatedUsers = filteredUsers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              +{stats?.newUsersThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats?.verifiedUsers || 0}</div>
              <CheckCircle className="h-8 w-8 text-primary opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.totalUsers ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats?.totalPoints?.toLocaleString() || 0}</div>
              <Award className="h-8 w-8 text-primary opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Avg Level: {stats?.avgLevel || '1.0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {stats?.roleDistribution && Object.entries(stats.roleDistribution).map(([role, count]) => (
                <Badge key={role} variant="outline" className="text-xs">
                  {role}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main User Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6" />
                User Management
              </CardTitle>
              <CardDescription>
                Comprehensive user administration with live updates
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search users by name, username, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="citizen">Citizen</SelectItem>
                <SelectItem value="verifier">Verifier</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">{selectedUsers.size} selected</span>
              <Separator orientation="vertical" className="h-4" />
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedUsers(new Set())}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
          )}

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {paginatedUsers?.length || 0} of {filteredUsers?.length || 0} users</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1">Page {currentPage} of {totalPages || 1}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.size === filteredUsers?.length && filteredUsers?.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="font-semibold cursor-pointer hover:bg-muted"
                    onClick={() => {
                      setSortField('display_name');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    User Details
                  </TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead 
                    className="font-semibold cursor-pointer hover:bg-muted"
                    onClick={() => {
                      setSortField('peace_points');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Stats
                  </TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers?.map((user) => (
                  <TableRow key={user.id} className={selectedUsers.has(user.id) ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                      />
                    </TableCell>
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
                              variant={roleObj.role === 'admin' ? 'default' : 'outline'}
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleVerificationMutation.mutate({ userId: user.id, isVerified: user.is_verified })}
                        >
                          {user.is_verified ? <Mail className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Update user information and role assignment</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="role">Role</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
              </div>
              <Button 
                onClick={() => updateProfileMutation.mutate({ 
                  userId: selectedUser?.id, 
                  displayName, 
                  bio 
                })}
                disabled={updateProfileMutation.isPending}
              >
                Save Changes
              </Button>
            </TabsContent>
            <TabsContent value="role" className="space-y-4">
              <div className="space-y-2">
                <Label>User Role</Label>
                <Select
                  defaultValue={(selectedUser?.user_roles as any)?.[0]?.role || 'citizen'}
                  onValueChange={(role: any) => updateRoleMutation.mutate({ userId: selectedUser?.id, role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Citizen</SelectItem>
                    <SelectItem value="verifier">Verifier</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.display_name || 'this user'}? This action cannot be undone and will permanently remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserMutation.mutate(selectedUser?.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};