import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCreateProposal } from '@/hooks/useProposals';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslationContext } from '@/components/TranslationProvider';
import MaterialEditor from '@/components/participation/MaterialEditor';
import { saveParticipationMaterials } from '@/hooks/useParticipationMaterials';
import { type MaterialDraft } from '@/lib/participation';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({ title: z.string().trim().min(5).max(200), body: z.string().trim().min(20).max(10000), jurisdiction: z.string().trim().max(200) });
export default function CreateProposalDialog() {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const create = useCreateProposal();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('governance');
  const [jurisdiction, setJurisdiction] = useState('');
  const [deadline, setDeadline] = useState('');
  const [materials, setMaterials] = useState<MaterialDraft[]>([]);
  const [savedId, setSavedId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submit = async (draft: boolean) => {
    setBusy(true);
    try {
      const v = schema.parse({title, body, jurisdiction});
      const proposal = savedId ? {id:savedId} : await create.mutateAsync({ ...v, summary:v.body.slice(0,500), tags:[category], billProposerName:'', parliamentaryStage:'first_reading', category, responseRequiredBy:deadline ? new Date(deadline+'T23:59:59').toISOString() : undefined, draft });
      setSavedId(proposal.id);
      await saveParticipationMaterials('proposal', proposal.id, materials);
      toast.success(t(draft ? 'participation.savedDraft' : 'participation.submitted'));
      setOpen(false); setSavedId(undefined); setTitle(''); setBody(''); setMaterials([]); setJurisdiction(''); setDeadline('');
    } catch(e) {toast.error(e instanceof Error ? e.message : t('participation.error'));} finally {setBusy(false);}
  };
  if (!user || user.is_anonymous) return null;
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><Button data-create-proposal className="gap-2"><Plus className="h-4 w-4" />{t('participation.createProposal')}</Button></DialogTrigger>
    <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{t('participation.newProposal')}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div><Label htmlFor="proposal-title">{t('participation.title')}</Label><Input id="proposal-title" maxLength={200} value={title} disabled={!!savedId} onChange={e=>setTitle(e.target.value)} /></div>
        <div><Label htmlFor="proposal-body">{t('participation.summary')}</Label><Textarea id="proposal-body" rows={6} maxLength={10000} value={body} disabled={!!savedId} onChange={e=>setBody(e.target.value)} /></div>
        <div><Label>{t('participation.category')}</Label><Select value={category} onValueChange={setCategory} disabled={!!savedId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['governance','community','safety','environment','education','health','digital_rights'].map(c=><SelectItem key={c} value={c}>{c==='digital_rights' ? t('participation.governance') : t('polls.categories.'+c)}</SelectItem>)}</SelectContent></Select></div>
        <div><Label htmlFor="proposal-institution">{t('participation.institution')}</Label><Input id="proposal-institution" maxLength={200} value={jurisdiction} disabled={!!savedId} onChange={e=>setJurisdiction(e.target.value)} /></div>
        <div><Label htmlFor="proposal-deadline">{t('participation.deadline')}</Label><Input id="proposal-deadline" type="date" value={deadline} disabled={!!savedId} onChange={e=>setDeadline(e.target.value)} /></div>
        <MaterialEditor value={materials} onChange={setMaterials} />
        <div className="flex flex-wrap justify-end gap-2 border-t pt-4"><Button variant="outline" disabled={busy} onClick={()=>submit(true)}>{t('participation.draft')}</Button><Button disabled={busy} onClick={()=>submit(false)}>{t(busy ? 'participation.pending' : 'participation.publish')}</Button></div>
      </div>
    </DialogContent>
  </Dialog>;
}
