import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import VoiceRecorder from '@/components/VoiceRecorder';
import ContentUpload from '@/components/ContentUpload';
import ContentFeed from '@/components/ContentFeed';
import { StoryFilters } from '@/components/StoryFilters';
import { FeaturedStories } from '@/components/FeaturedStories';
import { useTranslationContext } from '@/components/TranslationProvider';
import { useContentFilters } from '@/hooks/useContentFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Upload, Library, TrendingUp } from 'lucide-react';

const Voice = () => {
  const { t } = useTranslationContext();
  const { filters, updateFilter, resetFilters } = useContentFilters();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge={t('voice.badge')}
          title={t('voice.title')}
          subtitle={t('voice.subtitle')}
          icon={<Mic className="w-4 h-4" />}
        />
        
        <Tabs defaultValue="share" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="share" className="gap-2">
              <Upload className="w-4 h-4" />
              Share Story
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <Library className="w-4 h-4" />
              Browse Stories
            </TabsTrigger>
            <TabsTrigger value="featured" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Featured
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-12">
            <VoiceRecorder />
            
            <div className="border-t border-border pt-12">
              <SectionHeader
                badge={t('content.badge')}
                title={t('content.share.title')}
                subtitle={t('content.share.subtitle')}
                icon={<Upload className="w-4 h-4" />}
              />
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
      </div>
    </div>
  );
};

export default Voice;
