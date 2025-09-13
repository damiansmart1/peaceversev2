import HeroSection from "@/components/HeroSection";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useTranslation } from "@/hooks/useTranslation";
import CommunityMap from "@/components/CommunityMap";
import GamificationDashboard from "@/components/GamificationDashboard";
import AccessibilityFeatures from "@/components/AccessibilityFeatures";
import DonorShowcase from "@/components/DonorShowcase";
import ContentUpload from "@/components/ContentUpload";
import ContentFeed from "@/components/ContentFeed";
import PeacebuildingChallenges from "@/components/PeacebuildingChallenges";
import ContentModerationSection from "@/components/ContentModerationSection";
import OfflineAccessSection from "@/components/OfflineAccessSection";
import SafetyProtectionSection from "@/components/SafetyProtectionSection";
import CommunityTrustSection from "@/components/CommunityTrustSection";

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Critical Peacebuilding Areas */}
      <PeacebuildingChallenges />
      <ContentModerationSection />
      <OfflineAccessSection />
      <SafetyProtectionSection />
      <CommunityTrustSection />
      
      {/* Voice Recording Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t('voice.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('voice.description')}
            </p>
          </div>
          <VoiceRecorder />
        </div>
      </section>

      <CommunityMap />
      
      {/* Content Sharing Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t('content.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('content.description')}
            </p>
          </div>
          <ContentUpload />
        </div>
      </section>

      {/* Community Content Feed */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t('feed.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('feed.description')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ContentFeed />
          </div>
        </div>
      </section>

      <GamificationDashboard />
      <AccessibilityFeatures />
      <DonorShowcase />
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-peace-gradient bg-clip-text text-transparent">
                {t('hero.title')}
              </h3>
              <p className="text-primary-foreground/80">
                {t('footer.tagline')}
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">{t('footer.features')}</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>{t('footer.feature1')}</li>
                <li>{t('footer.feature2')}</li>
                <li>{t('footer.feature3')}</li>
                <li>{t('footer.feature4')}</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">{t('footer.support')}</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>{t('footer.support1')}</li>
                <li>{t('footer.support2')}</li>
                <li>{t('footer.support3')}</li>
                <li>{t('footer.support4')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;