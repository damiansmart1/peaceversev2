import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, Calendar, Shield, AlertTriangle, RefreshCw, Activity, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

// Generate secure API key
const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'pv_live_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Hash function for API key
const hashApiKey = async (key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const availablePermissions = [
  { key: 'read:incidents', label: 'Read Incidents', description: 'Access incident reports' },
  { key: 'read:alerts', label: 'Read Alerts', description: 'Access active alerts' },
  { key: 'read:hotspots', label: 'Read Hotspots', description: 'Access predictive hotspots' },
  { key: 'write:incidents', label: 'Write Incidents', description: 'Submit new incidents' },
  { key: 'read:analytics', label: 'Read Analytics', description: 'Access analytics data' },
];

const APIKeysManager = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [newKeyOrg, setNewKeyOrg] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read:incidents', 'read:alerts']);
  const [expiresIn, setExpiresIn] = useState('never');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [rotatingKeyId, setRotatingKeyId] = useState<string | null>(null);
  const [selectedKeyForStats, setSelectedKeyForStats] = useState<string | null>(null);

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch usage statistics for API keys
  const { data: keyUsageStats } = useQuery({
    queryKey: ['api-key-usage-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('api_usage_logs')
        .select('api_key_id, response_status, created_at');
      
      const stats: Record<string, { total: number; success: number; lastUsed: string | null }> = {};
      
      data?.forEach((log: any) => {
        if (log.api_key_id) {
          if (!stats[log.api_key_id]) {
            stats[log.api_key_id] = { total: 0, success: 0, lastUsed: null };
          }
          stats[log.api_key_id].total += 1;
          if (log.response_status && log.response_status < 400) {
            stats[log.api_key_id].success += 1;
          }
          if (!stats[log.api_key_id].lastUsed || log.created_at > stats[log.api_key_id].lastUsed) {
            stats[log.api_key_id].lastUsed = log.created_at;
          }
        }
      });
      
      return stats;
    }
  });

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const apiKey = generateApiKey();
      const keyHash = await hashApiKey(apiKey);
      const keyPrefix = apiKey.substring(0, 8);

      let expiresAt = null;
      if (expiresIn !== 'never') {
        const days = parseInt(expiresIn);
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      }

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          name: newKeyName,
          description: newKeyDescription,
          organization_name: newKeyOrg || null,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          permissions: selectedPermissions,
          expires_at: expiresAt,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, full_key: apiKey };
    },
    onSuccess: (data) => {
      setGeneratedKey(data.full_key);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create API key: ' + error.message);
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key deleted');
    }
  });

  const toggleKeyMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    }
  });

  // Key rotation mutation
  const rotateKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const oldKey = apiKeys?.find((k: any) => k.id === keyId);
      if (!oldKey) throw new Error('Key not found');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newApiKey = generateApiKey();
      const newKeyHash = await hashApiKey(newApiKey);
      const newKeyPrefix = newApiKey.substring(0, 8);

      // Update the existing key with new hash
      const { error } = await supabase
        .from('api_keys')
        .update({ 
          key_hash: newKeyHash,
          key_prefix: newKeyPrefix,
          updated_at: new Date().toISOString()
        })
        .eq('id', keyId);

      if (error) throw error;
      return { keyId, newKey: newApiKey };
    },
    onSuccess: (data) => {
      setGeneratedKey(data.newKey);
      setRotatingKeyId(data.keyId);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key rotated successfully');
    },
    onError: (error) => {
      toast.error('Failed to rotate key: ' + error.message);
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getExpirationWarning = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const daysUntilExpiry = differenceInDays(new Date(expiresAt), new Date());
    if (daysUntilExpiry < 0) return { type: 'expired', message: 'Expired' };
    if (daysUntilExpiry <= 7) return { type: 'critical', message: `Expires in ${daysUntilExpiry} days` };
    if (daysUntilExpiry <= 30) return { type: 'warning', message: `Expires in ${daysUntilExpiry} days` };
    return null;
  };

  const handleCreateKey = () => {
    if (!newKeyName) {
      toast.error('Please provide a name for the API key');
      return;
    }
    createKeyMutation.mutate();
  };

  const resetForm = () => {
    setNewKeyName('');
    setNewKeyDescription('');
    setNewKeyOrg('');
    setSelectedPermissions(['read:incidents', 'read:alerts']);
    setExpiresIn('never');
    setGeneratedKey(null);
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys for external system access</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => { 
            if (!open) resetForm();
            setIsCreateOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              {generatedKey ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      API Key Created
                    </DialogTitle>
                    <DialogDescription>
                      Copy your API key now. You won't be able to see it again!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Make sure to copy your API key now. For security reasons, we won't show it again.
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        value={generatedKey}
                        readOnly
                        className="pr-10 font-mono text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => copyToClipboard(generatedKey)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={resetForm}>Done</Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Generate a new API key for external system integration
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Key Name *</Label>
                      <Input
                        placeholder="e.g., Production Server"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="What will this key be used for?"
                        value={newKeyDescription}
                        onChange={(e) => setNewKeyDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization Name</Label>
                      <Input
                        placeholder="e.g., UN OCHA"
                        value={newKeyOrg}
                        onChange={(e) => setNewKeyOrg(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-1 gap-2 p-3 border rounded-lg">
                        {availablePermissions.map((perm) => (
                          <div key={perm.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={perm.key}
                              checked={selectedPermissions.includes(perm.key)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPermissions([...selectedPermissions, perm.key]);
                                } else {
                                  setSelectedPermissions(selectedPermissions.filter(p => p !== perm.key));
                                }
                              }}
                            />
                            <label htmlFor={perm.key} className="flex-1 cursor-pointer">
                              <div className="font-medium text-sm">{perm.label}</div>
                              <div className="text-xs text-muted-foreground">{perm.description}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration</Label>
                      <select
                        className="w-full p-2 border rounded-md bg-background"
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(e.target.value)}
                      >
                        <option value="never">Never expires</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="365">1 year</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateKey} disabled={createKeyMutation.isPending}>
                      {createKeyMutation.isPending ? 'Creating...' : 'Create Key'}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : apiKeys?.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No API Keys</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first API key to start integrating
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys?.map((key: any) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{key.name}</h4>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {key.expires_at && new Date(key.expires_at) < new Date() && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {key.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="font-mono">{key.key_prefix}...</span>
                      {key.organization_name && (
                        <span>Org: {key.organization_name}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Created {format(new Date(key.created_at), 'MMM d, yyyy')}
                      </span>
                      {key.last_used_at && (
                        <span>Last used: {format(new Date(key.last_used_at), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {Array.isArray(key.permissions) && key.permissions.map((perm: string) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={key.is_active}
                      onCheckedChange={(checked) => 
                        toggleKeyMutation.mutate({ id: key.id, isActive: checked })
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteKeyMutation.mutate(key.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeysManager;
