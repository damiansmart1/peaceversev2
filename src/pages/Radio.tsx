import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import FunctionalRadio from '@/components/FunctionalRadio';
import RadioAccessibilityFeatures from '@/components/RadioAccessibilityFeatures';
import { RadioSchedule } from '@/components/RadioSchedule';
import RadioLiveChat from '@/components/radio/RadioLiveChat';
import PodcastLibrary from '@/components/radio/PodcastLibrary';
import CommunityCallIn from '@/components/radio/CommunityCallIn';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio as RadioIcon, Waves, Calendar, Settings, MessageCircle, Podcast, Phone } from 'lucide-react';

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
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
            <TabsTrigger value="live" className="gap-2">
              <Waves className="w-4 h-4" />
              <span className="hidden sm:inline">{t('radio.tabs.live')}</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('radio.tabs.chat')}</span>
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="gap-2">
              <Podcast className="w-4 h-4" />
              <span className="hidden sm:inline">{t('radio.tabs.podcasts')}</span>
            </TabsTrigger>
            <TabsTrigger value="callin" className="gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{t('radio.tabs.callIn')}</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{t('radio.tabs.schedule')}</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.accessibility')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FunctionalRadio />
              </div>
              <div className="lg:col-span-1">
                <RadioLiveChat />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-8">
            <RadioLiveChat />
          </TabsContent>

          <TabsContent value="podcasts" className="space-y-8">
            <PodcastLibrary />
          </TabsContent>

          <TabsContent value="callin" className="space-y-8">
            <CommunityCallIn />
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
