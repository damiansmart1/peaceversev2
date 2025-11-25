import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import ContentModerationSection from '@/components/ContentModerationSection';
import SafetyProtectionSection from '@/components/SafetyProtectionSection';
import CommunityTrustSection from '@/components/CommunityTrustSection';
import OfflineAccessSection from '@/components/OfflineAccessSection';
import { SafetyResourceLibrary } from '@/components/SafetyResourceLibrary';
import { VerificationQueue } from '@/components/VerificationQueue';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Users, Wifi, BookOpen, UserCheck } from 'lucide-react';
import { useRoleCheck } from '@/hooks/useRoleCheck';

const Safety = () => {
  const { t } = useTranslationContext();
  const { data: isVerifier } = useRoleCheck('verifier');
  const { data: isAdmin } = useRoleCheck('admin');
  const canVerify = isVerifier || isAdmin;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge={t('safety.badge')}
          title="Safety Portal"
          subtitle="Protection, moderation, trust building, and verification tools"
          icon={<Shield className="w-4 h-4" />}
        />
        
        <Tabs defaultValue="moderation" className="max-w-6xl mx-auto">
          <TabsList className={`grid w-full ${canVerify ? 'grid-cols-6' : 'grid-cols-5'} mb-8`}>
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
            {canVerify && (
              <TabsTrigger value="verification" className="gap-2">
                <UserCheck className="w-4 h-4" />
                Verification
              </TabsTrigger>
            )}
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

          {canVerify && (
            <TabsContent value="verification">
              <VerificationQueue />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Safety;
