import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import ContentModerationSection from '@/components/ContentModerationSection';
import SafetyProtectionSection from '@/components/SafetyProtectionSection';
import CommunityTrustSection from '@/components/CommunityTrustSection';
import OfflineAccessSection from '@/components/OfflineAccessSection';
import { SafetyResourceLibrary } from '@/components/SafetyResourceLibrary';
import { useTranslationContext } from '@/components/TranslationProvider';
import SectionImageBanner from '@/components/SectionImageBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldHalf, OctagonAlert, UsersRound, WifiHigh, BookMarked } from 'lucide-react';
import safetyProtection from "@/assets/safety-protection.jpg";

const Safety = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-20 sm:py-24">
        <div className="mb-8 sm:mb-12">
          <SectionImageBanner
            image={safetyProtection}
            alt={t('safety.portal')}
            title={t('safety.portal')}
            subtitle={t('safety.portalSubtitle')}
            className="h-48 sm:h-64 md:h-80 lg:h-96 mb-6 sm:mb-8"
          />
        </div>
        
        <Tabs defaultValue="moderation" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-5 mb-6 sm:mb-8 h-auto p-1">
            <TabsTrigger value="moderation" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3 flex-col sm:flex-row h-auto">
              <Shield className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline truncate">{t('safety.moderation')}</span>
            </TabsTrigger>
            <TabsTrigger value="protection" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3 flex-col sm:flex-row h-auto">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline truncate">{t('safety.protection')}</span>
            </TabsTrigger>
            <TabsTrigger value="trust" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3 flex-col sm:flex-row h-auto">
              <Users className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline truncate">{t('safety.trust')}</span>
            </TabsTrigger>
            <TabsTrigger value="offline" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3 flex-col sm:flex-row h-auto">
              <Wifi className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline truncate">{t('safety.offline')}</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-1 sm:px-3 flex-col sm:flex-row h-auto">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline truncate">{t('safety.resources')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moderation">
            <ContentModerationSection />
          </TabsContent>

          <TabsContent value="protection">
            <SafetyProtectionSection />
          </TabsContent>

          <TabsContent value="trust">
            <CommunityTrustSection />
          </TabsContent>

          <TabsContent value="offline">
            <OfflineAccessSection />
          </TabsContent>

          <TabsContent value="resources">
            <SafetyResourceLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Safety;
