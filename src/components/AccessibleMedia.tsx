import { useEffect, useId, useRef, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Button } from '@/components/ui/button';
import { Captions } from 'lucide-react';
import { validCaptionFile } from '@/lib/accessibilityMedia';

export default function AccessibleMedia({kind,src,title,description,transcript,captionSrc,className}: {kind:'audio'|'video';src:string;title:string;description?:string;transcript?:string;captionSrc?:string;className?:string}) {
 const {settings}=useAccessibility(); const {t,language}=useTranslationContext(); const id=useId();
 const ref=useRef<HTMLVideoElement|null>(null); const file=useRef<HTMLInputElement|null>(null);
 const [localCaption,setLocalCaption]=useState<string>(); const [error,setError]=useState('');
 useEffect(()=>()=>{if(localCaption) URL.revokeObjectURL(localCaption);},[localCaption]);
 useEffect(()=>{
  const player=ref.current;if(!player) return;
  const apply=()=>{Array.from(player.textTracks).forEach(track=>{if(track.kind==='captions'||track.kind==='subtitles') track.mode=settings.showCaptions || localCaption?'showing':'disabled';});};
  apply();player.textTracks.addEventListener('addtrack',apply);player.addEventListener('loadedmetadata',apply);
  return ()=>{player.textTracks.removeEventListener('addtrack',apply);player.removeEventListener('loadedmetadata',apply);};
 },[settings.showCaptions,localCaption,captionSrc]);
 return <div className="space-y-2 min-w-0">
  {kind==='video'?<video ref={ref} src={src} aria-label={title} controls playsInline preload="none" className={className}>
   {(localCaption||captionSrc) && <track key={localCaption||captionSrc} kind="captions" src={localCaption||captionSrc} srcLang={language} label={t('a11y.captions')} default={settings.showCaptions||!!localCaption} />}
  </video>:<audio src={src} controls preload="none" aria-label={title} className={className} />}
  {(transcript||description) && <details><summary className="cursor-pointer text-sm text-foreground py-2">{t(`a11y.${transcript?'transcript':'description'}`)}</summary><p className="text-sm whitespace-pre-wrap break-words">{transcript||description}</p></details>}
  {!transcript && !captionSrc && !localCaption && <p className="text-xs text-muted-foreground">{t('a11y.missing')}</p>}
  {kind==='video' && <><input id={id} ref={file} type="file" accept=".vtt,text/vtt" className="sr-only" tabIndex={-1} aria-label={t('a11y.addCaptions')} onChange={async event=>{
   const selected=event.target.files?.[0]; if(!selected) return;
   if(!validCaptionFile(selected,await selected.text())) {setError(t('a11y.invalidCaptions'));return;}
   setError('');setLocalCaption(URL.createObjectURL(selected));
  }} /><Button variant="outline" size="sm" className="min-h-11" onClick={()=>file.current?.click()}><Captions className="h-4 w-4" />{t('a11y.addCaptions')}</Button></>}
  {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
 </div>;
}
