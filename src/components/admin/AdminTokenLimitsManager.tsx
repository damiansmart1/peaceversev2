import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Coins, Plus, Pencil, Trash2, Shield, Users, User, Globe,
  Zap, TrendingUp, AlertTriangle,
} from 'lucide-react';
import {
  useTokenLimits, useTokenUsageStats, useCreateTokenLimit,
  useUpdateTokenLimit, useDeleteTokenLimit, type TokenLimit,
} from '@/hooks/useNuruTokenLimits';
import { format } from 'date-fns';

const SCOPE_ICONS = { role: Users, user: User, global: Globe } as const;
const SCOPE_LABELS = { role: 'Role', user: 'User', global: 'Global' } as const;

const defaultForm = {
  name: '',
  scope: 'role' as TokenLimit['scope'],
  target_role: '',
  target_user_id: '',
  daily_token_limit: 10000,
  monthly_token_limit: 300000,
  max_tokens_per_request: 4096,
  is_active: true,
};

const AdminTokenLimitsManager = () => {
  const { data: limits, isLoading } = useTokenLimits();
  const { data: usageStats } = useTokenUsageStats();
  const createLimit = useCreateTokenLimit();
  const updateLimit = useUpdateTokenLimit();
  const deleteLimit = useDeleteTokenLimit();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (limit: TokenLimit) => {
    setEditingId(limit.id);
    setForm({
      name: limit.name,
      scope: limit.scope,
      target_role: limit.target_role || '',
      target_user_id: limit.target_user_id || '',
      daily_token_limit: limit.daily_token_limit,
      monthly_token_limit: limit.monthly_token_limit,
      max_tokens_per_request: limit.max_tokens_per_request,
      is_active: limit.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload = {
      name: form.name,
      scope: form.scope,
      target_role: form.scope === 'role' ? form.target_role || null : null,
      target_user_id: form.scope === 'user' ? form.target_user_id || null : null,
      daily_token_limit: form.daily_token_limit,
      monthly_token_limit: form.monthly_token_limit,
      max_tokens_per_request: form.max_tokens_per_request,
      is_active: form.is_active,
    };

    if (editingId) {
      updateLimit.mutate({ id: editingId, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createLimit.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this token limit?')) deleteLimit.mutate(id);
  };

  const handleToggleActive = (limit: TokenLimit) => {
    updateLimit.mutate({ id: limit.id, is_active: !limit.is_active });
  };

  const formatNum = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Limits', value: limits?.filter(l => l.is_active).length || 0, icon: Shield, color: 'text-green-500' },
          { label: 'Total Limits', value: limits?.length || 0, icon: Coins, color: 'text-blue-500' },
          { label: 'Tokens Used (All)', value: formatNum(usageStats?.totalTokensUsed || 0), icon: Zap, color: 'text-purple-500' },
          { label: 'Total Requests', value: formatNum(usageStats?.totalRequests || 0), icon: TrendingUp, color: 'text-orange-500' },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Limits Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Token Limits
            </CardTitle>
            <CardDescription>Set, edit, and manage token usage limits for NuruAI</CardDescription>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Limit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-right">Daily</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="text-right">Per Request</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(limits || []).map(limit => {
                  const ScopeIcon = SCOPE_ICONS[limit.scope];
                  return (
                    <TableRow key={limit.id}>
                      <TableCell className="font-medium">{limit.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 text-xs capitalize">
                          <ScopeIcon className="h-3 w-3" />
                          {SCOPE_LABELS[limit.scope]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {limit.scope === 'role' ? limit.target_role || '-' :
                         limit.scope === 'user' ? (limit.target_user_id?.slice(0, 8) + '...') || '-' : 'All Users'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatNum(limit.daily_token_limit)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatNum(limit.monthly_token_limit)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatNum(limit.max_tokens_per_request)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={limit.is_active}
                          onCheckedChange={() => handleToggleActive(limit)}
                          aria-label="Toggle active"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(limit)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(limit.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!limits || limits.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Coins className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>No token limits configured yet. Click "Add Limit" to create one.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Token Limit' : 'Create Token Limit'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the token limit configuration.' : 'Set a new token usage limit for NuruAI.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Citizen Daily Limit"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={form.scope} onValueChange={(v: any) => setForm(f => ({ ...f, scope: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (All Users)</SelectItem>
                  <SelectItem value="role">Role-Based</SelectItem>
                  <SelectItem value="user">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.scope === 'role' && (
              <div className="space-y-2">
                <Label>Target Role</Label>
                <Select value={form.target_role} onValueChange={v => setForm(f => ({ ...f, target_role: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Citizen</SelectItem>
                    <SelectItem value="verifier">Verifier</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.scope === 'user' && (
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input
                  placeholder="Enter user UUID"
                  value={form.target_user_id}
                  onChange={e => setForm(f => ({ ...f, target_user_id: e.target.value }))}
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Daily Limit</Label>
                <Input
                  type="number" min={0}
                  value={form.daily_token_limit}
                  onChange={e => setForm(f => ({ ...f, daily_token_limit: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Monthly Limit</Label>
                <Input
                  type="number" min={0}
                  value={form.monthly_token_limit}
                  onChange={e => setForm(f => ({ ...f, monthly_token_limit: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Per Request</Label>
                <Input
                  type="number" min={0}
                  value={form.max_tokens_per_request}
                  onChange={e => setForm(f => ({ ...f, max_tokens_per_request: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Quick presets */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Quick Presets</p>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setForm(f => ({
                  ...f, daily_token_limit: 5000, monthly_token_limit: 100000, max_tokens_per_request: 2048,
                }))}>
                  Basic
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setForm(f => ({
                  ...f, daily_token_limit: 25000, monthly_token_limit: 500000, max_tokens_per_request: 4096,
                }))}>
                  Standard
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setForm(f => ({
                  ...f, daily_token_limit: 100000, monthly_token_limit: 2000000, max_tokens_per_request: 8192,
                }))}>
                  Premium
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!form.name || createLimit.isPending || updateLimit.isPending}
            >
              {(createLimit.isPending || updateLimit.isPending) ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTokenLimitsManager;
