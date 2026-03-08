import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import CommunityMap from '@/components/CommunityMap';
import ContentFeed from '@/components/ContentFeed';
import { CommunityEvents } from '@/components/CommunityEvents';
import PeacebuildingChallenges from '@/components/PeacebuildingChallenges';
import GamificationDashboard from '@/components/GamificationDashboard';
import FunctionalRadio from '@/components/FunctionalRadio';
import RadioAccessibilityFeatures from '@/components/RadioAccessibilityFeatures';
import { RadioSchedule } from '@/components/RadioSchedule';
import VoiceRecorder from '@/components/VoiceRecorder';
import ContentUpload from '@/components/ContentUpload';
import { StoryFilters } from '@/components/StoryFilters';
import { FeaturedStories } from '@/components/FeaturedStories';
import { useContentFilters } from '@/hooks/useContentFilters';
import { useTranslationContext } from '@/components/TranslationProvider';
import SectionImageBanner from '@/components/SectionImageBanner';
import { SocialHub } from '@/components/social/SocialHub';
import { MapPinned, MessageCircleMore, UsersRound, CalendarRange, BookMarked, Award, Antenna, AudioLines, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import communityUnity from "@/assets/community-unity.jpg";
import radioBroadcasting from "@/assets/radio-broadcasting.jpg";
import challengesCollaboration from "@/assets/challenges-collaboration.jpg";

const Community = () => {
  const { t } = useTranslationContext();
  const { filters, updateFilter, resetFilters } = useContentFilters();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="mb-12">
          <SectionImageBanner
            image={communityUnity}
            alt={t('community.bannerAlt')}
            title={t('community.title')}
            subtitle={t('community.subtitle')}
            className="h-96 mb-8"
          />
        </div>
        
        <Tabs defaultValue="social" className="max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPinned className="w-4 h-4" />
              {t('community.tabs.safeSpaces')}
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4" />
              {t('community.tabs.events')}
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <MessageCircleMore className="w-4 h-4" />
              {t('community.tabs.stories')}
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              {t('community.tabs.challenges')}
            </TabsTrigger>
            <TabsTrigger value="radio" className="flex items-center gap-2">
              <Antenna className="w-4 h-4" />
              {t('community.tabs.radio')}
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <AudioLines className="w-4 h-4" />
              {t('community.tabs.voiceStories')}
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookMarked className="w-4 h-4" />
              {t('community.tabs.resources')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="space-y-4">
            <SocialHub />
          </TabsContent>
          
          <TabsContent value="map" className="space-y-4">
            <CommunityMap />
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <CommunityEvents />
          </TabsContent>
          
          <TabsContent value="stories" className="space-y-4">
            <ContentFeed />
          </TabsContent>

          <TabsContent value="challenges" className="space-y-8">
            <SectionImageBanner
              image={challengesCollaboration}
              alt={t('community.challengesBannerAlt')}
              className="h-72 mb-6"
            />
            <PeacebuildingChallenges />
            <GamificationDashboard />
          </TabsContent>

          <TabsContent value="radio" className="space-y-8">
            <SectionImageBanner
              image={radioBroadcasting}
              alt={t('community.radioBannerAlt')}
              className="h-72 mb-6"
            />
            <Tabs defaultValue="live" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="live">{t('community.radio.live')}</TabsTrigger>
                <TabsTrigger value="schedule">{t('community.radio.schedule')}</TabsTrigger>
                <TabsTrigger value="accessibility">{t('common.accessibility')}</TabsTrigger>
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
          </TabsContent>

          <TabsContent value="voice" className="space-y-8">
            <Tabs defaultValue="share" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="share">{t('community.voice.shareStory')}</TabsTrigger>
                <TabsTrigger value="browse">{t('community.voice.browseStories')}</TabsTrigger>
                <TabsTrigger value="featured">{t('community.voice.featured')}</TabsTrigger>
              </TabsList>
              <TabsContent value="share" className="space-y-12">
                <VoiceRecorder />
                <div className="border-t border-border pt-12">
                  <ContentUpload />
                </div>
              </TabsContent>
              <TabsContent value="browse" className="space-y-6">
                <StoryFilters
                  filters={filters}
                  onFilterChange={updateFilter}
                  onReset={resetFilters}
                />
                <ContentFeed />
              </TabsContent>
              <TabsContent value="featured" className="space-y-8">
                <FeaturedStories />
                <ContentFeed />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 text-center py-12">
            <p className="text-muted-foreground">{t('community.resourcesComingSoon')}</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
