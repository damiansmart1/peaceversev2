import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import FunctionalRadio from '@/components/FunctionalRadio';
import RadioAccessibilityFeatures from '@/components/RadioAccessibilityFeatures';
import { RadioSchedule } from '@/components/RadioSchedule';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio as RadioIcon, Waves, Calendar, Settings } from 'lucide-react';

const Radio = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge={t('radio.badge')}
          title={t('radio.title')}
          subtitle={t('radio.subtitle')}
          icon={<RadioIcon className="w-4 h-4" />}
        />
        
        <Tabs defaultValue="live" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="live" className="gap-2">
              <Waves className="w-4 h-4" />
              {t('radio.tabs.live')}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              {t('radio.tabs.schedule')}
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="gap-2">
              <Settings className="w-4 h-4" />
              {t('common.accessibility')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-8">
            <FunctionalRadio />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-8">
            <RadioSchedule />
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-8">
            <RadioAccessibilityFeatures />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Radio;
