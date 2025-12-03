import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Gauge, AlertTriangle, Key, Clock, TrendingUp, 
  Settings, Shield, Ban, CheckCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format, subMinutes } from 'date-fns';

const APIRateLimits = () => {
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<any>(null);
  const [newRateLimit, setNewRateLimit] = useState(60);
  const [newIpWhitelist, setNewIpWhitelist] = useState('');

  // Fetch API keys with usage stats
  const { data: apiKeysWithUsage } = useQuery({
    queryKey: ['api-keys-with-usage'],
    queryFn: async () => {
      const { data: keys } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      const now = new Date();
      const minuteAgo = subMinutes(now, 1);

      const { data: recentLogs } = await supabase
        .from('api_usage_logs')
        .select('api_key_id, created_at')
        .gte('created_at', minuteAgo.toISOString());

      // Calculate current usage per key
      const usagePerKey: Record<string, number> = {};
      recentLogs?.forEach((log: any) => {
        if (log.api_key_id) {
          usagePerKey[log.api_key_id] = (usagePerKey[log.api_key_id] || 0) + 1;
        }
      });

      return keys?.map((key: any) => ({
        ...key,
        currentUsage: usagePerKey[key.id] || 0,
        usagePercent: Math.min(100, ((usagePerKey[key.id] || 0) / (key.rate_limit_per_minute || 60)) * 100)
      })) || [];
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Fetch overall rate limit stats
  const { data: rateLimitStats } = useQuery({
    queryKey: ['rate-limit-stats'],
    queryFn: async () => {
      const now = new Date();
      const hourAgo = subMinutes(now, 60);

      const { data: logs } = await supabase
        .from('api_usage_logs')
        .select('response_status, api_key_id, created_at')
        .gte('created_at', hourAgo.toISOString());

      const rateLimitedRequests = logs?.filter((l: any) => l.response_status === 429).length || 0;
      const totalRequests = logs?.length || 0;
      const blockedPercentage = totalRequests > 0 ? ((rateLimitedRequests / totalRequests) * 100).toFixed(2) : '0.00';

      // Group by minute for trend
      const minuteGroups: Record<string, { total: number; blocked: number }> = {};
      logs?.forEach((log: any) => {
        const minute = format(new Date(log.created_at), 'HH:mm');
        if (!minuteGroups[minute]) {
          minuteGroups[minute] = { total: 0, blocked: 0 };
        }
        minuteGroups[minute].total += 1;
        if (log.response_status === 429) {
          minuteGroups[minute].blocked += 1;
        }
      });

      return {
        totalRequests,
        rateLimitedRequests,
        blockedPercentage: parseFloat(blockedPercentage),
        trend: Object.entries(minuteGroups).slice(-10).map(([minute, stats]) => ({
          minute,
          ...stats
        }))
      };
    }
  });

  // Update rate limit mutation
  const updateRateLimitMutation = useMutation({
    mutationFn: async ({ id, rateLimit, ipWhitelist }: { id: string; rateLimit: number; ipWhitelist: string[] }) => {
      const { error } = await supabase
        .from('api_keys')
        .update({ 
          rate_limit_per_minute: rateLimit,
          // Note: IP whitelist would need a new column in the database
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys-with-usage'] });
      toast.success('Rate limit updated');
      setEditingKey(null);
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    }
  });

  const handleSaveRateLimit = () => {
    if (editingKey) {
      const ipList = newIpWhitelist.split(',').map(ip => ip.trim()).filter(ip => ip);
      updateRateLimitMutation.mutate({
        id: editingKey.id,
        rateLimit: newRateLimit,
        ipWhitelist: ipList
      });
    }
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-500';
    if (percent >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Rate Limit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Gauge className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{rateLimitStats?.totalRequests || 0}</p>
                <p className="text-xs text-muted-foreground">Last hour</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-500/10">
                <Ban className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rate Limited</p>
                <p className="text-2xl font-bold">{rateLimitStats?.rateLimitedRequests || 0}</p>
                <p className="text-xs text-muted-foreground">{rateLimitStats?.blockedPercentage || 0}% of requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Key className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Keys</p>
                <p className="text-2xl font-bold">{apiKeysWithUsage?.filter((k: any) => k.is_active).length || 0}</p>
                <p className="text-xs text-muted-foreground">Currently in use</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Near Limit</p>
                <p className="text-2xl font-bold">
                  {apiKeysWithUsage?.filter((k: any) => k.usagePercent >= 70).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Keys at &gt;70% usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limits per API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            API Key Rate Limits
          </CardTitle>
          <CardDescription>Configure and monitor rate limits for each API key</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>API Key</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Rate Limit</TableHead>
                <TableHead>Current Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeysWithUsage?.map((key: any) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{key.key_prefix}...</p>
                    </div>
                  </TableCell>
                  <TableCell>{key.organization_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {key.rate_limit_per_minute || 60}/min
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className={getUsageColor(key.usagePercent)}>
                          {key.currentUsage}/{key.rate_limit_per_minute || 60}
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(key.usagePercent)}%
                        </span>
                      </div>
                      <Progress 
                        value={key.usagePercent} 
                        className={`h-2 ${getProgressColor(key.usagePercent)}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {key.usagePercent >= 90 ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Critical
                      </Badge>
                    ) : key.usagePercent >= 70 ? (
                      <Badge variant="secondary" className="gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Warning
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Normal
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingKey(key);
                        setNewRateLimit(key.rate_limit_per_minute || 60);
                        setNewIpWhitelist('');
                      }}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!apiKeysWithUsage || apiKeysWithUsage.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No API keys found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rate Limit Configuration Dialog */}
      <Dialog open={!!editingKey} onOpenChange={() => setEditingKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Rate Limit</DialogTitle>
            <DialogDescription>
              Adjust rate limiting settings for {editingKey?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Requests per Minute</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={newRateLimit}
                  onChange={(e) => setNewRateLimit(parseInt(e.target.value) || 60)}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">requests/minute</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {editingKey?.rate_limit_per_minute || 60} req/min
              </p>
            </div>

            <div className="space-y-2">
              <Label>IP Whitelist (Optional)</Label>
              <Input
                placeholder="192.168.1.1, 10.0.0.1"
                value={newIpWhitelist}
                onChange={(e) => setNewIpWhitelist(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of IPs that bypass rate limiting
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                Rate Limit Tiers
              </h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setNewRateLimit(30)}
                  className={newRateLimit === 30 ? 'border-primary' : ''}
                >
                  Basic (30/min)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setNewRateLimit(60)}
                  className={newRateLimit === 60 ? 'border-primary' : ''}
                >
                  Standard (60/min)
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setNewRateLimit(120)}
                  className={newRateLimit === 120 ? 'border-primary' : ''}
                >
                  Premium (120/min)
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingKey(null)}>Cancel</Button>
            <Button onClick={handleSaveRateLimit} disabled={updateRateLimitMutation.isPending}>
              {updateRateLimitMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APIRateLimits;
