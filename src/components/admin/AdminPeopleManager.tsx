import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAboutPeople, AboutPerson } from '@/hooks/useAboutPeople';
import { personSchema, validatePortrait } from '@/lib/aboutPeople';
import { PersonPortrait } from '@/components/about/PeopleSection';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
const blank = {name:'',role_title:'',category:'founder' as 'founder'|'team'|'partner',organization:'',bio:'',fun_intro:'',image_path:null as string|null,website_url:'',linkedin_url:'',display_order:0,is_published:false};
export default function AdminPeopleManager() {
 const {t}=useTranslationContext();
 const {data=[],isLoading,error,refetch}=useAboutPeople(true);
 const client=useQueryClient();
 const [open,setOpen]=useState(false), [editing,setEditing]=useState<AboutPerson|null>(null), [form,setForm]=useState(blank);
 const [file,setFile]=useState<File|null>(null), [preview,setPreview]=useState(''), [busy,setBusy]=useState(false), [removing,setRemoving]=useState<AboutPerson|null>(null);
 function start(person:AboutPerson|null) {setEditing(person);setForm(person ? {...person,category:person.category as typeof blank.category}:blank);setFile(null);setPreview('');setOpen(true);}
 async function save() {
  setBusy(true);let uploaded:string|null=null;
  try {
   let payload=personSchema.parse(form);
   if(file){ const ext=validatePortrait(file);uploaded=`${crypto.randomUUID()}.${ext}`;const {error}=await supabase.storage.from('about-portraits').upload(uploaded,file,{contentType:file.type});if(error)throw error;payload={...payload,image_path:uploaded}; }
   const values = {...payload, name: form.name.trim()};
   const result=editing ? await supabase.from('about_people').update(values).eq('id',editing.id).select().single() : await supabase.from('about_people').insert(values).select().single();
   if(result.error)throw result.error;
   if(editing?.image_path && editing.image_path!==payload.image_path) await supabase.storage.from('about-portraits').remove([editing.image_path]);
   await client.invalidateQueries({queryKey:['about-people']});toast.success(t('about.saved'));setOpen(false);
  }catch(e){if(uploaded)await supabase.storage.from('about-portraits').remove([uploaded]);toast.error(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 }
 async function remove(){if(!removing)return;setBusy(true);try{const {error}=await supabase.from('about_people').delete().eq('id',removing.id);if(error)throw error;if(removing.image_path)await supabase.storage.from('about-portraits').remove([removing.image_path]);await client.invalidateQueries({queryKey:['about-people']});toast.success(t('about.deleted'));setRemoving(null);}catch(e){toast.error(e instanceof Error?e.message:String(e));}finally{setBusy(false);}}
 return <section className="space-y-6"><div className="flex flex-wrap justify-between gap-4"><h2 className="text-2xl font-bold">{t('about.manage')}</h2><Button onClick={()=>start(null)} className="gap-2"><Plus className="h-4 w-4"/>{t('about.add')}</Button></div>
 {isLoading && <Loader2 className="animate-spin h-6 w-6"/>}{error && <div role="alert">{error.message}<Button onClick={()=>refetch()}>{t('about.retry')}</Button></div>}
 {!isLoading&&!data.length && <div className="py-12 border-y text-center"><h3 className="font-semibold">{t('about.adminEmpty')}</h3><p className="text-muted-foreground">{t('about.adminDetail')}</p></div>}
 <div className="divide-y divide-border">{data.map(p=><div key={p.id} className="flex items-center gap-4 py-4 min-w-0"><PersonPortrait person={p} className="w-16 h-16 shrink-0 rounded-md object-cover"/><div className="flex-1 min-w-0"><h3 className="font-semibold break-words">{p.name}</h3><p className="text-sm text-muted-foreground break-words">{p.role_title} · {t(`about.${p.category}`)}</p><span className={p.is_published?'text-success text-xs':'text-muted-foreground text-xs'}>{t(p.is_published?'about.published':'about.draft')}</span></div><Button size="icon" variant="ghost" title={t('about.edit')} aria-label={`${t('about.edit')} ${p.name}`} onClick={()=>start(p)}><Pencil className="h-4 w-4"/></Button><Button size="icon" variant="ghost" title={t('about.delete')} aria-label={`${t('about.delete')} ${p.name}`} onClick={()=>setRemoving(p)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>)}</div>
 <Dialog open={open} onOpenChange={v=>{if(!busy)setOpen(v);}}><DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{t(editing?'about.edit':'about.add')}</DialogTitle><DialogDescription>{t('about.manage')}</DialogDescription></DialogHeader><form onSubmit={e=>{e.preventDefault();void save();}} className="space-y-4">
 <div className="grid sm:grid-cols-2 gap-4">{(['name','role_title','organization','website_url','linkedin_url'] as const).map(key=><div key={key} className="space-y-2"><Label htmlFor={`person-${key}`}>{t(`about.${({role_title:'role',website_url:'website',linkedin_url:'linkedin'} as Record<string,string>)[key]||key}`)}</Label><Input id={`person-${key}`} value={form[key]} required={key==='name'} type={key.endsWith('_url')?'url':'text'} maxLength={key==='name'?120:key.endsWith('_url')?2048:160} onChange={e=>setForm({...form,[key]:e.target.value})}/></div>)}<div className="space-y-2"><Label>{t('about.category')}</Label><Select value={form.category} onValueChange={category=>setForm({...form,category:category as typeof blank.category})}><SelectTrigger aria-label={t('about.category')}><SelectValue/></SelectTrigger><SelectContent>{['founder','team','partner'].map(c=><SelectItem key={c} value={c}>{t(`about.${c}`)}</SelectItem>)}</SelectContent></Select></div></div>
 {(['bio','fun_intro'] as const).map(key=><div key={key} className="space-y-2"><Label htmlFor={`person-${key}`}>{t(key==='bio'?'about.bio':'about.fun')}</Label><Textarea id={`person-${key}`} value={form[key]} rows={key==='bio'?4:3} maxLength={key==='bio'?4000:500} onChange={e=>setForm({...form,[key]:e.target.value})}/></div>)}
 <div className="space-y-3"><Label htmlFor="person-photo">{t('about.photo')}</Label>{preview?<img src={preview} alt={form.name} className="w-32 h-32 object-cover rounded-md"/>:form.image_path&&editing?<PersonPortrait person={{...editing,image_path:form.image_path}} className="w-32 h-32 object-cover rounded-md"/>:null}<div className="flex flex-wrap items-center gap-3"><Upload className="h-4 w-4 text-primary"/><Input id="person-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];if(!f)return;try{validatePortrait(f);setFile(f);const reader=new FileReader();reader.onload=()=>setPreview(String(reader.result));reader.readAsDataURL(f);}catch(err){toast.error(err instanceof Error?err.message:String(err));e.target.value='';}}}/><Button type="button" variant="ghost" onClick={()=>{setFile(null);setPreview('');setForm({...form,image_path:null});}}>{t('about.removePhoto')}</Button></div><p className="text-xs text-muted-foreground">{t('about.photoHint')}</p></div>
 <div className="flex flex-wrap gap-6 items-center"><div className="space-y-2"><Label htmlFor="person-order">{t('about.order')}</Label><Input id="person-order" type="number" min={0} className="w-28" value={form.display_order} onChange={e=>setForm({...form,display_order:Number(e.target.value)})}/></div><div className="flex items-center gap-3"><Switch id="person-published" checked={form.is_published} onCheckedChange={is_published=>setForm({...form,is_published})}/><Label htmlFor="person-published">{t('about.published')}</Label></div></div>
 <div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="outline" disabled={busy} onClick={()=>setOpen(false)}>{t('about.cancel')}</Button><Button type="submit" disabled={busy}>{busy?t('about.saving'):t('about.save')}</Button></div></form></DialogContent></Dialog>
 <Dialog open={!!removing} onOpenChange={v=>{if(!v&&!busy)setRemoving(null);}}><DialogContent><DialogHeader><DialogTitle>{t('about.deleteTitle')}</DialogTitle><DialogDescription>{t('about.deleteDetail')}</DialogDescription></DialogHeader><p>{removing?.name}</p><div className="flex justify-end gap-3"><Button variant="outline" onClick={()=>setRemoving(null)} disabled={busy}>{t('about.cancel')}</Button><Button variant="destructive" onClick={()=>void remove()} disabled={busy}>{t('about.delete')}</Button></div></DialogContent></Dialog>
 </section>;
}
