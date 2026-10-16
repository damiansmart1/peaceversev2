import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase-typed';
import { useParticipationMaterials } from '@/hooks/useParticipationMaterials';
import { useContentTranslation } from '@/hooks/useContentTranslation';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BookOpen, Download, ExternalLink, Languages, ShieldCheck, Landmark } from 'lucide-react';
import { type Material } from '@/lib/participation';

function MaterialItem({ material, lowData }: { material: Material; lowData: boolean }) {
  const { t, language } = useTranslationContext();
  const { translateText, isTranslating, error } = useContentTranslation();
  const [expanded, setExpanded] = useState(false);
  const [translated, setTranslated] = useState<string>();
  const { data: src, error: fileError } = useQuery({
    queryKey: ['material-url', material.id], enabled: expanded, staleTime: 240_000,
    queryFn: async () => {
      if (material.url) return material.url;
      if (!material.storage_path) return null;
      const { data, error } = await supabase.storage.from('participation-materials').createSignedUrl(material.storage_path, 300);
      if (error) throw error;
      return data.signedUrl;
    },
  });
  return <article className="border-b border-border py-3 space-y-2 min-w-0">
    <div className="flex items-start gap-3 justify-between"><div className="min-w-0"><h4 className="text-sm font-medium break-words">{material.title}</h4><span className="text-xs text-muted-foreground">{material.language.toUpperCase()}</span></div><Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><BookOpen className="h-4 w-4 mr-1" />{t('participation.read')}</Button></div>
    {expanded && <div className="space-y-3">
      <p className="whitespace-pre-wrap break-words text-sm">{translated || material.context}</p>
      {material.context && language !== material.language && <Button size="sm" variant="outline" disabled={isTranslating} onClick={async () => setTranslated(translated ? undefined : await translateText(material.context, language))}><Languages className="h-4 w-4 mr-1" />{t(`participation.${isTranslating ? 'translating' : translated ? 'original' : 'translated'}`)}</Button>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {fileError && <p role="alert" className="text-sm text-destructive">{fileError.message}</p>}
      {src && !lowData && material.kind==='image' && <img src={src} alt={material.title} className="max-h-64 w-full object-contain rounded-md" loading="lazy" decoding="async" />}
      {src && !lowData && material.kind==='video' && <video src={src} controls preload="none" className="max-h-64 w-full rounded-md" aria-label={material.title} />}
      {src && <Button variant="outline" size="sm" asChild><a href={src} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-1" />{t('participation.open')}</a></Button>}
    </div>}
  </article>;
}

export default function LearningMaterials({ kind, id, title, description, proposalId }: { kind: 'poll' | 'proposal'; id: string; title: string; description: string; proposalId?: string | null }) {
  const { t } = useTranslationContext();
  const { data: materials = [], isLoading, error } = useParticipationMaterials(kind, id);
  const [lowData, setLowData] = useState(() => localStorage.getItem('participation-low-data') !== 'false');
  const download = () => {
    const text = [title, description, ...materials.map(m => `${m.title} [${m.language}]\n${m.context}\n${m.url || ''}`), `${t('participation.review')}\n${window.location.origin}/proposals${kind==='proposal' ? `/${id}` : `?poll=${id}`}`].join('\n\n');
    const url=URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='peaceverse-reading-pack.txt'; a.click(); URL.revokeObjectURL(url);
  };
  return <section className="space-y-3 py-3 border-y border-border min-w-0">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />{t('participation.materials')}</h3><Button variant="ghost" size="sm" onClick={download}><Download className="h-4 w-4 mr-1" />{t('participation.pack')}</Button></div>
    <div className="flex gap-2 items-center"><Switch id={`low-data-${kind}-${id}`} checked={lowData} onCheckedChange={v => {setLowData(v); localStorage.setItem('participation-low-data',String(v));}} /><Label htmlFor={`low-data-${kind}-${id}`} className="text-xs">{t('participation.lowData')}</Label></div>
    {isLoading && <p className="text-xs text-muted-foreground">{t('common.loading')}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
    {!isLoading && !error && !materials.length && <p className="text-xs text-muted-foreground">{t('participation.empty')}</p>}
    {materials.map(m => <MaterialItem key={m.id} material={m} lowData={lowData} />)}
    {!!materials.length && <p className="text-xs text-muted-foreground">{t('participation.review')}</p>}
    {proposalId && <Button variant="outline" size="sm" className="h-auto whitespace-normal text-start" asChild><Link to={`/proposals/${proposalId}`}><Landmark className="h-4 w-4 mr-2 shrink-0" />{t('participation.track')}</Link></Button>}
    <p className="text-xs text-muted-foreground flex items-start gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-primary" />{t('participation.privacy')}</p>
  </section>;
}