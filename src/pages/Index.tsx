import HeroSection from "@/components/HeroSection";
import VoiceRecorder from "@/components/VoiceRecorder";
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
import OnlineRadio from "@/components/OnlineRadio";
import RadioAccessibilityFeatures from "@/components/RadioAccessibilityFeatures";
import FunctionalRadio from "@/components/FunctionalRadio";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslationContext } from "@/components/TranslationProvider";

const Index = () => {
  const { t } = useTranslationContext();
  return (
    <div className="min-h-screen bg-background">
      {/* Language Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageToggle />
      </div>
      
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
              {t('voice.subtitle')}
            </p>
          </div>
          <VoiceRecorder />
        </div>
      </section>

      <CommunityMap />

      {/* Online Radio Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t('radio.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('radio.subtitle')}
            </p>
          </div>
          <FunctionalRadio />
        </div>
      </section>

      {/* Radio Accessibility Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t('accessibility.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('accessibility.subtitle')}
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <RadioAccessibilityFeatures />
          </div>
        </div>
      </section>
      
      {/* Content Sharing Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t('content.share.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('content.share.subtitle')}
            </p>
          </div>
          <ContentUpload />
        </div>
      </section>

      {/* Community Content Feed */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t('community.stories.title')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('community.stories.subtitle')}
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
                <li>{t('footer.features.voice')}</li>
                <li>{t('footer.features.mapping')}</li>
                <li>{t('footer.features.challenges')}</li>
                <li>{t('footer.features.dialogue')}</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">{t('footer.support')}</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>{t('footer.support.accessibility')}</li>
                <li>{t('footer.support.multilang')}</li>
                <li>{t('footer.support.safety')}</li>
                <li>{t('footer.support.crisis')}</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 {t('hero.title')}. {t('footer.tagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;