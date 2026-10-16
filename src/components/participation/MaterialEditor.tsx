import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Trash2, Paperclip } from 'lucide-react';
import { useTranslationContext } from '@/components/TranslationProvider';
import { materialSchema, validateMaterialFile, type MaterialDraft } from '@/lib/participation';
import { toast } from 'sonner';

export default function MaterialEditor({ value, onChange }: { value: MaterialDraft[]; onChange: (v: MaterialDraft[]) => void }) {
  const { t, language } = useTranslationContext();
  const id = useId();
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File>();
  const [sourceLanguage, setSourceLanguage] = useState<string>(language);
  const add = () => {
    try {
      const validated = materialSchema.parse({ title, context, language: sourceLanguage, url: url || undefined });
      if (file) validateMaterialFile(file);
      if (!file && !url) throw new Error(t('participation.file'));
      onChange([...value, { ...validated, file }]);
      setTitle(''); setContext(''); setUrl(''); setFile(undefined);
      const input = document.getElementById(`${id}-file`) as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (e) { toast.error(e instanceof Error ? e.message : t('participation.error')); }
  };
  return <section className="space-y-3 border-t pt-4 min-w-0">
    <h3 className="font-semibold flex items-center gap-2"><Paperclip className="h-4 w-4 text-primary" />{t('participation.addMaterials')}</h3>
    <p className="text-xs text-muted-foreground">{t('participation.publicNotice')}</p>
    {value.map((m, i) => <div key={i} className="flex items-center gap-2 border-b py-2"><span className="flex-1 min-w-0 text-sm break-words">{m.title}</span><Button variant="ghost" size="icon" aria-label={t('participation.remove')} onClick={() => onChange(value.filter((_, n) => n !== i))}><Trash2 className="h-4 w-4" /></Button></div>)}
    <div><Label htmlFor={`${id}-title`}>{t('participation.title')}</Label><Input id={`${id}-title`} maxLength={200} value={title} onChange={e => setTitle(e.target.value)} /></div>
    <div><Label htmlFor={`${id}-context`}>{t('participation.context')}</Label><Textarea id={`${id}-context`} rows={3} maxLength={2000} value={context} onChange={e => setContext(e.target.value)} /></div>
    <div><Label htmlFor={`${id}-file`}>{t('participation.file')}</Label><Input id={`${id}-file`} type="file" accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.pdf,.txt,.docx" onChange={e => { const f=e.target.files?.[0]; try { if(f) validateMaterialFile(f); setFile(f); } catch(err) { e.target.value=''; toast.error(err instanceof Error ? err.message : t('participation.error')); } }} /></div>
    <div><Label htmlFor={`${id}-url`}>{t('participation.link')}</Label><Input id={`${id}-url`} type="url" maxLength={2048} value={url} disabled={!!file} onChange={e => setUrl(e.target.value)} /></div>
    <div><Label>{t('participation.language')}</Label><Select value={sourceLanguage} onValueChange={setSourceLanguage}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['en','sw','fr','ar','so','am','es','pt','zh','hi','de'].map(l => <SelectItem key={l} value={l}>{new Intl.DisplayNames([language], {type:'language'}).of(l)}</SelectItem>)}</SelectContent></Select></div>
    <Button type="button" variant="outline" onClick={add} disabled={!title.trim() || (!file && !url)}><Plus className="h-4 w-4 mr-2" />{t('participation.add')}</Button>
  </section>;
}