import { useId } from 'react';
import { useAccessibility, type AccessibilitySettings } from '@/contexts/AccessibilityContext';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { recognitionConstructor } from '@/lib/accessibilitySpeech';

export default function AccessibilityPanel() {
 const {settings, updateSetting, resetSettings} = useAccessibility();
 const {t} = useTranslationContext(); const id = useId();
 const toggle = (key: keyof AccessibilitySettings, label: string, disabled=false) => <div key={key} className="flex items-center justify-between gap-4 py-3 border-b border-border"><Label htmlFor={`${id}-${key}`} className="leading-relaxed">{t(`a11y.${label}`)}</Label><Switch id={`${id}-${key}`} checked={!!settings[key]} disabled={disabled} onCheckedChange={value=>updateSetting(key,value)} className="shrink-0" /></div>;
 return <div className="w-full min-w-0 space-y-4">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{t('a11y.subtitle')}</h2><Button variant="outline" size="sm" className="min-h-11" onClick={resetSettings}><RotateCcw className="h-4 w-4" />{t('a11y.reset')}</Button></div>
  <Tabs defaultValue="visual">
   <TabsList className="flex flex-wrap h-auto w-full gap-1">{['visual','audio','interaction','content'].map(tab=><TabsTrigger key={tab} value={tab} className="min-h-11 flex-1 whitespace-normal">{t(`a11y.${tab}`)}</TabsTrigger>)}</TabsList>
   <TabsContent value="visual" className="space-y-3">
    <div className="py-3 space-y-3"><Label>{t('a11y.textSize')}</Label><div className="flex gap-3 items-center"><Button variant="outline" size="icon" className="min-h-11 min-w-11" aria-label={t('a11y.textSize')+' −'} disabled={settings.textSize<=100} onClick={()=>updateSetting('textSize',settings.textSize-10)}><Minus /></Button><output aria-live="polite" className="min-w-16 text-center">{settings.textSize}%</output><Button variant="outline" size="icon" className="min-h-11 min-w-11" aria-label={t('a11y.textSize')+' +'} disabled={settings.textSize>=200} onClick={()=>updateSetting('textSize',settings.textSize+10)}><Plus /></Button></div></div>
    {toggle('highContrast','contrast')}{toggle('reducedMotion','motion')}{toggle('focusHighlight','focus')}{toggle('readingMode','reading')}
   </TabsContent>
   <TabsContent value="audio" className="space-y-3">
    {toggle('textToSpeech','tts',!('speechSynthesis' in window))}
    {toggle('speechToText','dictation',!recognitionConstructor())}{toggle('voiceNavigation','navigation',!recognitionConstructor())}
    {!recognitionConstructor() && <p role="status" className="text-sm text-muted-foreground">{t('a11y.unsupported')}</p>}
    {!('speechSynthesis' in window) && <p className="text-sm text-muted-foreground">{t('a11y.noSpeech')}</p>}
    <p className="text-sm text-muted-foreground">{t('a11y.privacy')}</p>
   </TabsContent>
   <TabsContent value="interaction"><p className="py-3 text-sm leading-relaxed">{t('a11y.keyboardInfo')}</p>{toggle('focusHighlight','focus')}</TabsContent>
   <TabsContent value="content">{toggle('showCaptions','captions')}<p className="py-3 text-sm text-muted-foreground">{t('a11y.captionNotice')}</p></TabsContent>
  </Tabs>
  <p className="text-sm text-muted-foreground">{t('a11y.availability')}</p>
 </div>;
}
