import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { StickyNote, CheckSquare, Plus, Pin, Trash2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const PartnerCollaboration = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" /> Partner Workspace
        </CardTitle>
        <CardDescription>Shared notes and tasks across your partner network</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notes">
          <TabsList className="grid grid-cols-2 w-full md:w-fit">
            <TabsTrigger value="notes" className="gap-2"><StickyNote className="w-4 h-4" /> Notes</TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2"><CheckSquare className="w-4 h-4" /> Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="notes" className="mt-4"><NotesPanel /></TabsContent>
          <TabsContent value="tasks" className="mt-4"><TasksPanel /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const NotesPanel = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['partner-notes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('partner_notes' as any).select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const { error } = await supabase.from('partner_notes' as any).insert({ title, body, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => { setOpen(false); setTitle(''); setBody(''); qc.invalidateQueries({ queryKey: ['partner-notes'] }); toast.success('Note saved'); },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePin = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const { error } = await supabase.from('partner_notes' as any).update({ is_pinned: val }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-notes'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('partner_notes' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['partner-notes'] }); toast.success('Deleted'); },
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New note</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New shared note</DialogTitle><DialogDescription>Visible to all partner-role users</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Body…" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <DialogFooter><Button onClick={() => create.mutate()} disabled={!title || create.isPending}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="h-[420px]">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
         notes.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No notes yet</p> :
         <div className="space-y-2">
           <AnimatePresence>
             {notes.map((n: any) => (
               <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                 className="p-3 rounded-lg border bg-card">
                 <div className="flex items-start justify-between gap-2">
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                       {n.is_pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                       <h4 className="font-medium text-sm truncate">{n.title}</h4>
                     </div>
                     <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4">{n.body}</p>
                     <p className="text-[10px] text-muted-foreground mt-2">{format(new Date(n.created_at), 'MMM d, yyyy h:mm a')}</p>
                   </div>
                   <div className="flex gap-1">
                     <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePin.mutate({ id: n.id, val: !n.is_pinned })}><Pin className="w-3.5 h-3.5" /></Button>
                     <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove.mutate(n.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                   </div>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
         </div>
        }
      </ScrollArea>
    </div>
  );
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const TasksPanel = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['partner-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('partner_tasks' as any).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');
      const { error } = await supabase.from('partner_tasks' as any).insert({
        title: form.title, description: form.description, priority: form.priority,
        due_date: form.due_date || null, created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { setOpen(false); setForm({ title: '', description: '', priority: 'medium', due_date: '' }); qc.invalidateQueries({ queryKey: ['partner-tasks'] }); toast.success('Task created'); },
    onError: (e: any) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('partner_tasks' as any).update({
        status, completed_at: status === 'done' ? new Date().toISOString() : null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-tasks'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('partner_tasks' as any).delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['partner-tasks'] }); toast.success('Deleted'); },
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
            </div>
            <DialogFooter><Button onClick={() => create.mutate()} disabled={!form.title || create.isPending}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="h-[420px]">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
         tasks.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No tasks yet</p> :
         <div className="space-y-2">
           {tasks.map((t: any) => (
             <div key={t.id} className="p-3 rounded-lg border bg-card flex items-start gap-3">
               <Checkbox checked={t.status === 'done'} onCheckedChange={(checked) => setStatus.mutate({ id: t.id, status: checked ? 'done' : 'todo' })} className="mt-1" />
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 flex-wrap">
                   <p className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                   <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</Badge>
                   <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                 </div>
                 {t.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
                 <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                   {t.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(t.due_date), 'MMM d')}</span>}
                   {t.assigned_to && <span className="flex items-center gap-1"><User className="w-3 h-3" />Assigned</span>}
                 </div>
               </div>
               <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove.mutate(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
             </div>
           ))}
         </div>
        }
      </ScrollArea>
    </div>
  );
};
