import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CheckCircle2, Download, ExternalLink, Globe, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslationContext } from '@/components/TranslationProvider';
import SectionShell from '@/components/layout/SectionShell';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { isCorrectEducationAnswer, readEducationProgress, saveEducationProgress, type EducationCountry } from '@/lib/voterEducation';

function LearningPath({ country }: { country: EducationCountry }) {
  const { t, language } = useTranslationContext();
  const text = (key: string) => t(`voterEducation.${key}`);
  const [completed, setCompleted] = useState(() => readEducationProgress(country));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<number>();
  const [result, setResult] = useState<'correct' | 'incorrect'>();
  const lesson = country.lessons[index];
  if (!lesson) return null;
  const copy = lesson.copy[language] || lesson.copy.en;
  const resetQuestion = (next: number) => { setIndex(next); setAnswer(undefined); setResult(undefined); };
  const check = () => {
    const correct = isCorrectEducationAnswer(lesson, answer);
    setResult(correct ? 'correct' : 'incorrect');
    if (correct && !completed.includes(lesson.id)) {
      const next = [...completed, lesson.id];
      setCompleted(next); saveEducationProgress(country, next);
    }
  };
  const download = () => {
    const content = [text(country.code), text('scope'), ...country.lessons.map(item => {
      const translation = item.copy[language] || item.copy.en;
      return `${text(item.id)}\n${translation.summary}\n${item.citation}\n${item.sourceUrl}`;
    }), country.commissionUrl].join('\n\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `peaceverse-voter-education-${country.code}.txt`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="space-y-2 w-full sm:w-64">
        <p className="text-sm">{text('progress')}: {completed.length}/{country.lessons.length}</p>
        <Progress value={completed.length / country.lessons.length * 100} aria-label={text('progress')} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={download}><Download className="h-4 w-4 mr-2" />{text('pack')}</Button>
        <Button variant="ghost" size="icon" title={text('restart')} aria-label={text('restart')} onClick={() => { setCompleted([]); saveEducationProgress(country, []); resetQuestion(0); }}><RotateCcw className="h-4 w-4" /></Button>
      </div>
    </div>
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav aria-label={text('title')} className="flex flex-col gap-2">
        {country.lessons.map((item, position) => <Button key={item.id} variant={position === index ? 'secondary' : 'ghost'} className="justify-start h-auto min-h-11 whitespace-normal text-start" aria-current={position === index ? 'step' : undefined} onClick={() => resetQuestion(position)}>
          {completed.includes(item.id) ? <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" /> : <span className="mr-2">{position + 1}.</span>}{text(item.id)}
        </Button>)}
      </nav>
      <article className="min-w-0 space-y-5">
        <header className="space-y-2"><p className="eyebrow">{text('lesson')} {index + 1} / {country.lessons.length}</p><h3 className="text-xl font-semibold">{text(lesson.id)}</h3></header>
        <p className="leading-relaxed whitespace-pre-line">{copy.summary}</p>
        <div className="border-l-2 border-primary pl-4 space-y-2">
          <p className="text-sm font-medium">{text('evidence')} · {lesson.citation}</p>
          <Button asChild variant="link" className="h-auto p-0 whitespace-normal text-start"><a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">{text('read')}<ExternalLink className="h-3.5 w-3.5 ml-2 shrink-0" /></a></Button>
        </div>
        <fieldset className="border-t border-border pt-5 space-y-4">
          <legend className="sr-only">{text('select')}</legend>
          <h4 id={`question-${country.code}-${lesson.id}`} className="font-semibold">{copy.question}</h4>
          <RadioGroup aria-labelledby={`question-${country.code}-${lesson.id}`} value={answer === undefined ? '' : String(answer)} onValueChange={value => { setAnswer(Number(value)); setResult(undefined); }} className="gap-3">
            {copy.options.map((option, position) => <div key={position} className="flex gap-3 items-start"><RadioGroupItem value={String(position)} id={`answer-${country.code}-${lesson.id}-${position}`} className="mt-1 shrink-0" /><Label htmlFor={`answer-${country.code}-${lesson.id}-${position}`} className="leading-relaxed cursor-pointer">{option}</Label></div>)}
          </RadioGroup>
          <div className="flex flex-wrap gap-2"><Button onClick={check} disabled={answer === undefined}>{text('check')}</Button>{result === 'correct' && index < country.lessons.length - 1 && <Button variant="outline" onClick={() => resetQuestion(index + 1)}>{text('next')}</Button>}</div>
          <div role="status" aria-live="polite" aria-atomic="true">{result && <div className="border-l-2 border-primary pl-4 space-y-2"><p className="font-medium">{text(result)}</p><p className="text-sm leading-relaxed">{copy.explanation}</p></div>}</div>
        </fieldset>
        {completed.length === country.lessons.length && <div role="status" className="border-t border-border pt-4 space-y-2"><h4 className="font-semibold flex gap-2 items-center"><CheckCircle2 className="h-5 w-5 text-success" />{text('complete')}</h4><p className="text-sm">{text('done')}</p></div>}
      </article>
    </div>
    <footer className="border-t border-border pt-4 space-y-2 text-sm text-muted-foreground">
      <p>{text('checked')}: {new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${country.sourceChecked}T00:00:00Z`))}</p>
      <Button variant="link" asChild className="p-0 h-auto"><a href={country.commissionUrl} target="_blank" rel="noopener noreferrer">{text('commission')}<ExternalLink className="h-3.5 w-3.5 ml-2" /></a></Button>
      <p>{text('device')}</p>
    </footer>
  </div>;
}

export default function VoterEducation({ catalogue, initialCountry = 'KE' }: { catalogue: Record<string, EducationCountry>; initialCountry?: string }) {
  const { t } = useTranslationContext();
  const [code, setCode] = useState(initialCountry.toUpperCase());
  const text = (key: string) => t(`voterEducation.${key}`);
  const { data: countries = [], error } = useQuery({
    queryKey: ['voter-education-countries'], staleTime: 300_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('african_countries').select('code,name').eq('is_active', true).order('name');
      if (error) throw error;
      return data;
    },
  });
  const choices = new Map(countries.map(country => [country.code.toUpperCase(), country.name]));
  Object.keys(catalogue).forEach(country => choices.set(country, text(country)));
  if (!choices.has(code)) choices.set(code, code);
  const country = catalogue[code];
  return <SectionShell title={text('title')} description={text('subtitle')} actions={<BookOpen className="h-7 w-7 text-primary" />}>
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3"><Label htmlFor="voter-education-country" className="flex items-center gap-2"><Globe className="h-4 w-4" />{text('country')}</Label><Select value={code} onValueChange={setCode}><SelectTrigger id="voter-education-country" className="w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent>{[...choices].map(([value, name]) => <SelectItem key={value} value={value}>{name}</SelectItem>)}</SelectContent></Select></div>
      {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
      <p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">{text('scope')}</p>
      {country ? <LearningPath key={code} country={country} /> : <p role="status" className="py-6 border-y border-border">{text('empty')}</p>}
    </div>
  </SectionShell>;
}