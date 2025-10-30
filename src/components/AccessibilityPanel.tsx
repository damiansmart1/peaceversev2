import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Eye, Ear, Keyboard, Globe, Wifi, Type, Contrast,
  Volume2, Brain, MonitorPlay, Accessibility, RotateCcw,
  ZoomIn, Sparkles, BookOpen, Languages, SignalLow
} from 'lucide-react';
import { useTranslationContext } from '@/components/TranslationProvider';
import { toast } from '@/hooks/use-toast';

export default function AccessibilityPanel() {
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const { t } = useTranslationContext();

  const handleReset = () => {
    resetSettings();
    toast({
      title: t('accessibility.reset'),
      description: t('accessibility.reset_desc'),
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Accessibility className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">{t('accessibility.title')}</CardTitle>
              <CardDescription>{t('accessibility.subtitle')}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('accessibility.reset')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="visual">
              <Eye className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('accessibility.visual')}</span>
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Ear className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('accessibility.audio')}</span>
            </TabsTrigger>
            <TabsTrigger value="interaction">
              <Keyboard className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('accessibility.interaction')}</span>
            </TabsTrigger>
            <TabsTrigger value="content">
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('accessibility.content')}</span>
            </TabsTrigger>
            <TabsTrigger value="connectivity">
              <Wifi className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('accessibility.connectivity')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Visual Settings */}
          <TabsContent value="visual" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="text-size" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    {t('accessibility.text_size')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('accessibility.text_size_desc')} ({settings.textSize}%)
                  </p>
                </div>
              </div>
              <Slider
                id="text-size"
                min={80}
                max={200}
                step={10}
                value={[settings.textSize]}
                onValueChange={([value]) => updateSetting('textSize', value)}
                className="w-full"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="high-contrast" className="flex items-center gap-2">
                  <Contrast className="w-4 h-4" />
                  {t('accessibility.high_contrast')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.high_contrast_desc')}
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="reduced-motion" className="flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4" />
                  {t('accessibility.reduced_motion')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.reduced_motion_desc')}
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="dyslexic-font" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t('accessibility.dyslexic_font')}
                  <Badge variant="secondary" className="ml-2">New</Badge>
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.dyslexic_font_desc')}
                </p>
              </div>
              <Switch
                id="dyslexic-font"
                checked={settings.dyslexicFont}
                onCheckedChange={(checked) => updateSetting('dyslexicFont', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="focus-highlight" className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  {t('accessibility.enhanced_focus')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.enhanced_focus_desc')}
                </p>
              </div>
              <Switch
                id="focus-highlight"
                checked={settings.focusHighlight}
                onCheckedChange={(checked) => updateSetting('focusHighlight', checked)}
              />
            </div>
          </TabsContent>

          {/* Audio Settings */}
          <TabsContent value="audio" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="voice-nav" className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  {t('accessibility.voice_navigation')}
                  <Badge variant="secondary" className="ml-2">{t('accessibility.beta')}</Badge>
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.voice_navigation_desc')}
                </p>
              </div>
              <Switch
                id="voice-nav"
                checked={settings.voiceNavigation}
                onCheckedChange={(checked) => updateSetting('voiceNavigation', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="audio-desc" className="flex items-center gap-2">
                  <Ear className="w-4 h-4" />
                  {t('accessibility.audio_descriptions')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.audio_descriptions_desc')}
                </p>
              </div>
              <Switch
                id="audio-desc"
                checked={settings.audioDescriptions}
                onCheckedChange={(checked) => updateSetting('audioDescriptions', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="screen-reader" className="flex items-center gap-2">
                  <Accessibility className="w-4 h-4" />
                  {t('accessibility.screen_reader')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.screen_reader_desc')}
                </p>
              </div>
              <Switch
                id="screen-reader"
                checked={settings.screenReader}
                onCheckedChange={(checked) => updateSetting('screenReader', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="tts" className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  {t('accessibility.text_to_speech')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.text_to_speech_desc')}
                </p>
              </div>
              <Switch
                id="tts"
                checked={settings.textToSpeech}
                onCheckedChange={(checked) => updateSetting('textToSpeech', checked)}
              />
            </div>
          </TabsContent>

          {/* Interaction Settings */}
          <TabsContent value="interaction" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="keyboard-only" className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4" />
                  {t('accessibility.keyboard_only')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.keyboard_only_desc')}
                </p>
              </div>
              <Switch
                id="keyboard-only"
                checked={settings.keyboardOnly}
                onCheckedChange={(checked) => updateSetting('keyboardOnly', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="simplified" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  {t('accessibility.simplified_mode')}
                  <Badge variant="secondary" className="ml-2">New</Badge>
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.simplified_mode_desc')}
                </p>
              </div>
              <Switch
                id="simplified"
                checked={settings.simplifiedMode}
                onCheckedChange={(checked) => updateSetting('simplifiedMode', checked)}
              />
            </div>
          </TabsContent>

          {/* Content Settings */}
          <TabsContent value="content" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="reading-mode" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {t('accessibility.reading_mode')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.reading_mode_desc')}
                </p>
              </div>
              <Switch
                id="reading-mode"
                checked={settings.readingMode}
                onCheckedChange={(checked) => updateSetting('readingMode', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="captions" className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  {t('accessibility.show_captions')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.show_captions_desc')}
                </p>
              </div>
              <Switch
                id="captions"
                checked={settings.showCaptions}
                onCheckedChange={(checked) => updateSetting('showCaptions', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="sign-language" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {t('accessibility.sign_language')}
                  <Badge variant="secondary" className="ml-2">Premium</Badge>
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.sign_language_desc')}
                </p>
              </div>
              <Switch
                id="sign-language"
                checked={settings.signLanguage}
                onCheckedChange={(checked) => updateSetting('signLanguage', checked)}
              />
            </div>
          </TabsContent>

          {/* Connectivity Settings */}
          <TabsContent value="connectivity" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="low-bandwidth" className="flex items-center gap-2">
                  <SignalLow className="w-4 h-4" />
                  {t('accessibility.low_bandwidth')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.low_bandwidth_desc')}
                </p>
              </div>
              <Switch
                id="low-bandwidth"
                checked={settings.lowBandwidth}
                onCheckedChange={(checked) => updateSetting('lowBandwidth', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="offline-mode" className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  {t('accessibility.offline_mode')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.offline_mode_desc')}
                </p>
              </div>
              <Switch
                id="offline-mode"
                checked={settings.offlineMode}
                onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <Label htmlFor="data-saver" className="flex items-center gap-2">
                  <SignalLow className="w-4 h-4" />
                  {t('accessibility.data_saver')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.data_saver_desc')}
                </p>
              </div>
              <Switch
                id="data-saver"
                checked={settings.dataSaver}
                onCheckedChange={(checked) => updateSetting('dataSaver', checked)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
