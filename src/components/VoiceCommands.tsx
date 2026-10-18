import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Pause, Play, Square } from 'lucide-react';
import { appendDictation, isDictationTarget, recognitionConstructor, speechLocale, voiceDestination, type SpeechEngine } from '@/lib/accessibilitySpeech';

export default function VoiceCommands() {
 const {settings, announce} = useAccessibility();
 const {t, language} = useTranslationContext();
 const navigate = useNavigate();
 const location = useLocation();
 const [listening, setListening] = useState<'dictation' | 'navigation' | null>(null);
 const [reading, setReading] = useState(false);
 const [paused, setPaused] = useState(false);
 const [message, setMessage] = useState('');
 const engine = useRef<SpeechEngine | null>(null);
 const field = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
 const selected = useRef('');
 const report = (text: string) => {setMessage(text); announce(text);};
 const stop = () => {engine.current?.abort(); engine.current = null; setListening(null); window.speechSynthesis?.cancel(); setReading(false); setPaused(false);};
 useEffect(() => {
  const remember = (event: FocusEvent) => {if (event.target instanceof Element && isDictationTarget(event.target)) field.current = event.target;};
  const selection = () => {const active = document.activeElement; if (active instanceof Element && active.closest('[data-speech-controls]')) return; selected.current = window.getSelection()?.toString() || '';};
  document.addEventListener('focusin',remember); document.addEventListener('selectionchange',selection);
  return () => {document.removeEventListener('focusin',remember); document.removeEventListener('selectionchange',selection);};
 }, []);
 useEffect(() => {stop(); return () => {engine.current?.abort(); window.speechSynthesis?.cancel();};}, [location.pathname, language, settings.textToSpeech, settings.speechToText, settings.voiceNavigation]);
 const read = () => {
  stop();
  if (!('speechSynthesis' in window)) {report(t('a11y.noSpeech')); return;}
  const scope = document.querySelector('main, [role="main"]');
  const text = selected.current.trim() || (scope instanceof HTMLElement ? scope.innerText : '');
  if (!text.trim()) {report(t('a11y.empty')); return;}
  // Queue bounded chunks so long pages remain readable in browsers with utterance limits.
  const chunks = text.match(/[\s\S]{1,220}(?:\s|$)|[\s\S]{1,220}/g) || [text];
  setReading(true); setPaused(false);
  const next = (index: number) => {
   if (index >= chunks.length) {setReading(false); return;}
   const utterance = new SpeechSynthesisUtterance(chunks[index]); utterance.lang = speechLocale(language);
   const voices = window.speechSynthesis.getVoices();
   const voice = voices.find(v => v.lang.toLowerCase().startsWith(language)); if (voice) utterance.voice = voice;
   utterance.onend = () => next(index+1);
   utterance.onerror = () => {setReading(false);};
   window.speechSynthesis.speak(utterance);
  };
  next(0);
 };
 const start = (mode: 'dictation' | 'navigation') => {
  stop();
  const Constructor = recognitionConstructor(); if (!Constructor) {report(t('a11y.unsupported')); return;}
  const target = field.current;
  if (mode === 'dictation' && (!target?.isConnected || !isDictationTarget(target))) {report(t('a11y.target')); return;}
  const recognition = new Constructor(); engine.current = recognition;
  recognition.lang = speechLocale(language); recognition.continuous = false; recognition.interimResults = false;
  recognition.onresult = event => {
   const transcript = event.results[0]?.[0]?.transcript?.trim(); if (!transcript) return;
   if (mode === 'dictation' && target?.isConnected && isDictationTarget(target)) {
    const setter = Object.getOwnPropertyDescriptor(target instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,'value')?.set;
    setter?.call(target,appendDictation(target.value,transcript)); target.dispatchEvent(new Event('input',{bubbles:true})); target.focus();
   } else if (mode === 'navigation') {
    const destination = voiceDestination(transcript,language);
    if (destination) {navigate(destination); report(t('a11y.opened'));}
    else {
     const command = transcript.toLowerCase().replace(/[.!?,]/g,'').trim();
     if (['scroll down','sogeza chini','défiler vers le bas'].includes(command)) window.scrollBy({top:500,behavior:settings.reducedMotion?'instant':'smooth'});
     else if (['scroll up','sogeza juu','défiler vers le haut'].includes(command)) window.scrollBy({top:-500,behavior:settings.reducedMotion?'instant':'smooth'});
     else if (['go back','rudi nyuma','retour'].includes(command)) navigate(-1);
     else report(t('a11y.unknown'));
    }
   }
  };
  recognition.onerror = event => {
   if (event.error === 'aborted') return;
   const key = {'not-allowed':'denied','service-not-allowed':'denied','audio-capture':'noAudio','no-speech':'noMatch',network:'network'}[event.error] || 'error';
   report(t(`a11y.${key}`)); setListening(null);
  };
  recognition.onend = () => {if(engine.current === recognition) {engine.current = null; setListening(null);}};
  try {recognition.start(); setMessage(''); setListening(mode);} catch {report(t('a11y.error'));}
 };
 if (!settings.textToSpeech && !settings.speechToText && !settings.voiceNavigation) return null;
 return <section data-speech-controls aria-label={t('a11y.audio')} className="fixed bottom-24 right-3 z-40 w-[min(24rem,calc(100vw-1.5rem))] border border-border rounded-md bg-popover text-popover-foreground p-3 shadow-lg space-y-2">
  <div className="flex flex-wrap gap-2">
   {settings.textToSpeech && <>
    <Button size="sm" className="min-h-11 h-auto whitespace-normal text-start" onClick={read}><Volume2 className="h-4 w-4 shrink-0" />{t('a11y.read')}</Button>
    {reading && <Button size="icon" variant="outline" className="min-h-11 min-w-11" aria-label={t(`a11y.${paused?'resume':'pause'}`)} onClick={() => {if(paused) window.speechSynthesis.resume(); else window.speechSynthesis.pause(); setPaused(!paused);}}>{paused?<Play />:<Pause />}</Button>}
   </>}
   {settings.speechToText && <Button size="sm" variant="outline" className="min-h-11 h-auto whitespace-normal text-start" onMouseDown={e=>e.preventDefault()} onClick={() => start('dictation')} disabled={!!listening}><Mic className="h-4 w-4 shrink-0" />{t('a11y.dictate')}</Button>}
   {settings.voiceNavigation && <Button size="sm" variant="outline" className="min-h-11 h-auto whitespace-normal text-start" onClick={() => start('navigation')} disabled={!!listening}><Mic className="h-4 w-4 shrink-0" />{t('a11y.listen')}</Button>}
   {(listening || reading) && <Button size="icon" variant="outline" className="min-h-11 min-w-11" onClick={stop} aria-label={t('a11y.stop')}>{listening?<MicOff />:<Square />}</Button>}
  </div>
  {settings.voiceNavigation && <p className="text-xs text-muted-foreground">{t('a11y.commands')}</p>}
  {settings.speechToText && <p className="text-xs text-muted-foreground">{t('a11y.target')}</p>}
  {(settings.speechToText || settings.voiceNavigation) && <p className="text-xs text-muted-foreground">{t('a11y.privacy')}</p>}
  <p role="status" className="text-sm">{listening?t('a11y.listening'):message}</p>
 </section>;
}
