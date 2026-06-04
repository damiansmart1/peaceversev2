import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HeartHandshake, Plus, Users, DollarSign, Target, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  suspended: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export const PartnerImpactTracker = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    organization_name: '', programme_name: '', description: '',
    country: '', region: '', status: 'active',
    start_date: '', end_date: '',
    budget_usd: '', spent_usd: '',
    beneficiaries_target: '', beneficiaries_reached: '',
    outcome_summary: '', donor: '',
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['partner-interventions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('partner_interventions' as any).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const totals = useMemo(() => {
    return (items as any[]).reduce((acc, i) => ({
      programmes: acc.programmes + 1,
      active: acc.active + (i.status === 'active' ? 1 : 0),
      budget: acc.budget + Number(i.budget_usd || 0),
      spent: acc.spent + Number(i.spent_usd || 0),
      target: acc.target + Number(i.beneficiaries_target || 0),
      reached: acc.reached + Number(i.beneficiaries_reached || 0),
    }), { programmes: 0, active: 0, budget: 0, spent: 0, target: 0, reached: 0 });
  }, [items]);

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const payload: any = { ...form, created_by: user.id };
      ['budget_usd','spent_usd','beneficiaries_target','beneficiaries_reached'].forEach(k => {
        payload[k] = payload[k] === '' ? 0 : Number(payload[k]);
      });
      ['start_date','end_date'].forEach(k => { if (!payload[k]) payload[k] = null; });
      const { error } = await supabase.from('partner_interventions' as any).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false); qc.invalidateQueries({ queryKey: ['partner-interventions'] });
      setForm({ organization_name: '', programme_name: '', description: '', country: '', region: '', status: 'active', start_date: '', end_date: '', budget_usd: '', spent_usd: '', beneficiaries_target: '', beneficiaries_reached: '', outcome_summary: '', donor: '' });
      toast.success('Programme added');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('partner_interventions' as any).delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['partner-interventions'] }); toast.success('Removed'); },
  });

  const downloadCsv = () => {
    if (!items.length) return;
    const cols = ['organization_name','programme_name','country','region','status','start_date','end_date','budget_usd','spent_usd','beneficiaries_target','beneficiaries_reached','donor','outcome_summary'];
    const rows = [cols.join(',')].concat(
      (items as any[]).map(i => cols.map(c => JSON.stringify(i[c] ?? '')).join(','))
    );
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `impact-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const beneficiariesPct = totals.target > 0 ? Math.min(100, Math.round((totals.reached / totals.target) * 100)) : 0;
  const budgetPct = totals.budget > 0 ? Math.min(100, Math.round((totals.spent / totals.budget) * 100)) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-primary" /> Funding & Impact Tracker</CardTitle>
            <CardDescription>Programmes, beneficiaries reached, budget utilisation, donor-ready outcomes</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={downloadCsv} className="gap-2"><Download className="w-4 h-4" /> CSV</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add programme</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>New programme</DialogTitle><DialogDescription>Track funding & impact for a peacebuilding intervention</DialogDescription></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Organization" value={form.organization_name} onChange={(e) => setForm({...form, organization_name: e.target.value})} />
                  <Input placeholder="Programme name *" value={form.programme_name} onChange={(e) => setForm({...form, programme_name: e.target.value})} />
                  <Input placeholder="Country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} />
                  <Input placeholder="Region" value={form.region} onChange={(e) => setForm({...form, region: e.target.value})} />
                  <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Donor" value={form.donor} onChange={(e) => setForm({...form, donor: e.target.value})} />
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} />
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} />
                  <Input type="number" placeholder="Budget (USD)" value={form.budget_usd} onChange={(e) => setForm({...form, budget_usd: e.target.value})} />
                  <Input type="number" placeholder="Spent (USD)" value={form.spent_usd} onChange={(e) => setForm({...form, spent_usd: e.target.value})} />
                  <Input type="number" placeholder="Beneficiaries target" value={form.beneficiaries_target} onChange={(e) => setForm({...form, beneficiaries_target: e.target.value})} />
                  <Input type="number" placeholder="Beneficiaries reached" value={form.beneficiaries_reached} onChange={(e) => setForm({...form, beneficiaries_reached: e.target.value})} />
                  <Textarea className="col-span-2" placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                  <Textarea className="col-span-2" placeholder="Outcome summary (donor-ready)" rows={3} value={form.outcome_summary} onChange={(e) => setForm({...form, outcome_summary: e.target.value})} />
                </div>
                <DialogFooter><Button onClick={() => create.mutate()} disabled={!form.programme_name || !form.organization_name || create.isPending}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Roll-up metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground">Programmes</p>
            <p className="text-2xl font-bold">{totals.programmes}</p>
            <p className="text-[10px] text-muted-foreground">{totals.active} active</p>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" /> Budget Utilisation</p>
            <p className="text-2xl font-bold">${(totals.spent/1000).toFixed(1)}k</p>
            <Progress value={budgetPct} className="h-1.5 mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1">of ${(totals.budget/1000).toFixed(1)}k ({budgetPct}%)</p>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Beneficiaries</p>
            <p className="text-2xl font-bold">{totals.reached.toLocaleString()}</p>
            <Progress value={beneficiariesPct} className="h-1.5 mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1">of {totals.target.toLocaleString()} ({beneficiariesPct}%)</p>
          </div>
          <div className="p-3 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Avg Cost / Beneficiary</p>
            <p className="text-2xl font-bold">${totals.reached > 0 ? Math.round(totals.spent / totals.reached).toLocaleString() : '—'}</p>
            <p className="text-[10px] text-muted-foreground">Across all programmes</p>
          </div>
        </div>

        <ScrollArea className="h-[440px]">
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
           items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No programmes tracked yet — click <strong>Add programme</strong> to begin.</p> :
           <div className="space-y-3">
             {items.map((i: any) => {
               const pct = i.beneficiaries_target > 0 ? Math.round((i.beneficiaries_reached / i.beneficiaries_target) * 100) : 0;
               const budgetUsedPct = i.budget_usd > 0 ? Math.round((i.spent_usd / i.budget_usd) * 100) : 0;
               return (
                 <div key={i.id} className="p-4 rounded-lg border bg-card">
                   <div className="flex items-start justify-between gap-3 mb-2">
                     <div className="min-w-0">
                       <div className="flex items-center gap-2 flex-wrap">
                         <h4 className="font-semibold text-sm">{i.programme_name}</h4>
                         <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[i.status]}`}>{i.status}</Badge>
                       </div>
                       <p className="text-xs text-muted-foreground">{i.organization_name}{i.donor && ` · funded by ${i.donor}`}</p>
                       {(i.country || i.region) && <p className="text-[11px] text-muted-foreground">{[i.region, i.country].filter(Boolean).join(', ')}</p>}
                     </div>
                     <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => remove.mutate(i.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                   </div>
                   {i.description && <p className="text-xs text-muted-foreground mb-3">{i.description}</p>}
                   <div className="grid grid-cols-2 gap-3 text-xs">
                     <div>
                       <div className="flex justify-between mb-1"><span className="text-muted-foreground">Beneficiaries</span><span>{i.beneficiaries_reached?.toLocaleString()} / {i.beneficiaries_target?.toLocaleString()}</span></div>
                       <Progress value={pct} className="h-1.5" />
                     </div>
                     <div>
                       <div className="flex justify-between mb-1"><span className="text-muted-foreground">Budget</span><span>${Number(i.spent_usd).toLocaleString()} / ${Number(i.budget_usd).toLocaleString()}</span></div>
                       <Progress value={budgetUsedPct} className="h-1.5" />
                     </div>
                   </div>
                   {i.outcome_summary && <div className="mt-3 p-2 rounded bg-muted/40 text-xs"><span className="font-medium">Outcome: </span>{i.outcome_summary}</div>}
                   <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                     {i.start_date && <span>Start: {format(new Date(i.start_date), 'MMM d, yyyy')}</span>}
                     {i.end_date && <span>End: {format(new Date(i.end_date), 'MMM d, yyyy')}</span>}
                   </div>
                 </div>
               );
             })}
           </div>
          }
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
