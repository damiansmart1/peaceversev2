import { useState } from 'react';
import { UsersRound, Sparkles, ArrowUpRight, Linkedin, Globe } from 'lucide-react';
import { useAboutPeople, usePortrait, AboutPerson } from '@/hooks/useAboutPeople';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
export function PersonPortrait({ person, className = '' }: {person: AboutPerson; className?: string}) {
  const { data: src } = usePortrait(person.image_path);
  return src ? <img src={src} alt={person.name} className={className} loading="lazy" decoding="async" /> : <div className={`${className} bg-primary/10 flex items-center justify-center text-primary text-3xl font-semibold`}>{person.name.split(/\s+/).map(n=>n[0]).slice(0,2).join('')}</div>;
}
export default function PeopleSection({ category }: {category?: string}) {
  const { t } = useTranslationContext();
  const { data = [], isLoading, error, refetch } = useAboutPeople();
  const [selected, setSelected] = useState<AboutPerson | null>(null);
  const groups = category ? [category] : ['founder','team'];
  const people = data.filter(p=>groups.includes(p.category));
  return <section className="space-y-8">
    <div className="space-y-3 max-w-2xl"><p className="text-primary text-xs font-semibold uppercase flex items-center gap-2"><UsersRound className="h-4 w-4"/>PeaceVerse</p><h2 className="text-3xl md:text-4xl font-bold">{t(category === 'partner' ? 'about.partner':'about.people')}</h2><p className="text-muted-foreground">{t('about.subtitle')}</p></div>
    {isLoading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><Skeleton key={i} className="h-80 rounded-lg"/>)}</div>}
    {error && <div role="alert"><p>{error.message}</p><Button variant="outline" onClick={()=>refetch()}>{t('about.retry')}</Button></div>}
    {!isLoading && !error && !people.length && <div className="border-y border-border py-12 text-center space-y-3"><UsersRound className="h-10 w-10 text-primary mx-auto"/><h3 className="text-xl font-semibold">{t('about.empty')}</h3><p className="text-muted-foreground">{t('about.emptyDetail')}</p></div>}
    {groups.map(group=>data.some(p=>p.category===group) && <div key={group} className="space-y-4"><h3 className="text-xl font-semibold">{t(`about.${group}`)}</h3><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.filter(p=>p.category===group).map(person=><Card key={person.id} className="overflow-hidden border-border group"><PersonPortrait person={person} className="w-full aspect-[4/3] object-cover"/><div className="p-5 space-y-3"><p className="text-xs font-medium text-primary">{person.role_title}{person.organization && ` · ${person.organization}`}</p><h4 className="text-xl font-bold break-words">{person.name}</h4><p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">{person.bio}</p>{person.fun_intro && <p className="border-l-2 border-gold pl-3 text-sm line-clamp-2">{person.fun_intro}</p>}<Button variant="ghost" className="px-0 gap-2 text-primary" onClick={()=>setSelected(person)}>{t('about.meet')} {person.name.split(' ')[0]}<ArrowUpRight className="h-4 w-4"/></Button></div></Card>)}</div></div>)}
    <Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto">{selected && <><DialogHeader><DialogTitle>{selected.name}</DialogTitle><DialogDescription>{selected.role_title}{selected.organization && ` · ${selected.organization}`}</DialogDescription></DialogHeader><PersonPortrait person={selected} className="w-full max-h-80 aspect-[4/3] object-cover rounded-md"/><p className="whitespace-pre-line break-words leading-relaxed">{selected.bio}</p>{selected.fun_intro && <div className="border-l-2 border-gold pl-4 space-y-2"><h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-gold"/>{t('about.spark')}</h3><p className="whitespace-pre-line break-words">{selected.fun_intro}</p></div>}<div className="flex gap-3">{[['website_url','website',Globe],['linkedin_url','linkedin',Linkedin]].map(([key,label,Icon])=>{const href=selected[key as 'website_url'|'linkedin_url'];const I=Icon as typeof Globe;return /^https?:\/\//i.test(href) ? <Button key={String(key)} variant="outline" asChild><a href={href} target="_blank" rel="noopener noreferrer"><I className="h-4 w-4 mr-2"/>{t(`about.${label}`)}</a></Button>:null;})}</div></>}</DialogContent></Dialog>
  </section>;
}
