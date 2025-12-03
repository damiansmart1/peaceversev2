import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-typed';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Activity, Shield, Globe } from 'lucide-react';
import type { PeaceMetrics, AccountabilityMetrics, RegionalBlock, AfricanCountry } from '@/hooks/usePeaceMetrics';

const AdminPeaceMetricsManager = () => {
  const queryClient = useQueryClient();
  const [editingMetric, setEditingMetric] = useState<PeaceMetrics | null>(null);
  const [editingAccountability, setEditingAccountability] = useState<AccountabilityMetrics | null>(null);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [isAddingAccountability, setIsAddingAccountability] = useState(false);

  // Fetch data
  const { data: peaceMetrics } = useQuery({
    queryKey: ['admin-peace-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peace_pulse_metrics')
        .select('*')
        .order('calculated_at', { ascending: false });
      if (error) throw error;
      return data as PeaceMetrics[];
    },
  });

  const { data: accountabilityMetrics } = useQuery({
    queryKey: ['admin-accountability-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peace_accountability_metrics')
        .select('*')
        .order('calculated_at', { ascending: false });
      if (error) throw error;
      return data as AccountabilityMetrics[];
    },
  });

  const { data: countries } = useQuery({
    queryKey: ['admin-countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('african_countries')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data as AfricanCountry[];
    },
  });

  const { data: regionalBlocks } = useQuery({
    queryKey: ['admin-regional-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_blocks')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data as RegionalBlock[];
    },
  });

  // Mutations
  const savePeaceMetric = useMutation({
    mutationFn: async (metric: Partial<PeaceMetrics>) => {
      if (metric.id) {
        const { error } = await supabase
          .from('peace_pulse_metrics')
          .update(metric)
          .eq('id', metric.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('peace_pulse_metrics')
          .insert(metric);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-peace-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['peace-pulse'] });
      toast.success('Peace metric saved successfully');
      setEditingMetric(null);
      setIsAddingMetric(false);
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const deletePeaceMetric = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('peace_pulse_metrics')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-peace-metrics'] });
      toast.success('Metric deleted');
    },
  });

  const saveAccountabilityMetric = useMutation({
    mutationFn: async (metric: Partial<AccountabilityMetrics>) => {
      if (metric.id) {
        const { error } = await supabase
          .from('peace_accountability_metrics')
          .update(metric)
          .eq('id', metric.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('peace_accountability_metrics')
          .insert(metric);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accountability-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['accountability'] });
      toast.success('Accountability metric saved successfully');
      setEditingAccountability(null);
      setIsAddingAccountability(false);
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const deleteAccountabilityMetric = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('peace_accountability_metrics')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accountability-metrics'] });
      toast.success('Metric deleted');
    },
  });

  const getCountryName = (code: string) => {
    return countries?.find(c => c.code === code)?.name || code;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Peace Pulse Data Management</h2>
          <p className="text-muted-foreground">Manage peace metrics and accountability data for all countries</p>
        </div>
      </div>

      <Tabs defaultValue="peace-metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="peace-metrics" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Peace Metrics
          </TabsTrigger>
          <TabsTrigger value="accountability" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Accountability
          </TabsTrigger>
          <TabsTrigger value="regions" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Regions & Countries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peace-metrics" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Peace Pulse Metrics</CardTitle>
                <CardDescription>Manage sentiment, tension, and risk data by country</CardDescription>
              </div>
              <Dialog open={isAddingMetric} onOpenChange={setIsAddingMetric}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" />Add Metric</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Peace Metric</DialogTitle>
                  </DialogHeader>
                  <PeaceMetricForm 
                    countries={countries || []} 
                    onSave={(data) => savePeaceMetric.mutate(data)}
                    onCancel={() => setIsAddingMetric(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Tension</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peaceMetrics?.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell className="font-medium">{getCountryName(metric.country_code)}</TableCell>
                      <TableCell>{metric.sentiment_average ? `${(Number(metric.sentiment_average) * 100).toFixed(0)}%` : 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          metric.tension_level === 'critical' ? 'bg-destructive/20 text-destructive' :
                          metric.tension_level === 'high' ? 'bg-orange-500/20 text-orange-600' :
                          metric.tension_level === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                          'bg-green-500/20 text-green-600'
                        }`}>
                          {metric.tension_level || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{metric.risk_score ? `${(Number(metric.risk_score) * 100).toFixed(0)}%` : 'N/A'}</TableCell>
                      <TableCell>{metric.activity_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(metric.calculated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingMetric(metric)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Peace Metric</DialogTitle>
                              </DialogHeader>
                              <PeaceMetricForm 
                                metric={metric}
                                countries={countries || []} 
                                onSave={(data) => savePeaceMetric.mutate({ ...data, id: metric.id })}
                                onCancel={() => setEditingMetric(null)}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deletePeaceMetric.mutate(metric.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accountability" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Accountability Metrics</CardTitle>
                <CardDescription>Track incident resolution and response performance</CardDescription>
              </div>
              <Dialog open={isAddingAccountability} onOpenChange={setIsAddingAccountability}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" />Add Metric</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Accountability Metric</DialogTitle>
                  </DialogHeader>
                  <AccountabilityMetricForm 
                    countries={countries || []} 
                    onSave={(data) => saveAccountabilityMetric.mutate(data)}
                    onCancel={() => setIsAddingAccountability(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Accountability</TableHead>
                    <TableHead>Avg Response</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountabilityMetrics?.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell className="font-medium">{getCountryName(metric.country_code)}</TableCell>
                      <TableCell>{metric.incidents_reported}</TableCell>
                      <TableCell>{metric.incidents_verified}</TableCell>
                      <TableCell className="text-green-600">{metric.incidents_resolved}</TableCell>
                      <TableCell>
                        {metric.accountability_index ? `${(Number(metric.accountability_index) * 100).toFixed(0)}%` : 'N/A'}
                      </TableCell>
                      <TableCell>{metric.avg_response_time || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingAccountability(metric)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Accountability Metric</DialogTitle>
                              </DialogHeader>
                              <AccountabilityMetricForm 
                                metric={metric}
                                countries={countries || []} 
                                onSave={(data) => saveAccountabilityMetric.mutate({ ...data, id: metric.id })}
                                onCancel={() => setEditingAccountability(null)}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteAccountabilityMetric.mutate(metric.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Economic Blocks</CardTitle>
                <CardDescription>African regional organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {regionalBlocks?.map((block) => (
                    <div key={block.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{block.name}</div>
                        <div className="text-sm text-muted-foreground">{block.full_name}</div>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {countries?.filter(c => c.regional_block_id === block.id).length || 0} countries
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Countries</CardTitle>
                <CardDescription>All African countries in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-y-auto space-y-1">
                  {countries?.map((country) => (
                    <div key={country.id} className="flex justify-between items-center p-2 hover:bg-muted rounded">
                      <span className="font-medium">{country.name}</span>
                      <span className="text-xs text-muted-foreground">{country.code}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Peace Metric Form Component
const PeaceMetricForm = ({ 
  metric, 
  countries, 
  onSave, 
  onCancel 
}: { 
  metric?: PeaceMetrics; 
  countries: AfricanCountry[];
  onSave: (data: Partial<PeaceMetrics>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    country_code: metric?.country_code || '',
    sentiment_average: metric?.sentiment_average?.toString() || '',
    tension_level: metric?.tension_level || '',
    activity_count: metric?.activity_count?.toString() || '0',
    risk_score: metric?.risk_score?.toString() || '',
    trending_topics: JSON.stringify(metric?.trending_topics || [], null, 2),
    hotspot_locations: JSON.stringify(metric?.hotspot_locations || [], null, 2),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      country_code: formData.country_code,
      sentiment_average: formData.sentiment_average ? parseFloat(formData.sentiment_average) : null,
      tension_level: formData.tension_level || null,
      activity_count: parseInt(formData.activity_count) || 0,
      risk_score: formData.risk_score ? parseFloat(formData.risk_score) : null,
      trending_topics: JSON.parse(formData.trending_topics || '[]'),
      hotspot_locations: JSON.parse(formData.hotspot_locations || '[]'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={formData.country_code} onValueChange={(v) => setFormData(prev => ({ ...prev, country_code: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tension Level</Label>
          <Select value={formData.tension_level} onValueChange={(v) => setFormData(prev => ({ ...prev, tension_level: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sentiment Average (0-1)</Label>
          <Input 
            type="number" 
            step="0.01" 
            min="0" 
            max="1"
            value={formData.sentiment_average}
            onChange={(e) => setFormData(prev => ({ ...prev, sentiment_average: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Risk Score (0-1)</Label>
          <Input 
            type="number" 
            step="0.01" 
            min="0" 
            max="1"
            value={formData.risk_score}
            onChange={(e) => setFormData(prev => ({ ...prev, risk_score: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Activity Count</Label>
          <Input 
            type="number"
            value={formData.activity_count}
            onChange={(e) => setFormData(prev => ({ ...prev, activity_count: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Trending Topics (JSON array)</Label>
        <Textarea 
          value={formData.trending_topics}
          onChange={(e) => setFormData(prev => ({ ...prev, trending_topics: e.target.value }))}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Hotspot Locations (JSON array)</Label>
        <Textarea 
          value={formData.hotspot_locations}
          onChange={(e) => setFormData(prev => ({ ...prev, hotspot_locations: e.target.value }))}
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

// Accountability Metric Form Component
const AccountabilityMetricForm = ({ 
  metric, 
  countries, 
  onSave, 
  onCancel 
}: { 
  metric?: AccountabilityMetrics; 
  countries: AfricanCountry[];
  onSave: (data: Partial<AccountabilityMetrics>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    country_code: metric?.country_code || '',
    incidents_reported: metric?.incidents_reported?.toString() || '0',
    incidents_verified: metric?.incidents_verified?.toString() || '0',
    incidents_resolved: metric?.incidents_resolved?.toString() || '0',
    avg_response_time: metric?.avg_response_time || '',
    avg_resolution_time: metric?.avg_resolution_time || '',
    accountability_index: metric?.accountability_index?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      country_code: formData.country_code,
      incidents_reported: parseInt(formData.incidents_reported) || 0,
      incidents_verified: parseInt(formData.incidents_verified) || 0,
      incidents_resolved: parseInt(formData.incidents_resolved) || 0,
      avg_response_time: formData.avg_response_time || null,
      avg_resolution_time: formData.avg_resolution_time || null,
      accountability_index: formData.accountability_index ? parseFloat(formData.accountability_index) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={formData.country_code} onValueChange={(v) => setFormData(prev => ({ ...prev, country_code: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Accountability Index (0-1)</Label>
          <Input 
            type="number" 
            step="0.01" 
            min="0" 
            max="1"
            value={formData.accountability_index}
            onChange={(e) => setFormData(prev => ({ ...prev, accountability_index: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Incidents Reported</Label>
          <Input 
            type="number"
            value={formData.incidents_reported}
            onChange={(e) => setFormData(prev => ({ ...prev, incidents_reported: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Incidents Verified</Label>
          <Input 
            type="number"
            value={formData.incidents_verified}
            onChange={(e) => setFormData(prev => ({ ...prev, incidents_verified: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Incidents Resolved</Label>
          <Input 
            type="number"
            value={formData.incidents_resolved}
            onChange={(e) => setFormData(prev => ({ ...prev, incidents_resolved: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Avg Response Time</Label>
          <Input 
            placeholder="e.g. 4.2 hours"
            value={formData.avg_response_time}
            onChange={(e) => setFormData(prev => ({ ...prev, avg_response_time: e.target.value }))}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Avg Resolution Time</Label>
          <Input 
            placeholder="e.g. 3.5 days"
            value={formData.avg_resolution_time}
            onChange={(e) => setFormData(prev => ({ ...prev, avg_resolution_time: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default AdminPeaceMetricsManager;
