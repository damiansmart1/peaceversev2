import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useTranslationContext } from '@/components/TranslationProvider';
import { appendDictation, recognitionConstructor, speechLocale, type SpeechEngine } from '@/lib/accessibilitySpeech';
export default function DictationButton({onTranscript}: {onTranscript:(text:string)=>void}) {
 const {t,language}=useTranslationContext();const engine=useRef<SpeechEngine|null>(null);
 const [listening,setListening]=useState(false);const [error,setError]=useState('');
 useEffect(()=>()=>engine.current?.abort(),[]);
 const listen=()=>{
  if(listening) {engine.current?.abort();setListening(false);return;}
  const Constructor=recognitionConstructor();if(!Constructor){setError(t('a11y.unsupported'));return;}
  const recognition=new Constructor();engine.current=recognition;recognition.lang=speechLocale(language);recognition.continuous=false;recognition.interimResults=false;
  recognition.onresult=e=>{const text=e.results[0]?.[0]?.transcript;if(text)onTranscript(text);};
  recognition.onend=()=>setListening(false);
  recognition.onerror=e=>{setListening(false);if(e.error!=='aborted')setError(t(e.error==='not-allowed'?'a11y.denied':'a11y.error'));};
  try{recognition.start();setListening(true);setError('');}catch{setError(t('a11y.error'));}
 };
 return <div className="mt-2 space-y-1"><Button type="button" variant="outline" size="sm" className="min-h-11 h-auto whitespace-normal" onClick={listen}>{listening?<MicOff className="h-4 w-4" />:<Mic className="h-4 w-4" />}{t(listening?'a11y.stop':'a11y.dictate')}</Button>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<span role="status" className="sr-only">{listening?t('a11y.listening'):''}</span></div>;
}
export {appendDictation};
