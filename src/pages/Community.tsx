import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import CommunityMap from '@/components/CommunityMap';
import ContentFeed from '@/components/ContentFeed';
import { CommunityEvents } from '@/components/CommunityEvents';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Map, MessageSquare, Users, Calendar, BookOpen } from 'lucide-react';
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
          subtitle="Connect with safe spaces, join events, and share stories"
          icon={<Users className="w-4 h-4" />}
        />
        
        <Tabs defaultValue="map" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Safe Spaces
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Resources
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="space-y-4">
            <CommunityMap />
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <CommunityEvents />
          </TabsContent>
          
          <TabsContent value="stories" className="space-y-4">
            <ContentFeed />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4 text-center py-12">
            <p className="text-muted-foreground">Community resources coming soon</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
