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
import { Shield, AlertTriangle, Users, Wifi, BookOpen } from 'lucide-react';
import safetyProtection from "@/assets/safety-protection.jpg";

const Safety = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <div className="mb-12">
          <SectionImageBanner
            image={safetyProtection}
            alt="African community members in a safe space showing protection and security"
            title="Safety Portal"
            subtitle="Protection, moderation, trust building, and offline access"
            className="h-96 mb-8"
          />
        </div>
        
        <Tabs defaultValue="moderation" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="moderation" className="gap-2">
              <Shield className="w-4 h-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="protection" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Protection
            </TabsTrigger>
            <TabsTrigger value="trust" className="gap-2">
              <Users className="w-4 h-4" />
              Trust
            </TabsTrigger>
            <TabsTrigger value="offline" className="gap-2">
              <Wifi className="w-4 h-4" />
              Offline
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Resources
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
