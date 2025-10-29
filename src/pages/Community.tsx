import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import CommunityMap from '@/components/CommunityMap';
import ContentFeed from '@/components/ContentFeed';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Map, MessageSquare, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Community = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge={t('community.badge')}
          title="Community Hub"
          subtitle="Connect with safe spaces and share stories with your community"
          icon={<Users className="w-4 h-4" />}
        />
        
        <Tabs defaultValue="map" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Safe Spaces Map
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Community Stories
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="space-y-4">
            <CommunityMap />
          </TabsContent>
          
          <TabsContent value="stories" className="space-y-4">
            <ContentFeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
