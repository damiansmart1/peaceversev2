import Navigation from '@/components/Navigation';
import SectionHeader from '@/components/SectionHeader';
import ContentModerationSection from '@/components/ContentModerationSection';
import SafetyProtectionSection from '@/components/SafetyProtectionSection';
import CommunityTrustSection from '@/components/CommunityTrustSection';
import OfflineAccessSection from '@/components/OfflineAccessSection';
import { useTranslationContext } from '@/components/TranslationProvider';
import { Shield } from 'lucide-react';

const Safety = () => {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <SectionHeader
          badge={t('safety.badge')}
          title={t('safety.title')}
          subtitle={t('safety.subtitle')}
          icon={<Shield className="w-4 h-4" />}
        />
        
        <div className="max-w-6xl mx-auto space-y-12">
          <ContentModerationSection />
          <SafetyProtectionSection />
          <CommunityTrustSection />
          <OfflineAccessSection />
        </div>
      </div>
    </div>
  );
};

export default Safety;
